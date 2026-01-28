import React from 'react';
import { View, Pressable } from 'react-native';
import { LayoutGrid, List } from 'lucide-react-native';

interface ViewToggleProps {
  mode: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
}

export const ViewToggle = ({ mode, onChange }: ViewToggleProps) => {
  return (
    <View className="flex-row bg-slate-100 rounded-lg p-1">
      <Pressable
        onPress={() => onChange('grid')}
        className={`p-2 rounded-md ${mode === 'grid' ? 'bg-white shadow-sm' : ''}`}
      >
        <LayoutGrid size={20} color={mode === 'grid' ? '#0f172a' : '#94a3b8'} />
      </Pressable>
      <Pressable
        onPress={() => onChange('list')}
        className={`p-2 rounded-md ${mode === 'list' ? 'bg-white shadow-sm' : ''}`}
      >
        <List size={20} color={mode === 'list' ? '#0f172a' : '#94a3b8'} />
      </Pressable>
    </View>
  );
};