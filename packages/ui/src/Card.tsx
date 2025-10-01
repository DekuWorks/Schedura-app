import React from 'react';
import { Platform } from 'react-native';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: any;
}

export function Card({ children, className, style }: CardProps) {
  if (Platform.OS === 'web') {
    return (
      <div
        className={clsx(
          'bg-[#faf8f3] rounded-lg shadow-sm border border-gray-200 p-4',
          className
        )}
        style={style}
      >
        {children}
      </div>
    );
  }

  // React Native implementation
  const ReactNativeView = require('react-native').View;
  const ReactNativeText = require('react-native').Text;

  return (
    <ReactNativeView
      style={[
        {
          backgroundColor: '#faf8f3',
          borderRadius: 8,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        },
        style,
      ]}
    >
      {children}
    </ReactNativeView>
  );
}
