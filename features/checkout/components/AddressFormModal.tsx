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
import { I18nManager } from 'react-native';
import { cn } from '@/lib/utils';

const TEAL = '#0d9488';

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
        className={cn(
          "flex-row items-center gap-2 py-4 px-5 rounded-[24px] border-[1.5px] border-dashed border-teal-600 bg-teal-50 justify-center mb-2",
          I18nManager.isRTL && "flex-row-reverse"
        )}
        style={({ pressed }) => [pressed && { opacity: 0.8 }]}
      >
        <Plus size={18} color={TEAL} strokeWidth={2.5} />
        <Text className="text-[14px] font-bold text-teal-600 font-tajawal">إضافة عنوان جديد</Text>
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
          <View className={cn("flex-row items-center px-4 pt-5 pb-4 bg-white border-b border-slate-100 gap-3", I18nManager.isRTL && "flex-row-reverse")}>
            <Pressable onPress={() => setVisible(false)} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
              <X size={20} color="#374151" />
            </Pressable>
            <Text className="flex-1 text-[18px] font-bold text-slate-800 text-center font-tajawal">إضافة عنوان جديد</Text>
            <View className="w-10 h-10 rounded-full bg-teal-50 items-center justify-center">
              <MapPin size={20} color={TEAL} />
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Fields */}
            <View className={cn("flex-row gap-3", I18nManager.isRTL && "flex-row-reverse")}>
              <Field
                label="الاسم الأول *"
                value={form.firstname}
                onChange={set('firstname')}
                placeholder="مثال: محمد"
                className="flex-1"
              />
              <Field
                label="الاسم الأخير"
                value={form.lastname}
                onChange={set('lastname')}
                placeholder="مثال: العمري"
                className="flex-1"
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
              className="bg-teal-600 rounded-[24px] py-4 items-center mt-4 shadow-sm"
              style={({ pressed }) => [
                pressed && { opacity: 0.85 },
                isLoading && { opacity: 0.6 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-[16px] font-bold text-white font-tajawal">حفظ العنوان</Text>
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
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad';
  className?: string;
}) {
  return (
    <View className={cn("gap-2", className)}>
      <Text className={cn("text-[14px] font-bold text-slate-700 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType || 'default'}
        textAlign={I18nManager.isRTL ? "right" : "left"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
    color: '#1e293b',
  },
});
