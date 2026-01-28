import React from 'react';
import { View, TouchableOpacity, Text, Platform, I18nManager } from 'react-native';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type TabItem = { value: string; title: string; icon?: React.ReactNode; content?: React.ReactNode };

type TabsRootProps = {
  tabs?: TabItem[];
  initialTab?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  children?: React.ReactNode;
};

const TabsContext = React.createContext<{ value: string; setValue: (v: string) => void } | null>(
  null
);

function Tabs({ tabs, initialTab, value, onValueChange, className, children }: TabsRootProps) {
  const [internal, setInternal] = React.useState(initialTab ?? (tabs && tabs[0]?.value) ?? '');
  const selected = value ?? internal;
  const setValue = (v: string) => {
    if (onValueChange) onValueChange(v);
    else setInternal(v);
  };

  return (
    <TabsContext.Provider value={{ value: selected, setValue }}>
      <View className={cn('flex flex-col gap-2', className)}>
        {tabs ? renderFromArray(tabs, selected, setValue) : children}
      </View>
    </TabsContext.Provider>
  );
}

function renderFromArray(tabs: TabItem[], selected: string, setValue: (v: string) => void) {
  const active = tabs.find((t) => t.value === selected) ?? tabs[0];
  const isRTL = I18nManager.isRTL;
  
  return (
    <>
      {/* Content Area */}
      <View className="flex-1 border-t border-border">
        {active?.content}
      </View>

      {/* Bottom Navigation Bar with Enhanced Design & RTL Support */}
      <View className=" backdrop-blur-xl">
        {/* Active Tab Indicator Line */}
        <View 
          className="absolute top-0 h-0.5 "
          style={{
            left: 0,
            right: 0,
          }} 
        />
        
        <View 
          className="flex-row items-center justify-around px-2 py-1 safe-area-bottom"
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}>
          {tabs.map((t, index) => {
            const isActive = t.value === selected;
            return (
              <TouchableOpacity
                key={t.value}
                onPress={() => setValue(t.value)}
                className={cn(
                  'flex-1 items-center justify-center gap-1.5 rounded-2xl px-2 py-1.5 transition-all duration-300',
                  isActive && ' '
                )}
                activeOpacity={0.6}
                style={{
                  transform: [{ scale: isActive ? 1.05 : 1 }],
                }}>
                {/* Icon Container with Animation */}
                <View 
                  className={cn(
                    'transition-all duration-300',
                    isActive && 'scale-110'
                  )}
                  style={{
                    transform: [{ translateY: isActive ? -2 : 0 }],
                  }}>
                  {t.icon}
                </View>
                
                {/* Tab Title */}
                <Text 
                  className={cn(
                    'text-xs font-semibold transition-all duration-300',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                  style={{
                    opacity: isActive ? 1 : 0.7,
                    textAlign: 'center',
                  }}>
                  {t.title}
                </Text>

                {/* Active Indicator Dot */}
                {isActive && (
                  <View className="absolute -top-1 h-1 w-1 " />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );
}

function TabsList({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <View className={cn('flex-row items-center justify-center', className)}>{children}</View>;
}

function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) return null;
  const isActive = ctx.value === value;
  return (
    <TextClassContext.Provider
      value={cn('text-foreground text-sm font-medium', isActive && 'dark:text-foreground')}>
      <TouchableOpacity onPress={() => ctx.setValue(value)} className={cn('px-2 py-1', className)}>
        <Text>{children}</Text>
      </TouchableOpacity>
    </TextClassContext.Provider>
  );
}

function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) return null;
  if (ctx.value !== value) return null;
  return (
    <View className={cn(Platform.select({ web: 'flex-1 outline-none' }), className)}>
      {children}
    </View>
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
