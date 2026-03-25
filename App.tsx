import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ExercisesScreen from './screens/ExercisesScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import PlansScreen from './screens/PlansScreen';
import HistoryScreen from './screens/HistoryScreen';
import { initDB } from './database/db';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Initializing database...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Exercises" component={ExercisesScreen} />
        <Tab.Screen name="Workouts" component={WorkoutsScreen} />
        <Tab.Screen name="Plans" component={PlansScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}