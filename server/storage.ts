import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  
  // Exercise methods
  getExercises(): Promise<schema.Exercise[]>;
  getExercisesByCategory(category: string): Promise<schema.Exercise[]>;
  createExercise(exercise: schema.InsertExercise): Promise<schema.Exercise>;
  updateExercise(id: string, exercise: Partial<schema.InsertExercise>): Promise<schema.Exercise | undefined>;
  deleteExercise(id: string): Promise<boolean>;
  
  // Workout methods
  getWorkouts(userId: string): Promise<schema.Workout[]>;
  getWorkoutsByDay(userId: string, dayOfWeek: string, mode: "solo" | "friend"): Promise<schema.Workout | undefined>;
  getWorkoutById(id: string): Promise<schema.Workout | undefined>;
  getWorkoutWithBlocks(id: string): Promise<WorkoutWithBlocks | undefined>;
  createWorkout(workout: schema.InsertWorkout): Promise<schema.Workout>;
  updateWorkout(id: string, workout: Partial<schema.InsertWorkout>): Promise<schema.Workout | undefined>;
  deleteWorkout(id: string): Promise<boolean>;
  
  // Workout block methods
  getWorkoutBlocks(workoutId: string): Promise<schema.WorkoutBlock[]>;
  createWorkoutBlock(block: schema.InsertWorkoutBlock): Promise<schema.WorkoutBlock>;
  updateWorkoutBlock(id: string, block: Partial<schema.InsertWorkoutBlock>): Promise<schema.WorkoutBlock | undefined>;
  deleteWorkoutBlock(id: string): Promise<boolean>;
  
  // Workout block exercise methods
  getBlockExercises(blockId: string): Promise<WorkoutBlockExerciseWithExercise[]>;
  createBlockExercise(exercise: schema.InsertWorkoutBlockExercise): Promise<schema.WorkoutBlockExercise>;
  updateBlockExercise(id: string, exercise: Partial<schema.InsertWorkoutBlockExercise>): Promise<schema.WorkoutBlockExercise | undefined>;
  deleteBlockExercise(id: string): Promise<boolean>;
  
  // Workout session methods
  getWorkoutSessions(userId: string): Promise<schema.WorkoutSession[]>;
  getActiveSession(userId: string): Promise<schema.WorkoutSession | undefined>;
  getPausedSessions(userId: string): Promise<schema.WorkoutSession[]>;
  getSessionById(id: string): Promise<schema.WorkoutSession | undefined>;
  createWorkoutSession(session: schema.InsertWorkoutSession): Promise<schema.WorkoutSession>;
  updateWorkoutSession(id: string, session: Partial<schema.InsertWorkoutSession>): Promise<schema.WorkoutSession | undefined>;
  pauseWorkoutSession(id: string, state: string): Promise<schema.WorkoutSession | undefined>;
  resumeWorkoutSession(id: string): Promise<schema.WorkoutSession | undefined>;
  deleteWorkoutSession(id: string): Promise<boolean>;
  getSessionStats(userId: string): Promise<{
    totalSessions: number;
    currentStreak: number;
    thisWeekSessions: number;
    averageAccuracy: number;
  }>;
  
  // Exercise log methods
  getExerciseLogsBySession(sessionId: string): Promise<schema.ExerciseLog[]>;
  createExerciseLog(log: schema.InsertExerciseLog): Promise<schema.ExerciseLog>;
  updateExerciseLog(id: string, log: Partial<schema.InsertExerciseLog>): Promise<schema.ExerciseLog | undefined>;
  
  // Check-in methods
  getCheckIns(userId: string): Promise<schema.CheckIn[]>;
  getLatestCheckIn(userId: string): Promise<schema.CheckIn | undefined>;
  createCheckIn(checkIn: schema.InsertCheckIn): Promise<schema.CheckIn>;
  updateCheckIn(id: string, checkIn: Partial<schema.InsertCheckIn>): Promise<schema.CheckIn | undefined>;
  
  // User stats methods
  getUserStats(userId: string): Promise<schema.UserStats | undefined>;
  updateUserStats(userId: string, stats: Partial<schema.InsertUserStats>): Promise<schema.UserStats>;
}

