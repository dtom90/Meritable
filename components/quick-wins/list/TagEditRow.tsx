import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Icon } from 'react-native-paper';
import type { Tag } from '@/db/types';
import { Colors } from '@/lib/Colors';
import PillButton from '@/components/common/PillButton';
import { useUpdateTag } from '@/db/useTags';

type TagEditRowProps = {
  tag: Tag;
  editingTagId: number | null;
  setEditingTagId: (id: number | null) => void;
};

export default function TagEditRow({ tag, editingTagId, setEditingTagId }: TagEditRowProps) {
  const { mutateAsync: updateTag } = useUpdateTag();
  const isEditing = editingTagId === tag.id;
  const anotherRowEditing = editingTagId != null && editingTagId !== tag.id;
  const [draft, setDraft] = useState(tag.name);
  const committingRef = useRef(false);
  const skipBlurCommitRef = useRef(false);
  const isEditingRef = useRef(isEditing);
  isEditingRef.current = isEditing;

  useEffect(() => {
    if (!isEditing) setDraft(tag.name);
  }, [tag.name, isEditing]);

  useEffect(() => {
    return () => {
      if (isEditingRef.current) setEditingTagId(null);
    };
  }, [setEditingTagId]);

  const beginEdit = useCallback(() => {
    if (anotherRowEditing) return;
    setDraft(tag.name);
    setEditingTagId(tag.id);
  }, [anotherRowEditing, setEditingTagId, tag.id, tag.name]);

  const endEditing = useCallback(() => {
    setEditingTagId(null);
  }, [setEditingTagId]);

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

  if (isEditing) {
    return (
      <View
        className="flex-1 flex-row items-center my-4 rounded-lg min-h-[68px] overflow-hidden"
        style={{ backgroundColor: Colors.card }}
      >
        <View className="flex-1 flex-row items-center px-3 min-w-0" style={{ zIndex: 1 }}>
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
        </View>
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
      </View>
    );
  }

  return (
    <PillButton
      text={tag.name}
      secondaryButton={{
        onPress: beginEdit,
        disabled: anotherRowEditing,
        icon: 'pencil',
        iconColor: Colors.textSecondary,
      }}
    />
  );
}
