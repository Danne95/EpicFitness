import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import WorkoutService from '../services/WorkoutService';
import ExercisePicker from '../components/ExercisePicker';
import ExerciseService from '../services/ExerciseService';
import Workout, { WorkoutExercise } from '../models/Workout';
import Exercise from '../models/Exercise';
import TogglePill from '../components/TogglePill';

interface Props {
  route: any;
  navigation: any;
}

export default function WorkoutDetailsScreen({ route }: Props) {
  const workoutId: number = route.params.workoutId;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingMode, setEditingMode] = useState(false); // ✅ toggle

  useEffect(() => {
    loadWorkout();
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const exercises = await ExerciseService.getAll();
    setAllExercises(exercises);
  };

  const loadWorkout = async () => {
    const allWorkouts = await WorkoutService.getAll();
    const w = allWorkouts.find(w => w.id === workoutId);
    setWorkout(w || null);
  };

  const handleSelectExercise = async (exercise: Exercise) => {
    if (!workout) return;
    const newEx = new WorkoutExercise(
      null,
      workout.id!,
      exercise.id!,
      workout.exercises.length,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      ''
    );
    workout.exercises.push(newEx);
    await WorkoutService.update(workout);
    setPickerVisible(false);
    loadWorkout();
  };

  const deleteExercise = (index: number) => {
    if (!workout) return;
    Alert.alert('Remove Exercise', 'Are you sure you want to remove this exercise?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          workout.exercises.splice(index, 1);
          await WorkoutService.update(workout);
          loadWorkout();
        },
      },
    ]);
  };

  const moveExercise = async (index: number, direction: 'up' | 'down') => {
    if (!workout) return;
    const exList = workout.exercises;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= exList.length) return;
    [exList[index], exList[newIndex]] = [exList[newIndex], exList[index]];
    exList.forEach((ex, i) => (ex.orderIndex = i));
    await WorkoutService.update(workout);
    loadWorkout();
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
  };

  const saveEdit = async (index: number, updated: Partial<WorkoutExercise>) => {
    if (!workout) return;
    const ex = workout.exercises[index];
    Object.assign(ex, updated);
    await WorkoutService.update(workout);
    setEditingIndex(null);
    loadWorkout();
  };

  if (!workout) return <Text>Loading...</Text>;

  const renderItem = ({ item, index }: { item: WorkoutExercise; index: number }) => {
    const exInfo = allExercises.find(e => e.id === item.exerciseId);

    if (editingIndex === index) {
      return (
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle}>{exInfo?.name}</Text>
          <TextInput
            placeholder="Sets"
            keyboardType="numeric"
            value={item.sets?.toString() || ''}
            onChangeText={text => (item.sets = text ? parseInt(text) : undefined)}
            style={styles.input}
          />
          <TextInput
            placeholder="Reps"
            keyboardType="numeric"
            value={item.reps?.toString() || ''}
            onChangeText={text => (item.reps = text ? parseInt(text) : undefined)}
            style={styles.input}
          />
          <TextInput
            placeholder="Duration"
            keyboardType="numeric"
            value={item.duration?.toString() || ''}
            onChangeText={text => (item.duration = text ? parseInt(text) : undefined)}
            style={styles.input}
          />
          <TextInput
            placeholder="Weight"
            keyboardType="numeric"
            value={item.weight?.toString() || ''}
            onChangeText={text => (item.weight = text ? parseFloat(text) : undefined)}
            style={styles.input}
          />
          <TextInput
            placeholder="Rest Time"
            keyboardType="numeric"
            value={item.restTime?.toString() || ''}
            onChangeText={text => (item.restTime = text ? parseInt(text) : undefined)}
            style={styles.input}
          />
          <TextInput
            placeholder="Notes"
            value={item.notes || ''}
            onChangeText={text => (item.notes = text)}
            style={styles.input}
          />
          <Button title="Save" onPress={() => saveEdit(index, item)} />
          <Button title="Cancel" onPress={() => setEditingIndex(null)} />
        </View>
      );
    }

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemTitle}>{exInfo?.name}</Text>
        <Text>
          {exInfo?.primaryMuscle}
          {exInfo?.secondaryMuscle ? `, ${exInfo.secondaryMuscle}` : ''}
        </Text>
        {item.sets !== undefined ? <Text>Sets: {item.sets}</Text> : null}
        {item.reps !== undefined ? <Text>Reps: {item.reps}</Text> : null}
        {item.duration ? <Text>Duration: {item.duration}</Text> : null}
        {item.weight ? <Text>Weight: {item.weight}</Text> : null}
        {item.restTime ? <Text>Rest: {item.restTime}</Text> : null}
        {item.notes ? <Text>Note: {item.notes}</Text> : null}

        {/* Buttons hidden when editingMode is off */}
        {editingMode && (
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            <Button title="▲" onPress={() => moveExercise(index, 'up')} />
            <View style={{ width: 5 }} />
            <Button title="▼" onPress={() => moveExercise(index, 'down')} />
            <View style={{ width: 5 }} />
            <Button title="Edit" onPress={() => startEdit(index)} />
            <View style={{ width: 5 }} />
            <Button title="Delete" color="red" onPress={() => deleteExercise(index)} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Header with toggle */}
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

      <FlatList
        data={workout.exercises.sort((a, b) => a.orderIndex - b.orderIndex)}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Add Exercise hidden when editingMode is off */}
      {editingMode && (
        <Button title="Add Exercise" onPress={() => setPickerVisible(true)} />
      )}

      <Modal visible={pickerVisible} animationType="slide">
        <View style={{ flex: 1, padding: 10 }}>
          <Button title="Close" onPress={() => setPickerVisible(false)} />
          <ExercisePicker
            onSelect={handleSelectExercise}
            excludeIds={workout.exercises.map(ex => ex.exerciseId)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  title: { fontWeight: 'bold', fontSize: 20, marginBottom: 20 },
  itemContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  itemTitle: { fontWeight: 'bold', fontSize: 16 },
  input: { borderWidth: 1, padding: 5, marginVertical: 3, borderRadius: 5 },

  // Toggle pill styles
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#eee',
    minWidth: 80,
    justifyContent: 'center',
  },
  togglePillActive: {
    backgroundColor: '#4caf50',
  },
  toggleCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#888',
    marginRight: 8,
  },
  toggleCircleActive: {
    backgroundColor: '#fff',
  },
  toggleText: {
    fontWeight: 'bold',
    color: '#555',
  },
  toggleTextActive: {
    color: '#fff',
  },
});