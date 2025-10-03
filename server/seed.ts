import { db } from "./db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { workoutTemplates, type WorkoutTemplate } from "./workouts-data";

// Comprehensive exercise library
const exerciseLibrary: Array<Omit<schema.InsertExercise, "userId">> = [
  // Warm-up exercises
  { name: "2 laps jog around pitch", category: "Warm-up", type: "cardio", hasDistance: true, hasTime: true },
  { name: "Leg swings (front/back)", category: "Warm-up", type: "mobility", hasLeftRight: true },
  { name: "Leg swings (side/side)", category: "Warm-up", type: "mobility", hasLeftRight: true },
  { name: "Walking lunges with twist", category: "Warm-up", type: "mobility", hasLeftRight: true },
  { name: "High knees", category: "Warm-up", type: "cardio", hasDistance: true },
  { name: "Butt kicks", category: "Warm-up", type: "cardio", hasDistance: true },
  { name: "Light ball touches", category: "Warm-up", type: "technical" },
  { name: "Light dribbling & passing", category: "Warm-up", type: "technical" },
  { name: "Gentle dribbling", category: "Warm-up", type: "technical" },
  { name: "Short passes", category: "Warm-up", type: "technical", hasLeftRight: true },
  { name: "Dynamic stretching", category: "Warm-up", type: "mobility" },
  { name: "Jump rope", category: "Warm-up", type: "cardio", hasTime: true },
  
  // Passing drills
  { name: "Wall passes 5m", category: "Passing", type: "technical", hasLeftRight: true },
  { name: "Wall passes 10m", category: "Passing", type: "technical", hasLeftRight: true },
  { name: "Partner short passes 5m", category: "Passing", type: "technical", hasLeftRight: true },
  { name: "Partner short passes 10m", category: "Passing", type: "technical", hasLeftRight: true },
  { name: "Driven passes 20m", category: "Passing", type: "technical", hasLeftRight: true },
  { name: "Long driven passes", category: "Passing", type: "technical", hasLeftRight: true },
  { name: "One-touch passes", category: "Passing", type: "technical", hasLeftRight: true },
  { name: "Two-touch passes", category: "Passing", type: "technical", hasLeftRight: true },
  { name: "Two-touch passes advanced", category: "Passing", type: "technical", hasLeftRight: true },
  { name: "Two-touch passes both feet", category: "Passing", type: "technical" },
  { name: "Passing accuracy (wall)", category: "Passing", type: "technical", hasLeftRight: true },
  { name: "Passing accuracy (partner)", category: "Passing", type: "technical", hasLeftRight: true },
  
  // Dribbling drills
  { name: "Cone slalom", category: "Dribbling", type: "technical", hasLeftRight: true, hasTime: true },
  { name: "Cone slalom (tight)", category: "Dribbling", type: "technical", hasLeftRight: true, hasTime: true },
  { name: "Cone dribble → pass", category: "Dribbling", type: "technical", hasLeftRight: true },
  { name: "Cone dribble → pass to partner → return pass", category: "Dribbling", type: "technical", hasLeftRight: true },
  { name: "Dribble + skill move → finish", category: "Dribbling", type: "technical", hasLeftRight: true },
  { name: "Dribble + skill move past passive partner → finish", category: "Dribbling", type: "technical", hasLeftRight: true },
  { name: "Dribble + finish", category: "Dribbling", type: "technical", hasLeftRight: true },
  { name: "Open dribble + skill → finish", category: "Dribbling", type: "technical", hasLeftRight: true },
  { name: "Open dribble + skill move past partner → finish", category: "Dribbling", type: "technical", hasLeftRight: true },
  
  // Ball mastery drills
  { name: "Ball mastery", category: "Ball Mastery", type: "technical", hasTime: true },
  { name: "Toe taps", category: "Ball Mastery", type: "technical", hasTime: true },
  { name: "Sole rolls", category: "Ball Mastery", type: "technical", hasTime: true },
  { name: "Inside-outside touches", category: "Ball Mastery", type: "technical", hasLeftRight: true, hasTime: true },
  { name: "V-pulls", category: "Ball Mastery", type: "technical", hasTime: true },
  
  // Shooting drills
  { name: "Inside-foot shots", category: "Shooting", type: "technical", hasLeftRight: true, hasNearFar: true },
  { name: "Laces drives", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "Volleys", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "Volleys L only", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "Volleys R only", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "Volleys alternating", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "Volleys 2-touch L", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "Volleys 2-touch R", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "Partner toss volleys", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "Shooting placement", category: "Shooting", type: "technical", hasLeftRight: true, hasNearFar: true },
  { name: "Cut-in shots", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "Cut-in shot", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "Cut-in finishes", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "First-touch → shot", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "First-touch → shot from partner pass", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "Sprint 20m → shoot", category: "Shooting", type: "technical", hasLeftRight: true },
  { name: "Sprint 20m → partner pass → finish", category: "Shooting", type: "technical", hasLeftRight: true },
  
  // 1v1 Skills
  { name: "Fake shot + ball roll", category: "1v1 Skills", type: "technical", hasLeftRight: true },
  { name: "Body feint + La Croqueta", category: "1v1 Skills", type: "technical", hasLeftRight: true },
  { name: "Flip Flap", category: "1v1 Skills", type: "technical", hasLeftRight: true },
  { name: "Cruyff turn", category: "1v1 Skills", type: "technical", hasLeftRight: true },
  
  // Combination play
  { name: "Give-and-go → finish", category: "Combination Play", type: "technical", hasLeftRight: true },
  { name: "Wall give-and-go → finish", category: "Combination Play", type: "technical", hasLeftRight: true },
  { name: "Partner give-and-go → finish", category: "Combination Play", type: "technical", hasLeftRight: true },
  { name: "Layoff + 1st-time shot", category: "Combination Play", type: "technical", hasLeftRight: true },
  { name: "Partner layoff + 1st-time shot", category: "Combination Play", type: "technical", hasLeftRight: true },
  { name: "Long pass → control → return", category: "Combination Play", type: "technical", hasLeftRight: true },
  
  // Juggling
  { name: "Wall juggling", category: "Juggling", type: "technical", hasLeftRight: true },
  { name: "Wall juggling L", category: "Juggling", type: "technical", hasLeftRight: true },
  { name: "Wall juggling R", category: "Juggling", type: "technical", hasLeftRight: true },
  { name: "Wall juggling alternating feet", category: "Juggling", type: "technical", hasLeftRight: true },
  { name: "Wall juggling 2-touch alternating", category: "Juggling", type: "technical", hasLeftRight: true },
  { name: "Partner juggling", category: "Juggling", type: "technical", hasLeftRight: true },
  { name: "Freestyle juggling", category: "Juggling", type: "technical" },
  { name: "Partner volleys", category: "Juggling", type: "technical", hasLeftRight: true },
  
  // Strength training - Lower body
  { name: "Squat", category: "Lower Strength", type: "strength", hasWeight: true },
  { name: "Bulgarian Split Squat", category: "Lower Strength", type: "strength", hasWeight: true, hasLeftRight: true },
  { name: "RDL", category: "Lower Strength", type: "strength", hasWeight: true },
  { name: "Calf Raise", category: "Lower Strength", type: "strength", hasWeight: true },
  { name: "Nordic Curl", category: "Lower Strength", type: "strength" },
  { name: "Front Squat", category: "Lower Strength", type: "strength", hasWeight: true },
  { name: "Goblet Squat", category: "Lower Strength", type: "strength", hasWeight: true },
  { name: "Leg Press", category: "Lower Strength", type: "strength", hasWeight: true },
  { name: "Walking Lunges", category: "Lower Strength", type: "strength", hasWeight: true, hasDistance: true },
  { name: "Step-ups", category: "Lower Strength", type: "strength", hasWeight: true, hasLeftRight: true },
  
  // Strength training - Upper body
  { name: "Bench Press", category: "Upper Strength", type: "strength", hasWeight: true },
  { name: "Pull-ups", category: "Upper Strength", type: "strength" },
  { name: "OHP", category: "Upper Strength", type: "strength", hasWeight: true },
  { name: "Overhead Press", category: "Upper Strength", type: "strength", hasWeight: true },
  { name: "Barbell Row", category: "Upper Strength", type: "strength", hasWeight: true },
  { name: "Dumbbell Row", category: "Upper Strength", type: "strength", hasWeight: true, hasLeftRight: true },
  { name: "Push-ups", category: "Upper Strength", type: "strength" },
  { name: "Dips", category: "Upper Strength", type: "strength" },
  
  // Plyometric exercises
  { name: "Box Jumps", category: "Plyo", type: "power" },
  { name: "Lateral Bounds", category: "Plyo", type: "power", hasLeftRight: true },
  { name: "Broad Jumps", category: "Plyo", type: "power", hasDistance: true },
  { name: "Single-leg Hops", category: "Plyo", type: "power", hasLeftRight: true },
  { name: "Depth Jumps", category: "Plyo", type: "power" },
  { name: "Skater Jumps", category: "Plyo", type: "power" },
  
  // Core exercises
  { name: "Plank", category: "Core", type: "core", hasTime: true },
  { name: "Copenhagen plank", category: "Core", type: "core", hasLeftRight: true, hasTime: true },
  { name: "Bird dog", category: "Core", type: "core" },
  { name: "Dead Bug", category: "Core", type: "core" },
  { name: "Russian Twists", category: "Core", type: "core" },
  { name: "Ab Wheel", category: "Core", type: "core" },
  
  // Speed & Agility
  { name: "Ladder drills", category: "Speed & Agility", type: "agility", hasTime: true },
  { name: "5–10–5 shuttle", category: "Speed & Agility", type: "agility" },
  { name: "Flying 30m", category: "Speed & Agility", type: "speed", hasTime: true },
  { name: "10m accel starts", category: "Speed & Agility", type: "speed", hasTime: true },
  { name: "20m sprint", category: "Speed & Agility", type: "speed", hasTime: true },
  { name: "Cone Drills", category: "Speed & Agility", type: "agility", hasTime: true },
  
  // Conditioning
  { name: "4×4 min HIIT", category: "Conditioning", type: "cardio", hasDistance: true, hasHeartRate: true },
  { name: "Recovery Jog", category: "Conditioning", type: "cardio", hasDistance: true, hasHeartRate: true, hasTime: true },
  { name: "Endurance Run", category: "Conditioning", type: "cardio", hasDistance: true, hasHeartRate: true, hasTime: true },
  
  // Mobility & Recovery
  { name: "Hip 90/90", category: "Mobility", type: "mobility", hasLeftRight: true, hasTime: true },
  { name: "Cossack Squats", category: "Mobility", type: "mobility", hasLeftRight: true },
  { name: "World's Greatest Stretch", category: "Mobility", type: "mobility", hasLeftRight: true },
  { name: "Ankle rocks", category: "Mobility", type: "mobility", hasLeftRight: true },
  { name: "Cat-Cow + T-spine rotations", category: "Mobility", type: "mobility" },
  { name: "Foam roll legs", category: "Mobility", type: "recovery", hasTime: true },
  { name: "Foam roll quads", category: "Mobility", type: "recovery", hasTime: true },
  { name: "Foam roll hamstrings", category: "Mobility", type: "recovery", hasTime: true },
  { name: "Foam roll calves", category: "Mobility", type: "recovery", hasTime: true },
  { name: "Foam roll adductors", category: "Mobility", type: "recovery", hasTime: true },
  
  // Cooldown
  { name: "1 lap walk/jog", category: "Cooldown", type: "recovery", hasDistance: true, hasTime: true },
  { name: "Hamstring stretch", category: "Cooldown", type: "recovery", hasTime: true },
  { name: "Quad stretch", category: "Cooldown", type: "recovery", hasLeftRight: true, hasTime: true },
  { name: "Calf stretch", category: "Cooldown", type: "recovery", hasLeftRight: true, hasTime: true },
  { name: "Hip flexor lunge stretch", category: "Cooldown", type: "recovery", hasLeftRight: true, hasTime: true },
  { name: "Groin/adductor stretch", category: "Cooldown", type: "recovery", hasTime: true },
  { name: "Static stretches", category: "Cooldown", type: "recovery", hasTime: true },
];

