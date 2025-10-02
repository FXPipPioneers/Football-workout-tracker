import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as schema from "@shared/schema";
import { seedWorkouts, seedExercises } from "./seed";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Exercise routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/category/:category", async (req, res) => {
    try {
      const exercises = await storage.getExercisesByCategory(req.params.category);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exercises by category" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const exercise = await storage.createExercise(req.body);
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ error: "Failed to create exercise" });
    }
  });

  // Workout routes
  app.get("/api/workouts", async (req, res) => {
    try {
      const userId = "test-user-id"; // TODO: Get from session/auth
      const workouts = await storage.getWorkouts(userId);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workouts" });
    }
  });

  app.get("/api/workouts/today", async (req, res) => {
    try {
      const userId = "test-user-id"; // TODO: Get from session/auth
      const mode = (req.query.mode as "solo" | "friend") || "solo";
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
      
      const workout = await storage.getWorkoutsByDay(userId, today, mode);
      if (!workout) {
        return res.status(404).json({ error: "No workout found for today" });
      }
      
      const workoutWithBlocks = await storage.getWorkoutWithBlocks(workout.id);
      res.json(workoutWithBlocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's workout" });
    }
  });

  app.get("/api/workouts/:id", async (req, res) => {
    try {
      const workout = await storage.getWorkoutWithBlocks(req.params.id);
      if (!workout) {
        return res.status(404).json({ error: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workout" });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const { blocks, ...workoutData } = req.body;
      
      // Create workout
      const workout = await storage.createWorkout(workoutData);

      // If blocks are included, create them
      if (blocks && Array.isArray(blocks)) {
        for (const block of blocks) {
          const { exercises, ...blockData } = block;
          
          // Create block
          const newBlock = await storage.createWorkoutBlock({
            ...blockData,
            workoutId: workout.id,
          });

          // Create exercises for this block
          if (exercises && Array.isArray(exercises)) {
            for (const exercise of exercises) {
              const { exercise: _, ...exerciseData } = exercise;
              await storage.createBlockExercise({
                ...exerciseData,
                blockId: newBlock.id,
              });
            }
          }
        }
      }

      // Return created workout with blocks
      const createdWorkout = await storage.getWorkoutWithBlocks(workout.id);
      res.json(createdWorkout);
    } catch (error) {
      console.error('Error creating workout:', error);
      res.status(500).json({ error: "Failed to create workout" });
    }
  });

  app.patch("/api/workouts/:id", async (req, res) => {
    try {
      const { blocks, ...workoutData } = req.body;
      
      // Update workout basic fields
      const workout = await storage.updateWorkout(req.params.id, workoutData);
      if (!workout) {
        return res.status(404).json({ error: "Workout not found" });
      }

      // If blocks are included, handle full update
      if (blocks && Array.isArray(blocks)) {
        // Get existing blocks
        const existingBlocks = await storage.getWorkoutBlocks(req.params.id);
        const existingBlockIds = new Set(existingBlocks.map(b => b.id));
        const incomingBlockIds = new Set(blocks.filter(b => !b.id.startsWith('temp-')).map(b => b.id));

        // Delete blocks that are no longer present
        for (const existingBlock of existingBlocks) {
          if (!incomingBlockIds.has(existingBlock.id)) {
            await storage.deleteWorkoutBlock(existingBlock.id);
          }
        }

        // Update or create blocks
        for (const block of blocks) {
          const { exercises, ...blockData } = block;
          let blockId = block.id;

          // Create or update block
          if (block.id.startsWith('temp-')) {
            const newBlock = await storage.createWorkoutBlock({
              ...blockData,
              workoutId: req.params.id,
            });
            blockId = newBlock.id;
          } else {
            await storage.updateWorkoutBlock(block.id, blockData);
          }

          // Handle exercises for this block
          if (exercises && Array.isArray(exercises)) {
            const existingExercises = await storage.getBlockExercises(blockId);
            const existingExerciseIds = new Set(existingExercises.map(e => e.id));
            const incomingExerciseIds = new Set(exercises.filter(e => !e.id.startsWith('temp-')).map(e => e.id));

            // Delete exercises that are no longer present
            for (const existingExercise of existingExercises) {
              if (!incomingExerciseIds.has(existingExercise.id)) {
                await storage.deleteBlockExercise(existingExercise.id);
              }
            }

            // Update or create exercises
            for (const exercise of exercises) {
              const { exercise: _, ...exerciseData } = exercise;
              
              if (exercise.id.startsWith('temp-')) {
                await storage.createBlockExercise({
                  ...exerciseData,
                  blockId: blockId,
                });
              } else {
                await storage.updateBlockExercise(exercise.id, exerciseData);
              }
            }
          }
        }
      }

      // Return updated workout with blocks
      const updatedWorkout = await storage.getWorkoutWithBlocks(req.params.id);
      res.json(updatedWorkout);
    } catch (error) {
      console.error('Error updating workout:', error);
      res.status(500).json({ error: "Failed to update workout" });
    }
  });

  app.delete("/api/workouts/:id", async (req, res) => {
    try {
      await storage.deleteWorkout(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting workout:', error);
      res.status(500).json({ error: "Failed to delete workout" });
    }
  });

  // Workout block routes
  app.post("/api/workout-blocks", async (req, res) => {
    try {
      const block = await storage.createWorkoutBlock(req.body);
      res.json(block);
    } catch (error) {
      res.status(500).json({ error: "Failed to create workout block" });
    }
  });

  app.patch("/api/workout-blocks/:id", async (req, res) => {
    try {
      const block = await storage.updateWorkoutBlock(req.params.id, req.body);
      if (!block) {
        return res.status(404).json({ error: "Workout block not found" });
      }
      res.json(block);
    } catch (error) {
      res.status(500).json({ error: "Failed to update workout block" });
    }
  });

  app.delete("/api/workout-blocks/:id", async (req, res) => {
    try {
      await storage.deleteWorkoutBlock(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workout block" });
    }
  });

  // Workout block exercise routes
  app.post("/api/block-exercises", async (req, res) => {
    try {
      const exercise = await storage.createBlockExercise(req.body);
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ error: "Failed to create block exercise" });
    }
  });

  app.patch("/api/block-exercises/:id", async (req, res) => {
    try {
      const exercise = await storage.updateBlockExercise(req.params.id, req.body);
      if (!exercise) {
        return res.status(404).json({ error: "Block exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ error: "Failed to update block exercise" });
    }
  });

  app.delete("/api/block-exercises/:id", async (req, res) => {
    try {
      await storage.deleteBlockExercise(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete block exercise" });
    }
  });

  // Workout session routes
  app.get("/api/sessions", async (req, res) => {
    try {
      const userId = "test-user-id"; // TODO: Get from session/auth
      const sessions = await storage.getWorkoutSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/active", async (req, res) => {
    try {
      const userId = "test-user-id"; // TODO: Get from session/auth
      const session = await storage.getActiveSession(userId);
      res.json(session || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active session" });
    }
  });

  app.get("/api/sessions/paused/list", async (req, res) => {
    try {
      const userId = "test-user-id"; // TODO: Get from session/auth
      const sessions = await storage.getPausedSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch paused sessions" });
    }
  });

  app.get("/api/sessions/stats", async (req, res) => {
    try {
      const userId = "test-user-id"; // TODO: Get from session/auth
      const stats = await storage.getSessionStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching session stats:", error);
      res.status(500).json({ error: "Failed to fetch session stats" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSessionById(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const userId = "test-user-id"; // TODO: Get from session/auth
      const session = await storage.createWorkoutSession({
        ...req.body,
        userId,
        startedAt: req.body.startedAt ? new Date(req.body.startedAt) : new Date(),
      });
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateWorkoutSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  app.post("/api/sessions/:id/pause", async (req, res) => {
    try {
      const { state } = req.body;
      if (!state) {
        return res.status(400).json({ error: "Paused state is required" });
      }
      const session = await storage.pauseWorkoutSession(req.params.id, JSON.stringify(state));
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to pause session" });
    }
  });

  app.post("/api/sessions/:id/resume", async (req, res) => {
    try {
      const session = await storage.resumeWorkoutSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to resume session" });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      await storage.deleteWorkoutSession(req.params.id);
      res.json({ message: "Session deleted successfully" });
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  // Exercise log routes
  app.get("/api/sessions/:sessionId/logs", async (req, res) => {
    try {
      const logs = await storage.getExerciseLogsBySession(req.params.sessionId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exercise logs" });
    }
  });

  app.post("/api/exercise-logs", async (req, res) => {
    try {
      const log = await storage.createExerciseLog(req.body);
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to create exercise log" });
    }
  });

  app.patch("/api/exercise-logs/:id", async (req, res) => {
    try {
      const log = await storage.updateExerciseLog(req.params.id, req.body);
      if (!log) {
        return res.status(404).json({ error: "Exercise log not found" });
      }
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to update exercise log" });
    }
  });

  // Check-in routes
  app.get("/api/check-ins", async (req, res) => {
    try {
      const userId = "test-user-id"; // TODO: Get from session/auth
      const checkIns = await storage.getCheckIns(userId);
      res.json(checkIns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch check-ins" });
    }
  });

  app.get("/api/check-ins/latest", async (req, res) => {
    try {
      const userId = "test-user-id"; // TODO: Get from session/auth
      const checkIn = await storage.getLatestCheckIn(userId);
      res.json(checkIn || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest check-in" });
    }
  });

  app.post("/api/check-ins", async (req, res) => {
    try {
      const userId = "test-user-id"; // TODO: Get from session/auth
      const checkIn = await storage.createCheckIn({
        ...req.body,
        userId,
      });
      res.json(checkIn);
    } catch (error) {
      res.status(500).json({ error: "Failed to create check-in" });
    }
  });

  app.patch("/api/check-ins/:id", async (req, res) => {
    try {
      const checkIn = await storage.updateCheckIn(req.params.id, req.body);
      if (!checkIn) {
        return res.status(404).json({ error: "Check-in not found" });
      }
      res.json(checkIn);
    } catch (error) {
      res.status(500).json({ error: "Failed to update check-in" });
    }
  });

  // Progress/Analytics routes
  app.get("/api/progress/weekly", async (req, res) => {
    try {
      const userId = "test-user-id"; // TODO: Get from session/auth
      
      // Calculate date range - either from custom dates or weeks back
      let startDate: Date;
      let endDate: Date;
      
      if (req.query.startDate && req.query.endDate) {
        // Custom date range
        startDate = new Date(req.query.startDate as string);
        endDate = new Date(req.query.endDate as string);
        // Set time to end of day for endDate
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Weeks-based range
        const weeksBack = parseInt(req.query.weeks as string) || 12;
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - (weeksBack * 7));
      }
      
      // Fetch all exercise logs with exercise details in date range
      const logs = await db
        .select({
          log: schema.exerciseLogs,
          exercise: schema.exercises,
          session: schema.workoutSessions,
        })
        .from(schema.exerciseLogs)
        .innerJoin(schema.exercises, eq(schema.exerciseLogs.exerciseId, schema.exercises.id))
        .innerJoin(schema.workoutSessions, eq(schema.exerciseLogs.sessionId, schema.workoutSessions.id))
        .where(eq(schema.workoutSessions.userId, userId))
        .orderBy(schema.workoutSessions.startedAt);
      
      // Group by week and category
      const weeklyData: Record<string, any[]> = {};
      
      logs.forEach(({ log, exercise, session }) => {
        if (!session.startedAt) return;
        
        const sessionDate = new Date(session.startedAt);
        if (sessionDate < startDate || sessionDate > endDate) return;
        
        // Calculate week number
        const weekStart = new Date(sessionDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start on Sunday
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = [];
        }
        
        weeklyData[weekKey].push({
          category: exercise.category,
          exerciseName: exercise.name,
          log,
          date: sessionDate,
        });
      });
      
      res.json({ weeklyData, startDate, endDate });
    } catch (error) {
      console.error("Progress fetch error:", error);
      res.status(500).json({ error: "Failed to fetch progress data" });
    }
  });

  // User stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = "test-user-id"; // TODO: Get from session/auth
      const stats = await storage.getUserStats(userId);
      res.json(stats || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  app.patch("/api/stats", async (req, res) => {
    try {
      const userId = "test-user-id"; // TODO: Get from session/auth
      const stats = await storage.updateUserStats(userId, req.body);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user stats" });
    }
  });

  // Seed route (for development)
  app.post("/api/seed-workouts", async (req, res) => {
    try {
      const userId = "test-user-id";
      
      // Create test user if it doesn't exist
      const existingUser = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      if (existingUser.length === 0) {
        await db.insert(schema.users).values({
          id: userId,
          username: "testuser",
          password: "testpassword"
        });
        console.log("Created test user");
      }
      
      // Seed exercises first
      await seedExercises();
      
      // Then seed workouts
      await seedWorkouts(userId);
      
      res.json({ success: true, message: "Database seeded successfully" });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ error: "Failed to seed workouts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
