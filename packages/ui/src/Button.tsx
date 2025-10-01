import React from 'react';
import { Platform } from 'react-native';
import { clsx } from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function Button({ 
  children, 
  onPress, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className 
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-medium transition-colors';
  
  const variantStyles = {
    primary: 'bg-[#20B2AA] text-white hover:bg-[#1a9b95]',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-[#20B2AA] text-[#20B2AA] hover:bg-[#20B2AA] hover:text-white'
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  if (Platform.OS === 'web') {
    return (
      <button
        onClick={onPress}
        disabled={disabled}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {children}
      </button>
    );
  }

  // React Native implementation
  const ReactNativeButton = require('react-native').TouchableOpacity;
  const ReactNativeText = require('react-native').Text;
  
  const rnStyles = {
    primary: { backgroundColor: '#20B2AA' },
    secondary: { backgroundColor: '#e5e7eb' },
    outline: { borderWidth: 1, borderColor: '#20B2AA', backgroundColor: 'transparent' }
  };

  const rnSizeStyles = {
    sm: { paddingHorizontal: 12, paddingVertical: 6 },
    md: { paddingHorizontal: 16, paddingVertical: 8 },
    lg: { paddingHorizontal: 24, paddingVertical: 12 }
  };

  return (
    <ReactNativeButton
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        rnStyles[variant],
        rnSizeStyles[size]
      ]}
    >
      <ReactNativeText
        style={{
          color: variant === 'outline' ? '#20B2AA' : '#ffffff',
          fontWeight: '500',
          fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
        }}
      >
        {children}
      </ReactNativeText>
    </ReactNativeButton>
  );
}