export async function seedExercises() {
  console.log("Seeding exercises...");
  
  for (const exercise of exerciseLibrary) {
    await db.insert(schema.exercises).values({
      ...exercise,
      userId: null,
      isCustom: false,
    }).onConflictDoNothing();
  }
  
  console.log(`Seeded ${exerciseLibrary.length} exercises`);
}

export async function seedWorkouts(userId: string) {
  console.log("Seeding workouts for user:", userId);
  
  // Clear existing workouts for this user (delete related records first)
  const existingWorkouts = await db.select().from(schema.workouts).where(eq(schema.workouts.userId, userId));
  for (const workout of existingWorkouts) {
    // Delete workout_block_exercises first
    const blocks = await db.select().from(schema.workoutBlocks).where(eq(schema.workoutBlocks.workoutId, workout.id));
    for (const block of blocks) {
      await db.delete(schema.workoutBlockExercises).where(eq(schema.workoutBlockExercises.blockId, block.id));
    }
    // Then delete workout_blocks
    await db.delete(schema.workoutBlocks).where(eq(schema.workoutBlocks.workoutId, workout.id));
  }
  // Finally delete workouts
  await db.delete(schema.workouts).where(eq(schema.workouts.userId, userId));
  
  // Get all exercises
  const exercises = await db.select().from(schema.exercises);
  const exerciseMap = new Map(exercises.map(e => [e.name, e]));
  
  const getExercise = (name: string) => {
    const exercise = exerciseMap.get(name);
    if (!exercise) {
      throw new Error(`Exercise not found: ${name}`);
    }
    return exercise;
  };
  
  // Helper to create workout with blocks and exercises
  const createWorkout = async (template: WorkoutTemplate) => {
    const { dayOfWeek, mode, title, duration, location, equipment, blocks } = template;
    
    const [workout] = await db.insert(schema.workouts).values({
      userId,
      dayOfWeek,
      mode,
      title,
      duration,
      location,
      equipment,
      isActive: true,
    }).returning();
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const [workoutBlock] = await db.insert(schema.workoutBlocks).values({
        workoutId: workout.id,
        title: block.title,
        duration: block.duration,
        order: i,
      }).returning();
      
      for (let j = 0; j < block.exercises.length; j++) {
        const exercise = block.exercises[j];
        const exerciseData = getExercise(exercise.name);
        
        await db.insert(schema.workoutBlockExercises).values({
          blockId: workoutBlock.id,
          exerciseId: exerciseData.id,
          order: j,
          sets: exercise.sets,
          reps: exercise.reps,
          rest: exercise.rest,
          notes: exercise.notes,
        });
      }
    }
    
    return workout;
  };
  
  // Create all workout templates
  for (const template of workoutTemplates) {
    await createWorkout(template);
  }
  
  console.log(`Seeded ${workoutTemplates.length} workouts successfully!`);
}

export async function runSeed() {
  await seedExercises();
  // Note: User-specific workouts will be seeded when user signs up/logs in
  console.log("Seed completed!");
}

// Uncomment below to run seed manually with: npx tsx server/seed.ts
// runSeed()
//   .then(() => {
//     console.log("Done!");
//     process.exit(0);
//   })
//   .catch((err) => {
//     console.error("Seed failed:", err);
//     process.exit(1);
//   });
