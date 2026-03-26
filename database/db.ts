import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export const initDB = async () => {
  db = await SQLite.openDatabaseAsync('gymapp.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT,
      primary_muscle TEXT,
      secondary_muscle TEXT,
      category TEXT,
      notes TEXT,
      favorite INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT,
      favorite INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY NOT NULL,
      workout_id INTEGER,
      exercise_id INTEGER,
      order_index INTEGER, 
      sets INTEGER,
      reps INTEGER,
      duration INTEGER,
      weight REAL,
      rest_time INTEGER,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS training_plans (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT
    );

    CREATE TABLE IF NOT EXISTS plan_workouts (
      id INTEGER PRIMARY KEY NOT NULL,
      plan_id INTEGER,
      workout_id INTEGER,
      sequence INTEGER
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY NOT NULL,
      exercise_id INTEGER,
      date TEXT,
      sets INTEGER,
      reps INTEGER,
      duration INTEGER,
      weight REAL,
      notes TEXT
    );
  `);
};

export const getDB = () => db;