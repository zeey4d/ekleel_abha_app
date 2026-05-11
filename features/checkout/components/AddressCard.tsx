import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { Check, MapPin, Pencil } from 'lucide-react-native';
import type { Address } from '@/store/types';

interface Props {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}

const GREEN = '#10b981';

export function AddressCard({ address, selected, onSelect }: Props) {
  const fullName = `${address.firstname} ${address.lastname}`.trim();
  const cityLine = [address.address_1, address.city].filter(Boolean).join('، ');

  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && { opacity: 0.85 },
      ]}
    >
      {/* Selection indicator */}
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>

      {/* Address body */}
      <View style={styles.body}>
        {/* Icon + Name row */}
        <View style={styles.nameRow}>
          <View style={[styles.mapIconWrap, selected && styles.mapIconWrapSelected]}>
            <MapPin size={14} color={selected ? GREEN : '#94a3b8'} strokeWidth={2} />
          </View>
          <Text style={[styles.name, selected && styles.nameSelected]} numberOfLines={1}>
            {fullName}
          </Text>
          {address.default && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>افتراضي</Text>
            </View>
          )}
        </View>

        <Text style={styles.addressLine} numberOfLines={2}>
          {cityLine}
        </Text>

        {address.address_2 ? (
          <Text style={styles.addressSub} numberOfLines={1}>
            {address.address_2}
          </Text>
        ) : null}
      </View>

      {/* Selected checkmark */}
      {selected && (
        <View style={styles.checkCircle}>
          <Check size={12} color="#fff" strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: GREEN,
    backgroundColor: '#f0fdf4',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: GREEN,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GREEN,
  },
  body: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  mapIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapIconWrapSelected: {
    backgroundColor: '#d1fae5',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flexShrink: 1,
  },
  nameSelected: {
    color: '#065f46',
  },
  defaultBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  addressLine: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  addressSub: {
    fontSize: 12,
    color: '#94a3b8',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
