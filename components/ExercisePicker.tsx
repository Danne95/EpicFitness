import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import ExerciseService from '../services/ExerciseService';
import Exercise from '../models/Exercise';
import { commonStyles } from '../styles/common';

interface Props {
  onSelect: (exercise: Exercise) => void;
  excludeIds?: number[];
}

export default function ExercisePicker({ onSelect, excludeIds = [] }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    const all = await ExerciseService.getAll();
    setExercises(all);
  };

  useEffect(() => {
    load();
  }, []);

  const getSortedSearchResults = () => {
    const filtered = exercises.filter(exercise => !excludeIds.includes(exercise.id!));

    if (!search.trim()) {
      return [...filtered].sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    const lowerSearch = search.toLowerCase();
    const result: Exercise[] = [];
    const fields: ('name' | 'primaryMuscle' | 'secondaryMuscle' | 'category' | 'notes')[] = [
      'name',
      'primaryMuscle',
      'secondaryMuscle',
      'category',
      'notes',
    ];

    const pushIfMatch = (
      field: 'name' | 'primaryMuscle' | 'secondaryMuscle' | 'category' | 'notes',
      favorite: boolean
    ) => {
      filtered.forEach(exercise => {
        const value = exercise[field];
        if (
          typeof value === 'string' &&
          value.toLowerCase().includes(lowerSearch) &&
          exercise.favorite === favorite &&
          !result.some(existing => existing.id === exercise.id)
        ) {
          result.push(exercise);
        }
      });
    };

    fields.forEach(field => {
      pushIfMatch(field, true);
      pushIfMatch(field, false);
    });

    return result;
  };

  const renderItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
      <View style={commonStyles.listItemHeader}>
        <Text style={styles.name}>
          {item.name}
        </Text>
        <Text>{item.favorite ? '\u2B50' : '\u2606'}</Text>
      </View>
      <Text style={styles.details}>
        {item.primaryMuscle}
        {item.secondaryMuscle ? `, ${item.secondaryMuscle}` : ''}
        {` • ${item.category}`}
      </Text>
      {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search exercises"
        value={search}
        onChangeText={setSearch}
        style={commonStyles.searchInput}
      />

      <FlatList
        data={getSortedSearchResults()}
        keyExtractor={item => item.id!.toString()}
        renderItem={renderItem}
        contentContainerStyle={commonStyles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: commonStyles.listItem,
  name: commonStyles.listItemTitle,
  details: commonStyles.listItemMeta,
  notes: {
    ...commonStyles.listItemNote,
    fontStyle: 'italic',
  },
});
