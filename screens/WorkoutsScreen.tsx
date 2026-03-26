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

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'WorkoutsList'>;

export default function WorkoutsScreen({ navigation }: Props) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const loadWorkouts = async () => {
    const all = await WorkoutService.getAll();
    setWorkouts(all);
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const addWorkout = async () => {
    if (!newWorkoutName.trim()) return;
    const w = new Workout(null, newWorkoutName);
    await WorkoutService.create(w);
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
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            <Button title="Save" onPress={editWorkoutName} />
            <View style={{ width: 10 }} />
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
          <Text style={[styles.itemTitle, { flexShrink: 1 }]} numberOfLines={1} ellipsizeMode="tail" >
            {item.name}
          </Text>

          {!editingMode && item.favorite && (
            <Text>⭐</Text>
          )}
        </View>
        {editingMode && (
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            <Button title={item.favorite ? '⭐' : '☆'} onPress={() => toggleFavorite(item)} />
            <View style={{ width: 10 }} />
            <Button title="Edit" onPress={() => setEditingWorkout(item)} />
            <View style={{ width: 10 }} />
            <Button title="Delete" color="red" onPress={() => deleteWorkout(item.id!)} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Header with toggle */}
      <View style={styles.header}>
        <Text style={styles.title}>Workouts List:</Text>
        <TogglePill
          value={editingMode}
          onChange={setEditingMode}
          activeText="Edit"
          inactiveText="View"
          width={100}
          height={40}
        />
      </View>

      {/* New Workout Form */}
      {editingMode && (
        <View style={styles.formContainer}>
          <TextInput
            placeholder="New Workout Name"
            value={newWorkoutName}
            onChangeText={setNewWorkoutName}
            style={styles.input}
          />
          <Button title="Add Workout" onPress={addWorkout} />
        </View>
      )}

      {/* Workout List */}
      <FlatList
        data={workouts}
        keyExtractor={item => item.id!.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
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
  title: { fontSize: 24, fontWeight: 'bold' },
  formContainer: { marginBottom: 15 },
  itemContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center' },
  itemTitle: { fontWeight: 'bold', fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    marginVertical: 5,
    borderRadius: 5,
  },
});