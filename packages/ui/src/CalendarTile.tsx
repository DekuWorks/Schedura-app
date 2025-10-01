import React from 'react';
import { Platform } from 'react-native';
import { clsx } from 'clsx';

interface CalendarTileProps {
  date: Date;
  isToday?: boolean;
  isSelected?: boolean;
  hasTasks?: boolean;
  onPress?: (date: Date) => void;
  className?: string;
}

export function CalendarTile({ 
  date, 
  isToday = false, 
  isSelected = false, 
  hasTasks = false,
  onPress,
  className 
}: CalendarTileProps) {
  const dayNumber = date.getDate();
  
  if (Platform.OS === 'web') {
    return (
      <button
        onClick={() => onPress?.(date)}
        className={clsx(
          'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors',
          isToday && 'bg-[#20B2AA] text-white',
          isSelected && !isToday && 'bg-[#e0f7f7] text-[#20B2AA] font-bold',
          !isToday && !isSelected && 'text-gray-700 hover:bg-gray-100',
          className
        )}
      >
        {dayNumber}
        {hasTasks && (
          <div className="w-1 h-1 bg-[#20B2AA] rounded-full absolute bottom-1" />
        )}
      </button>
    );
  }

  // React Native implementation
  const ReactNativeTouchableOpacity = require('react-native').TouchableOpacity;
  const ReactNativeText = require('react-native').Text;
  const ReactNativeView = require('react-native').View;

  return (
    <ReactNativeTouchableOpacity
      onPress={() => onPress?.(date)}
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isToday 
          ? '#20B2AA' 
          : isSelected 
            ? '#e0f7f7' 
            : 'transparent',
      }}
    >
      <ReactNativeText
        style={{
          fontSize: 14,
          fontWeight: isSelected ? 'bold' : 'normal',
          color: isToday 
            ? '#ffffff' 
            : isSelected 
              ? '#20B2AA' 
              : '#374151',
        }}
      >
        {dayNumber}
      </ReactNativeText>
      {hasTasks && (
        <ReactNativeView
          style={{
            position: 'absolute',
            bottom: 2,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#20B2AA',
          }}
        />
      )}
    </ReactNativeTouchableOpacity>
  );
}
