import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  TextInput,
  Alert,
  StyleSheet,
  Platform,
  UIManager,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ExerciseService from '../services/ExerciseService';
import Exercise from '../models/Exercise';
import TogglePill from '../components/TogglePill';
import { commonStyles } from '../styles/common';
import { colors, spacing } from '../styles/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [editingMode, setEditingMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState('');
  const [category, setCategory] = useState<'strength' | 'cardio' | 'stretching' | 'warmup'>('strength');
  const [notes, setNotes] = useState('');

  const load = async () => setExercises(await ExerciseService.getAll());

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!editingMode) {
      setFormOpen(false);
      setEditingId(null);
    }
  }, [editingMode]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrimary('');
    setSecondary('');
    setCategory('strength');
    setNotes('');
  };

  const saveExercise = async () => {
    if (!name.trim()) {
      alert('Exercise name required');
      return;
    }

    const exercise = new Exercise(editingId, name, primary, secondary, category, notes);

    if (editingId) {
      await ExerciseService.update(exercise);
    } else {
      await ExerciseService.create(exercise);
    }

    resetForm();
    await load();
    setFormOpen(false);
  };

  const editExercise = (exercise: Exercise) => {
    setEditingId(exercise.id!);
    setName(exercise.name);
    setPrimary(exercise.primaryMuscle);
    setSecondary(exercise.secondaryMuscle);
    setCategory(exercise.category as 'strength' | 'cardio' | 'stretching' | 'warmup');
    setNotes(exercise.notes);
    setFormOpen(true);
  };

  const deleteExercise = (id: number) => {
    Alert.alert('Delete Exercise', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await ExerciseService.delete(id);
          load();
        },
      },
    ]);
  };

  const getSortedSearchResults = () => {
    if (!search.trim()) {
      return [...exercises].sort((a, b) => {
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
      exercises.forEach(exercise => {
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
    <View style={styles.itemContainer}>
      <View style={commonStyles.row}>
        <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">
          {item.name} ({item.primaryMuscle})
        </Text>
        {!editingMode && item.favorite && <Text>{'\u2B50'}</Text>}
      </View>

      <Text style={styles.itemMeta}>
        <Text style={commonStyles.boldText}>Category: </Text>
        {item.category}
      </Text>

      {item.secondaryMuscle ? (
        <Text style={styles.itemMeta}>
          <Text style={commonStyles.boldText}>Secondary: </Text>
          {item.secondaryMuscle}
        </Text>
      ) : null}

      {item.notes ? (
        <Text style={styles.itemMeta}>
          <Text style={commonStyles.boldText}>Note: </Text>
          {item.notes}
        </Text>
      ) : null}

      {editingMode && (
        <View style={styles.actionRow}>
          <Button
            title={item.favorite ? '\u2B50' : '\u2606'}
            onPress={async () => {
              await ExerciseService.toggleFavorite(item.id!, !item.favorite);
              load();
            }}
          />
          <View style={styles.actionSpacer} />
          <Button title="Edit" onPress={() => editExercise(item)} />
          <View style={styles.actionSpacer} />
          <Button title="Delete" color={colors.danger} onPress={() => deleteExercise(item.id!)} />
        </View>
      )}
    </View>
  );

  return (
    <View style={commonStyles.screen}>
      <View style={commonStyles.headerRow}>
        <Text style={commonStyles.title}>Exercises List:</Text>
        <TogglePill
          value={editingMode}
          onChange={setEditingMode}
          activeText="Edit"
          inactiveText="View"
          width={100}
          height={40}
        />
      </View>

      <TextInput
        placeholder="Search exercises"
        value={search}
        onChangeText={setSearch}
        style={commonStyles.searchInput}
      />

      {editingMode && !formOpen && (
        <Button
          title="Add Exercise"
          onPress={() => {
            resetForm();
            setFormOpen(true);
          }}
        />
      )}

      {editingMode && formOpen && (
        <View style={commonStyles.sectionSpacing}>
          <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
          <TextInput
            placeholder="Primary Muscle"
            value={primary}
            onChangeText={setPrimary}
            style={styles.input}
          />
          <TextInput
            placeholder="Secondary Muscle"
            value={secondary}
            onChangeText={setSecondary}
            style={styles.input}
          />

          <Text style={commonStyles.boldText}>Category:</Text>
          <Picker
            selectedValue={category}
            onValueChange={value => setCategory(value as typeof category)}
            style={styles.picker}
          >
            <Picker.Item label="Strength" value="strength" />
            <Picker.Item label="Cardio" value="cardio" />
            <Picker.Item label="Stretching" value="stretching" />
            <Picker.Item label="Warmup" value="warmup" />
          </Picker>

          <TextInput
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={[styles.input, styles.notesInput]}
          />

          <Button title={editingId ? 'Update Exercise' : 'Add Exercise'} onPress={saveExercise} />
          <Button title="Cancel" color={colors.danger} onPress={() => setFormOpen(false)} />
        </View>
      )}

      <FlatList
        data={getSortedSearchResults()}
        keyExtractor={item => item.id!.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    ...commonStyles.input,
    marginBottom: spacing.xs,
  },
  notesInput: {
    height: 60,
  },
  picker: {
    marginBottom: spacing.sm,
  },
  itemContainer: commonStyles.listItem,
  itemTitle: {
    ...commonStyles.itemTitle,
    flex: 1,
  },
  itemMeta: commonStyles.mutedText,
  actionRow: {
    ...commonStyles.row,
    marginTop: spacing.xs,
  },
  actionSpacer: {
    width: spacing.sm,
  },
});
