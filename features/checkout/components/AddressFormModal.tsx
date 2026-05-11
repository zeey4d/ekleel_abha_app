import React, { useState } from 'react';
import {
  View,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { X, Plus, MapPin } from 'lucide-react-native';
import { useAddAddressMutation } from '@/store/features/addresses/addressesSlice';
import Toast from 'react-native-toast-message';

const GREEN = '#10b981';

interface Props {
  onAddressAdded: (id: number | string) => void;
}

interface FormData {
  firstname: string;
  lastname: string;
  address_1: string;
  address_2: string;
  city: string;
  phone: string;
}

const EMPTY_FORM: FormData = {
  firstname: '',
  lastname: '',
  address_1: '',
  address_2: '',
  city: '',
  phone: '',
};

export function AddressFormModal({ onAddressAdded }: Props) {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [addAddress, { isLoading }] = useAddAddressMutation();

  const set = (key: keyof FormData) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.firstname.trim() || !form.address_1.trim() || !form.city.trim()) {
      Toast.show({ type: 'error', text1: 'يرجى ملء الحقول المطلوبة' });
      return;
    }

    try {
      const result = await addAddress({
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        address_1: form.address_1.trim(),
        address_2: form.address_2.trim(),
        city: form.city.trim(),
        country_id: 184, // Saudi Arabia
        zone_id: 0,
        default: false,
      }).unwrap();

      const newId = (result as any)?.id ?? (result as any)?.data?.id;
      Toast.show({ type: 'success', text1: 'تمت إضافة العنوان بنجاح' });
      setForm(EMPTY_FORM);
      setVisible(false);
      if (newId) onAddressAdded(newId);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'فشل إضافة العنوان';
      Toast.show({ type: 'error', text1: msg });
    }
  };

  return (
    <>
      {/* Trigger button */}
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.trigger, pressed && { opacity: 0.8 }]}
      >
        <Plus size={16} color={GREEN} strokeWidth={2.5} />
        <Text style={styles.triggerText}>إضافة عنوان جديد</Text>
      </Pressable>

      {/* Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setVisible(false)} style={styles.closeBtn}>
              <X size={20} color="#374151" />
            </Pressable>
            <Text style={styles.modalTitle}>إضافة عنوان جديد</Text>
            <View style={styles.headerIcon}>
              <MapPin size={18} color={GREEN} />
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Fields */}
            <View style={styles.row}>
              <Field
                label="الاسم الأول *"
                value={form.firstname}
                onChange={set('firstname')}
                placeholder="مثال: محمد"
                style={styles.halfField}
              />
              <Field
                label="الاسم الأخير"
                value={form.lastname}
                onChange={set('lastname')}
                placeholder="مثال: العمري"
                style={styles.halfField}
              />
            </View>

            <Field
              label="العنوان *"
              value={form.address_1}
              onChange={set('address_1')}
              placeholder="الشارع، رقم المبنى"
            />
            <Field
              label="تفاصيل إضافية"
              value={form.address_2}
              onChange={set('address_2')}
              placeholder="الحي، الدور، الشقة (اختياري)"
            />
            <Field
              label="المدينة *"
              value={form.city}
              onChange={set('city')}
              placeholder="مثال: أبها"
            />
            <Field
              label="رقم الجوال"
              value={form.phone}
              onChange={set('phone')}
              placeholder="05xxxxxxxx"
              keyboardType="phone-pad"
            />

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && { opacity: 0.85 },
                isLoading && { opacity: 0.6 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>حفظ العنوان</Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  style,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad';
  style?: object;
}) {
  return (
    <View style={[styles.fieldWrapper, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType || 'default'}
        textAlign="right"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: GREEN,
    borderStyle: 'dashed',
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
  },
  triggerText: {
    fontSize: 13,
    fontWeight: '600',
    color: GREEN,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfField: {
    flex: 1,
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  submitBtn: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
