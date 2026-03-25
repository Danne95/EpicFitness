// screens/ExercisesScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, FlatList, TextInput, Alert,
  TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ExerciseService from '../services/ExerciseService';
import Exercise from '../models/Exercise';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState('');
  const [category, setCategory] = useState<'strength'|'cardio'|'stretching'|'warmup'>('strength');
  const [notes, setNotes] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  // Load exercises
  const load = async () => setExercises(await ExerciseService.getAll());
  useEffect(() => { load(); }, []);

  // Toggle collapsible form
  const toggleForm = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFormOpen(!formOpen);
  };

  // Save new or updated exercise
  const saveExercise = async () => {
    if (!name.trim()) { alert('Exercise name required'); return; }
    const ex = new Exercise(editingId, name, primary, secondary, category, notes);
    if (editingId) await ExerciseService.update(ex);
    else await ExerciseService.create(ex);

    // Reset form
    setEditingId(null); setName(''); setPrimary(''); setSecondary('');
    setCategory('strength'); setNotes('');
    load();
    setFormOpen(false);
  };

  // Edit exercise
  const editExercise = (ex: Exercise) => {
    setEditingId(ex.id!);
    setName(ex.name);
    setPrimary(ex.primaryMuscle);
    setSecondary(ex.secondaryMuscle);
    setCategory(ex.category as any);
    setNotes(ex.notes);
    setFormOpen(true);
  };

  // Delete exercise with confirmation
  const deleteExercise = (id: number) => {
    Alert.alert('Delete Exercise', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await ExerciseService.delete(id); load(); } }
    ]);
  };

  // Logical search with priority + favorite
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

    const pushIfMatch = (field: 'name' | 'primaryMuscle' | 'secondaryMuscle' | 'category' | 'notes', fav: boolean) => {
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

    // Search priority: favorites first, then non-favorites; within each group, order by relevance of fields
    const fields: ('name' | 'primaryMuscle' | 'secondaryMuscle' | 'category' | 'notes')[] =
      ['name', 'primaryMuscle', 'secondaryMuscle', 'category', 'notes'];

    fields.forEach(field => {
      pushIfMatch(field, true);  // favorites first
      pushIfMatch(field, false); // then non-favorites
    });

    return result;
  };

  // Render one exercise item
  const renderItem = ({ item }: { item: Exercise }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.name} ({item.primaryMuscle})</Text>
      <Text style={styles.itemCategory}><Text style={styles.label}>Category: </Text>{item.category}</Text>
      {item.secondaryMuscle ? <Text style={styles.itemSecondary}><Text style={styles.label}>Secondary muscle: </Text>{item.secondaryMuscle}</Text> : null}
      {item.notes ? <Text style={styles.itemNotes}><Text style={styles.label}>Note: </Text>{item.notes}</Text> : null}

      <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
        <Button title={item.favorite ? '⭐' : '☆'} onPress={async () => {
          await ExerciseService.toggleFavorite(item.id!, !item.favorite);
          load();
        }} />
        <View style={{ width: 10 }} />
        <Button title="Edit" onPress={() => editExercise(item)} />
        <View style={{ width: 10 }} />
        <Button title="Delete" color="red" onPress={() => deleteExercise(item.id!)} />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed Top: Search + Form */}
      <View style={styles.topContainer}>
        <TextInput
          placeholder="Search exercises"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <TouchableOpacity onPress={toggleForm} style={styles.toggleButton}>
          <Text style={{ fontWeight: 'bold' }}>{formOpen ? '▼' : '►'} {editingId ? 'Edit Exercise' : 'Add Exercise'}</Text>
        </TouchableOpacity>

        {formOpen && (
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

            <TextInput placeholder="Notes" value={notes} onChangeText={setNotes} multiline style={[styles.input, { height: 60 }]} />
            <Button title={editingId ? 'Update Exercise' : 'Add Exercise'} onPress={saveExercise} />
          </View>
        )}
      </View>

      {/* Exercises List */}
      <FlatList
        data={getSortedSearchResults()}
        keyExtractor={item => item.id!.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topContainer: { paddingHorizontal: 20, paddingTop: 10, backgroundColor: '#fff', zIndex: 1 },
  searchInput: { borderWidth: 1, padding: 5, marginBottom: 5 },
  toggleButton: { paddingVertical: 5 },
  formContainer: { marginBottom: 10 },
  input: { borderWidth: 1, padding: 5, marginBottom: 5 },
  picker: { borderWidth: 1, marginBottom: 5 },
  itemContainer: { marginBottom: 10, borderBottomWidth: 1, paddingBottom: 5 },
  itemTitle: { fontWeight: 'bold', fontSize: 16 },
  itemCategory: { fontSize: 14, color: '#555' },
  itemSecondary: { fontSize: 14, color: '#555' },
  itemNotes: { fontSize: 14, color: '#555' },
  label: { fontWeight: 'bold' },
});