// components/ExercisePicker.tsx
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

interface Props {
  onSelect: (exercise: Exercise) => void;
  excludeIds?: number[]; // already selected exercises
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

  // Reuse the same search logic from ExercisesScreen
  const getSortedSearchResults = () => {
    let filtered = exercises.filter(ex => !excludeIds.includes(ex.id!));
    if (!search.trim()) {
      return [...filtered].sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    const lowerSearch = search.toLowerCase();
    const result: Exercise[] = [];

    const pushIfMatch = (
      field: 'name' | 'primaryMuscle' | 'secondaryMuscle' | 'category' | 'notes',
      fav: boolean
    ) => {
      filtered.forEach(ex => {
        const value = ex[field];
        if (
          typeof value === 'string' &&
          value.toLowerCase().includes(lowerSearch) &&
          ex.favorite === fav &&
          !result.some(r => r.id === ex.id)
        ) {
          result.push(ex);
        }
      });
    };

    const fields: ('name' | 'primaryMuscle' | 'secondaryMuscle' | 'category' | 'notes')[] =
      ['name', 'primaryMuscle', 'secondaryMuscle', 'category', 'notes'];

    fields.forEach(field => {
      pushIfMatch(field, true);
      pushIfMatch(field, false);
    });

    return result;
  };

  const renderItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.name}>
        {item.name} {item.favorite ? '⭐' : '☆'}
      </Text>
      <Text style={styles.details}>
        {item.primaryMuscle}
        {item.secondaryMuscle ? `, ${item.secondaryMuscle}` : ''}
        {' • ' + item.category}
      </Text>
      {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        placeholder="Search exercises"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      <FlatList
        data={getSortedSearchResults()}
        keyExtractor={item => item.id!.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchInput: { borderWidth: 1, padding: 5, margin: 5, borderRadius: 5 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  name: { fontWeight: 'bold', fontSize: 16 },
  details: { fontSize: 14, color: '#555' },
  notes: { fontSize: 12, color: '#888', fontStyle: 'italic' },
});