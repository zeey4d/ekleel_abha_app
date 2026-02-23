import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { addRecentlyViewed } from "@/store/slices/recentlyViewedSlice";
import { Product } from "@/store/features/products/productsSlice";

interface ProductViewTrackerProps {
    product: Product | null | undefined;
}

export const ProductViewTracker = ({ product }: ProductViewTrackerProps) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (product && product.id) {
            dispatch(addRecentlyViewed(product));
        }
    }, [product?.id, dispatch]);

    return null;
};
