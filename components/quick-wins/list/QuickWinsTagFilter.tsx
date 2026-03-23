import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/lib/Colors';
import type { Tag } from '@/db/types';

type QuickWinsTagFilterProps = {
  tagsInUse: Tag[];
  selectedTagId: number | null;
  onSelectTagId: (id: number | null) => void;
  onReorderPress: () => void;
  showReorderButton: boolean;
};

export default function QuickWinsTagFilter({
  tagsInUse,
  selectedTagId,
  onSelectTagId,
  onReorderPress,
  showReorderButton,
}: QuickWinsTagFilterProps) {
  const showBar =
    tagsInUse.length > 0 || selectedTagId != null || showReorderButton;

  if (!showBar) {
    return null;
  }

  return (
    <View className="flex-row items-center gap-3 mb-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row items-center gap-3 flex-1"
      >
        <TouchableOpacity
          onPress={() => onSelectTagId(null)}
          className="px-3 py-1.5 rounded-full mr-2"
          style={{
            backgroundColor: selectedTagId === null ? Colors.primary : Colors.card,
          }}
        >
          <Text className="text-sm" style={{ color: Colors.text }}>
            All
          </Text>
        </TouchableOpacity>
        {tagsInUse.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            onPress={() => onSelectTagId(tag.id)}
            className="px-3 py-1.5 rounded-full mr-2"
            style={{
              backgroundColor:
                selectedTagId === tag.id ? Colors.primary : Colors.card,
            }}
          >
            <Text className="text-sm" style={{ color: Colors.text }}>
              {tag.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {showReorderButton && (
        <TouchableOpacity
          onPress={onReorderPress}
          className="px-3 py-1.5 rounded-full"
          style={{ backgroundColor: Colors.border }}
        >
          <Text className="text-sm" style={{ color: Colors.textSecondary }}>
            Edit tags
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
