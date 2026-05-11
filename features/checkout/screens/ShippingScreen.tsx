import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
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
import { ChevronLeft, MapPin, Truck } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

const GREEN = '#10b981';

export default function ShippingScreen() {
  const router = useRouter();

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
      Toast.show({ type: 'error', text1: 'يرجى اختيار عنوان الشحن' });
      return;
    }
    if (selectedMethodId === 'pickup' && !selectedBranchId) {
      Toast.show({ type: 'error', text1: 'يرجى اختيار الفرع' });
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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <CheckoutSteps currentStep={1} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Section 1: Address ── */}
        <SectionCard>
          <SectionHeader number="1" icon={<MapPin size={16} color={GREEN} />} title="عنوان الشحن" />

          {addresses.length === 0 ? (
            <View style={styles.emptyAddresses}>
              <MapPin size={32} color="#cbd5e1" />
              <Text style={styles.emptyAddressText}>لا توجد عناوين محفوظة</Text>
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
          <SectionHeader number="2" icon={<Truck size={16} color={GREEN} />} title="طريقة التوصيل" />

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

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Fixed Continue Button ── */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.85 }]}
        >
          <ChevronLeft size={20} color="#fff" />
          <Text style={styles.continueBtnText}>متابعة للدفع</Text>
        </Pressable>
      </View>
    </SafeAreaView>
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
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionNum}>
        <Text style={styles.sectionNumText}>{number}</Text>
      </View>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
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
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
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
    flexDirection: 'row',
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
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: GREEN,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
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
    color: '#94a3b8',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 16,
    paddingBottom: 24,
  },
  continueBtn: {
    backgroundColor: GREEN,
    borderRadius: 18,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
