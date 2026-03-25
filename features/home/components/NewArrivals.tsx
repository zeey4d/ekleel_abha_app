import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProductCarousel } from '@/features/products/components/ProductCarousel';

export const NewArrivals = ({ products }: { products: any[] }) => {
  const { t } = useTranslation('home');

  if (!products?.length) return null;

  return (
    <ProductCarousel 
      products={products} 
      title={t('newArrivals.title')} 
      href="/(tabs)/(home)/(context)/products/(new)" 
    />
  );
};
