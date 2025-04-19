import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const tabs = Array.from({ length: 7 }).map((_, index) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - (6 - index));

    const year = targetDate.getFullYear();
    const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const day = targetDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [activeTab, setActiveTab] = useState(tabs[tabs.length - 1]);

  return (
    <View>
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Added Dynamic Content Area */}
      <ThemedView style={styles.contentContainer}>
        <ThemedText>Content for {activeTab}</ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#1c1c1e', 
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0A84FF', 
  },
  tabText: {
    fontSize: 14,
    color: '#8e8e93', 
  },
  activeTabText: {
    color: '#0A84FF', 
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20, 
    alignItems: 'center', 
  },
});