export type WorkoutWithBlocks = schema.Workout & {
  blocks: (schema.WorkoutBlock & {
    exercises: WorkoutBlockExerciseWithExercise[];
  })[];
};

export type WorkoutBlockExerciseWithExercise = schema.WorkoutBlockExercise & {
  exercise: schema.Exercise;
};

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  // Exercise methods
  async getExercises(): Promise<schema.Exercise[]> {
    return await db.select().from(schema.exercises);
  }

  async getExercisesByCategory(category: string): Promise<schema.Exercise[]> {
    return await db.select().from(schema.exercises).where(eq(schema.exercises.category, category));
  }

  async createExercise(exercise: schema.InsertExercise): Promise<schema.Exercise> {
    const [newExercise] = await db.insert(schema.exercises).values(exercise).returning();
    return newExercise;
  }

  async updateExercise(id: string, exercise: Partial<schema.InsertExercise>): Promise<schema.Exercise | undefined> {
    const [updated] = await db.update(schema.exercises)
      .set(exercise)
      .where(eq(schema.exercises.id, id))
      .returning();
    return updated;
  }

  async deleteExercise(id: string): Promise<boolean> {
    const result = await db.delete(schema.exercises).where(eq(schema.exercises.id, id));
    return true;
  }

  // Workout methods
  async getWorkouts(userId: string): Promise<schema.Workout[]> {
    return await db.select()
      .from(schema.workouts)
      .where(and(eq(schema.workouts.userId, userId), eq(schema.workouts.isActive, true)))
      .orderBy(schema.workouts.dayOfWeek);
  }

  async getWorkoutsByDay(userId: string, dayOfWeek: string, mode: "solo" | "friend"): Promise<schema.Workout | undefined> {
    const [workout] = await db.select()
      .from(schema.workouts)
      .where(
        and(
          eq(schema.workouts.userId, userId),
          eq(schema.workouts.dayOfWeek, dayOfWeek),
          eq(schema.workouts.mode, mode),
          eq(schema.workouts.isActive, true)
        )
      );
    return workout;
  }

  async getWorkoutById(id: string): Promise<schema.Workout | undefined> {
    const [workout] = await db.select().from(schema.workouts).where(eq(schema.workouts.id, id));
    return workout;
  }

  async getWorkoutWithBlocks(id: string): Promise<WorkoutWithBlocks | undefined> {
    const workout = await this.getWorkoutById(id);
    if (!workout) return undefined;

    const blocks = await this.getWorkoutBlocks(id);
    const blocksWithExercises = await Promise.all(
      blocks.map(async (block) => ({
        ...block,
        exercises: await this.getBlockExercises(block.id),
      }))
    );

    return {
      ...workout,
      blocks: blocksWithExercises,
    };
  }

  async createWorkout(workout: schema.InsertWorkout): Promise<schema.Workout> {
    const [newWorkout] = await db.insert(schema.workouts).values(workout).returning();
    return newWorkout;
  }

  async updateWorkout(id: string, workout: Partial<schema.InsertWorkout>): Promise<schema.Workout | undefined> {
    const [updated] = await db.update(schema.workouts)
      .set(workout)
      .where(eq(schema.workouts.id, id))
      .returning();
    return updated;
  }

  async deleteWorkout(id: string): Promise<boolean> {
    // Cascade delete: Must delete in order due to foreign key constraints
    
    // 1. Get all sessions referencing this workout
    const sessions = await db.select().from(schema.workoutSessions).where(eq(schema.workoutSessions.workoutId, id));
    
    // 2. Clear currentBlockId from all sessions (breaks FK constraint to blocks)
    for (const session of sessions) {
      await db.update(schema.workoutSessions)
        .set({ currentBlockId: null })
        .where(eq(schema.workoutSessions.id, session.id));
    }
    
    // 3. Delete exercise logs and session block logs for these sessions
    for (const session of sessions) {
      await db.delete(schema.exerciseLogs).where(eq(schema.exerciseLogs.sessionId, session.id));
      await db.delete(schema.sessionBlockLogs).where(eq(schema.sessionBlockLogs.sessionId, session.id));
    }
    
    // 4. Delete all workout sessions
    await db.delete(schema.workoutSessions).where(eq(schema.workoutSessions.workoutId, id));
    
    // 5. Get all blocks for this workout
    const blocks = await db.select().from(schema.workoutBlocks).where(eq(schema.workoutBlocks.workoutId, id));
    
    // 6. Delete all exercises in all blocks
    for (const block of blocks) {
      await db.delete(schema.workoutBlockExercises).where(eq(schema.workoutBlockExercises.blockId, block.id));
    }
    
    // 7. Delete all blocks
    await db.delete(schema.workoutBlocks).where(eq(schema.workoutBlocks.workoutId, id));
    
    // 8. Finally delete the workout itself
    await db.delete(schema.workouts).where(eq(schema.workouts.id, id));
    
    return true;
  }

  // Workout block methods
  async getWorkoutBlocks(workoutId: string): Promise<schema.WorkoutBlock[]> {
    return await db.select()
      .from(schema.workoutBlocks)
      .where(eq(schema.workoutBlocks.workoutId, workoutId))
      .orderBy(schema.workoutBlocks.order);
  }

  async createWorkoutBlock(block: schema.InsertWorkoutBlock): Promise<schema.WorkoutBlock> {
    const [newBlock] = await db.insert(schema.workoutBlocks).values(block).returning();
    return newBlock;
  }

  async updateWorkoutBlock(id: string, block: Partial<schema.InsertWorkoutBlock>): Promise<schema.WorkoutBlock | undefined> {
    const [updated] = await db.update(schema.workoutBlocks)
      .set(block)
      .where(eq(schema.workoutBlocks.id, id))
      .returning();
    return updated;
  }

  async deleteWorkoutBlock(id: string): Promise<boolean> {
    // First delete all exercises in this block
    await db.delete(schema.workoutBlockExercises).where(eq(schema.workoutBlockExercises.blockId, id));
    // Then delete the block itself
    await db.delete(schema.workoutBlocks).where(eq(schema.workoutBlocks.id, id));
    return true;
  }

  // Workout block exercise methods
  async getBlockExercises(blockId: string): Promise<WorkoutBlockExerciseWithExercise[]> {
    const results = await db.select()
      .from(schema.workoutBlockExercises)
      .leftJoin(schema.exercises, eq(schema.workoutBlockExercises.exerciseId, schema.exercises.id))
      .where(eq(schema.workoutBlockExercises.blockId, blockId))
      .orderBy(schema.workoutBlockExercises.order);

    return results.map(({ workout_block_exercises, exercises }) => ({
      ...workout_block_exercises,
      exercise: exercises!,
    }));
  }

  async createBlockExercise(exercise: schema.InsertWorkoutBlockExercise): Promise<schema.WorkoutBlockExercise> {
    const [newExercise] = await db.insert(schema.workoutBlockExercises).values(exercise).returning();
    return newExercise;
  }

  async updateBlockExercise(id: string, exercise: Partial<schema.InsertWorkoutBlockExercise>): Promise<schema.WorkoutBlockExercise | undefined> {
    const [updated] = await db.update(schema.workoutBlockExercises)
      .set(exercise)
      .where(eq(schema.workoutBlockExercises.id, id))
      .returning();
    return updated;
  }

  async deleteBlockExercise(id: string): Promise<boolean> {
    await db.delete(schema.workoutBlockExercises).where(eq(schema.workoutBlockExercises.id, id));
    return true;
  }

  // Workout session methods
  async getWorkoutSessions(userId: string): Promise<schema.WorkoutSession[]> {
    return await db.select()
      .from(schema.workoutSessions)
      .where(eq(schema.workoutSessions.userId, userId))
      .orderBy(desc(schema.workoutSessions.startedAt));
  }

  async getActiveSession(userId: string): Promise<schema.WorkoutSession | undefined> {
    const [session] = await db.select()
      .from(schema.workoutSessions)
      .where(
        and(
          eq(schema.workoutSessions.userId, userId),
          eq(schema.workoutSessions.status, "in_progress")
        )
      );
    return session;
  }

  async getSessionById(id: string): Promise<schema.WorkoutSession | undefined> {
    const [session] = await db.select().from(schema.workoutSessions).where(eq(schema.workoutSessions.id, id));
    return session;
  }

  async createWorkoutSession(session: schema.InsertWorkoutSession): Promise<schema.WorkoutSession> {
    const [newSession] = await db.insert(schema.workoutSessions).values(session).returning();
    return newSession;
  }

  async updateWorkoutSession(id: string, session: Partial<schema.InsertWorkoutSession>): Promise<schema.WorkoutSession | undefined> {
    const [updated] = await db.update(schema.workoutSessions)
      .set(session)
      .where(eq(schema.workoutSessions.id, id))
      .returning();
    return updated;
  }

  async getPausedSessions(userId: string): Promise<schema.WorkoutSession[]> {
    return await db.select()
      .from(schema.workoutSessions)
      .where(
        and(
          eq(schema.workoutSessions.userId, userId),
          eq(schema.workoutSessions.status, "paused")
        )
      )
      .orderBy(desc(schema.workoutSessions.pausedAt));
  }

  async pauseWorkoutSession(id: string, state: string): Promise<schema.WorkoutSession | undefined> {
    const [updated] = await db.update(schema.workoutSessions)
      .set({
        status: "paused",
        pausedAt: new Date(),
        pausedState: state,
      })
      .where(eq(schema.workoutSessions.id, id))
      .returning();
    return updated;
  }

  async resumeWorkoutSession(id: string): Promise<schema.WorkoutSession | undefined> {
    const [updated] = await db.update(schema.workoutSessions)
      .set({
        status: "in_progress",
        pausedAt: null,
        pausedState: null,
      })
      .where(eq(schema.workoutSessions.id, id))
      .returning();
    return updated;
  }

  async deleteWorkoutSession(id: string): Promise<boolean> {
    // Delete associated exercise logs first
    await db.delete(schema.exerciseLogs).where(eq(schema.exerciseLogs.sessionId, id));
    
    // Delete associated session block logs
    await db.delete(schema.sessionBlockLogs).where(eq(schema.sessionBlockLogs.sessionId, id));
    
    // Delete the session itself
    await db.delete(schema.workoutSessions).where(eq(schema.workoutSessions.id, id));
    
    return true;
  }

  async getSessionStats(userId: string): Promise<{
    totalSessions: number;
    currentStreak: number;
    thisWeekSessions: number;
    averageAccuracy: number;
  }> {
    // Get all completed sessions ordered by completion date
    const completedSessions = await db.select()
      .from(schema.workoutSessions)
      .where(
        and(
          eq(schema.workoutSessions.userId, userId),
          eq(schema.workoutSessions.status, "completed")
        )
      )
      .orderBy(desc(schema.workoutSessions.completedAt));

    const totalSessions = completedSessions.length;

    // Calculate current streak (consecutive days with sessions)
    let currentStreak = 0;
    if (completedSessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let checkDate = new Date(today);
      const sessionDates = new Set(
        completedSessions
          .filter(s => s.completedAt)
          .map(s => {
            const d = new Date(s.completedAt!);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
          })
      );

      // Check if there's a session today or yesterday to start the streak
      const hasToday = sessionDates.has(today.getTime());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const hasYesterday = sessionDates.has(yesterday.getTime());

      if (hasToday || hasYesterday) {
        // Start from today if has today's session, otherwise from yesterday
        if (!hasToday) {
          checkDate = new Date(yesterday);
        }

        while (sessionDates.has(checkDate.getTime())) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    }

    // Calculate this week's sessions (starting from Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const thisWeekSessions = completedSessions.filter(s => {
      if (!s.completedAt) return false;
      const sessionDate = new Date(s.completedAt);
      return sessionDate >= monday;
    }).length;

    // Calculate average accuracy from exercise logs (for this user's sessions)
    const userSessionIds = completedSessions.map(s => s.id);
    
    let totalAccuracy = 0;
    let accuracyCount = 0;

    if (userSessionIds.length > 0) {
      const logs = await db.select()
        .from(schema.exerciseLogs)
        .innerJoin(
          schema.workoutSessions,
          eq(schema.exerciseLogs.sessionId, schema.workoutSessions.id)
        )
        .where(eq(schema.workoutSessions.userId, userId));

      for (const { exercise_logs: log } of logs) {
        // Calculate accuracy from near/far reps (successful = near, total = near + far)
        const leftSuccessful = log.leftNearReps || 0;
        const leftMissed = log.leftFarReps || 0;
        const rightSuccessful = log.rightNearReps || 0;
        const rightMissed = log.rightFarReps || 0;

        const totalSuccessful = leftSuccessful + rightSuccessful;
        const totalAttempts = leftSuccessful + leftMissed + rightSuccessful + rightMissed;

        if (totalAttempts > 0) {
          totalAccuracy += (totalSuccessful / totalAttempts) * 100;
          accuracyCount++;
        }
      }
    }

    const averageAccuracy = accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0;

    return {
      totalSessions,
      currentStreak,
      thisWeekSessions,
      averageAccuracy,
    };
  }

  // Exercise log methods
  async getExerciseLogsBySession(sessionId: string): Promise<schema.ExerciseLog[]> {
    return await db.select()
      .from(schema.exerciseLogs)
      .where(eq(schema.exerciseLogs.sessionId, sessionId))
      .orderBy(schema.exerciseLogs.createdAt);
  }

  async createExerciseLog(log: schema.InsertExerciseLog): Promise<schema.ExerciseLog> {
    const [newLog] = await db.insert(schema.exerciseLogs).values(log).returning();
    return newLog;
  }

  async updateExerciseLog(id: string, log: Partial<schema.InsertExerciseLog>): Promise<schema.ExerciseLog | undefined> {
    const [updated] = await db.update(schema.exerciseLogs)
      .set(log)
      .where(eq(schema.exerciseLogs.id, id))
      .returning();
    return updated;
  }

  // Check-in methods
  async getCheckIns(userId: string): Promise<schema.CheckIn[]> {
    return await db.select()
      .from(schema.checkIns)
      .where(eq(schema.checkIns.userId, userId))
      .orderBy(schema.checkIns.checkInNumber);
  }

  async getLatestCheckIn(userId: string): Promise<schema.CheckIn | undefined> {
    const [checkIn] = await db.select()
      .from(schema.checkIns)
      .where(eq(schema.checkIns.userId, userId))
      .orderBy(desc(schema.checkIns.checkInNumber))
      .limit(1);
    return checkIn;
  }

  async createCheckIn(checkIn: schema.InsertCheckIn): Promise<schema.CheckIn> {
    const [newCheckIn] = await db.insert(schema.checkIns).values(checkIn).returning();
    return newCheckIn;
  }

  async updateCheckIn(id: string, checkIn: Partial<schema.InsertCheckIn>): Promise<schema.CheckIn | undefined> {
    const [updated] = await db.update(schema.checkIns)
      .set({ ...checkIn, updatedAt: new Date() })
      .where(eq(schema.checkIns.id, id))
      .returning();
    return updated;
  }

  // User stats methods
  async getUserStats(userId: string): Promise<schema.UserStats | undefined> {
    const [stats] = await db.select().from(schema.userStats).where(eq(schema.userStats.userId, userId));
    return stats;
  }

  async updateUserStats(userId: string, stats: Partial<schema.InsertUserStats>): Promise<schema.UserStats> {
    const existing = await this.getUserStats(userId);
    
    if (existing) {
      const [updated] = await db.update(schema.userStats)
        .set({ ...stats, updatedAt: new Date() })
        .where(eq(schema.userStats.userId, userId))
        .returning();
      return updated;
    } else {
      const [newStats] = await db.insert(schema.userStats)
        .values({ userId, ...stats })
        .returning();
      return newStats;
    }
  }
}

export const storage = new DbStorage();
