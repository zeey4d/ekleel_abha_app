import * as React from 'react';
import { Modal, View, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { XIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text'; // تأكد من وجود مكون Text يدعم NativeWind
import { cn } from '@/lib/utils';

// السياق لإدارة حالة الفتح والإغلاق
const SheetContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function Sheet({ children, open: openProp, onOpenChange }: any) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children, asChild, ...props }: any) {
  const { setOpen } = React.useContext(SheetContext);
  return (
    <TouchableOpacity onPress={() => setOpen(true)} {...props}>
      {children}
    </TouchableOpacity>
  );
}

export function SheetClose({ children, ...props }: any) {
  const { setOpen } = React.useContext(SheetContext);
  return (
    <TouchableOpacity onPress={() => setOpen(false)} {...props}>
      {children}
    </TouchableOpacity>
  );
}

export function SheetContent({ className, children, side = 'right', ...props }: any) {
  const { open, setOpen } = React.useContext(SheetContext);

  // تحديد مكان الظهور (Side)
  const sideStyles = {
    right: 'right-0 h-full w-3/4 border-l',
    left: 'left-0 h-full w-3/4 border-r',
    bottom: 'bottom-0 w-full h-auto border-t rounded-t-3xl',
    top: 'top-0 w-full h-auto border-b rounded-b-3xl',
  };

  return (
    <Modal
      transparent
      visible={open}
      animationType={side === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={() => setOpen(false)}>
      {/* Overlay */}
      <Pressable className="flex-1 bg-black/50" onPress={() => setOpen(false)} />

      {/* Content Container */}
      <View
        className={cn(
          'absolute bg-white p-4 shadow-xl',
          sideStyles[side as keyof typeof sideStyles],
          className
        )}
        {...props}>
        <TouchableOpacity
          onPress={() => setOpen(false)}
          className="absolute right-4 top-4 z-10 p-2">
          <XIcon size={20} className="text-slate-500" />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
      </View>
    </Modal>
  );
}

export function SheetHeader({ className, ...props }: any) {
  return <View className={cn('mb-4 flex flex-col gap-1.5', className)} {...props} />;
}

export function SheetFooter({ className, ...props }: any) {
  return <View className={cn('mt-auto flex flex-col gap-2 pt-4', className)} {...props} />;
}

export function SheetTitle({ className, children, ...props }: any) {
  return (
    <Text className={cn('text-lg font-semibold text-slate-900', className)} {...props}>
      {children}
    </Text>
  );
}

export function SheetDescription({ className, children, ...props }: any) {
  return (
    <Text className={cn('text-sm text-slate-500', className)} {...props}>
      {children}
    </Text>
  );
}
