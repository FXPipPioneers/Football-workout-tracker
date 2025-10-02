import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Play, Edit2, Plus, Trash2, ChevronUp, ChevronDown, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Workout {
  id: string;
  title: string;
  description: string | null;
  dayOfWeek: string;
  mode: string;
  duration: string | null;
  location: string | null;
  equipment: string | null;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  type: string;
  hasLeftRight: boolean;
  hasNearFar: boolean;
  hasWeight: boolean;
  hasDistance: boolean;
  hasTime: boolean;
  hasHeartRate: boolean;
}

interface BlockExercise {
  id: string;
  exerciseId: string;
  order: number;
  sets: string | null;
  reps: string | null;
  rest: string | null;
  notes: string | null;
  exercise: Exercise;
}

interface WorkoutBlock {
  id: string;
  title: string;
  duration: string | null;
  order: number;
  exercises: BlockExercise[];
}

interface WorkoutWithBlocks extends Workout {
  blocks: WorkoutBlock[];
}

export default function Log() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editingWorkout, setEditingWorkout] = useState<WorkoutWithBlocks | null>(null);
  const [editingBlock, setEditingBlock] = useState<{ workoutId: string; block?: WorkoutBlock } | null>(null);
  const [editingExercise, setEditingExercise] = useState<{ blockId: string; exercise?: BlockExercise } | null>(null);
  const [isCreateExerciseOpen, setIsCreateExerciseOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [overwriteMode, setOverwriteMode] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkUploadText, setBulkUploadText] = useState("");
  const [bulkOverwriteMode, setBulkOverwriteMode] = useState(false);
  const [bulkUploadMode, setBulkUploadMode] = useState<"solo" | "friend">("solo");
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [workoutFormData, setWorkoutFormData] = useState({ title: "", description: "", duration: "", location: "", equipment: "" });
  const [blockFormData, setBlockFormData] = useState({ title: "", duration: "" });
  const [exerciseFormData, setExerciseFormData] = useState({ exerciseId: "", sets: "", reps: "", rest: "", notes: "" });
  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "Technical",
    type: "technical",
    hasLeftRight: false,
    hasNearFar: false,
    hasTime: false,
    hasDistance: false,
    hasWeight: false,
    hasHeartRate: false,
  });

  const { data: allWorkouts = [], isLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: allExercises = [] } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Get today's day of the week
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

  // Day order for sorting
  const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  // Split workouts into solo and friend modes, then sort by day of week
  const soloWorkouts = allWorkouts
    .filter(w => w.mode === "solo")
    .sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));
    
  const friendWorkouts = allWorkouts
    .filter(w => w.mode === "friend")
    .sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));

  const handleStartWorkout = (workoutId: string) => {
    setLocation(`/workout/${workoutId}`);
  };

  const handleEditWorkout = async (workoutId: string) => {
    const response = await fetch(`/api/workouts/${workoutId}`);
    const workoutData: WorkoutWithBlocks = await response.json();
    setEditingWorkout(workoutData);
    setWorkoutFormData({
      title: workoutData.title,
      description: workoutData.description || "",
      duration: workoutData.duration || "",
      location: workoutData.location || "",
      equipment: workoutData.equipment || "",
    });
  };

  const parseWorkoutText = (text: string) => {
    const lines = text.split('\n');
    const parsed: any = {
      title: "",
      duration: "",
      location: "",
      equipment: "",
      blocks: []
    };

    let currentBlock: any = null;
    let blockIdCounter = 0;
    let exerciseIdCounter = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('//')) continue;

      const titleMatch = line.match(/^-?\s*\*\*([A-Z]+)\s*[—-]\s*(.+?)\s*\((.+?)\)\*\*/i);
      if (titleMatch) {
        parsed.title = titleMatch[2].trim();
        parsed.duration = titleMatch[3].trim();
        continue;
      }

      const locationMatch = line.match(/\*\*Location:\*\*\s*(.+)/i);
      if (locationMatch) {
        parsed.location = locationMatch[1].replace(/→/g, ',').trim();
        continue;
      }

      const equipmentMatch = line.match(/\*\*Equipment:\*\*\s*(.+)/i);
      if (equipmentMatch) {
        parsed.equipment = equipmentMatch[1].trim();
        continue;
      }

      const blockMatch = line.match(/^\d+\.\s*\*\*(.+?)\s*\((.+?)\)\*\*\s*(?:\*\((.+?)\)\*)?/);
      if (blockMatch) {
        if (currentBlock) {
          parsed.blocks.push(currentBlock);
        }
        currentBlock = {
          id: `temp-block-${blockIdCounter++}`,
          title: blockMatch[1].trim(),
          duration: blockMatch[2].trim(),
          order: parsed.blocks.length + 1,
          exercises: []
        };
        continue;
      }

      // Try to match exercise with colon format first
      const exerciseWithColonMatch = line.match(/^-\s*(.+?):\s*(.+)/);
      if (exerciseWithColonMatch && currentBlock) {
        const exerciseName = exerciseWithColonMatch[1].trim();
        const exerciseDetails = exerciseWithColonMatch[2].trim();
        
        let sets = null, reps = null, rest = null;
        
        const setsRepsMatch = exerciseDetails.match(/(\d+)\s*[x×]\s*(\d+)/);
        if (setsRepsMatch) {
          sets = setsRepsMatch[1];
          reps = setsRepsMatch[2];
        }
        
        const lrMatch = exerciseDetails.match(/(\d+)\s*L\s*\|\s*(\d+)\s*R/);
        if (lrMatch) {
          reps = `${lrMatch[1]} L | ${lrMatch[2]} R`;
        }
        
        const restMatch = exerciseDetails.match(/rest\s*(\d+[\w\s]+)/i);
        if (restMatch) {
          rest = restMatch[1].trim();
        }

        let matchingExercise = allExercises.find(e => 
          e.name.toLowerCase() === exerciseName.toLowerCase()
        );

        // If exercise doesn't exist, mark it for creation with smart defaults
        if (!matchingExercise) {
          const lowerName = exerciseName.toLowerCase();
          const hasWeight = lowerName.includes('press') || lowerName.includes('squat') || 
                           lowerName.includes('deadlift') || lowerName.includes('row') || 
                           lowerName.includes('curl') || lowerName.includes('pull-up');
          
          matchingExercise = {
            id: `create-${exerciseName}`,
            name: exerciseName,
            category: "Custom",
            type: "Custom",
            hasLeftRight: lrMatch ? true : false,
            hasNearFar: false,
            hasWeight: hasWeight,
            hasDistance: false,
            hasTime: false,
            hasHeartRate: false,
            isCustom: true,
            userId: null
          } as Exercise;
        }

        currentBlock.exercises.push({
          id: `temp-exercise-${exerciseIdCounter++}`,
          exerciseId: matchingExercise.id,
          order: currentBlock.exercises.length + 1,
          sets: sets,
          reps: reps,
          rest: rest,
          notes: exerciseDetails,
          exercise: matchingExercise
        });
        continue;
      }

      // Also try to match exercises without colons (simpler format)
      const exerciseWithoutColonMatch = line.match(/^-\s*(.+?)(?:\s*\((.+?)\))?$/);
      if (exerciseWithoutColonMatch && currentBlock) {
        const fullText = exerciseWithoutColonMatch[1].trim();
        const details = exerciseWithoutColonMatch[2] || "";
        
        let matchingExercise = allExercises.find(e => 
          e.name.toLowerCase() === fullText.toLowerCase()
        );

        // If exercise doesn't exist, mark it for creation
        if (!matchingExercise) {
          matchingExercise = {
            id: `create-${fullText}`,
            name: fullText,
            category: "Custom",
            type: "Custom",
            hasLeftRight: false,
            hasNearFar: false,
            hasWeight: false,
            hasDistance: false,
            hasTime: false,
            hasHeartRate: false,
            isCustom: true,
            userId: null
          } as Exercise;
        }

        currentBlock.exercises.push({
          id: `temp-exercise-${exerciseIdCounter++}`,
          exerciseId: matchingExercise.id,
          order: currentBlock.exercises.length + 1,
          sets: null,
          reps: null,
          rest: null,
          notes: details,
          exercise: matchingExercise
        });
      }
    }

    if (currentBlock) {
      parsed.blocks.push(currentBlock);
    }

    return parsed;
  };

  const parseWeekWorkouts = (text: string) => {
    const workouts: any[] = [];
    
    // Try to detect format: either "## Monday" or "- **MONDAY —"
    const lines = text.split('\n');
    let currentDayText = '';
    let currentDayOfWeek = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Match both formats: "## Monday" or "- **MONDAY —"
      const hashFormat = line.match(/^##\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
      const bulletFormat = line.match(/^-\s*\*\*(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
      
      if (hashFormat || bulletFormat) {
        // Save previous day if exists
        if (currentDayOfWeek && currentDayText.trim()) {
          const parsed = parseWorkoutText(currentDayText);
          if (parsed.blocks.length > 0) {
            workouts.push({
              dayOfWeek: currentDayOfWeek,
              ...parsed
            });
          }
        }
        
        // Start new day
        currentDayOfWeek = (hashFormat ? hashFormat[1] : bulletFormat![1]).toUpperCase();
        currentDayText = line + '\n'; // Include the title line
      } else if (currentDayOfWeek) {
        // Add line to current day
        currentDayText += line + '\n';
      }
    }
    
    // Don't forget the last day
    if (currentDayOfWeek && currentDayText.trim()) {
      const parsed = parseWorkoutText(currentDayText);
      if (parsed.blocks.length > 0) {
        workouts.push({
          dayOfWeek: currentDayOfWeek,
          ...parsed
        });
      }
    }
    
    return workouts;
  };

  const handleBulkUploadWorkouts = async () => {
    if (!bulkUploadText.trim()) {
      toast({
        title: "No text provided",
        description: "Please paste your weekly workout schedule.",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedWorkouts = parseWeekWorkouts(bulkUploadText);
      
      if (parsedWorkouts.length === 0) {
        toast({
          title: "No workouts found",
          description: "Could not parse any workouts. Make sure each day starts with '## DayName' or '- **DAYNAME —'.",
          variant: "destructive",
        });
        return;
      }

      // Refresh exercises list to check against latest DB state
      const exercisesResponse = await fetch("/api/exercises");
      const latestExercises = await exercisesResponse.json();
      
      // First, create any new exercises across all workouts
      const createdExerciseMap = new Map<string, string>();
      const newExercisesCreated: string[] = [];
      
      for (const workout of parsedWorkouts) {
        for (const block of workout.blocks) {
          for (const exercise of block.exercises) {
            if (exercise.exerciseId.startsWith('create-')) {
              const exerciseName = exercise.exercise.name;
              
              const existingExercise = latestExercises.find((e: Exercise) => 
                e.name.toLowerCase() === exerciseName.toLowerCase()
              );
              
              if (existingExercise) {
                createdExerciseMap.set(exercise.exerciseId, existingExercise.id);
              } else if (!createdExerciseMap.has(exercise.exerciseId)) {
                const newExerciseData = {
                  name: exerciseName,
                  category: "Custom",
                  type: "Custom",
                  hasLeftRight: exercise.exercise.hasLeftRight || false,
                  hasNearFar: exercise.exercise.hasNearFar || false,
                  hasWeight: exercise.exercise.hasWeight || false,
                  hasDistance: exercise.exercise.hasDistance || false,
                  hasTime: exercise.exercise.hasTime || false,
                  hasHeartRate: exercise.exercise.hasHeartRate || false,
                  isCustom: true,
                  userId: "test-user-id"
                };
                
                const response = await apiRequest("POST", "/api/exercises", newExerciseData);
                const createdExercise = await response.json();
                createdExerciseMap.set(exercise.exerciseId, createdExercise.id);
                newExercisesCreated.push(exerciseName);
                latestExercises.push(createdExercise);
              }
            }
          }
        }
      }

      // If overwrite mode, delete existing workouts for the specific days being uploaded
      if (bulkOverwriteMode) {
        const daysBeingUploaded = parsedWorkouts.map(w => w.dayOfWeek);
        const workoutsToDelete = allWorkouts.filter(w => 
          w.mode === bulkUploadMode && daysBeingUploaded.includes(w.dayOfWeek)
        );
        for (const workout of workoutsToDelete) {
          await apiRequest("DELETE", `/api/workouts/${workout.id}`, null);
        }
      }

      // Create workouts
      for (const parsedWorkout of parsedWorkouts) {
        const workoutData = {
          userId: "test-user-id",
          title: parsedWorkout.title || `${parsedWorkout.dayOfWeek} Workout`,
          description: null,
          dayOfWeek: parsedWorkout.dayOfWeek,
          mode: bulkUploadMode,
          duration: parsedWorkout.duration || null,
          location: parsedWorkout.location || null,
          equipment: parsedWorkout.equipment || null,
        };
        
        const workoutResponse = await apiRequest("POST", "/api/workouts", workoutData);
        const newWorkout = await workoutResponse.json();

        // Create blocks for this workout
        for (const block of parsedWorkout.blocks) {
          const blockData = {
            workoutId: newWorkout.id,
            title: block.title,
            duration: block.duration,
            order: block.order
          };
          
          const blockResponse = await apiRequest("POST", "/api/workout-blocks", blockData);
          const newBlock = await blockResponse.json();

          // Create exercises for this block
          for (const exercise of block.exercises) {
            const finalExerciseId = exercise.exerciseId.startsWith('create-') 
              ? createdExerciseMap.get(exercise.exerciseId)
              : exercise.exerciseId;
            
            await apiRequest("POST", "/api/block-exercises", {
              blockId: newBlock.id,
              exerciseId: finalExerciseId,
              order: exercise.order,
              sets: exercise.sets,
              reps: exercise.reps,
              rest: exercise.rest,
              notes: exercise.notes
            });
          }
        }
      }

      // Refresh workout list and exercises
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/workouts"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/exercises"] })
      ]);
      
      const totalBlocks = parsedWorkouts.reduce((sum, w) => sum + w.blocks.length, 0);
      const totalExercises = parsedWorkouts.reduce((sum, w) => 
        sum + w.blocks.reduce((bSum: number, b: any) => bSum + b.exercises.length, 0), 0);
      
      // Close dialog immediately before showing success
      setIsBulkUploadOpen(false);
      setBulkUploadText("");
      
      toast({
        title: "Weekly schedule uploaded successfully",
        description: `Created ${parsedWorkouts.length} workout(s) for ${bulkUploadMode} mode with ${totalBlocks} blocks and ${totalExercises} exercises.${newExercisesCreated.length > 0 ? ` Added ${newExercisesCreated.length} new exercises.` : ""}`,
      });
    } catch (error) {
      console.error("Bulk upload error:", error);
      toast({
        title: "Upload error",
        description: "Could not upload workouts. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllWorkouts = async () => {
    try {
      // Delete workouts sequentially to avoid race conditions
      for (const workout of allWorkouts) {
        await apiRequest("DELETE", `/api/workouts/${workout.id}`, null);
      }
      
      // Refresh workout list
      await queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      
      setIsDeleteAllDialogOpen(false);
      
      toast({
        title: "All workouts deleted",
        description: `Successfully deleted ${allWorkouts.length} workout(s).`,
      });
    } catch (error) {
      console.error("Delete all error:", error);
      toast({
        title: "Delete error",
        description: "Could not delete all workouts.",
        variant: "destructive",
      });
    }
  };

  const handleUploadWorkout = async () => {
    if (!uploadText.trim()) {
      toast({
        title: "No text provided",
        description: "Please paste workout details before uploading.",
        variant: "destructive",
      });
      return;
    }

    if (!editingWorkout) return;

    try {
      const parsed = parseWorkoutText(uploadText);
      
      if (parsed.blocks.length === 0) {
        toast({
          title: "No blocks found",
          description: "Could not parse any workout blocks. Please check the format matches the example.",
          variant: "destructive",
        });
        return;
      }

      const totalExercises = parsed.blocks.reduce((sum: number, block: any) => sum + (block.exercises?.length || 0), 0);
      
      // If overwrite mode, delete all existing blocks first
      if (overwriteMode && editingWorkout.blocks) {
        for (const block of editingWorkout.blocks) {
          await apiRequest("DELETE", `/api/workout-blocks/${block.id}`, null);
        }
      }

      // Update workout metadata if parsed
      if (parsed.title || parsed.duration || parsed.location || parsed.equipment) {
        const updateData = {
          title: parsed.title || workoutFormData.title,
          description: workoutFormData.description,
          duration: parsed.duration || workoutFormData.duration,
          location: parsed.location || workoutFormData.location,
          equipment: parsed.equipment || workoutFormData.equipment,
        };
        
        await apiRequest("PATCH", `/api/workouts/${editingWorkout.id}`, updateData);
        setWorkoutFormData(updateData);
      }

      // Refresh exercises list to check against latest DB state
      const exercisesResponse = await fetch("/api/exercises");
      const latestExercises = await exercisesResponse.json();
      
      // First, create any new exercises that don't exist
      const createdExerciseMap = new Map<string, string>();
      const newExercisesCreated: string[] = [];
      
      for (const block of parsed.blocks) {
        for (const exercise of block.exercises) {
          if (exercise.exerciseId.startsWith('create-')) {
            const exerciseName = exercise.exercise.name;
            
            // Check if exercise already exists in latest DB state
            const existingExercise = latestExercises.find((e: Exercise) => 
              e.name.toLowerCase() === exerciseName.toLowerCase()
            );
            
            if (existingExercise) {
              // Use existing exercise ID
              createdExerciseMap.set(exercise.exerciseId, existingExercise.id);
            } else if (!createdExerciseMap.has(exercise.exerciseId)) {
              // Create new exercise only if not already created in this session
              const newExerciseData = {
                name: exerciseName,
                category: "Custom",
                type: "Custom",
                hasLeftRight: exercise.exercise.hasLeftRight || false,
                hasNearFar: exercise.exercise.hasNearFar || false,
                hasWeight: exercise.exercise.hasWeight || false,
                hasDistance: exercise.exercise.hasDistance || false,
                hasTime: exercise.exercise.hasTime || false,
                hasHeartRate: exercise.exercise.hasHeartRate || false,
                isCustom: true,
                userId: "test-user-id"
              };
              
              const response = await apiRequest("POST", "/api/exercises", newExerciseData);
              const createdExercise = await response.json();
              createdExerciseMap.set(exercise.exerciseId, createdExercise.id);
              newExercisesCreated.push(exerciseName);
              
              // Add to local list to avoid duplicates in same upload
              latestExercises.push(createdExercise);
            }
          }
        }
      }

      // Now create blocks and exercises with proper IDs
      for (const block of parsed.blocks) {
        const blockData = {
          workoutId: editingWorkout.id,
          title: block.title,
          duration: block.duration,
          order: overwriteMode ? block.order : (editingWorkout.blocks.length + block.order)
        };
        
        const blockResponse = await apiRequest("POST", "/api/workout-blocks", blockData);
        const newBlock = await blockResponse.json();

        // Create exercises for this block
        for (const exercise of block.exercises) {
          const finalExerciseId = exercise.exerciseId.startsWith('create-') 
            ? createdExerciseMap.get(exercise.exerciseId)
            : exercise.exerciseId;
          
          await apiRequest("POST", "/api/block-exercises", {
            blockId: newBlock.id,
            exerciseId: finalExerciseId,
            order: exercise.order,
            sets: exercise.sets,
            reps: exercise.reps,
            rest: exercise.rest,
            notes: exercise.notes
          });
        }
      }

      // Close dialog and clear text immediately
      setIsUploadOpen(false);
      setUploadText("");

      // Refresh the workout data and exercises list
      await Promise.all([
        handleEditWorkout(editingWorkout.id),
        queryClient.invalidateQueries({ queryKey: ["/api/exercises"] })
      ]);
      
      // Show success message
      if (newExercisesCreated.length > 0) {
        toast({
          title: "Workout uploaded successfully",
          description: `Created ${parsed.blocks.length} block(s) with ${totalExercises} exercise(s). Added ${newExercisesCreated.length} new exercises: ${newExercisesCreated.join(", ")}`,
        });
      } else {
        toast({
          title: "Workout uploaded successfully",
          description: `Created ${parsed.blocks.length} block(s) with ${totalExercises} exercise(s).`,
        });
      }
    } catch (error) {
      console.error("Parse error:", error);
      toast({
        title: "Parse error",
        description: "Could not parse the workout text. Please check the format.",
        variant: "destructive",
      });
    }
  };

  // Helper function to invalidate all workout-related queries
  const invalidateWorkoutQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/workouts/today"] });
    queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
  };

  const updateWorkoutMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Workout> }) =>
      apiRequest("PATCH", `/api/workouts/${data.id}`, data.updates),
    onSuccess: () => {
      invalidateWorkoutQueries();
      setEditingWorkout(null);
      toast({ title: "Workout updated successfully" });
    },
  });

  const createBlockMutation = useMutation({
    mutationFn: async (data: { workoutId: string; title: string; duration: string | null; order: number }) =>
      apiRequest("POST", "/api/workout-blocks", data),
    onSuccess: () => {
      if (editingWorkout) {
        handleEditWorkout(editingWorkout.id);
      }
      invalidateWorkoutQueries();
      toast({ title: "Block added successfully" });
      setEditingBlock(null);
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<WorkoutBlock> }) =>
      apiRequest("PATCH", `/api/workout-blocks/${data.id}`, data.updates),
    onSuccess: () => {
      if (editingWorkout) {
        handleEditWorkout(editingWorkout.id);
      }
      invalidateWorkoutQueries();
      toast({ title: "Block updated successfully" });
      setEditingBlock(null);
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/workout-blocks/${id}`, {}),
    onSuccess: () => {
      if (editingWorkout) {
        handleEditWorkout(editingWorkout.id);
      }
      invalidateWorkoutQueries();
      toast({ title: "Block deleted successfully" });
    },
  });

  const createExerciseMutation = useMutation({
    mutationFn: async (data: { blockId: string; exerciseId: string; order: number; sets: string | null; reps: string | null; rest: string | null; notes: string | null }) =>
      apiRequest("POST", "/api/block-exercises", data),
    onSuccess: () => {
      if (editingWorkout) {
        handleEditWorkout(editingWorkout.id);
      }
      invalidateWorkoutQueries();
      toast({ title: "Exercise added successfully" });
      setEditingExercise(null);
    },
  });

  const updateExerciseMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<BlockExercise> }) =>
      apiRequest("PATCH", `/api/block-exercises/${data.id}`, data.updates),
    onSuccess: () => {
      if (editingWorkout) {
        handleEditWorkout(editingWorkout.id);
      }
      invalidateWorkoutQueries();
      toast({ title: "Exercise updated successfully" });
      setEditingExercise(null);
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/block-exercises/${id}`, {}),
    onSuccess: () => {
      if (editingWorkout) {
        handleEditWorkout(editingWorkout.id);
      }
      invalidateWorkoutQueries();
      toast({ title: "Exercise deleted successfully" });
    },
  });

  const createNewExerciseMutation = useMutation({
    mutationFn: async (exercise: any) => {
      const res = await apiRequest("POST", "/api/exercises", exercise);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({
        title: "Exercise created",
        description: `${data.name} has been added to your exercises.`,
      });
      setIsCreateExerciseOpen(false);
      setNewExercise({
        name: "",
        category: "Technical",
        type: "technical",
        hasLeftRight: false,
        hasNearFar: false,
        hasTime: false,
        hasDistance: false,
        hasWeight: false,
        hasHeartRate: false,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create exercise.",
        variant: "destructive",
      });
    },
  });

  const handleMoveBlock = async (blockId: string, direction: "up" | "down") => {
    if (!editingWorkout) return;
    
    const blocks = [...editingWorkout.blocks].sort((a, b) => a.order - b.order);
    const currentIndex = blocks.findIndex(b => b.id === blockId);
    
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === blocks.length - 1) return;
    
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    // Swap orders
    const currentBlock = blocks[currentIndex];
    const swapBlock = blocks[swapIndex];
    
    await updateBlockMutation.mutateAsync({ id: currentBlock.id, updates: { order: swapBlock.order } });
    await updateBlockMutation.mutateAsync({ id: swapBlock.id, updates: { order: currentBlock.order } });
  };

  const handleMoveExercise = async (exerciseId: string, blockId: string, direction: "up" | "down") => {
    if (!editingWorkout) return;
    
    const block = editingWorkout.blocks.find(b => b.id === blockId);
    if (!block) return;
    
    const exercises = [...block.exercises].sort((a, b) => a.order - b.order);
    const currentIndex = exercises.findIndex(e => e.id === exerciseId);
    
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === exercises.length - 1) return;
    
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    // Swap orders
    const currentExercise = exercises[currentIndex];
    const swapExercise = exercises[swapIndex];
    
    await updateExerciseMutation.mutateAsync({ id: currentExercise.id, updates: { order: swapExercise.order } });
    await updateExerciseMutation.mutateAsync({ id: swapExercise.id, updates: { order: currentExercise.order } });
  };

  const handleSaveWorkout = () => {
    if (editingWorkout) {
      updateWorkoutMutation.mutate({
        id: editingWorkout.id,
        updates: {
          title: workoutFormData.title,
          description: workoutFormData.description || null,
          duration: workoutFormData.duration || null,
          location: workoutFormData.location || null,
          equipment: workoutFormData.equipment || null,
        },
      });
    }
  };

  const handleSaveBlock = () => {
    if (editingBlock) {
      if (editingBlock.block) {
        // Update existing block
        updateBlockMutation.mutate({
          id: editingBlock.block.id,
          updates: {
            title: blockFormData.title,
            duration: blockFormData.duration || null,
          },
        });
      } else {
        // Create new block
        const maxOrder = editingWorkout?.blocks.reduce((max, b) => Math.max(max, b.order), 0) || 0;
        createBlockMutation.mutate({
          workoutId: editingBlock.workoutId,
          title: blockFormData.title,
          duration: blockFormData.duration || null,
          order: maxOrder + 1,
        });
      }
    }
  };

  const handleSaveExercise = () => {
    if (editingExercise) {
      if (editingExercise.exercise) {
        // Update existing exercise
        updateExerciseMutation.mutate({
          id: editingExercise.exercise.id,
          updates: {
            sets: exerciseFormData.sets || null,
            reps: exerciseFormData.reps || null,
            rest: exerciseFormData.rest || null,
            notes: exerciseFormData.notes || null,
          },
        });
      } else {
        // Create new exercise
        const block = editingWorkout?.blocks.find(b => b.id === editingExercise.blockId);
        const maxOrder = block?.exercises.reduce((max, e) => Math.max(max, e.order), 0) || 0;
        createExerciseMutation.mutate({
          blockId: editingExercise.blockId,
          exerciseId: exerciseFormData.exerciseId,
          order: maxOrder + 1,
          sets: exerciseFormData.sets || null,
          reps: exerciseFormData.reps || null,
          rest: exerciseFormData.rest || null,
          notes: exerciseFormData.notes || null,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">All Workouts</h1>
              <p className="text-sm text-muted-foreground">Browse, edit, and start any workout</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsDeleteAllDialogOpen(true)} 
                variant="outline"
                data-testid="button-delete-all"
                disabled={allWorkouts.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All
              </Button>
              <Button 
                onClick={() => setIsBulkUploadOpen(true)} 
                variant="default"
                data-testid="button-bulk-upload"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* Solo Workouts Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Solo Training</h2>
            <span className="text-sm text-muted-foreground">({soloWorkouts.length} workouts)</span>
          </div>
          <div className="grid gap-4">
            {soloWorkouts.map((workout) => (
              <Card
                key={workout.id}
                className={`p-4 ${workout.dayOfWeek === today ? 'border-primary border-2' : ''}`}
                data-testid={`card-solo-workout-${workout.dayOfWeek.toLowerCase()}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {workout.dayOfWeek}
                      </span>
                      {workout.dayOfWeek === today && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Today
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{workout.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {workout.duration && (
                        <span data-testid={`text-duration-${workout.dayOfWeek.toLowerCase()}`}>
                          ⏱️ {workout.duration}
                        </span>
                      )}
                      {workout.location && (
                        <span data-testid={`text-location-${workout.dayOfWeek.toLowerCase()}`}>
                          📍 {workout.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditWorkout(workout.id)}
                      data-testid={`button-edit-${workout.dayOfWeek.toLowerCase()}-solo`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleStartWorkout(workout.id)}
                      data-testid={`button-start-${workout.dayOfWeek.toLowerCase()}-solo`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Friend Workouts Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Friend Training</h2>
            <span className="text-sm text-muted-foreground">({friendWorkouts.length} workouts)</span>
          </div>
          <div className="grid gap-4">
            {friendWorkouts.map((workout) => (
              <Card
                key={workout.id}
                className={`p-4 ${workout.dayOfWeek === today ? 'border-primary border-2' : ''}`}
                data-testid={`card-friend-workout-${workout.dayOfWeek.toLowerCase()}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {workout.dayOfWeek}
                      </span>
                      {workout.dayOfWeek === today && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Today
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{workout.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {workout.duration && (
                        <span data-testid={`text-duration-${workout.dayOfWeek.toLowerCase()}`}>
                          ⏱️ {workout.duration}
                        </span>
                      )}
                      {workout.location && (
                        <span data-testid={`text-location-${workout.dayOfWeek.toLowerCase()}`}>
                          📍 {workout.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditWorkout(workout.id)}
                      data-testid={`button-edit-${workout.dayOfWeek.toLowerCase()}-friend`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleStartWorkout(workout.id)}
                      data-testid={`button-start-${workout.dayOfWeek.toLowerCase()}-friend`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Workout Dialog */}
      <Dialog open={!!editingWorkout} onOpenChange={(open) => !open && setEditingWorkout(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Workout</DialogTitle>
          </DialogHeader>
          {editingWorkout && (
            <div className="space-y-6">
              {/* Workout Metadata Form */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Workout Details</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={workoutFormData.title}
                      onChange={(e) => setWorkoutFormData({ ...workoutFormData, title: e.target.value })}
                      data-testid="input-workout-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={workoutFormData.description}
                      onChange={(e) => setWorkoutFormData({ ...workoutFormData, description: e.target.value })}
                      placeholder="Add notes about this workout..."
                      data-testid="input-workout-description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 60 min"
                        value={workoutFormData.duration}
                        onChange={(e) => setWorkoutFormData({ ...workoutFormData, duration: e.target.value })}
                        data-testid="input-workout-duration"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Field"
                        value={workoutFormData.location}
                        onChange={(e) => setWorkoutFormData({ ...workoutFormData, location: e.target.value })}
                        data-testid="input-workout-location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="equipment">Equipment</Label>
                      <Input
                        id="equipment"
                        placeholder="e.g., Cones"
                        value={workoutFormData.equipment}
                        onChange={(e) => setWorkoutFormData({ ...workoutFormData, equipment: e.target.value })}
                        data-testid="input-workout-equipment"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setIsUploadOpen(true)} variant="outline" className="flex-1" data-testid="button-upload-workout">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Workout Details
                    </Button>
                    <Button onClick={handleSaveWorkout} className="flex-1" data-testid="button-save-workout">
                      <Save className="h-4 w-4 mr-2" />
                      Save Workout Details
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Blocks Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Workout Blocks</h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingBlock({ workoutId: editingWorkout.id });
                      setBlockFormData({ title: "", duration: "" });
                    }}
                    data-testid="button-add-block"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Block
                  </Button>
                </div>

                {editingWorkout.blocks.map((block, index) => (
                  <Card key={block.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{block.title}</h4>
                        {block.duration && <p className="text-sm text-muted-foreground">{block.duration}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveBlock(block.id, "up")}
                          disabled={index === 0}
                          data-testid={`button-move-up-block-${block.id}`}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveBlock(block.id, "down")}
                          disabled={index === editingWorkout.blocks.length - 1}
                          data-testid={`button-move-down-block-${block.id}`}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingBlock({ workoutId: editingWorkout.id, block });
                            setBlockFormData({ title: block.title, duration: block.duration || "" });
                          }}
                          data-testid={`button-edit-block-${block.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this block and all its exercises?")) {
                              deleteBlockMutation.mutate(block.id);
                            }
                          }}
                          data-testid={`button-delete-block-${block.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Exercises in Block */}
                    <div className="space-y-2">
                      {block.exercises.map((exercise, exerciseIndex) => (
                        <div key={exercise.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{exercise.exercise.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {exercise.sets && `${exercise.sets} sets`}
                              {exercise.reps && ` × ${exercise.reps} reps`}
                              {exercise.rest && ` • ${exercise.rest} rest`}
                            </p>
                            {exercise.notes && <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveExercise(exercise.id, block.id, "up")}
                              disabled={exerciseIndex === 0}
                              data-testid={`button-move-up-exercise-${exercise.id}`}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveExercise(exercise.id, block.id, "down")}
                              disabled={exerciseIndex === block.exercises.length - 1}
                              data-testid={`button-move-down-exercise-${exercise.id}`}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingExercise({ blockId: block.id, exercise });
                                setExerciseFormData({
                                  exerciseId: exercise.exerciseId,
                                  sets: exercise.sets || "",
                                  reps: exercise.reps || "",
                                  rest: exercise.rest || "",
                                  notes: exercise.notes || "",
                                });
                              }}
                              data-testid={`button-edit-exercise-${exercise.id}`}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("Delete this exercise?")) {
                                  deleteExerciseMutation.mutate(exercise.id);
                                }
                              }}
                              data-testid={`button-delete-exercise-${exercise.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setEditingExercise({ blockId: block.id });
                          setExerciseFormData({ exerciseId: "", sets: "", reps: "", rest: "", notes: "" });
                        }}
                        data-testid={`button-add-exercise-${block.id}`}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exercise
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Block Dialog */}
      <Dialog open={!!editingBlock} onOpenChange={(open) => !open && setEditingBlock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBlock?.block ? "Edit Block" : "Add Block"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="block-title">Block Title</Label>
              <Input
                id="block-title"
                value={blockFormData.title}
                onChange={(e) => setBlockFormData({ ...blockFormData, title: e.target.value })}
                placeholder="e.g., Warm-up, Drills, Strength"
                data-testid="input-block-title"
              />
            </div>
            <div>
              <Label htmlFor="block-duration">Duration (optional)</Label>
              <Input
                id="block-duration"
                value={blockFormData.duration}
                onChange={(e) => setBlockFormData({ ...blockFormData, duration: e.target.value })}
                placeholder="e.g., 10 min"
                data-testid="input-block-duration"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveBlock} className="flex-1" data-testid="button-save-block">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditingBlock(null)} data-testid="button-cancel-block">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Exercise Dialog */}
      <Dialog open={!!editingExercise} onOpenChange={(open) => !open && setEditingExercise(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExercise?.exercise ? "Edit Exercise" : "Add Exercise"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editingExercise?.exercise && (
              <div>
                <Label htmlFor="exercise-select">Exercise</Label>
                <div className="flex gap-2">
                  <Select value={exerciseFormData.exerciseId} onValueChange={(value) => setExerciseFormData({ ...exerciseFormData, exerciseId: value })}>
                    <SelectTrigger id="exercise-select" data-testid="select-exercise" className="flex-1">
                      <SelectValue placeholder="Select an exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {allExercises.map((ex) => (
                        <SelectItem key={ex.id} value={ex.id}>
                          {ex.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsCreateExerciseOpen(true)}
                    data-testid="button-create-new-exercise"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sets">Sets</Label>
                <Input
                  id="sets"
                  value={exerciseFormData.sets}
                  onChange={(e) => setExerciseFormData({ ...exerciseFormData, sets: e.target.value })}
                  placeholder="e.g., 3"
                  data-testid="input-sets"
                />
              </div>
              <div>
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  value={exerciseFormData.reps}
                  onChange={(e) => setExerciseFormData({ ...exerciseFormData, reps: e.target.value })}
                  placeholder="e.g., 10"
                  data-testid="input-reps"
                />
              </div>
              <div>
                <Label htmlFor="rest">Rest</Label>
                <Input
                  id="rest"
                  value={exerciseFormData.rest}
                  onChange={(e) => setExerciseFormData({ ...exerciseFormData, rest: e.target.value })}
                  placeholder="e.g., 30s"
                  data-testid="input-rest"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={exerciseFormData.notes}
                onChange={(e) => setExerciseFormData({ ...exerciseFormData, notes: e.target.value })}
                placeholder="Add any special instructions..."
                data-testid="input-notes"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveExercise} className="flex-1" data-testid="button-save-exercise">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditingExercise(null)} data-testid="button-cancel-exercise">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create New Exercise Dialog */}
      <Dialog open={isCreateExerciseOpen} onOpenChange={setIsCreateExerciseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Exercise</DialogTitle>
            <DialogDescription>
              Add a new exercise to your library. You can customize which metrics to track.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="new-exercise-name">Exercise Name</Label>
              <Input
                id="new-exercise-name"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="e.g., Inside-Foot Finishing"
                data-testid="input-new-exercise-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-exercise-category">Category</Label>
                <Select
                  value={newExercise.category}
                  onValueChange={(value) => setNewExercise({ ...newExercise, category: value })}
                >
                  <SelectTrigger id="new-exercise-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shooting">Shooting</SelectItem>
                    <SelectItem value="Passing">Passing</SelectItem>
                    <SelectItem value="Dribbling">Dribbling</SelectItem>
                    <SelectItem value="Ball Mastery">Ball Mastery</SelectItem>
                    <SelectItem value="1v1 Skills">1v1 Skills</SelectItem>
                    <SelectItem value="Speed & Agility">Speed & Agility</SelectItem>
                    <SelectItem value="Conditioning">Conditioning</SelectItem>
                    <SelectItem value="Lower Strength">Lower Strength</SelectItem>
                    <SelectItem value="Upper Strength">Upper Strength</SelectItem>
                    <SelectItem value="Core">Core</SelectItem>
                    <SelectItem value="Plyo">Plyo</SelectItem>
                    <SelectItem value="Mobility">Mobility</SelectItem>
                    <SelectItem value="Warm-up">Warm-up</SelectItem>
                    <SelectItem value="Cooldown">Cooldown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-exercise-type">Type</Label>
                <Select
                  value={newExercise.type}
                  onValueChange={(value) => setNewExercise({ ...newExercise, type: value })}
                >
                  <SelectTrigger id="new-exercise-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="power">Power</SelectItem>
                    <SelectItem value="speed">Speed</SelectItem>
                    <SelectItem value="agility">Agility</SelectItem>
                    <SelectItem value="mobility">Mobility</SelectItem>
                    <SelectItem value="recovery">Recovery</SelectItem>
                    <SelectItem value="core">Core</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Track Metrics</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-hasLeftRight"
                    checked={newExercise.hasLeftRight}
                    onCheckedChange={(checked) =>
                      setNewExercise({ ...newExercise, hasLeftRight: checked as boolean })
                    }
                  />
                  <label htmlFor="new-hasLeftRight" className="text-sm">
                    Left/Right Foot
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-hasNearFar"
                    checked={newExercise.hasNearFar}
                    onCheckedChange={(checked) =>
                      setNewExercise({ ...newExercise, hasNearFar: checked as boolean })
                    }
                  />
                  <label htmlFor="new-hasNearFar" className="text-sm">
                    Near/Far Target
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-hasTime"
                    checked={newExercise.hasTime}
                    onCheckedChange={(checked) =>
                      setNewExercise({ ...newExercise, hasTime: checked as boolean })
                    }
                  />
                  <label htmlFor="new-hasTime" className="text-sm">
                    Time
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-hasDistance"
                    checked={newExercise.hasDistance}
                    onCheckedChange={(checked) =>
                      setNewExercise({ ...newExercise, hasDistance: checked as boolean })
                    }
                  />
                  <label htmlFor="new-hasDistance" className="text-sm">
                    Distance
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-hasWeight"
                    checked={newExercise.hasWeight}
                    onCheckedChange={(checked) =>
                      setNewExercise({ ...newExercise, hasWeight: checked as boolean })
                    }
                  />
                  <label htmlFor="new-hasWeight" className="text-sm">
                    Weight
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-hasHeartRate"
                    checked={newExercise.hasHeartRate}
                    onCheckedChange={(checked) =>
                      setNewExercise({ ...newExercise, hasHeartRate: checked as boolean })
                    }
                  />
                  <label htmlFor="new-hasHeartRate" className="text-sm">
                    Heart Rate
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsCreateExerciseOpen(false)}
                data-testid="button-cancel-new-exercise"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => createNewExerciseMutation.mutate(newExercise)}
                disabled={!newExercise.name || createNewExerciseMutation.isPending}
                data-testid="button-submit-new-exercise"
              >
                {createNewExerciseMutation.isPending ? "Creating..." : "Create Exercise"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Workout Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Upload Workout Details</DialogTitle>
            <DialogDescription>
              Paste your workout details in the format below. The system will automatically parse the structure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="upload-text">Workout Text</Label>
              <Textarea
                id="upload-text"
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                placeholder={`Example format:
- **SUNDAY — Skill Moves & Ball Mastery + Upper strength (1h10m)**
    - **Location:** Parking field (skills) → Gym (upper body)
    - **Equipment:** Ball, mat, barbell/dumbbells
    1. **1v1 Skills (15m)** *(rest 45–60s per set)*
        - Fake shot + ball roll: 15 L | 15 R
        - Body feint + croqueta: 15 L | 15 R
    2. **Gym Upper Strength (40m)**
        - Bench Press: 4×8 — rest 2m
        - Pull-ups: 4×to-failure — rest 2m`}
                className="min-h-[300px] font-mono text-sm"
                data-testid="textarea-upload-workout"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="overwrite"
                checked={overwriteMode}
                onCheckedChange={(checked) => setOverwriteMode(checked as boolean)}
                data-testid="checkbox-overwrite"
              />
              <label htmlFor="overwrite" className="text-sm">
                Overwrite existing exercises (if unchecked, will append to current workout)
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsUploadOpen(false);
                  setUploadText("");
                }}
                data-testid="button-cancel-upload"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleUploadWorkout}
                disabled={!uploadText.trim()}
                data-testid="button-submit-upload"
              >
                Upload & Parse
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Schedule Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Upload Weekly Workout Schedule</DialogTitle>
            <DialogDescription>
              Paste your full week's workout schedule. Each day should start with "## DayName" or "- **DAYNAME —".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="bulk-upload-text">Weekly Schedule</Label>
              <Textarea
                id="bulk-upload-text"
                value={bulkUploadText}
                onChange={(e) => setBulkUploadText(e.target.value)}
                rows={15}
                className="font-mono text-sm"
                placeholder={`- **MONDAY — Speed & Agility (45 min)**
    - **Location:** Field
    - **Equipment:** Cones
    1. **Warm-up (10 min)**
        - Dynamic Stretching: 5 min
        - Light jogging: 5 min
    2. **Sprint Work (20 min)**
        - 40m sprints: 6×40m rest 90s
        - Agility ladder: 4 sets rest 60s

---

- **TUESDAY — Technical Training (60 min)**
    - **Location:** Field
    - **Equipment:** Ball, Cones
    1. **Ball Control (15 min)**
        - Dribbling: 10 min
        - First touch: 5 min`}
                data-testid="textarea-bulk-upload"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bulk-overwrite"
                  checked={bulkOverwriteMode}
                  onCheckedChange={(checked) => setBulkOverwriteMode(checked as boolean)}
                  data-testid="checkbox-bulk-overwrite"
                />
                <label htmlFor="bulk-overwrite" className="text-sm">
                  Overwrite existing workouts for selected mode
                </label>
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="bulk-mode">Upload for:</Label>
                <Select
                  value={bulkUploadMode}
                  onValueChange={(value) => setBulkUploadMode(value as "solo" | "friend")}
                >
                  <SelectTrigger id="bulk-mode" className="w-40" data-testid="select-bulk-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo Training</SelectItem>
                    <SelectItem value="friend">Friend Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsBulkUploadOpen(false);
                  setBulkUploadText("");
                }}
                data-testid="button-cancel-bulk-upload"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleBulkUploadWorkouts}
                disabled={!bulkUploadText.trim()}
                data-testid="button-submit-bulk-upload"
              >
                Upload & Parse
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Workouts Confirmation Dialog */}
      <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Workouts?</DialogTitle>
            <DialogDescription>
              This will permanently delete all {allWorkouts.length} workout(s) from your schedule. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDeleteAllDialogOpen(false)}
              data-testid="button-cancel-delete-all"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteAllWorkouts}
              data-testid="button-confirm-delete-all"
            >
              Delete All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
