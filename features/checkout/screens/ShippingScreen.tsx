import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  I18nManager,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import {
  useGetUserAddressesQuery,
  useGetBranchesQuery,
} from '@/store/features/addresses/addressesSlice';
import { useGetCartQuery } from '@/store/features/cart/cartSlice';
import { CheckoutSteps } from '@/features/checkout/components/CheckoutSteps';
import { AddressCard } from '@/features/checkout/components/AddressCard';
import { AddressFormModal } from '@/features/checkout/components/AddressFormModal';
import { ShippingMethodCard } from '@/features/checkout/components/ShippingMethodCard';
import { ChevronLeft, ChevronRight, MapPin, Truck } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

const TEAL = '#0d9488';

export default function ShippingScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('checkout');
  const insets = useSafeAreaInsets();
  const isRtl = i18n.language === 'ar' || I18nManager.isRTL;

  const [selectedAddressId, setSelectedAddressId] = useState<number | string | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('home_delivery');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  const { data: addressesState, isLoading: loadingAddresses } = useGetUserAddressesQuery();
  const { data: branches, isLoading: loadingBranches } = useGetBranchesQuery();
  const { data: cart, isLoading: loadingCart } = useGetCartQuery();

  const addresses = addressesState?.ids.map((id) => addressesState.entities[id]!) || [];
  const subtotal = cart?.summary?.subtotal ?? cart?.summary?.total ?? 0;

  // Auto-select default address
  useEffect(() => {
    if (addressesState?.defaultAddressId && !selectedAddressId) {
      setSelectedAddressId(addressesState.defaultAddressId);
    }
  }, [addressesState, selectedAddressId]);

  // Auto-select first branch when pickup chosen
  useEffect(() => {
    if (selectedMethodId === 'pickup' && branches && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [selectedMethodId, branches, selectedBranchId]);

  const selectedAddress = addresses.find((a) => a?.id === selectedAddressId);
  const homeDeliveryCost = selectedAddress?.shipping_cost ?? 23;
  const freeShippingThreshold = selectedAddress?.shipping_free_total ?? 250;

  const getShippingCost = () => {
    if (selectedMethodId === 'pickup') return 0;
    return subtotal >= freeShippingThreshold ? 0 : homeDeliveryCost;
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      Toast.show({ 
        type: 'error', 
        text1: t('ShippingForm.selectAddress', 'الرجاء اختيار عنوان الشحن') 
      });
      return;
    }
    if (selectedMethodId === 'pickup' && !selectedBranchId) {
      Toast.show({ 
        type: 'error', 
        text1: t('ShippingForm.validation.branchRequired', 'يرجى اختيار الفرع') 
      });
      return;
    }

    let shippingMethod = selectedMethodId;
    if (selectedMethodId === 'pickup' && selectedBranchId) {
      const branchName = branches?.find((b) => b.id === selectedBranchId)?.name || '';
      shippingMethod = `Pickup from Branch ${branchName}`;
    }

    router.push({
      pathname: '/checkout/payment',
      params: {
        address_id: String(selectedAddressId),
        shipping_method: shippingMethod,
        shipping_cost: String(getShippingCost()),
      },
    });
  };

  const isLoading = loadingAddresses || loadingCart || loadingBranches;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={TEAL} />
        <Text style={styles.loadingText}>{t('Payment.processing', 'جاري التحميل...')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CheckoutSteps currentStep={1} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Section 1: Address ── */}
        <SectionCard>
          <SectionHeader 
            number="1" 
            icon={<MapPin size={16} color={TEAL} />} 
            title={t('ShippingForm.savedAddresses', 'عنوان الشحن')} 
            isRtl={isRtl}
          />

          {addresses.length === 0 ? (
            <View style={styles.emptyAddresses}>
              <MapPin size={32} color="#cbd5e1" />
              <Text style={styles.emptyAddressText}>{t('AddressSelect.noAddresses', 'لا توجد عناوين محفوظة')}</Text>
            </View>
          ) : (
            addresses.map((addr) =>
              addr ? (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  selected={selectedAddressId === addr.id}
                  onSelect={() => setSelectedAddressId(addr.id)}
                />
              ) : null
            )
          )}

          <AddressFormModal onAddressAdded={(id) => setSelectedAddressId(id)} />
        </SectionCard>

        {/* ── Section 2: Delivery Method ── */}
        <SectionCard>
          <SectionHeader 
            number="2" 
            icon={<Truck size={16} color={TEAL} />} 
            title={t('Review.delivery', 'طريقة التوصيل')} 
            isRtl={isRtl}
          />

          <ShippingMethodCard
            selectedId={selectedMethodId}
            onSelect={setSelectedMethodId}
            subtotal={subtotal}
            homeDeliveryCost={getShippingCost()}
            freeShippingThreshold={freeShippingThreshold}
            branches={branches}
            selectedBranchId={selectedBranchId}
            onBranchSelect={setSelectedBranchId}
          />
        </SectionCard>
      </ScrollView>

      {/* ── Fixed Continue Button ── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.85 }, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
        >
          {isRtl ? <ChevronLeft size={20} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} /> : <ChevronRight size={20} color="#fff" />}
          <Text style={styles.continueBtnText}>{t('ShippingForm.continueToPayment', 'متابعة للدفع')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

function SectionHeader({
  number,
  icon,
  title,
  isRtl,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  isRtl: boolean;
}) {
  return (
    <View style={[styles.sectionHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
      <View style={styles.sectionNum}>
        <Text style={styles.sectionNumText}>{number}</Text>
      </View>
      {icon}
      <Text style={[styles.sectionTitle, { textAlign: isRtl ? 'right' : 'left' }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionNum: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumText: {
    fontSize: 14,
    fontFamily: 'Tajawal_700Bold',
    color: TEAL,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
    color: '#1e293b',
    flex: 1,
  },
  emptyAddresses: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyAddressText: {
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
    color: '#94a3b8',
  },
  bottomBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  continueBtn: {
    backgroundColor: TEAL,
    borderRadius: 32,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  continueBtnText: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
    color: '#fff',
  },
});
