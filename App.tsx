import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

import ExercisesScreen from './screens/ExercisesScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import WorkoutDetailsScreen from './screens/WorkoutDetailsScreen';
import PlansScreen from './screens/PlansScreen';
import PlanDetailsScreen from './screens/PlanDetailsScreen';
import HistoryScreen from './screens/HistoryScreen';
import { initDB } from './database/db';
import { commonStyles } from './styles/common';

// ✅ Tab navigator
const Tab = createBottomTabNavigator();

// ✅ Workouts stack navigator
export type WorkoutsStackParamList = {
  WorkoutsList: undefined;
  WorkoutDetails: { workoutId: number };
};
const WorkoutsStack = createNativeStackNavigator<WorkoutsStackParamList>();

function WorkoutsStackScreen() {
  return (
    <WorkoutsStack.Navigator>
      <WorkoutsStack.Screen
        name="WorkoutsList"
        component={WorkoutsScreen}
        options={{ headerShown: false }} // hide default title
      />
      <WorkoutsStack.Screen
        name="WorkoutDetails"
        component={WorkoutDetailsScreen}
        // options={{ title: 'Workout Details' }}
        options={{ headerShown: false }} // hide default title
      />
    </WorkoutsStack.Navigator>
  );
}

export type PlansStackParamList = {
  PlansList: undefined;
  PlanDetails: { planId: number };
};
const PlansStack = createNativeStackNavigator<PlansStackParamList>();

function PlansStackScreen() {
  return (
    <PlansStack.Navigator>
      <PlansStack.Screen
        name="PlansList"
        component={PlansScreen}
        options={{ headerShown: false }}
      />
      <PlansStack.Screen
        name="PlanDetails"
        component={PlanDetailsScreen}
        options={{ headerShown: false }}
      />
    </PlansStack.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      try {
        await initDB();
        setReady(true);
      } catch (err) {
        console.error('DB INIT ERROR:', err);
      }
    };
    setup();
  }, []);

  if (!ready) {
    return (
      <View style={commonStyles.centeredScreen}>
        <Text>Initializing database...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Exercises" component={ExercisesScreen} />
        <Tab.Screen name="Workouts" component={WorkoutsStackScreen} />
        <Tab.Screen name="Plans" component={PlansStackScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
