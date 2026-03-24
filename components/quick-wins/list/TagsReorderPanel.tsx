import React from 'react';
import { View } from 'react-native';
import { ReorderEditLayout } from '@/components/common/ReorderEditLayout';
import Spinner from '@/components/common/Spinner';
import type { Tag } from '@/db/types';
import { useReorderTags, useTagsQuery } from '@/db/useTags';

export default function TagsReorderPanel() {
  const { data: tags = [], isLoading } = useTagsQuery();
  const { mutate: reorderTags } = useReorderTags();

  if (isLoading) {
    return <Spinner />;
  }

  if (tags.length === 0) {
    return <View className="py-4" />;
  }

  return (
    <View className="min-h-0 max-h-80 flex-1">
      <ReorderEditLayout<Tag>
        footer={null}
        data={tags}
        getItemId={(t) => t.id.toString()}
        getItemLabel={(t) => t.name}
        onReorder={(reordered) =>
          reorderTags(reordered.map((t, i) => ({ ...t, order: i })))
        }
        loading={isLoading}
      />
    </View>
  );
}
