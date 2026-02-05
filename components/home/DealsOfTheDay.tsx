

import { useTranslation } from 'react-i18next';
import { ProductCarousel } from '../products/ProductCarousel';

export const DealsOfTheDay = ({ products }: { products: any[] }) => {
  const { t } = useTranslation('home');

  if (!products?.length) return null;

  return (
    <ProductCarousel products={products} title={t('DealsOfTheDay.title')} href="/products/(deals)" />
  );
};
