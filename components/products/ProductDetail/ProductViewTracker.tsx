import { useEffect } from "react";
// في ريأكت نيتف، عادة ما نستخدم مسارات الـ alias المعرفة في tsconfig/babel
import { useAppDispatch } from "@/store/hooks"; 
import { addRecentlyViewed } from "@/store/slices/recentlyViewedSlice";
import { Product } from "@/store/features/products/productsSlice";

interface ProductViewTrackerProps {
    product: Product | null | undefined;
}

/**
 * هذا المكون لا يرندر أي شيء، وظيفته فقط تحديث السجل (Recently Viewed) 
 * عند فتح صفحة المنتج في التطبيق.
 */
export const ProductViewTracker = ({ product }: ProductViewTrackerProps) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (product && product.id) {
            // إضافة المنتج لسجل المشاهدات الأخيرة
            dispatch(addRecentlyViewed(product));
        }
    }, [product?.id, dispatch]); // استخدمنا product.id كاعتماد لضمان عدم التكرار غير الضروري

    return null;
};