import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Workout from '../models/Workout';
import WorkoutService from '../services/WorkoutService';
import { commonStyles } from '../styles/common';

interface Props {
  onSelect: (workout: Workout) => void;
  excludeIds?: number[];
}

export default function WorkoutPicker({ onSelect, excludeIds = [] }: Props) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const all = await WorkoutService.getAll();
      setWorkouts(all);
    };

    load();
  }, []);

  const getSortedSearchResults = () => {
    const filtered = workouts.filter(workout => !excludeIds.includes(workout.id!));

    if (!search.trim()) {
      return [...filtered].sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    const lowerSearch = search.toLowerCase();

    return filtered
      .filter(workout => workout.name.toLowerCase().includes(lowerSearch))
      .sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return a.name.localeCompare(b.name);
      });
  };

  const renderItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
      <View style={commonStyles.listItemHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>{item.favorite ? '\u2B50' : '\u2606'}</Text>
      </View>
      <Text style={styles.details}>
        {item.exercises.length} exercise{item.exercises.length === 1 ? '' : 's'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search workouts"
        value={search}
        onChangeText={setSearch}
        style={commonStyles.searchInput}
      />

      <FlatList
        data={getSortedSearchResults()}
        keyExtractor={item => item.id!.toString()}
        renderItem={renderItem}
        contentContainerStyle={commonStyles.listContent}
        ListEmptyComponent={<Text style={commonStyles.mutedText}>No workouts available.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: commonStyles.interactiveListItem,
  name: commonStyles.listItemTitle,
  details: commonStyles.listItemMeta,
});
