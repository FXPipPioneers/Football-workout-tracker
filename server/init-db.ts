import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Database initialization skipped.");
    return false;
  }

  try {
    console.log("Initializing database...");
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    const db = drizzle(pool);

    console.log("Checking if tables exist...");
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    const tablesExist = result.rows[0]?.exists;

    if (!tablesExist) {
      console.log("Tables don't exist. Creating schema via drizzle-kit...");
      console.log("Please run: npm run db:push");
      console.log("Attempting to create basic structure...");
      
      await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS exercises (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          type TEXT NOT NULL,
          has_left_right BOOLEAN DEFAULT false,
          has_near_far BOOLEAN DEFAULT false,
          has_weight BOOLEAN DEFAULT false,
          has_distance BOOLEAN DEFAULT false,
          has_time BOOLEAN DEFAULT false,
          has_heart_rate BOOLEAN DEFAULT false,
          description TEXT,
          is_custom BOOLEAN DEFAULT false,
          user_id VARCHAR REFERENCES users(id)
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS workouts (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          day_of_week TEXT NOT NULL,
          mode TEXT NOT NULL,
          title TEXT NOT NULL,
          duration TEXT,
          location TEXT,
          equipment TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS workout_blocks (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          workout_id VARCHAR NOT NULL REFERENCES workouts(id),
          title TEXT NOT NULL,
          duration TEXT,
          "order" INTEGER NOT NULL
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS workout_block_exercises (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          block_id VARCHAR NOT NULL REFERENCES workout_blocks(id),
          exercise_id VARCHAR NOT NULL REFERENCES exercises(id),
          "order" INTEGER NOT NULL,
          sets TEXT,
          reps TEXT,
          rest TEXT,
          notes TEXT
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS workout_sessions (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          workout_id VARCHAR NOT NULL REFERENCES workouts(id),
          started_at TIMESTAMP NOT NULL,
          completed_at TIMESTAMP,
          status TEXT NOT NULL,
          mode TEXT NOT NULL,
          current_block_id VARCHAR REFERENCES workout_blocks(id),
          notes TEXT
        )
      `);

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS workout_sessions_user_date_idx 
        ON workout_sessions(user_id, started_at)
      `);

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS workout_sessions_user_status_idx 
        ON workout_sessions(user_id, status)
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS session_block_logs (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id VARCHAR NOT NULL REFERENCES workout_sessions(id),
          block_id VARCHAR NOT NULL REFERENCES workout_blocks(id),
          status TEXT NOT NULL,
          started_at TIMESTAMP,
          completed_at TIMESTAMP
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS exercise_logs (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id VARCHAR NOT NULL REFERENCES workout_sessions(id),
          block_log_id VARCHAR NOT NULL REFERENCES session_block_logs(id),
          exercise_id VARCHAR NOT NULL REFERENCES exercises(id),
          completed_sets INTEGER DEFAULT 0,
          left_reps INTEGER,
          right_reps INTEGER,
          left_near_reps INTEGER,
          left_far_reps INTEGER,
          right_near_reps INTEGER,
          right_far_reps INTEGER,
          weight REAL,
          distance REAL,
          duration INTEGER,
          heart_rate INTEGER,
          on_target INTEGER,
          total_reps INTEGER,
          notes TEXT,
          skipped BOOLEAN DEFAULT false,
          modified BOOLEAN DEFAULT false,
          pain BOOLEAN DEFAULT false,
          technique_off BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS exercise_logs_session_idx ON exercise_logs(session_id)
      `);

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS exercise_logs_exercise_idx ON exercise_logs(exercise_id)
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS check_ins (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          check_in_number INTEGER NOT NULL,
          check_in_date TIMESTAMP NOT NULL,
          passing_accuracy_left INTEGER,
          passing_accuracy_right INTEGER,
          finishing_near_left INTEGER,
          finishing_far_left INTEGER,
          finishing_near_right INTEGER,
          finishing_far_right INTEGER,
          first_touch_left INTEGER,
          first_touch_right INTEGER,
          comfort_level_left INTEGER,
          comfort_level_right INTEGER,
          skill_move_fake_shot_left INTEGER,
          skill_move_fake_shot_right INTEGER,
          skill_move_croqueta_left INTEGER,
          skill_move_croqueta_right INTEGER,
          skill_move_cruyff_left INTEGER,
          skill_move_cruyff_right INTEGER,
          game_realism_success INTEGER,
          endurance_jog_time INTEGER,
          endurance_avg_hr INTEGER,
          hiit_distance INTEGER,
          max_sprint_time REAL,
          fatigued_finishing_near INTEGER,
          fatigued_finishing_far INTEGER,
          squat_weight REAL,
          bench_weight REAL,
          rdl_weight REAL,
          pull_ups INTEGER,
          weight REAL,
          protein_intake INTEGER,
          sleep_hours REAL,
          energy_level INTEGER,
          left_foot_confidence INTEGER,
          overall_confidence INTEGER,
          motivation_check TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS check_ins_user_check_in_idx 
        ON check_ins(user_id, check_in_number)
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_stats (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
          total_workouts INTEGER DEFAULT 0,
          current_streak INTEGER DEFAULT 0,
          longest_streak INTEGER DEFAULT 0,
          last_workout_date TIMESTAMP,
          total_shots_left INTEGER DEFAULT 0,
          total_shots_right INTEGER DEFAULT 0,
          on_target_left INTEGER DEFAULT 0,
          on_target_right INTEGER DEFAULT 0,
          total_passes_left INTEGER DEFAULT 0,
          total_passes_right INTEGER DEFAULT 0,
          total_distance REAL DEFAULT 0,
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log("Basic database structure created");
      
      // Seed the database with initial data
      console.log("Seeding database with initial data...");
      const { seedExercises, seedWorkouts } = await import('./seed.js');
      
      // Create test user if doesn't exist
      const testUserId = "test-user-id";
      await db.execute(sql`
        INSERT INTO users (id, username, password) 
        VALUES ('test-user-id', 'test-user', 'password')
        ON CONFLICT (username) DO NOTHING
      `);
      
      await seedExercises();
      await seedWorkouts(testUserId);
      console.log("Database seeded successfully!");
    } else {
      console.log("Tables already exist");
      
      // Check if workouts exist, if not, seed them
      const workoutCheck = await db.execute(sql`SELECT COUNT(*) as count FROM workouts`);
      const workoutCount = parseInt(String(workoutCheck.rows[0]?.count || '0'));
      
      if (workoutCount === 0) {
        console.log("No workouts found. Seeding database...");
        const { seedExercises, seedWorkouts } = await import('./seed.js');
        
        // Create test user if doesn't exist
        const testUserId = "test-user-id";
        await db.execute(sql`
          INSERT INTO users (id, username, password) 
          VALUES ('test-user-id', 'test-user', 'password')
          ON CONFLICT (username) DO NOTHING
        `);
        
        await seedExercises();
        await seedWorkouts(testUserId);
        console.log("Database seeded successfully!");
      } else {
        console.log(`Found ${workoutCount} existing workouts`);
      }
    }

    await pool.end();
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
}
