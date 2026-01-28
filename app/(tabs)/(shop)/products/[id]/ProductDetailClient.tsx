"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { addRecentlyViewed } from "@/store/slices/recentlyViewedSlice";
import { Product } from "@/store/features/products/productsSlice";

export default function ProductDetailClient({ product }: { product: Product }) {
    const dispatch = useAppDispatch();

    // Side Effect: Add to Recently Viewed
    useEffect(() => {
        if (product) {
            dispatch(addRecentlyViewed(product));
        } 
    }, [product, dispatch]);

    // This component doesn't render anything, it's just for side effects
    return null;
}
