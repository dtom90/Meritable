import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import TagEditRow from './TagEditRow';
import Spinner from '@/components/common/Spinner';
import { useTagsQuery } from '@/db/useTags';

export default function TagsEditList() {
  const { data: tags = [], isLoading } = useTagsQuery();
  const [editingTagId, setEditingTagId] = useState<number | null>(null);

  if (isLoading) {
    return <Spinner />;
  }

  if (tags.length === 0) {
    return <View className="py-4" />;
  }

  return (
    <ScrollView
      className="max-h-80"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
    >
      {tags.map((tag) => (
        <TagEditRow
          key={tag.id}
          tag={tag}
          editingTagId={editingTagId}
          setEditingTagId={setEditingTagId}
        />
      ))}
    </ScrollView>
  );
}
