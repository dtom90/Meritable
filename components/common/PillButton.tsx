import React from 'react';
import { View, Text, TouchableOpacity, Pressable, type ViewStyle } from 'react-native';
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

/** Props to spread onto the drag handle (e.g. from @dnd-kit useSortable). When set, a standard drag handle is rendered on the left with pl-4 mr-3 spacing. */
export interface PillButtonDragHandleProps {
  [key: string]: unknown;
}

export interface PillButtonProps {
  backgroundColor: string;
  onMainPress?: () => void;
  /** Main label; rendered with standard pill button text styling (text-lg, center, theme color). */
  text?: string;
  /** Optional extra content (e.g. icon, count) rendered after the text. */
  children?: React.ReactNode;
  leftContent?: React.ReactNode;
  /** When set, renders a drag handle on the left with spacing matching habit/workout lists. */
  dragHandleProps?: PillButtonDragHandleProps | null;
  /** When onMainPress is set, a chevron-right icon is shown. Use this to override its color (e.g. when completed). */
  chevronColor?: string;
  checkButton?: PillButtonCheckButtonProps;
  multiCount?: PillButtonMultiCountProps;
}

function computeProgressPercentage(currentCount: number, targetCount: number): number {
  if (targetCount <= 0) return 0;
  return Math.min(100, (currentCount / targetCount) * 100);
}

function DragHandle({ dragHandleProps }: { dragHandleProps: PillButtonDragHandleProps }) {
  return (
    <View className="pl-4 mr-3 flex-row items-center" style={{ zIndex: 1 }}>
      <Pressable
        style={({ pressed }) =>
          [
            { opacity: pressed ? 0.7 : 1 },
            { cursor: 'grab' as ViewStyle['cursor'] },
          ] as ViewStyle[]
        }
        {...dragHandleProps}
      >
        <Icon source="drag" color={Colors.textSecondary} size={20} />
      </Pressable>
    </View>
  );
}

export default function PillButton({
  backgroundColor,
  onMainPress,
  text,
  children,
  leftContent,
  dragHandleProps,
  chevronColor,
  checkButton,
  multiCount,
}: PillButtonProps) {
  const progressPercentage =
    multiCount != null
      ? computeProgressPercentage(multiCount.currentCount, multiCount.targetCount)
      : null;

  const MainWrapper = onMainPress != null ? TouchableOpacity : View;
  const mainPressProps = onMainPress != null ? { onPress: onMainPress } : {};

  const leftSlot =
    dragHandleProps != null ? (
      <DragHandle dragHandleProps={dragHandleProps} />
    ) : leftContent != null ? (
      <View style={{ zIndex: 1 }}>{leftContent}</View>
    ) : null;

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
      {leftSlot}
      <MainWrapper
        {...mainPressProps}
        style={{ backgroundColor: 'transparent', zIndex: 1 }}
        className="flex-1 h-full flex flex-row items-center border-r border-gray-600"
      >
        <View className="w-0 sm:w-[52px] h-[52px] transition-all duration-300" />
        <View className="flex-1 flex flex-row items-center justify-center gap-2">
          {text != null ? (
            <Text className="text-lg text-center" style={{ color: Colors.text }}>
              {text}
            </Text>
          ) : null}
          {multiCount != null && (
            <Text className="text-lg text-bold text-center ml-2 mr-2" style={{ color: Colors.text }}>
              {multiCount.currentCount} / {multiCount.targetCount}
            </Text>
          )}
          {children}
          {onMainPress != null && (
            <Icon source="chevron-right" color={chevronColor ?? Colors.textSecondary} size={20} />
          )}
        </View>
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
