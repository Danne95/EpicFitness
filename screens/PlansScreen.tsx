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
import { PlansStackParamList } from '../App';
import TrainingPlan from '../models/TrainingPlan';
import PlanService from '../services/PlanService';
import TogglePill from '../components/TogglePill';
import { commonStyles } from '../styles/common';
import { colors, spacing } from '../styles/theme';

type Props = NativeStackScreenProps<PlansStackParamList, 'PlansList'>;

export default function PlansScreen({ navigation }: Props) {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [editingMode, setEditingMode] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const allPlans = await PlanService.getAll();
    setPlans(
      [...allPlans].sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return a.name.localeCompare(b.name);
      })
    );
  };

  const addPlan = async () => {
    if (!newPlanName.trim()) return;

    await PlanService.create(new TrainingPlan(null, newPlanName));
    setNewPlanName('');
    await loadPlans();
  };

  const savePlanName = async () => {
    if (!editingPlan || !editingPlan.name.trim()) return;

    await PlanService.update(editingPlan);
    setEditingPlan(null);
    await loadPlans();
  };

  const deletePlan = (id: number) => {
    Alert.alert('Delete Plan', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await PlanService.delete(id);
          await loadPlans();
        },
      },
    ]);
  };

  const toggleFavorite = async (plan: TrainingPlan) => {
    await PlanService.toggleFavorite(plan.id!, !plan.favorite);
    await loadPlans();
  };

  const renderItem = ({ item }: { item: TrainingPlan }) => {
    const isEditingName = editingPlan?.id === item.id;

    if (isEditingName) {
      return (
        <View style={styles.itemContainer}>
          <TextInput
            style={styles.input}
            value={editingPlan?.name}
            onChangeText={text => setEditingPlan(current => (current ? { ...current, name: text } : current))}
          />
          <View style={styles.actionRow}>
            <Button title="Save" onPress={savePlanName} />
            <View style={styles.actionSpacer} />
            <Button title="Cancel" onPress={() => setEditingPlan(null)} />
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => navigation.navigate('PlanDetails', { planId: item.id! })}
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
            <Button title="Edit" onPress={() => setEditingPlan(item)} />
            <View style={styles.actionSpacer} />
            <Button title="Delete" color={colors.danger} onPress={() => deletePlan(item.id!)} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={commonStyles.screen}>
      <View style={commonStyles.headerRow}>
        <Text style={commonStyles.title}>Training Plans:</Text>
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
            placeholder="New Plan Name"
            value={newPlanName}
            onChangeText={setNewPlanName}
            style={styles.input}
          />
          <Button title="Add Plan" onPress={addPlan} />
        </View>
      )}

      <FlatList
        data={plans}
        keyExtractor={item => item.id!.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={commonStyles.mutedText}>No training plans yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.lg,
  },
  itemContainer: commonStyles.card,
  itemHeader: commonStyles.row,
  itemTitle: {
    ...commonStyles.itemTitle,
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
