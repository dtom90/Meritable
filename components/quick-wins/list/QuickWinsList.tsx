import { useState } from 'react';
import { View } from 'react-native';
import Spinner from '@/components/common/Spinner';
import TagsEditModal from './TagsEditModal';
import QuickWinsTagFilter from './QuickWinsTagFilter';
import QuickWinsTaskList from './QuickWinsTaskList';
import { useQuickWinsList } from './useQuickWinsList';

type QuickWinsListProps = {
  selectedTagId: number | null;
  onSelectTagId: (id: number | null) => void;
};

export default function QuickWinsList({
  selectedTagId,
  onSelectTagId,
}: QuickWinsListProps) {
  const [tagOrderModalVisible, setTagOrderModalVisible] = useState(false);
  const {
    tasksFiltered,
    tagsInUse,
    tags,
    getTaskTags,
    isLoading,
  } = useQuickWinsList(selectedTagId);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <View>
      <QuickWinsTagFilter
        tagsInUse={tagsInUse}
        selectedTagId={selectedTagId}
        onSelectTagId={onSelectTagId}
        onReorderPress={() => setTagOrderModalVisible(true)}
        showReorderButton={tags.length > 0}
      />
      <TagsEditModal
        visible={tagOrderModalVisible}
        onClose={() => setTagOrderModalVisible(false)}
      />
      <QuickWinsTaskList
        tasks={tasksFiltered}
        getTaskTags={getTaskTags}
        selectedTagId={selectedTagId}
      />
    </View>
  );
}
