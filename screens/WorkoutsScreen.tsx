import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WorkoutsStackParamList } from '../App';
import WorkoutService from '../services/WorkoutService';
import Workout from '../models/Workout';
import TogglePill from '../components/TogglePill';
import { commonStyles } from '../styles/common';
import { colors, spacing } from '../styles/theme';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'WorkoutsList'>;

export default function WorkoutsScreen({ navigation }: Props) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const loadWorkouts = async () => {
    const all = await WorkoutService.getAll();
    setWorkouts(
      [...all].sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return a.name.localeCompare(b.name);
      })
    );
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const addWorkout = async () => {
    if (!newWorkoutName.trim()) return;
    const workout = new Workout(null, newWorkoutName);
    await WorkoutService.create(workout);
    setNewWorkoutName('');
    loadWorkouts();
  };

  const editWorkoutName = async () => {
    if (!editingWorkout || !editingWorkout.name.trim()) return;
    await WorkoutService.update(editingWorkout);
    setEditingWorkout(null);
    loadWorkouts();
  };

  const deleteWorkout = (id: number) => {
    Alert.alert('Delete Workout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await WorkoutService.delete(id);
          loadWorkouts();
        },
      },
    ]);
  };

  const toggleFavorite = async (workout: Workout) => {
    await WorkoutService.toggleFavorite(workout.id!, !workout.favorite);
    loadWorkouts();
  };

  const renderItem = ({ item }: { item: Workout }) => {
    const isEditingName = editingWorkout?.id === item.id;

    if (isEditingName) {
      return (
        <View style={styles.itemContainer}>
          <TextInput
            style={styles.input}
            value={editingWorkout?.name}
            onChangeText={text => setEditingWorkout({ ...editingWorkout!, name: text })}
          />
          <View style={styles.actionRow}>
            <Button title="Save" onPress={editWorkoutName} />
            <View style={styles.actionSpacer} />
            <Button title="Cancel" onPress={() => setEditingWorkout(null)} />
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.id! })}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          {!editingMode && item.favorite && <Text>{'\u2B50'}</Text>}
        </View>

        {editingMode && (
          <View style={styles.actionRow}>
            <Button title={item.favorite ? '\u2B50' : '\u2606'} onPress={() => toggleFavorite(item)} />
            <View style={styles.actionSpacer} />
            <Button title="Edit" onPress={() => setEditingWorkout(item)} />
            <View style={styles.actionSpacer} />
            <Button title="Delete" color={colors.danger} onPress={() => deleteWorkout(item.id!)} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={commonStyles.screen}>
      <View style={commonStyles.headerRow}>
        <Text style={commonStyles.title}>Workouts List:</Text>
        <TogglePill
          value={editingMode}
          onChange={setEditingMode}
          activeText="Edit"
          inactiveText="View"
          width={100}
          height={40}
        />
      </View>

      {editingMode && (
        <View style={commonStyles.sectionSpacing}>
          <TextInput
            placeholder="New Workout Name"
            value={newWorkoutName}
            onChangeText={setNewWorkoutName}
            style={styles.input}
          />
          <Button title="Add Workout" onPress={addWorkout} />
        </View>
      )}

      <FlatList
        data={workouts}
        keyExtractor={item => item.id!.toString()}
        renderItem={renderItem}
        contentContainerStyle={commonStyles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: commonStyles.interactiveListItem,
  itemHeader: commonStyles.listItemHeader,
  itemTitle: {
    ...commonStyles.listItemTitle,
    flexShrink: 1,
  },
  input: {
    ...commonStyles.input,
    marginVertical: spacing.xs,
  },
  actionRow: {
    ...commonStyles.row,
    marginTop: spacing.xs,
  },
  actionSpacer: {
    width: spacing.sm,
  },
});
