// screens/ExercisesScreen.tsx
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

// Enable LayoutAnimation on Android
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
  const [category, setCategory] = useState<'strength'|'cardio'|'stretching'|'warmup'>('strength');
  const [notes, setNotes] = useState('');

  // Load exercises
  const load = async () => setExercises(await ExerciseService.getAll());
  useEffect(() => { load(); }, []);

  // Close form when exiting edit mode
  useEffect(() => {
    if (!editingMode) {
      setFormOpen(false);
      setEditingId(null);
    }
  }, [editingMode]);

  const saveExercise = async () => {
    if (!name.trim()) {
      alert('Exercise name required');
      return;
    }

    const ex = new Exercise(editingId, name, primary, secondary, category, notes);

    if (editingId) await ExerciseService.update(ex);
    else await ExerciseService.create(ex);

    setEditingId(null);
    setName('');
    setPrimary('');
    setSecondary('');
    setCategory('strength');
    setNotes('');

    await load();
    setFormOpen(false);
  };

  const editExercise = (ex: Exercise) => {
    setEditingId(ex.id!);
    setName(ex.name);
    setPrimary(ex.primaryMuscle);
    setSecondary(ex.secondaryMuscle);
    setCategory(ex.category as any);
    setNotes(ex.notes);
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

    const pushIfMatch = (
      field: 'name' | 'primaryMuscle' | 'secondaryMuscle' | 'category' | 'notes',
      fav: boolean
    ) => {
      exercises.forEach(ex => {
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
    <View style={styles.itemContainer}>
      {/* Title + Star */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={[styles.itemTitle, { flex: 1 }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name} ({item.primaryMuscle})
        </Text>

        {!editingMode && item.favorite && <Text>⭐</Text>}
      </View>

      <Text style={styles.itemCategory}>
        <Text style={styles.label}>Category: </Text>{item.category}
      </Text>

      {item.secondaryMuscle ? (
        <Text style={styles.itemSecondary}>
          <Text style={styles.label}>Secondary: </Text>{item.secondaryMuscle}
        </Text>
      ) : null}

      {item.notes ? (
        <Text style={styles.itemNotes}>
          <Text style={styles.label}>Note: </Text>{item.notes}
        </Text>
      ) : null}

      {/* Editing buttons */}
      {editingMode && (
        <View style={{ flexDirection: 'row', marginTop: 5 }}>
          <Button
            title={item.favorite ? '⭐' : '☆'}
            onPress={async () => {
              await ExerciseService.toggleFavorite(item.id!, !item.favorite);
              load();
            }}
          />
          <View style={{ width: 10 }} />
          <Button title="Edit" onPress={() => editExercise(item)} />
          <View style={{ width: 10 }} />
          <Button title="Delete" color="red" onPress={() => deleteExercise(item.id!)} />
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Exercises</Text>
        <TogglePill
          value={editingMode}
          onChange={setEditingMode}
          activeText="Edit"
          inactiveText="View"
          width={100}
          height={40}
        />
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search exercises"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* Add button */}
      {editingMode && !formOpen && (
        <Button
          title="Add Exercise"
          onPress={() => {
            setEditingId(null);
            setName('');
            setPrimary('');
            setSecondary('');
            setCategory('strength');
            setNotes('');
            setFormOpen(true);
          }}
        />
      )}

      {/* Inline Form */}
      {editingMode && formOpen && (
        <View style={styles.formContainer}>
          <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="Primary Muscle" value={primary} onChangeText={setPrimary} style={styles.input} />
          <TextInput placeholder="Secondary Muscle" value={secondary} onChangeText={setSecondary} style={styles.input} />

          <Text style={{ fontWeight: 'bold' }}>Category:</Text>
          <Picker selectedValue={category} onValueChange={v => setCategory(v as any)} style={styles.picker}>
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
            style={[styles.input, { height: 60 }]}
          />

          <Button
            title={editingId ? 'Update Exercise' : 'Add Exercise'}
            onPress={saveExercise}
          />

          <Button 
            title="Cancel" 
            color="red"
            onPress={() => setFormOpen(false)} 
          />
        </View>
      )}

      {/* List */}
      <FlatList
        data={getSortedSearchResults()}
        keyExtractor={item => item.id!.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold' },
  searchInput: { borderWidth: 1, padding: 5, marginBottom: 10 },
  formContainer: { marginBottom: 15 },
  input: { borderWidth: 1, padding: 5, marginBottom: 5 },
  picker: { marginBottom: 10 },
  itemContainer: { marginBottom: 10, borderBottomWidth: 1, paddingBottom: 5 },
  itemTitle: { fontWeight: 'bold', fontSize: 16 },
  itemCategory: { fontSize: 14, color: '#555' },
  itemSecondary: { fontSize: 14, color: '#555' },
  itemNotes: { fontSize: 14, color: '#555' },
  label: { fontWeight: 'bold' },
});