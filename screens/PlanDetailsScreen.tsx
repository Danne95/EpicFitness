import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert, StyleSheet, Modal } from 'react-native';
import PlanService from '../services/PlanService';
import ExerciseService from '../services/ExerciseService';
import TrainingPlan, { PlanWorkout } from '../models/TrainingPlan';
import Workout from '../models/Workout';
import Exercise from '../models/Exercise';
import TogglePill from '../components/TogglePill';
import WorkoutPicker from '../components/WorkoutPicker';
import BackArrowButton from '../components/BackArrowButton';
import { commonStyles } from '../styles/common';
import { colors, spacing } from '../styles/theme';

interface Props {
  route: any;
  navigation: any;
}

export default function PlanDetailsScreen({ route, navigation }: Props) {
  const planId: number = route.params.planId;

  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [editingMode, setEditingMode] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    loadPlan();
    loadExercises();
  }, []);

  const loadPlan = async () => {
    const plans = await PlanService.getAll();
    const selectedPlan = plans.find(current => current.id === planId) || null;
    setPlan(selectedPlan);
  };

  const loadExercises = async () => {
    const allExercises = await ExerciseService.getAll();
    setExercises(allExercises);
  };

  const persistPlan = async (nextWorkouts: PlanWorkout[]) => {
    if (!plan) return;

    const orderedWorkouts = nextWorkouts.map(
      (planWorkout, index) =>
        new PlanWorkout(
          planWorkout.id,
          plan.id!,
          planWorkout.workoutId,
          index,
          planWorkout.workout
        )
    );

    const updatedPlan = new TrainingPlan(
      plan.id,
      plan.name,
      orderedWorkouts.map(planWorkout => planWorkout.workoutId),
      plan.favorite,
      orderedWorkouts
    );

    await PlanService.update(updatedPlan);
    await loadPlan();
  };

  const handleSelectWorkout = async (workout: Workout) => {
    if (!plan) return;

    const currentWorkouts = [...plan.workouts];

    if (editingIndex === null) {
      currentWorkouts.push(
        new PlanWorkout(null, plan.id!, workout.id!, currentWorkouts.length, workout)
      );
    } else {
      currentWorkouts[editingIndex] = new PlanWorkout(
        currentWorkouts[editingIndex].id,
        plan.id!,
        workout.id!,
        editingIndex,
        workout
      );
    }

    await persistPlan(currentWorkouts);
    setPickerVisible(false);
    setEditingIndex(null);
  };

  const deleteWorkout = (index: number) => {
    if (!plan) return;

    Alert.alert('Remove Workout', 'Are you sure you want to remove this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const nextWorkouts = [...plan.workouts];
          nextWorkouts.splice(index, 1);
          await persistPlan(nextWorkouts);
        },
      },
    ]);
  };

  const moveWorkout = async (index: number, direction: 'up' | 'down') => {
    if (!plan) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= plan.workouts.length) return;

    const nextWorkouts = [...plan.workouts];

    [nextWorkouts[index], nextWorkouts[newIndex]] = [nextWorkouts[newIndex], nextWorkouts[index]];

    await persistPlan(nextWorkouts);
  };

  const startReplaceWorkout = (index: number) => {
    setEditingIndex(index);
    setPickerVisible(true);
  };

  const closePicker = () => {
    setPickerVisible(false);
    setEditingIndex(null);
  };

  if (!plan) {
    return (
      <View style={commonStyles.centeredScreen}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const getExcludedWorkoutIds = () => {
    if (editingIndex === null) {
      return plan.workouts.map(planWorkout => planWorkout.workoutId);
    }

    return plan.workouts
      .filter((_, index) => index !== editingIndex)
      .map(planWorkout => planWorkout.workoutId);
  };

  const formatExerciseParams = (workout: Workout) => {
    return workout.exercises
      .map(exercise => {
        const parts: string[] = [];

        if (exercise.sets !== undefined) parts.push(`Sets: ${exercise.sets}`);
        if (exercise.reps !== undefined) parts.push(`Reps: ${exercise.reps}`);
        if (exercise.duration !== undefined) parts.push(`Duration: ${exercise.duration}`);
        if (exercise.weight !== undefined) parts.push(`Weight: ${exercise.weight}`);
        if (exercise.restTime !== undefined) parts.push(`Rest: ${exercise.restTime}`);
        if (exercise.notes) parts.push(`Note: ${exercise.notes}`);

        return parts;
      });
  };

  const renderItem = ({ item, index }: { item: PlanWorkout; index: number }) => {
    const workout = item.workout;
    const exerciseParams = workout ? formatExerciseParams(workout) : [];

    return (
      <View style={editingMode ? styles.editingItemContainer : styles.viewItemContainer}>
        <Text style={styles.itemTitle}>{workout?.name || `Workout #${item.workoutId}`}</Text>

        {!editingMode &&
          (workout?.exercises.length ? (
            workout.exercises.map((exercise, exerciseIndex) => {
              const exerciseInfo = exercises.find(current => current.id === exercise.exerciseId);
              const params = exerciseParams[exerciseIndex] || [];

              return (
                <View key={`${item.workoutId}-${exercise.exerciseId}-${exerciseIndex}`} style={styles.exerciseBlock}>
                  <Text style={styles.exerciseName}>
                    {exerciseInfo?.name || `Exercise #${exercise.exerciseId}`}
                  </Text>
                  {params.length ? (
                    params.map((param, paramIndex) => (
                      <Text key={`${param}-${paramIndex}`} style={styles.exerciseParam}>
                        {param}
                      </Text>
                    ))
                  ) : (
                    <Text style={commonStyles.subtleText}>No parameters set.</Text>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={commonStyles.subtleText}>No exercises in this workout.</Text>
          ))}

        {editingMode && (
          <View style={styles.actionRow}>
            <Button title={'\u25B2'} onPress={() => moveWorkout(index, 'up')} />
            <View style={styles.actionSpacer} />
            <Button title={'\u25BC'} onPress={() => moveWorkout(index, 'down')} />
            <View style={styles.actionSpacer} />
            <Button title="Edit" onPress={() => startReplaceWorkout(index)} />
            <View style={styles.actionSpacer} />
            <Button title="Delete" color={colors.danger} onPress={() => deleteWorkout(index)} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={commonStyles.screen}>
      <View style={commonStyles.headerRow}>
        <View style={styles.titleRow}>
          <BackArrowButton onPress={() => navigation.goBack()} />
          <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
            {plan.name}
          </Text>
        </View>
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
        data={[...plan.workouts].sort((a, b) => a.sequence - b.sequence)}
        keyExtractor={(item, index) => `${item.workoutId}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={commonStyles.mutedText}>No workouts added yet.</Text>}
      />

      {editingMode && <Button title="Add Workout" onPress={() => setPickerVisible(true)} />}

      <Modal visible={pickerVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Button title="Close" onPress={closePicker} />
          <WorkoutPicker onSelect={handleSelectWorkout} excludeIds={getExcludedWorkoutIds()} />
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
  titleRow: {
    ...commonStyles.row,
    flex: 1,
  },
  titleText: {
    ...commonStyles.title,
    flex: 1,
    marginLeft: spacing.sm,
  },
  viewItemContainer: {
    ...commonStyles.listItem,
    paddingBottom: spacing.sm,
  },
  editingItemContainer: commonStyles.card,
  itemTitle: {
    ...commonStyles.itemTitle,
    marginBottom: spacing.xs,
  },
  exerciseBlock: {
    marginTop: spacing.xs,
  },
  exerciseName: commonStyles.bodyText,
  exerciseParam: {
    ...commonStyles.subtleText,
    marginLeft: spacing.sm,
    marginTop: 2,
  },
  actionRow: {
    ...commonStyles.row,
    marginTop: spacing.xs,
  },
  actionSpacer: {
    width: spacing.xs,
  },
});
