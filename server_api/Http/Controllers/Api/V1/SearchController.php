<?php

namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SearchController extends Controller
{
    /**
     * Search products with facets and pagination
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'q' => 'nullable|string|max:255',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'categories' => 'nullable|array',
            'categories.*' => 'string',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer',
            'price_range' => 'nullable|array',
            'price_range.*' => 'string|in:0-9,10-49,50-99,100-499,500-999,1000+',
            'on_sale' => 'nullable|in:true,false,1,0',
            'status' => 'nullable|in:true,false,1,0',
            'sort_by' => 'nullable|string|in:price_asc,price_desc,date_added_desc,date_added_asc,relevance',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $query = $request->input('q', '*');
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 20);

        // Build filter string for Typesense
        $filters = $this->buildFilters($request);

        // Build sort parameter
        $sortBy = $this->buildSortBy($request->input('sort_by', 'relevance'));

        try {
            // Build search parameters
            $searchParams = [
                'q' => $query,
                'query_by' => 'name_ar,name_en,description_en,description_ar',
                'page' => $page,
                'per_page' => $perPage,
                'facet_by' => 'categories,price_range,on_sale,status',
                'max_facet_values' => 30,
            ];

            // Add filters
            if (!empty($filters)) {
                $searchParams['filter_by'] = $filters;
            }

            // Add sorting
            if ($sortBy) {
                $searchParams['sort_by'] = $sortBy;
            }

            // Get Typesense client and perform search
            $typesense = $this->getTypesenseClient();
            $rawResults = $typesense->collections['product_index']->documents->search($searchParams);

            // Extract products
            $products = collect($rawResults['hits'] ?? [])->map(function ($hit) {
                return $hit['document'];
            });

            // Extract facets
            $facets = $this->formatFacets($rawResults['facet_counts'] ?? []);

            // Pagination meta
            $pagination = [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $rawResults['found'] ?? 0,
                'total_pages' => isset($rawResults['found']) ? ceil($rawResults['found'] / $perPage) : 0,
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'products' => $products,
                    'facets' => $facets,
                    'pagination' => $pagination,
                    'search_time_ms' => $rawResults['search_time_ms'] ?? 0,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Typesense client instance
     *
     * @return \Typesense\Client
     */
    protected function getTypesenseClient()
    {
        $config = config('scout.typesense.client-settings');
        
        return new \Typesense\Client($config);
    }

    /**
     * Build Typesense filter string
     *
     * @param Request $request
     * @return string
     */
    protected function buildFilters(Request $request): string
    {
        $filters = [];

        // Category filter
        if ($request->has('categories') && !empty($request->categories)) {
            $categories = array_map(function($cat) {
                return '`' . addslashes($cat) . '`';
            }, $request->categories);
            $filters[] = 'categories:=[' . implode(',', $categories) . ']';
        }

        // Category IDs filter
        if ($request->has('category_ids') && !empty($request->category_ids)) {
            $categoryIds = implode(',', array_map('intval', $request->category_ids));
            $filters[] = 'category_ids:=[' . $categoryIds . ']';
        }

        // Price range filter
        if ($request->has('price_range') && !empty($request->price_range)) {
            $priceRanges = array_map(function($range) {
                return '`' . $range . '`';
            }, $request->price_range);
            $filters[] = 'price_range:=[' . implode(',', $priceRanges) . ']';
        }

        // Min/Max price filter
        if ($request->has('min_price')) {
            $filters[] = 'final_price:>=' . floatval($request->min_price);
        }
        if ($request->has('max_price')) {
            $filters[] = 'final_price:<=' . floatval($request->max_price);
        }

        // On sale filter
        if ($request->has('on_sale')) {
            $onSale = filter_var($request->on_sale, FILTER_VALIDATE_BOOLEAN);
            $filters[] = 'on_sale:=' . ($onSale ? 'true' : 'false');
        }

        // Status filter (default to active products)
        if ($request->has('status')) {
            $status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN);
            $filters[] = 'status:=' . ($status ? 'true' : 'false');
        } else {
            // Default: only show active products
            $filters[] = 'status:=true';
        }

        return implode(' && ', $filters);
    }

    /**
     * Build sort parameter for Typesense
     *
     * @param string $sortBy
     * @return string|null
     */
    protected function buildSortBy(string $sortBy): ?string
    {
        return match ($sortBy) {
            'price_asc' => 'final_price:asc',
            'price_desc' => 'final_price:desc',
            'date_added_desc' => 'date_added:desc',
            'date_added_asc' => 'date_added:asc',
            'relevance' => null, // Default relevance sorting
            default => null,
        };
    }

    /**
     * Format facets for response
     *
     * @param array $facetCounts
     * @return array
     */
    protected function formatFacets(array $facetCounts): array
    {
        $formattedFacets = [];

        foreach ($facetCounts as $facet) {
            $fieldName = $facet['field_name'];
            $counts = [];

            foreach ($facet['counts'] as $count) {
                $counts[] = [
                    'value' => $count['value'],
                    'count' => $count['count'],
                ];
            }

            $formattedFacets[$fieldName] = [
                'field' => $fieldName,
                'values' => $counts,
                'stats' => $facet['stats'] ?? null,
            ];
        }

        return $formattedFacets;
    }

    /**
     * Get autocomplete suggestions
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function autocomplete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2|max:255',
            'limit' => 'nullable|integer|min:1|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $query = $request->input('q');
        $limit = $request->input('limit', 5);

        try {
            $searchParams = [
                'q' => $query,
                'query_by' => 'name_ar,name_en',
                'filter_by' => 'status:=true',
                'per_page' => $limit,
            ];

            // Get Typesense client and perform search
            $typesense = $this->getTypesenseClient();
            $rawResults = $typesense->collections['product_index']->documents->search($searchParams);
            
            $results = collect($rawResults['hits'] ?? [])->map(function ($hit) {
                return [
                    'id' => $hit['document']['id'],
                    'name_en' => $hit['document']['name_en'] ?? '',
                    'name_ar' => $hit['document']['name_ar'] ?? '',
                    'price' => $hit['document']['final_price'],
                    'image' => $hit['document']['main_image'] ?? null,
                ];
            });

            return response()->json([
                'success' => true,
                'suggestions' => $results
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Autocomplete failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}



// End of SearchController.php