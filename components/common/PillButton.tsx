import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { Colors } from '@/lib/Colors';

export interface PillButtonCheckButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  completed: boolean;
}

export interface PillButtonMultiCountProps {
  currentCount: number;
  targetCount: number;
  onMinus: () => void;
  minusDisabled?: boolean;
  plusDisabled?: boolean;
  loading?: boolean;
}

export interface PillButtonProps {
  backgroundColor: string;
  onMainPress?: () => void;
  children: React.ReactNode;
  leftContent?: React.ReactNode;
  checkButton?: PillButtonCheckButtonProps;
  multiCount?: PillButtonMultiCountProps;
}

function computeProgressPercentage(currentCount: number, targetCount: number): number {
  if (targetCount <= 0) return 0;
  return Math.min(100, (currentCount / targetCount) * 100);
}

export default function PillButton({
  backgroundColor,
  onMainPress,
  children,
  leftContent,
  checkButton,
  multiCount,
}: PillButtonProps) {
  const progressPercentage =
    multiCount != null
      ? computeProgressPercentage(multiCount.currentCount, multiCount.targetCount)
      : null;

  const MainWrapper = onMainPress != null ? TouchableOpacity : View;
  const mainPressProps = onMainPress != null ? { onPress: onMainPress } : {};

  return (
    <View
      className="flex-1 flex-row items-center my-4 rounded-lg min-h-[68px] overflow-hidden"
      style={{ backgroundColor, position: 'relative' }}
    >
      {progressPercentage != null && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progressPercentage}%`,
            backgroundColor: Colors.success,
            zIndex: 0,
          }}
        />
      )}
      {leftContent != null && <View style={{ zIndex: 1 }}>{leftContent}</View>}
      <MainWrapper
        {...mainPressProps}
        style={{ backgroundColor: 'transparent', zIndex: 1 }}
        className="flex-1 h-full flex flex-row items-center border-r border-gray-600"
      >
        <View className="w-0 sm:w-[52px] h-[52px] transition-all duration-300" />
        <View className="flex-1 flex flex-row items-center justify-center">{children}</View>
      </MainWrapper>

      {multiCount != null && (
        <TouchableOpacity
          onPress={multiCount.onMinus}
          disabled={multiCount.minusDisabled}
          className="h-full w-16 flex items-center justify-center border-r border-gray-600"
          style={{ backgroundColor: 'transparent', zIndex: 1 }}
        >
          {multiCount.loading ? (
            <Icon source="loading" color={Colors.textSecondary} size={24} />
          ) : (
            <Icon source="minus" size={24} color={Colors.text} />
          )}
        </TouchableOpacity>
      )}

      {checkButton != null && (
        <TouchableOpacity
          onPress={checkButton.onPress}
          disabled={checkButton.disabled}
          className="h-full w-16 flex items-center justify-center"
          style={{ backgroundColor: 'transparent', zIndex: 1 }}
        >
          {checkButton.loading ? (
            <Icon source="loading" color={Colors.textSecondary} size={24} />
          ) : (
            <Icon
              source={
                multiCount != null
                  ? checkButton.completed
                    ? 'check'
                    : 'plus'
                  : checkButton.completed
                    ? 'restore'
                    : 'check'
              }
              color={
                multiCount != null
                  ? Colors.text
                  : checkButton.disabled
                    ? Colors.textSecondary
                    : checkButton.completed
                      ? Colors.text
                      : Colors.success
              }
              size={24}
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
