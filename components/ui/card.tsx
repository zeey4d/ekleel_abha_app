import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn("rounded-xl border border-border bg-card shadow-sm", className)}
      {...props}
    />
  );
}
