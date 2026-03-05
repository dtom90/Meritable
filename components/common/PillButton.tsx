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
  /** When true, background is #e0e0e0 (e.g. drag preview). */
  isDragging?: boolean;
  /** When true (and not isDragging), background is Colors.success. */
  highlightAsCompleted?: boolean;
  onMainPress?: () => void;
  /** Main label; rendered with standard pill button text styling (text-lg, center, theme color). */
  text?: string;
  /** Optional content rendered below the main title row (e.g. tag pills). */
  children?: React.ReactNode;
  /** When set, renders a drag handle on the left with spacing matching habit/workout lists. */
  dragHandleProps?: PillButtonDragHandleProps | null;
  checkButton?: PillButtonCheckButtonProps;
  multiCount?: PillButtonMultiCountProps;
  /** When true and highlightAsCompleted, shows a checkmark icon on the right in the main row (no separate button). Used by ExerciseList. */
  showCompletedCheckIcon?: boolean;
  /** When set and onMainPress is set, overrides the right-chevron icon (e.g. "pencil"). Must be a react-native-paper icon name. */
  rightIcon?: string;
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

function resolveBackgroundColor(
  isDragging: boolean,
  highlightAsCompleted: boolean
): string {
  if (isDragging) return '#e0e0e0';
  if (highlightAsCompleted) return Colors.success;
  return Colors.card;
}

export default function PillButton({
  isDragging = false,
  highlightAsCompleted = false,
  onMainPress,
  text,
  children,
  dragHandleProps,
  checkButton,
  multiCount,
  showCompletedCheckIcon = false,
  rightIcon,
}: PillButtonProps) {
  const resolvedBackgroundColor = resolveBackgroundColor(
    isDragging,
    highlightAsCompleted
  );
  const progressPercentage =
    multiCount != null
      ? computeProgressPercentage(multiCount.currentCount, multiCount.targetCount)
      : null;

  const MainWrapper = onMainPress != null ? TouchableOpacity : View;
  const mainPressProps = onMainPress != null ? { onPress: onMainPress } : {};
  const chevronColor =
    highlightAsCompleted || checkButton?.completed ? Colors.text : Colors.textSecondary;
  const hasRightButton = multiCount != null || checkButton != null;

  const leftSlot =
    dragHandleProps != null ? (
      <DragHandle dragHandleProps={dragHandleProps} />
    ) : null;

  return (
    <View
      className="flex-1 flex-row items-center my-4 rounded-lg min-h-[68px] overflow-hidden"
      style={{ backgroundColor: resolvedBackgroundColor, position: 'relative' }}
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
        className={`flex-1 h-full flex flex-row items-center ${hasRightButton ? 'border-r border-gray-600' : ''}`}
      >
        <View className="w-0 sm:w-[52px] h-[52px] transition-all duration-300" />
        <View className="flex-1 flex flex-col items-center justify-center">
          <View className="flex-row items-center justify-center gap-2">
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
            {onMainPress != null && (
              <Icon
                source={rightIcon ?? 'chevron-right'}
                color={chevronColor}
                size={20}
              />
            )}
          </View>
          {children != null && (
            <View className="mt-1">{children}</View>
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

      {showCompletedCheckIcon ? (
        <View
          className="h-full w-16 flex items-center justify-center"
          style={{ backgroundColor: 'transparent', zIndex: 1, opacity: highlightAsCompleted ? 1 : 0 }}
        >
          <Icon source="check" color={Colors.text} size={24} />
        </View>
      ) : checkButton != null ? (
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
      ) : null}
    </View>
  );
}
