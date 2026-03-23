import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  Alert,
  Platform,
  type ViewStyle,
  ViewProps,
} from 'react-native';
import { Icon } from 'react-native-paper';
import type { Tag } from '@/db/types';
import { Colors } from '@/lib/Colors';
import type { PillButtonDragHandleProps } from '@/components/common/PillButton';
import { useUpdateTag } from '@/db/useTags';

interface TagReorderItemProps extends ViewProps {
  tag: Tag;
  isDragging?: boolean;
  dragHandleProps?: PillButtonDragHandleProps | null;
  onEditingChange: (id: number | null) => void;
  /** When true, drag is disabled (e.g. another row or this row is editing). */
  dragFrozen?: boolean;
}

const TagReorderItem = React.forwardRef<View, TagReorderItemProps>(function TagReorderItem(
  {
    tag,
    isDragging = false,
    dragHandleProps,
    onEditingChange,
    dragFrozen = false,
    style,
    ...props
  },
  ref
) {
  const { mutateAsync: updateTag } = useUpdateTag();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(tag.name);
  const committingRef = useRef(false);
  /** When true, blur was caused by tapping save — let onPress commit so we don't unmount the button before the click finishes (web ghost-click → pencil/name). */
  const skipBlurCommitRef = useRef(false);
  const isEditingRef = useRef(isEditing);
  isEditingRef.current = isEditing;

  useEffect(() => {
    if (!isEditing) setDraft(tag.name);
  }, [tag.name, isEditing]);

  useEffect(() => {
    return () => {
      if (isEditingRef.current) onEditingChange(null);
    };
  }, [onEditingChange]);

  const beginEdit = useCallback(() => {
    if (dragFrozen && !isEditing) return;
    setDraft(tag.name);
    setIsEditing(true);
    onEditingChange(tag.id);
  }, [dragFrozen, isEditing, onEditingChange, tag.id, tag.name]);

  const endEditing = useCallback(() => {
    setIsEditing(false);
    onEditingChange(null);
  }, [onEditingChange]);

  const commit = useCallback(async () => {
    if (committingRef.current) return;
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(tag.name);
      endEditing();
      return;
    }
    if (trimmed === tag.name) {
      endEditing();
      return;
    }
    committingRef.current = true;
    try {
      await updateTag({ id: tag.id, name: trimmed });
      endEditing();
    } catch (e) {
      Alert.alert(
        'Could not rename',
        e instanceof Error ? e.message : 'Something went wrong'
      );
    } finally {
      committingRef.current = false;
    }
  }, [draft, endEditing, tag.id, tag.name, updateTag]);

  const canDrag = dragHandleProps != null && !isEditing && !dragFrozen;
  const bg = isDragging ? '#e0e0e0' : Colors.card;

  return (
    <View ref={ref} style={[isDragging && { opacity: 0.5 }, style]} {...props}>
      <View
        className="flex-1 flex-row items-center my-4 rounded-lg min-h-[68px] overflow-hidden"
        style={{ backgroundColor: bg }}
      >
        {canDrag ? (
          <View className="pl-4 mr-3 flex-row items-center" style={{ zIndex: 1 }}>
            <Pressable
              style={({ pressed }) =>
                [{ opacity: pressed ? 0.7 : 1 }, { cursor: 'grab' as ViewStyle['cursor'] }] as ViewStyle[]
              }
              {...dragHandleProps}
            >
              <Icon source="drag" color={Colors.textSecondary} size={20} />
            </Pressable>
          </View>
        ) : (
          <View className="pl-4 mr-3 w-[44px] flex-row items-center justify-center" />
        )}

        <View className="flex-1 flex-row items-center pr-2 min-w-0" style={{ zIndex: 1 }}>
          {isEditing ? (
            <TextInput
              className="flex-1 text-lg py-2 px-2 rounded"
              style={{ backgroundColor: Colors.surface, color: Colors.text }}
              value={draft}
              onChangeText={setDraft}
              autoFocus
              selectTextOnFocus
              placeholderTextColor={Colors.textSecondary}
              onSubmitEditing={() => {
                void commit();
              }}
              onBlur={() => {
                if (skipBlurCommitRef.current) {
                  skipBlurCommitRef.current = false;
                  return;
                }
                void commit();
              }}
            />
          ) : (
            <Pressable
              onPress={beginEdit}
              className="flex-1 py-3 justify-center"
              disabled={dragFrozen}
            >
              <Text className="text-lg text-center" style={{ color: Colors.text }} numberOfLines={1}>
                {tag.name}
              </Text>
            </Pressable>
          )}
        </View>

        {isEditing ? (
          <TouchableOpacity
            onPressIn={() => {
              skipBlurCommitRef.current = true;
            }}
            onPressOut={() => {
              setTimeout(() => {
                skipBlurCommitRef.current = false;
              }, 0);
            }}
            onPress={() => {
              skipBlurCommitRef.current = false;
              void commit();
            }}
            accessibilityLabel="Save tag name"
            className="h-full w-14 flex items-center justify-center"
            style={{ zIndex: 1 }}
            {...(Platform.OS === 'web'
              ? {
                  onMouseDown: (e: { preventDefault: () => void }) => e.preventDefault(),
                }
              : {})}
          >
            <Icon source="check" color={Colors.success} size={24} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={beginEdit}
            disabled={dragFrozen}
            accessibilityLabel="Edit tag name"
            className="h-full w-14 flex items-center justify-center"
            style={{ zIndex: 1, opacity: dragFrozen ? 0.35 : 1 }}
          >
            <Icon source="pencil" color={Colors.textSecondary} size={22} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

export default TagReorderItem;
