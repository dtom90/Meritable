import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/lib/Colors';
import { useTaskTagIds, useTagsQuery, useSetTaskTags, useCreateTag } from '@/db/useTags';

type TaskDetailTagsDetailProps = {
  taskId: number;
  value?: never;
  onChange?: never;
};

type TaskDetailTagsFormProps = {
  taskId?: never;
  value: string[];
  onChange: (names: string[]) => void;
};

export type TaskDetailTagsProps = TaskDetailTagsDetailProps | TaskDetailTagsFormProps;

function isDetailMode(
  props: TaskDetailTagsProps
): props is TaskDetailTagsDetailProps {
  return 'taskId' in props && props.taskId !== undefined;
}

export function TaskDetailTags(props: TaskDetailTagsProps) {
  const isDetail = isDetailMode(props);
  const controlledValue = !isDetail ? props.value : undefined;
  const controlledOnChange = !isDetail ? props.onChange : undefined;

  const { data: tagIds = [] } = useTaskTagIds(isDetail ? props.taskId : undefined);
  const { data: tags = [] } = useTagsQuery();
  const setTaskTags = useSetTaskTags();
  const createTag = useCreateTag();
  const [newTagName, setNewTagName] = useState('');

  // Detail mode: tag items from task tag IDs + tag names
  const orderMap = new Map(tags.map((t, i) => [t.id, i]));
  const detailTagItems: { id: number; name: string }[] = isDetail
    ? tagIds
        .slice()
        .sort((a, b) => (orderMap.get(a) ?? 0) - (orderMap.get(b) ?? 0))
        .map((id) => ({ id, name: tags.find((t) => t.id === id)?.name }))
        .filter((x): x is { id: number; name: string } => Boolean(x.name))
    : [];

  // Form mode: display names from controlled value
  const formTagItems: string[] = !isDetail ? (controlledValue ?? []) : [];

  const existingTagsNotOnTask = isDetail
    ? tags.filter((t) => !tagIds.includes(t.id))
    : tags.filter((t) => !(controlledValue ?? []).includes(t.name));

  const handleAddExistingTagDetail = async (tagId: number) => {
    if (setTaskTags.isPending || !isDetail) return;
    if (tagIds.includes(tagId)) return;
    await setTaskTags.mutateAsync({ taskId: props.taskId, tagIds: [...tagIds, tagId] });
  };

  const handleAddExistingTagForm = (tagName: string) => {
    if (!controlledOnChange || (controlledValue ?? []).includes(tagName)) return;
    controlledOnChange([...(controlledValue ?? []), tagName]);
  };

  const handleAddTagDetail = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed || setTaskTags.isPending || createTag.isPending || !isDetail) return;
    try {
      const tag = await createTag.mutateAsync(trimmed);
      const nextIds = [...tagIds, tag.id];
      await setTaskTags.mutateAsync({ taskId: props.taskId, tagIds: nextIds });
      setNewTagName('');
    } catch {
      // keep input on error
    }
  };

  const handleAddTagForm = () => {
    const trimmed = newTagName.trim();
    if (!trimmed || !controlledOnChange) return;
    if ((controlledValue ?? []).includes(trimmed)) {
      setNewTagName('');
      return;
    }
    controlledOnChange([...(controlledValue ?? []), trimmed]);
    setNewTagName('');
  };

  const handleRemoveTagDetail = async (tagId: number) => {
    if (setTaskTags.isPending || !isDetail) return;
    const nextIds = tagIds.filter((id) => id !== tagId);
    await setTaskTags.mutateAsync({ taskId: props.taskId, tagIds: nextIds });
  };

  const handleRemoveTagForm = (tagName: string) => {
    if (!controlledOnChange) return;
    controlledOnChange((controlledValue ?? []).filter((n) => n !== tagName));
  };

  const tagItems = isDetail ? detailTagItems ?? [] : formTagItems;
  const showPills = tagItems.length > 0;

  return (
    <View className="mt-4 px-1">
      <Text className="text-sm mb-2" style={{ color: Colors.textSecondary }}>
        Tags
      </Text>
      {showPills && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row flex-wrap gap-2 mb-2"
        >
          {isDetail
            ? (tagItems as { id: number; name: string }[]).map(({ id, name }) => (
                <View
                  key={id}
                  className="flex-row items-center rounded-full px-3 py-1.5"
                  style={{ backgroundColor: Colors.card }}
                >
                  <Text className="text-sm mr-1.5" style={{ color: Colors.text }}>
                    {name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTagDetail(id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text className="text-base font-bold" style={{ color: Colors.textSecondary }}>
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            : (tagItems as string[]).map((name) => (
                <View
                  key={name}
                  className="flex-row items-center rounded-full px-3 py-1.5"
                  style={{ backgroundColor: Colors.card }}
                >
                  <Text className="text-sm mr-1.5" style={{ color: Colors.text }}>
                    {name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTagForm(name)}
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
          onSubmitEditing={isDetail ? handleAddTagDetail : handleAddTagForm}
        />
        <TouchableOpacity
          onPress={isDetail ? handleAddTagDetail : handleAddTagForm}
          disabled={
            isDetail
              ? !newTagName.trim() || setTaskTags.isPending || createTag.isPending
              : !newTagName.trim()
          }
          className="py-2.5 px-4 rounded"
          style={{
            backgroundColor:
              newTagName.trim() &&
              (isDetail ? !setTaskTags.isPending && !createTag.isPending : true)
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
                onPress={() =>
                  isDetail ? handleAddExistingTagDetail(tag.id) : handleAddExistingTagForm(tag.name)
                }
                disabled={isDetail ? setTaskTags.isPending : false}
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
