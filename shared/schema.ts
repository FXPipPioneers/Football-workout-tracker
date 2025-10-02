import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(),
  hasLeftRight: boolean("has_left_right").default(false),
  hasNearFar: boolean("has_near_far").default(false),
  hasWeight: boolean("has_weight").default(false),
  hasDistance: boolean("has_distance").default(false),
  hasTime: boolean("has_time").default(false),
  hasHeartRate: boolean("has_heart_rate").default(false),
  description: text("description"),
  isCustom: boolean("is_custom").default(false),
  userId: varchar("user_id").references(() => users.id),
});

export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  mode: text("mode").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  duration: text("duration"),
  location: text("location"),
  equipment: text("equipment"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutBlocks = pgTable("workout_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: varchar("workout_id").references(() => workouts.id).notNull(),
  title: text("title").notNull(),
  duration: text("duration"),
  order: integer("order").notNull(),
});

export const workoutBlockExercises = pgTable("workout_block_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockId: varchar("block_id").references(() => workoutBlocks.id).notNull(),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  order: integer("order").notNull(),
  sets: text("sets"),
  reps: text("reps"),
  rest: text("rest"),
  notes: text("notes"),
});

export const workoutSessions = pgTable("workout_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  workoutId: varchar("workout_id").references(() => workouts.id).notNull(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull(),
  mode: text("mode").notNull(),
  currentBlockId: varchar("current_block_id").references(() => workoutBlocks.id),
  notes: text("notes"),
  pausedAt: timestamp("paused_at"),
  pausedState: text("paused_state"),
}, (table) => ({
  userDateIdx: index("workout_sessions_user_date_idx").on(table.userId, table.startedAt),
  userStatusIdx: index("workout_sessions_user_status_idx").on(table.userId, table.status),
}));

export const sessionBlockLogs = pgTable("session_block_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => workoutSessions.id).notNull(),
  blockId: varchar("block_id").references(() => workoutBlocks.id).notNull(),
  status: text("status").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const exerciseLogs = pgTable("exercise_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => workoutSessions.id).notNull(),
  blockLogId: varchar("block_log_id").references(() => sessionBlockLogs.id).notNull(),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  completedSets: integer("completed_sets").default(0),
  leftReps: integer("left_reps"),
  rightReps: integer("right_reps"),
  leftNearReps: integer("left_near_reps"),
  leftFarReps: integer("left_far_reps"),
  rightNearReps: integer("right_near_reps"),
  rightFarReps: integer("right_far_reps"),
  weight: real("weight"),
  distance: real("distance"),
  duration: integer("duration"),
  heartRate: integer("heart_rate"),
  onTarget: integer("on_target"),
  totalReps: integer("total_reps"),
  notes: text("notes"),
  skipped: boolean("skipped").default(false),
  modified: boolean("modified").default(false),
  pain: boolean("pain").default(false),
  techniqueOff: boolean("technique_off").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdx: index("exercise_logs_session_idx").on(table.sessionId),
  exerciseIdx: index("exercise_logs_exercise_idx").on(table.exerciseId),
}));

export const checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  checkInNumber: integer("check_in_number").notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  passingAccuracyLeft: integer("passing_accuracy_left"),
  passingAccuracyRight: integer("passing_accuracy_right"),
  finishingNearLeft: integer("finishing_near_left"),
  finishingFarLeft: integer("finishing_far_left"),
  finishingNearRight: integer("finishing_near_right"),
  finishingFarRight: integer("finishing_far_right"),
  firstTouchLeft: integer("first_touch_left"),
  firstTouchRight: integer("first_touch_right"),
  comfortLevelLeft: integer("comfort_level_left"),
  comfortLevelRight: integer("comfort_level_right"),
  skillMoveFakeShotLeft: integer("skill_move_fake_shot_left"),
  skillMoveFakeShotRight: integer("skill_move_fake_shot_right"),
  skillMoveCroquetaLeft: integer("skill_move_croqueta_left"),
  skillMoveCroquetaRight: integer("skill_move_croqueta_right"),
  skillMoveFlipFlapLeft: integer("skill_move_flip_flap_left"),
  skillMoveFlipFlapRight: integer("skill_move_flip_flap_right"),
  gameRealismSuccess: integer("game_realism_success"),
  enduranceJog1km: real("endurance_jog_1km"),
  enduranceJog2km: real("endurance_jog_2km"),
  enduranceJog3km: real("endurance_jog_3km"),
  enduranceJog4km: real("endurance_jog_4km"),
  enduranceJog5km: real("endurance_jog_5km"),
  enduranceAvgHR: integer("endurance_avg_hr"),
  hiitDistance: integer("hiit_distance"),
  maxSprintTime: real("max_sprint_time"),
  fatiguedFinishingNearLeft: integer("fatigued_finishing_near_left"),
  fatiguedFinishingFarLeft: integer("fatigued_finishing_far_left"),
  fatiguedFinishingNearRight: integer("fatigued_finishing_near_right"),
  fatiguedFinishingFarRight: integer("fatigued_finishing_far_right"),
  squatWeight: real("squat_weight"),
  benchWeight: real("bench_weight"),
  rdlWeight: real("rdl_weight"),
  pullUps: integer("pull_ups"),
  weight: real("weight"),
  proteinIntake: integer("protein_intake"),
  sleepHours: real("sleep_hours"),
  energyLevel: integer("energy_level"),
  leftFootConfidence: integer("left_foot_confidence"),
  overallConfidence: integer("overall_confidence"),
  motivationCheck: text("motivation_check"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userCheckInIdx: index("check_ins_user_check_in_idx").on(table.userId, table.checkInNumber),
}));

export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  totalWorkouts: integer("total_workouts").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastWorkoutDate: timestamp("last_workout_date"),
  totalShotsLeft: integer("total_shots_left").default(0),
  totalShotsRight: integer("total_shots_right").default(0),
  onTargetLeft: integer("on_target_left").default(0),
  onTargetRight: integer("on_target_right").default(0),
  totalPassesLeft: integer("total_passes_left").default(0),
  totalPassesRight: integer("total_passes_right").default(0),
  totalDistance: real("total_distance").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutBlockSchema = createInsertSchema(workoutBlocks).omit({
  id: true,
});

export const insertWorkoutBlockExerciseSchema = createInsertSchema(workoutBlockExercises).omit({
  id: true,
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({
  id: true,
});

export const insertSessionBlockLogSchema = createInsertSchema(sessionBlockLogs).omit({
  id: true,
});

export const insertExerciseLogSchema = createInsertSchema(exerciseLogs).omit({
  id: true,
  createdAt: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type WorkoutBlock = typeof workoutBlocks.$inferSelect;
export type InsertWorkoutBlock = z.infer<typeof insertWorkoutBlockSchema>;

export type WorkoutBlockExercise = typeof workoutBlockExercises.$inferSelect;
export type InsertWorkoutBlockExercise = z.infer<typeof insertWorkoutBlockExerciseSchema>;

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;

export type SessionBlockLog = typeof sessionBlockLogs.$inferSelect;
export type InsertSessionBlockLog = z.infer<typeof insertSessionBlockLogSchema>;

export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type InsertExerciseLog = z.infer<typeof insertExerciseLogSchema>;

export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
