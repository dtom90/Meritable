import { useState } from 'react';
import { View } from 'react-native';
import Spinner from '@/components/common/Spinner';
import TagOrderModal from './TagOrderModal';
import QuickWinsTagFilter from './QuickWinsTagFilter';
import QuickWinsTaskList from './QuickWinsTaskList';
import { useQuickWinsList } from './useQuickWinsList';

export default function QuickWinsList() {
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
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
        onSelectTagId={setSelectedTagId}
        onReorderPress={() => setTagOrderModalVisible(true)}
        showReorderButton={tags.length > 0}
      />
      <TagOrderModal
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
