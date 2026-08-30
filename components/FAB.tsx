import React from 'react';
import { Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-6 right-6 w-[60px] h-[60px] rounded-full bg-primary items-center justify-center"
      style={{
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Plus size={28} color="#FFFFFF" />
    </Pressable>
  );
}
