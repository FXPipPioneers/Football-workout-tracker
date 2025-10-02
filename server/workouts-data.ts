// Complete workout templates for all 7 days in both solo and friend modes
export type WorkoutTemplate = {
  dayOfWeek: string;
  mode: "solo" | "friend";
  title: string;
  duration: string;
  location: string;
  equipment: string;
  blocks: Array<{
    title: string;
    duration?: string;
    exercises: Array<{
      name: string;
      sets?: string;
      reps?: string;
      rest?: string;
      notes?: string;
    }>;
  }>;
};

export const workoutTemplates: WorkoutTemplate[] = [
  // MONDAY - SOLO
  {
    dayOfWeek: "MONDAY",
    mode: "solo",
    title: "Passing + Lower Strength + Plyo",
    duration: "~1h45min",
    location: "Pitch → Gym",
    equipment: "Ball, cones, wall, barbell/dumbbells, plyo box, mat",
    blocks: [
      {
        title: "Warm-up",
        duration: "10m",
        exercises: [
          { name: "2 laps jog around pitch", notes: "~400–600 m, 3–4 min" },
          { name: "Leg swings (front/back)", reps: "10/leg" },
          { name: "Leg swings (side/side)", reps: "10/leg" },
          { name: "Walking lunges with twist", reps: "8/leg" },
          { name: "High knees", notes: "20 m" },
          { name: "Butt kicks", notes: "20 m" },
          { name: "Light ball touches", notes: "2–3 min. Gentle dribbling, 20–30 short passes at 50% intensity" },
        ]
      },
      {
        title: "Passing Block",
        duration: "20m",
        exercises: [
          { name: "Wall passes 5m", reps: "2×25 L | 2×25 R", rest: "30–60s" },
          { name: "Driven passes 20m", reps: "3×8 L | 3×8 R", rest: "30–60s" },
          { name: "Cone dribble → pass", reps: "3×10 L | 2×10 R", rest: "30–60s", notes: "scan every 2–3 touches" },
        ]
      },
      {
        title: "Gym Lower Strength",
        duration: "50m",
        exercises: [
          { name: "Squat", sets: "4", reps: "6", rest: "3m", notes: "@ 75–80%" },
          { name: "Bulgarian Split Squat", sets: "3", reps: "8/leg", rest: "90s" },
          { name: "RDL", sets: "3", reps: "8", rest: "90s" },
          { name: "Calf Raise", sets: "3", reps: "15", rest: "60s" },
          { name: "Nordic Curl", sets: "2", reps: "6–8", rest: "90s" },
        ]
      },
      {
        title: "Plyo",
        duration: "15m",
        exercises: [
          { name: "Box Jumps", sets: "4", reps: "6", rest: "90s" },
          { name: "Lateral Bounds", sets: "3", reps: "10/side", rest: "60s" },
        ]
      },
      {
        title: "Core",
        duration: "5m",
        exercises: [
          { name: "Plank", sets: "3", reps: "to-failure" },
        ]
      },
      {
        title: "Cooldown",
        duration: "5m",
        exercises: [
          { name: "1 lap walk/jog", notes: "~200–300 m, 2–3 min" },
          { name: "Static stretches", notes: "5–6 min (hold 20–30 s each). Examples: Hamstring stretch, Quad stretch, Calf stretch, Hip flexor lunge stretch, Groin/adductor stretch" },
        ]
      },
    ]
  },
  
  // MONDAY - FRIEND
  {
    dayOfWeek: "MONDAY",
    mode: "friend",
    title: "Passing + Lower Strength + Plyo",
    duration: "~1h45min",
    location: "Pitch → Gym",
    equipment: "Ball, cones, partner, barbell/dumbbells, plyo box, mat",
    blocks: [
      {
        title: "Warm-up",
        duration: "10m",
        exercises: [
          { name: "2 laps jog around pitch", notes: "~400–600 m" },
          { name: "Leg swings (front/back)", reps: "10/leg" },
          { name: "Leg swings (side/side)", reps: "10/leg" },
          { name: "Walking lunges with twist", reps: "8/leg" },
          { name: "High knees", notes: "20 m" },
          { name: "Butt kicks", notes: "20 m" },
          { name: "Light ball touches", notes: "2–3 min. Gentle dribbling, 20–30 short passes at 50% intensity (with friend)" },
        ]
      },
      {
        title: "Passing Block",
        duration: "20m",
        exercises: [
          { name: "Partner short passes 5m", reps: "2×25 L | 2×25 R", rest: "30s" },
          { name: "Driven passes 20m", reps: "3×8 L | 3×8 R", rest: "60s", notes: "Partner cushions and returns" },
          { name: "Cone dribble → pass to partner → return pass", reps: "3×10 L | 2×10 R", rest: "30–60s", notes: "Scan up before pass" },
        ]
      },
      {
        title: "Gym Lower Strength",
        duration: "50m",
        exercises: [
          { name: "Squat", sets: "4", reps: "6", rest: "3m", notes: "@ 75–80%" },
          { name: "Bulgarian Split Squat", sets: "3", reps: "8/leg", rest: "90s" },
          { name: "RDL", sets: "3", reps: "8", rest: "90s" },
          { name: "Calf Raise", sets: "3", reps: "15", rest: "60s" },
          { name: "Nordic Curl", sets: "2", reps: "6–8", rest: "90s" },
        ]
      },
      {
        title: "Plyo",
        duration: "15m",
        exercises: [
          { name: "Box Jumps", sets: "4", reps: "6", rest: "90s" },
          { name: "Lateral Bounds", sets: "3", reps: "10/side", rest: "60s" },
        ]
      },
      {
        title: "Core",
        duration: "5m",
        exercises: [
          { name: "Plank", sets: "3", reps: "to-failure" },
        ]
      },
      {
        title: "Cooldown",
        duration: "5m",
        exercises: [
          { name: "1 lap walk/jog", notes: "~200–300 m" },
          { name: "Static stretches", notes: "5–6 min (hold 20–30 s each). Examples: Hamstring stretch, Quad stretch, Calf stretch, Hip flexor lunge stretch, Groin/adductor stretch" },
        ]
      },
    ]
  },
  
  // TUESDAY - SOLO
  {
    dayOfWeek: "TUESDAY",
    mode: "solo",
    title: "Dribbling + Finishing + HIIT",
    duration: "~2h",
    location: "Pitch",
    equipment: "Ball, cones, mini-goal, stopwatch",
    blocks: [
      {
        title: "Warm-up",
        duration: "10m",
        exercises: [
          { name: "2 laps jog around pitch", notes: "~400–600 m" },
          { name: "Dynamic stretching" },
        ]
      },
      {
        title: "Dribbling Block",
        duration: "20m",
        exercises: [
          { name: "Cone slalom", reps: "3×60s L | 2×60s R", rest: "60s" },
          { name: "Dribble + skill move → finish", reps: "3×10 L | 2×10 R", rest: "60s", notes: "head up scanning" },
        ]
      },
      {
        title: "Technical Circuit",
        duration: "60m",
        exercises: [
          { name: "Ball mastery", notes: "5m alternating (toe taps, V-pulls, rolls)" },
          { name: "Passing accuracy (wall)", reps: "3×25 L | 2×25 R", rest: "45–60s" },
          { name: "Dribble + finish", sets: "2", reps: "8 L | 8 R", rest: "45–60s" },
          { name: "Shooting placement", notes: "10 far + 10 near L | 10 far + 10 near R" },
        ]
      },
      {
        title: "Conditioning — HIIT",
        duration: "30m",
        exercises: [
          { name: "4×4 min HIIT", notes: "4×4 min @ 80–85% (~600–800m). Rest = 2m jog between sets (no full stop). Total ~2.5–3.2 km" },
        ]
      },
      {
        title: "Cooldown",
        duration: "10m",
        exercises: [
          { name: "1 lap walk/jog" },
          { name: "Static stretches", notes: "5–6 min (hold 20–30 s each). Examples: Hamstring stretch, Quad stretch, Calf stretch, Hip flexor lunge stretch, Groin/adductor stretch" },
        ]
      },
    ]
  },
  
  // TUESDAY - FRIEND
  {
    dayOfWeek: "TUESDAY",
    mode: "friend",
    title: "Dribbling + Finishing + HIIT",
    duration: "~2h",
    location: "Pitch",
    equipment: "Ball, cones, mini-goal, stopwatch, jump rope, partner",
    blocks: [
      {
        title: "Jump rope",
        duration: "3m",
        exercises: [
          { name: "Jump rope", notes: "light sweat, springy calves, fast feet" },
        ]
      },
      {
        title: "Warm-up",
        duration: "10m",
        exercises: [
          { name: "2 laps jog around pitch", notes: "~400–600 m, 3–4 min" },
          { name: "Leg swings (front/back)", reps: "10/leg" },
          { name: "Leg swings (side/side)", reps: "10/leg" },
          { name: "Walking lunges with twist", reps: "8/leg" },
          { name: "High knees", notes: "20 m" },
          { name: "Butt kicks", notes: "20 m" },
          { name: "Light ball touches", notes: "2–3 min. Gentle dribbling, 20–30 short passes at 50% intensity" },
        ]
      },
      {
        title: "Dribbling Block",
        duration: "20m",
        exercises: [
          { name: "Cone slalom", reps: "4×60s L | 2×60s R", rest: "60s", notes: "partner times reps" },
          { name: "Dribble + skill move past passive partner → finish", reps: "3×10 L | 1×10 R", rest: "60s" },
        ]
      },
      {
        title: "Technical Circuit",
        duration: "60m",
        exercises: [
          { name: "Ball mastery", notes: "5min alternating reps" },
          { name: "Passing accuracy (partner)", reps: "3×25 L | 2×25 R", rest: "45–60s" },
          { name: "Dribble + finish", reps: "2×8 L | 1×8 R", rest: "45–60s", notes: "light partner pressure" },
          { name: "Shooting placement", notes: "Partner feeds balls → 10 near + 10 far each foot" },
        ]
      },
      {
        title: "Conditioning — HIIT",
        duration: "30m",
        exercises: [
          { name: "4×4 min HIIT", notes: "4×4 min @ 80–85% (race partner for pace). ~600–800m per interval. Rest 2m jog" },
        ]
      },
      {
        title: "Cooldown",
        duration: "10m",
        exercises: [
          { name: "1 lap walk/jog" },
          { name: "Static stretches", notes: "5–6 min (hold 20–30 s each). Examples: Hamstring stretch, Quad stretch, Calf stretch, Hip flexor lunge stretch, Groin/adductor stretch" },
        ]
      },
    ]
  },
  
  // WEDNESDAY - SOLO
  {
    dayOfWeek: "WEDNESDAY",
    mode: "solo",
    title: "Touches + Recovery Jog + Mobility",
    duration: "~1h20min",
    location: "Parking field (touches) → Outside (jog) → Home (mobility)",
    equipment: "Ball, running shoes, mat, foam roller",
    blocks: [
      {
        title: "Wall Touches",
        duration: "15m",
        exercises: [
          { name: "Wall passes 5m", reps: "50 L | 50 R", rest: "1m per block", notes: "3–5m from wall, ball speed 50–60%" },
          { name: "Two-touch passes", reps: "50 L | 50 R", rest: "1m per block" },
          { name: "Two-touch passes both feet", reps: "50", notes: "receive L → pass R, and vice versa" },
        ]
      },
      {
        title: "Juggling",
        duration: "20m",
        exercises: [
          { name: "Wall juggling L", reps: "20", rest: "30–45s" },
          { name: "Wall juggling R", reps: "20", rest: "30–45s" },
          { name: "Wall juggling alternating feet", reps: "20", rest: "30–45s" },
          { name: "Wall juggling 2-touch alternating", reps: "20", rest: "30–45s", notes: "ADVANCED" },
        ]
      },
      {
        title: "Recovery Jog",
        duration: "20–25m",
        exercises: [
          { name: "Recovery Jog", notes: "3–4 km easy @ HR < 130. Start 10–15m after touches/juggling" },
        ]
      },
      {
        title: "Mobility Circuit",
        duration: "20m",
        exercises: [
          { name: "Hip 90/90", reps: "30s/side", notes: "repeat 2×" },
          { name: "Cossack Squats", reps: "8/side", notes: "repeat 2×" },
          { name: "World's Greatest Stretch", reps: "6/side", notes: "repeat 2×" },
          { name: "Ankle Rocks", reps: "12/side", notes: "repeat 2×" },
          { name: "Cat-Cow + T-spine rotations", reps: "8 reps each", notes: "repeat 2×" },
          { name: "Foam roll legs", notes: "60–90s each" },
        ]
      },
    ]
  },
  
  // WEDNESDAY - FRIEND
  {
    dayOfWeek: "WEDNESDAY",
    mode: "friend",
    title: "Partner Touches + Volleys + Recovery Jog + Mobility",
    duration: "~1h20m",
    location: "Pitch/parking field (touches) → Outside (jog) → Home (mobility)",
    equipment: "Ball, running shoes, mat, foam roller, partner",
    blocks: [
      {
        title: "Partner Touches",
        duration: "20m",
        exercises: [
          { name: "One-touch passes", reps: "50 L | 50 R" },
          { name: "Two-touch passes", reps: "50 L | 50 R" },
          { name: "Two-touch passes advanced", reps: "25 each", notes: "Receive left → pass right, and vice versa" },
        ]
      },
      {
        title: "Partner Volleys",
        duration: "20m",
        exercises: [
          { name: "Volleys L only", reps: "20", notes: "Partner serves throws, player returns" },
          { name: "Volleys R only", reps: "20", notes: "Partner serves throws, player returns" },
          { name: "Volleys 2-touch L", reps: "20", notes: "Partner serves throws, player returns" },
          { name: "Volleys 2-touch R", reps: "20", notes: "Partner serves throws, player returns" },
          { name: "Volleys alternating", reps: "20", notes: "receive L → return R, then swap. Rest = partner's turn" },
        ]
      },
      {
        title: "Recovery Jog",
        duration: "20–25m",
        exercises: [
          { name: "Recovery Jog", notes: "3–4 km easy pace @ HR < 130" },
        ]
      },
      {
        title: "Mobility Circuit",
        duration: "20m",
        exercises: [
          { name: "Hip 90/90", reps: "30s/side" },
          { name: "Cossack Squats", reps: "8/side" },
          { name: "World's Greatest Stretch", reps: "6/side" },
          { name: "Ankle Rocks", reps: "12/side" },
          { name: "Cat-Cow + T-spine rotations", reps: "8 reps each" },
          { name: "Foam roll quads", notes: "60–90s each" },
          { name: "Foam roll hamstrings", notes: "60–90s each" },
          { name: "Foam roll calves", notes: "60–90s each" },
          { name: "Foam roll adductors", notes: "60–90s each" },
        ]
      },
    ]
  },
  
  // THURSDAY - SOLO
  {
    dayOfWeek: "THURSDAY",
    mode: "solo",
    title: "Shooting + Speed/Agility",
    duration: "~1h45m",
    location: "Pitch",
    equipment: "Ball, cones, ladder",
    blocks: [
      {
        title: "Warm-up",
        duration: "10m",
        exercises: [
          { name: "2 laps jog around pitch", notes: "~400–600 m, 3–4 min" },
          { name: "Leg swings (front/back)", reps: "10/leg" },
          { name: "Leg swings (side/side)", reps: "10/leg" },
          { name: "Walking lunges with twist", reps: "8/leg" },
          { name: "High knees", notes: "20 m" },
          { name: "Butt kicks", notes: "20 m" },
          { name: "Light ball touches", notes: "2–3 min. Gentle dribbling, 20–30 short passes at 50% intensity" },
        ]
      },
      {
        title: "Shooting Block",
        duration: "40m",
        exercises: [
          { name: "Inside-foot shots", reps: "1×10 far + 1×10 near L | 1×10 far + 1×10 near R", rest: "45–60s" },
          { name: "Laces drives", reps: "3×6 L | 2×6 R", rest: "45–60s" },
          { name: "Volleys", reps: "5 L | 5 R" },
        ]
      },
      {
        title: "Speed & Agility",
        duration: "30m",
        exercises: [
          { name: "Ladder drills", notes: "5m continuous" },
          { name: "5–10–5 shuttle", sets: "6", notes: "alternating", rest: "60s per rep" },
          { name: "Flying 30m", sets: "6", rest: "90s per rep" },
          { name: "10m accel starts", sets: "6", rest: "walk-back" },
        ]
      },
      {
        title: "Fatigued Shooting Block",
        duration: "20m",
        exercises: [
          { name: "Inside-foot shots", reps: "1×10 far + 1×10 near L | 1×10 far + 1×10 near R" },
        ]
      },
      {
        title: "Cooldown",
        duration: "5m",
        exercises: [
          { name: "1 lap walk/jog" },
          { name: "Static stretches", notes: "5–6 min (hold 20–30 s each). Examples: Hamstring stretch, Quad stretch, Calf stretch, Hip flexor lunge stretch, Groin/adductor stretch" },
        ]
      },
    ]
  },
  
  // THURSDAY - FRIEND
  {
    dayOfWeek: "THURSDAY",
    mode: "friend",
    title: "Shooting + Speed/Agility",
    duration: "~1h45m",
    location: "Pitch",
    equipment: "Ball, cones, ladder, partner",
    blocks: [
      {
        title: "Warm-up",
        duration: "10m",
        exercises: [
          { name: "2 laps jog around pitch", notes: "~400–600 m, 3–4 min" },
          { name: "Leg swings (front/back)", reps: "10/leg" },
          { name: "Leg swings (side/side)", reps: "10/leg" },
          { name: "Walking lunges with twist", reps: "8/leg" },
          { name: "High knees", notes: "20 m" },
          { name: "Butt kicks", notes: "20 m" },
          { name: "Light ball touches", notes: "2–3 min. Gentle dribbling, 20–30 short passes at 50% intensity" },
        ]
      },
      {
        title: "Shooting Block",
        duration: "40m",
        exercises: [
          { name: "Inside-foot shots", reps: "1×10 far + 1×10 near L | 1×10 far + 1×10 near R", rest: "45–60s" },
          { name: "Laces drives", reps: "3×6 L | 2×6 R", rest: "45–60s" },
          { name: "Volleys", reps: "5 L | 5 R" },
        ]
      },
      {
        title: "Speed & Agility",
        duration: "30m",
        exercises: [
          { name: "Ladder drills", notes: "5m continuous" },
          { name: "5–10–5 shuttle", sets: "6", notes: "alternating", rest: "60s per rep" },
          { name: "Flying 30m", sets: "6", rest: "90s per rep" },
          { name: "10m accel starts", sets: "6", rest: "walk-back" },
        ]
      },
      {
        title: "Fatigued Shooting Block",
        duration: "20m",
        exercises: [
          { name: "Inside-foot shots", reps: "1×10 far + 1×10 near L | 1×10 far + 1×10 near R", notes: "with friend: partner calls far/near mid-run → 2×10 randomized/foot" },
        ]
      },
      {
        title: "Cooldown",
        duration: "5m",
        exercises: [
          { name: "1 lap walk/jog" },
          { name: "Static stretches", notes: "5–6 min (hold 20–30 s each). Examples: Hamstring stretch, Quad stretch, Calf stretch, Hip flexor lunge stretch, Groin/adductor stretch" },
        ]
      },
    ]
  },
  
  // FRIDAY - SOLO
  {
    dayOfWeek: "FRIDAY",
    mode: "solo",
    title: "Mixed Touches + 1v1 Moves + Combo Play",
    duration: "~1h40min",
    location: "Pitch",
    equipment: "Ball, cones, wall",
    blocks: [
      {
        title: "Warm-up",
        duration: "10m",
        exercises: [
          { name: "2 laps jog around pitch", notes: "~400–600 m, 3–4 min" },
          { name: "Leg swings (front/back)", reps: "10/leg" },
          { name: "Leg swings (side/side)", reps: "10/leg" },
          { name: "Walking lunges with twist", reps: "8/leg" },
          { name: "High knees", notes: "20 m" },
          { name: "Butt kicks", notes: "20 m" },
          { name: "Light ball touches", notes: "2–3 min. Gentle dribbling, 20–30 short passes at 50% intensity" },
        ]
      },
      {
        title: "Mixed Touch Block",
        duration: "20m",
        exercises: [
          { name: "Wall passes 5m", reps: "30 L | 30 R", rest: "45s" },
          { name: "Cone dribble → pass", reps: "3×10 L | 2×10 R", rest: "45s" },
          { name: "Cut-in finishes", reps: "10 L | 7 R" },
        ]
      },
      {
        title: "1v1 Skills",
        duration: "30m",
        exercises: [
          { name: "Fake shot + ball roll", reps: "25 L | 25 R", rest: "45–60s" },
          { name: "Body feint + La Croqueta", reps: "25 L | 25 R", rest: "45–60s" },
          { name: "Flip Flap", reps: "25 L | 25 R", rest: "45–60s" },
        ]
      },
      {
        title: "Combination Play",
        duration: "30m",
        exercises: [
          { name: "Wall give-and-go → finish", reps: "3×8 L | 2×8 R", rest: "60s" },
          { name: "Layoff + 1st-time shot", reps: "3×8 L | 2×8 R", rest: "60s" },
          { name: "Long pass → control → return", reps: "8 L | 8 R" },
        ]
      },
      {
        title: "Shooting Under Fatigue",
        duration: "10m",
        exercises: [
          { name: "Sprint 20m → shoot", reps: "2×10 L | 1×10 R", rest: "2m" },
        ]
      },
      {
        title: "Cooldown",
        duration: "10m",
        exercises: [
          { name: "1 lap walk/jog" },
          { name: "Static stretches", notes: "5–6 min (hold 20–30 s each). Examples: Hamstring stretch, Quad stretch, Calf stretch, Hip flexor lunge stretch, Groin/adductor stretch" },
        ]
      },
    ]
  },
  
  // FRIDAY - FRIEND
  {
    dayOfWeek: "FRIDAY",
    mode: "friend",
    title: "Mixed Touches + 1v1 Duels + Combo Play + Fatigue Finishing",
    duration: "~1h50min",
    location: "Pitch",
    equipment: "Ball, cones, partner, jump rope",
    blocks: [
      {
        title: "Jump rope",
        duration: "3m",
        exercises: [
          { name: "Jump rope" },
        ]
      },
      {
        title: "Warm-up",
        duration: "10m",
        exercises: [
          { name: "2 laps jog around pitch", notes: "~400–600 m, 3–4 min" },
          { name: "Leg swings (front/back)", reps: "10/leg" },
          { name: "Leg swings (side/side)", reps: "10/leg" },
          { name: "Walking lunges with twist", reps: "8/leg" },
          { name: "High knees", notes: "20 m" },
          { name: "Butt kicks", notes: "20 m" },
          { name: "Light ball touches", notes: "2–3 min. Gentle dribbling, 20–30 short passes at 50% intensity" },
        ]
      },
      {
        title: "Mixed Touch Block",
        duration: "20m",
        exercises: [
          { name: "One-touch passes", reps: "30 L | 30 R" },
          { name: "Cone dribble → pass", reps: "3×10 L | 2×10 R" },
          { name: "Cut-in finishes", reps: "10 L | 5 R", notes: "Partner gives ball" },
        ]
      },
      {
        title: "1v1 Skills",
        duration: "30m",
        exercises: [
          { name: "Fake shot + ball roll", reps: "25 L | 25 R", notes: "Partner defends light → medium pressure" },
          { name: "Body feint + La Croqueta", reps: "25 L | 25 R", notes: "Partner defends light → medium pressure" },
          { name: "Cruyff turn", reps: "25 L | 25 R", notes: "Partner defends light → medium pressure" },
        ]
      },
      {
        title: "Combination Play",
        duration: "30m",
        exercises: [
          { name: "Partner give-and-go → finish", reps: "3×8 L | 2×8 R", rest: "60s" },
          { name: "Partner layoff + 1st-time shot", reps: "3×8 L | 2×8 R", rest: "60s" },
          { name: "Long pass → control → return", reps: "8 L | 8 R" },
        ]
      },
      {
        title: "Shooting Under Fatigue",
        duration: "10m",
        exercises: [
          { name: "Sprint 20m → partner pass → finish", reps: "2×10 L | 1×10 R", rest: "2m" },
        ]
      },
      {
        title: "Cooldown",
        duration: "10m",
        exercises: [
          { name: "1 lap walk/jog" },
          { name: "Static stretches", notes: "5–6 min (hold 20–30 s each). Examples: Hamstring stretch, Quad stretch, Calf stretch, Hip flexor lunge stretch, Groin/adductor stretch" },
        ]
      },
    ]
  },
  
  // SATURDAY - SOLO
  {
    dayOfWeek: "SATURDAY",
    mode: "solo",
    title: "Expanded Technical Day",
    duration: "~1h50min",
    location: "Pitch",
    equipment: "Ball, cones, wall, mini-goals",
    blocks: [
      {
        title: "Warm-up",
        duration: "10m",
        exercises: [
          { name: "2 laps jog around pitch", notes: "~400–600 m, 3–4 min" },
          { name: "Leg swings (front/back)", reps: "10/leg" },
          { name: "Leg swings (side/side)", reps: "10/leg" },
          { name: "Walking lunges with twist", reps: "8/leg" },
          { name: "High knees", notes: "20 m" },
          { name: "Butt kicks", notes: "20 m" },
          { name: "Light ball touches", notes: "2–3 min. Gentle dribbling, 20–30 short passes at 50% intensity" },
        ]
      },
      {
        title: "Dribbling",
        duration: "20m",
        exercises: [
          { name: "Cone slalom (tight)", reps: "3×60s L | 2×60s R", rest: "60s" },
          { name: "Open dribble + skill → finish", reps: "3×10 L | 2×10 R", rest: "60s", notes: "head up scanning" },
        ]
      },
      {
        title: "Passing",
        duration: "20m",
        exercises: [
          { name: "Wall passes 10m", reps: "3×25 L | 2×25 R", rest: "60s" },
          { name: "Long driven passes", reps: "3×10 L | 2×10 R", rest: "60s" },
        ]
      },
      {
        title: "Ball Mastery",
        duration: "20m",
        exercises: [
          { name: "Toe taps", sets: "3", reps: "45s alternating", rest: "45s" },
          { name: "Sole rolls", sets: "3", reps: "45s alternating", rest: "45s" },
          { name: "Inside-outside touches", reps: "3×45s L | 2×45s R", rest: "45s" },
        ]
      },
      {
        title: "Finishing",
        duration: "20m",
        exercises: [
          { name: "Cut-in shots", reps: "3×8 L | 2×8 R", rest: "60s" },
          { name: "First-touch → shot", reps: "3×8 L | 2×8 R", rest: "60s" },
          { name: "Volleys", reps: "10 L | 10 R" },
        ]
      },
      {
        title: "Core",
        duration: "10m",
        exercises: [
          { name: "Copenhagen plank", sets: "3", reps: "to-failure/side" },
          { name: "Bird dog", sets: "3", reps: "12" },
        ]
      },
      {
        title: "Cooldown",
        duration: "10m",
        exercises: [
          { name: "1 lap walk/jog" },
          { name: "Static stretches", notes: "5–6 min (hold 20–30 s each). Examples: Hamstring stretch, Quad stretch, Calf stretch, Hip flexor lunge stretch, Groin/adductor stretch" },
        ]
      },
    ]
  },
  
  // SATURDAY - FRIEND
  {
    dayOfWeek: "SATURDAY",
    mode: "friend",
    title: "Expanded Partner Technical Day",
    duration: "~1h50min",
    location: "Pitch",
    equipment: "Ball, cones, partner, mini-goals, jump rope",
    blocks: [
      {
        title: "Jump rope",
        duration: "3m",
        exercises: [
          { name: "Jump rope" },
        ]
      },
      {
        title: "Warm-up",
        duration: "10m",
        exercises: [
          { name: "2 laps jog around pitch", notes: "~400–600 m, 3–4 min" },
          { name: "Leg swings (front/back)", reps: "10/leg" },
          { name: "Leg swings (side/side)", reps: "10/leg" },
          { name: "Walking lunges with twist", reps: "8/leg" },
          { name: "High knees", notes: "20 m" },
          { name: "Butt kicks", notes: "20 m" },
          { name: "Light ball touches", notes: "2–3 min. Gentle dribbling, 20–30 short passes at 50% intensity" },
        ]
      },
      {
        title: "Dribbling",
        duration: "20m",
        exercises: [
          { name: "Cone slalom (tight)", reps: "3×60s L | 2×60s R", rest: "60s" },
          { name: "Open dribble + skill move past partner → finish", reps: "3×10 L | 2×10 R" },
        ]
      },
      {
        title: "Passing",
        duration: "20m",
        exercises: [
          { name: "Short passes", reps: "3×25 L | 2×25 R", rest: "60s" },
          { name: "Long driven passes", reps: "3×10 L | 2×10 R", rest: "60s" },
        ]
      },
      {
        title: "Ball Mastery",
        duration: "20m",
        exercises: [
          { name: "Toe taps", sets: "3", reps: "45s alternating", rest: "45s" },
          { name: "Sole rolls", sets: "3", reps: "45s alternating", rest: "45s" },
          { name: "Inside-outside touches", reps: "3×45s L | 2×45s R", rest: "45s" },
        ]
      },
      {
        title: "Finishing",
        duration: "20m",
        exercises: [
          { name: "Cut-in shot", reps: "3×8 L | 2×8 R", rest: "60s", notes: "Partner feeds" },
          { name: "First-touch → shot from partner pass", reps: "3×8 L | 2×8 R", rest: "60s" },
          { name: "Partner toss volleys", reps: "10 each foot" },
        ]
      },
      {
        title: "Core",
        duration: "10m",
        exercises: [
          { name: "Copenhagen plank", sets: "3", reps: "to-failure/side" },
          { name: "Bird dog", sets: "3", reps: "12" },
        ]
      },
      {
        title: "Cooldown",
        duration: "10m",
        exercises: [
          { name: "1 lap walk/jog" },
          { name: "Static stretches", notes: "5–6 min (hold 20–30 s each). Examples: Hamstring stretch, Quad stretch, Calf stretch, Hip flexor lunge stretch, Groin/adductor stretch" },
        ]
      },
    ]
  },
  
  // SUNDAY - SOLO
  {
    dayOfWeek: "SUNDAY",
    mode: "solo",
    title: "Skill Moves & Ball Mastery + Upper Strength",
    duration: "1h10m",
    location: "Parking field (skills) → Gym (upper body) → Home (mobility optional)",
    equipment: "Ball, mat, barbell/dumbbells, pull-up bar",
    blocks: [
      {
        title: "1v1 Skills",
        duration: "15m",
        exercises: [
          { name: "Fake shot + ball roll", reps: "15 L | 15 R", rest: "45–60s" },
          { name: "Body feint + croqueta", reps: "15 L | 15 R", rest: "45–60s" },
          { name: "Flip Flap", reps: "15 L | 15 R", rest: "45–60s" },
        ]
      },
      {
        title: "Juggling",
        duration: "5m",
        exercises: [
          { name: "Freestyle", notes: "vary touches, weak foot emphasis" },
        ]
      },
      {
        title: "Gym Upper Strength",
        duration: "40m",
        exercises: [
          { name: "Bench Press", sets: "4", reps: "8", rest: "2m" },
          { name: "Pull-ups", sets: "4", reps: "to-failure", rest: "2m" },
          { name: "OHP", sets: "3", reps: "10", rest: "90s" },
          { name: "Barbell Row", sets: "3", reps: "10", rest: "90s" },
        ]
      },
      {
        title: "Mobility Reset",
        duration: "10m",
        exercises: [
          { name: "Hip 90/90", reps: "30s/side", notes: "optional, light recovery flow if you feel tight" },
          { name: "Ankle rocks", reps: "12/side" },
          { name: "Cat-cow with thoracic rotations", reps: "6–8 reps" },
          { name: "Foam roll calves/hamstrings/quads", notes: "30–45s each" },
        ]
      },
    ]
  },
  
  // SUNDAY - FRIEND
  {
    dayOfWeek: "SUNDAY",
    mode: "friend",
    title: "Skill Moves & Ball Mastery + Upper Strength",
    duration: "1h10m",
    location: "Parking field (skills) → Gym (upper body) → Home (mobility optional)",
    equipment: "Ball, mat, barbell/dumbbells, pull-up bar",
    blocks: [
      {
        title: "1v1 Skills",
        duration: "15m",
        exercises: [
          { name: "Fake shot + ball roll", reps: "15 L | 15 R", rest: "45–60s" },
          { name: "Body feint + croqueta", reps: "15 L | 15 R", rest: "45–60s" },
          { name: "Flip Flap", reps: "15 L | 15 R", rest: "45–60s" },
        ]
      },
      {
        title: "Juggling",
        duration: "5m",
        exercises: [
          { name: "Freestyle", notes: "vary touches, weak foot emphasis" },
        ]
      },
      {
        title: "Gym Upper Strength",
        duration: "40m",
        exercises: [
          { name: "Bench Press", sets: "4", reps: "8", rest: "2m" },
          { name: "Pull-ups", sets: "4", reps: "to-failure", rest: "2m" },
          { name: "OHP", sets: "3", reps: "10", rest: "90s" },
          { name: "Barbell Row", sets: "3", reps: "10", rest: "90s" },
        ]
      },
      {
        title: "Mobility Reset",
        duration: "10m",
        exercises: [
          { name: "Hip 90/90", reps: "30s/side", notes: "optional, light recovery flow if you feel tight" },
          { name: "Ankle rocks", reps: "12/side" },
          { name: "Cat-cow with thoracic rotations", reps: "6–8 reps" },
          { name: "Foam roll calves/hamstrings/quads", notes: "30–45s each" },
        ]
      },
    ]
  },
];
