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
} from 'react-native';
import WorkoutService from '../services/WorkoutService';
import ExercisePicker from '../components/ExercisePicker';
import ExerciseService from '../services/ExerciseService';
import Workout, { WorkoutExercise } from '../models/Workout';
import Exercise from '../models/Exercise';
import TogglePill from '../components/TogglePill';
import { commonStyles } from '../styles/common';
import { colors, spacing } from '../styles/theme';

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
  const [editingMode, setEditingMode] = useState(false);

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
    const selectedWorkout = allWorkouts.find(current => current.id === workoutId);
    setWorkout(selectedWorkout || null);
  };

  const handleSelectExercise = async (exercise: Exercise) => {
    if (!workout) return;

    const newExercise = new WorkoutExercise(
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

    workout.exercises.push(newExercise);
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

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= workout.exercises.length) return;

    [workout.exercises[index], workout.exercises[newIndex]] = [
      workout.exercises[newIndex],
      workout.exercises[index],
    ];
    workout.exercises.forEach((exercise, orderIndex) => {
      exercise.orderIndex = orderIndex;
    });

    await WorkoutService.update(workout);
    loadWorkout();
  };

  const saveEdit = async (index: number, updated: Partial<WorkoutExercise>) => {
    if (!workout) return;
    Object.assign(workout.exercises[index], updated);
    await WorkoutService.update(workout);
    setEditingIndex(null);
    loadWorkout();
  };

  if (!workout) {
    return (
      <View style={commonStyles.centeredScreen}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: WorkoutExercise; index: number }) => {
    const exerciseInfo = allExercises.find(exercise => exercise.id === item.exerciseId);

    if (editingIndex === index) {
      return (
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle}>{exerciseInfo?.name}</Text>
          <TextInput
            placeholder="Sets"
            keyboardType="numeric"
            value={item.sets?.toString() || ''}
            onChangeText={text => (item.sets = text ? parseInt(text, 10) : undefined)}
            style={styles.input}
          />
          <TextInput
            placeholder="Reps"
            keyboardType="numeric"
            value={item.reps?.toString() || ''}
            onChangeText={text => (item.reps = text ? parseInt(text, 10) : undefined)}
            style={styles.input}
          />
          <TextInput
            placeholder="Duration"
            keyboardType="numeric"
            value={item.duration?.toString() || ''}
            onChangeText={text => (item.duration = text ? parseInt(text, 10) : undefined)}
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
            onChangeText={text => (item.restTime = text ? parseInt(text, 10) : undefined)}
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
        <Text style={styles.itemTitle}>{exerciseInfo?.name}</Text>
        <Text style={commonStyles.bodyText}>
          {exerciseInfo?.primaryMuscle}
          {exerciseInfo?.secondaryMuscle ? `, ${exerciseInfo.secondaryMuscle}` : ''}
        </Text>
        {item.sets !== undefined ? <Text style={commonStyles.bodyText}>Sets: {item.sets}</Text> : null}
        {item.reps !== undefined ? <Text style={commonStyles.bodyText}>Reps: {item.reps}</Text> : null}
        {item.duration ? <Text style={commonStyles.bodyText}>Duration: {item.duration}</Text> : null}
        {item.weight ? <Text style={commonStyles.bodyText}>Weight: {item.weight}</Text> : null}
        {item.restTime ? <Text style={commonStyles.bodyText}>Rest: {item.restTime}</Text> : null}
        {item.notes ? <Text style={commonStyles.bodyText}>Note: {item.notes}</Text> : null}

        {editingMode && (
          <View style={styles.actionRow}>
            <Button title="â–²" onPress={() => moveExercise(index, 'up')} />
            <View style={styles.actionSpacer} />
            <Button title="â–¼" onPress={() => moveExercise(index, 'down')} />
            <View style={styles.actionSpacer} />
            <Button title="Edit" onPress={() => setEditingIndex(index)} />
            <View style={styles.actionSpacer} />
            <Button title="Delete" color={colors.danger} onPress={() => deleteExercise(index)} />
          </View>
        )}
      </View>
    );
  };

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

      <FlatList
        data={[...workout.exercises].sort((a, b) => a.orderIndex - b.orderIndex)}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      {editingMode && <Button title="Add Exercise" onPress={() => setPickerVisible(true)} />}

      <Modal visible={pickerVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Button title="Close" onPress={() => setPickerVisible(false)} />
          <ExercisePicker
            onSelect={handleSelectExercise}
            excludeIds={workout.exercises.map(exercise => exercise.exerciseId)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.lg,
  },
  modalContainer: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  itemContainer: {
    ...commonStyles.listItem,
    marginBottom: spacing.md,
  },
  itemTitle: commonStyles.itemTitle,
  input: {
    ...commonStyles.input,
    marginVertical: 3,
  },
  actionRow: {
    ...commonStyles.row,
    marginTop: spacing.xs,
  },
  actionSpacer: {
    width: spacing.xs,
  },
});
