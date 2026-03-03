import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/lib/Colors';
import { useTaskTagIds, useTagsQuery, useSetTaskTags, useCreateTag } from '@/db/useTags';

type TaskDetailTagsProps = {
  taskId: number;
};

export function TaskDetailTags({ taskId }: TaskDetailTagsProps) {
  const { data: tagIds = [] } = useTaskTagIds(taskId);
  const { data: tags = [] } = useTagsQuery();
  const setTaskTags = useSetTaskTags();
  const createTag = useCreateTag();
  const [newTagName, setNewTagName] = useState('');

  const orderMap = new Map(tags.map((t, i) => [t.id, i]));
  const tagItems = tagIds
    .slice()
    .sort((a, b) => (orderMap.get(a) ?? 0) - (orderMap.get(b) ?? 0))
    .map((id) => ({ id, name: tags.find((t) => t.id === id)?.name }))
    .filter((x): x is { id: number; name: string } => Boolean(x.name));

  const existingTagsNotOnTask = tags.filter((t) => !tagIds.includes(t.id));

  const handleAddExistingTag = async (tagId: number) => {
    if (setTaskTags.isPending) return;
    if (tagIds.includes(tagId)) return;
    await setTaskTags.mutateAsync({ taskId, tagIds: [...tagIds, tagId] });
  };

  const handleAddTag = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed || setTaskTags.isPending || createTag.isPending) return;
    try {
      const tag = await createTag.mutateAsync(trimmed);
      const nextIds = [...tagIds, tag.id];
      await setTaskTags.mutateAsync({ taskId, tagIds: nextIds });
      setNewTagName('');
    } catch {
      // keep input on error
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    if (setTaskTags.isPending) return;
    const nextIds = tagIds.filter((id) => id !== tagId);
    await setTaskTags.mutateAsync({ taskId, tagIds: nextIds });
  };

  return (
    <View className="mt-4 px-1">
      <Text className="text-sm mb-2" style={{ color: Colors.textSecondary }}>
        Tags
      </Text>
      {tagItems.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row flex-wrap gap-2 mb-2"
        >
          {tagItems.map(({ id, name }) => (
            <View
              key={id}
              className="flex-row items-center rounded-full px-3 py-1.5"
              style={{ backgroundColor: Colors.card }}
            >
              <Text className="text-sm mr-1.5" style={{ color: Colors.text }}>
                {name}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemoveTag(id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text className="text-base font-bold" style={{ color: Colors.textSecondary }}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      <View className="flex-row items-center gap-2">
        <TextInput
          className="flex-1 p-2.5 rounded"
          style={{ backgroundColor: Colors.card, color: Colors.text }}
          placeholder="Add tag"
          placeholderTextColor={Colors.textSecondary}
          value={newTagName}
          onChangeText={setNewTagName}
          onSubmitEditing={handleAddTag}
        />
        <TouchableOpacity
          onPress={handleAddTag}
          disabled={!newTagName.trim() || setTaskTags.isPending || createTag.isPending}
          className="py-2.5 px-4 rounded"
          style={{
            backgroundColor:
              newTagName.trim() && !setTaskTags.isPending && !createTag.isPending
                ? Colors.primary
                : Colors.border,
          }}
        >
          <Text className="text-sm font-medium" style={{ color: Colors.text }}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
      {existingTagsNotOnTask.length > 0 && (
        <View className="mt-2">
          <Text className="text-xs mb-1.5" style={{ color: Colors.textSecondary }}>
            Add existing tag
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row flex-wrap gap-2"
          >
            {existingTagsNotOnTask.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                onPress={() => handleAddExistingTag(tag.id)}
                disabled={setTaskTags.isPending}
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: Colors.card }}
              >
                <Text className="text-sm" style={{ color: Colors.text }}>
                  + {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
