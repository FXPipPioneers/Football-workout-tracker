import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Exercise {
  id: string;
  name: string;
}

interface WorkoutBlockExercise {
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
  exercises: WorkoutBlockExercise[];
}

interface Workout {
  id: string;
  title: string;
  dayOfWeek: string;
  mode: string;
  duration: string | null;
  location: string | null;
  equipment: string | null;
  blocks: WorkoutBlock[];
}

export default function WorkoutEditor() {
  const { workoutId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const isNewWorkout = workoutId === "new";
  const [workoutData, setWorkoutData] = useState<any>(
    isNewWorkout
      ? {
          userId: "test-user-id",
          title: "New Workout",
          dayOfWeek: "MONDAY",
          mode: "solo",
          duration: "60 min",
          location: "Field",
          equipment: "Ball",
          isActive: true,
          blocks: [],
        }
      : {}
  );

  const [isCreateExerciseOpen, setIsCreateExerciseOpen] = useState(false);
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

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [overwriteMode, setOverwriteMode] = useState(false);

  // Fetch workout data (skip if new workout)
  const { data: workout, isLoading } = useQuery<Workout>({
    queryKey: ["/api/workouts", workoutId],
    enabled: !isNewWorkout && !!workoutId,
    staleTime: 0,
  });

  // Fetch all exercises for dropdown
  const { data: allExercises = [] } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Create exercise mutation
  const createExerciseMutation = useMutation({
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

  // Create workout mutation
  const createWorkoutMutation = useMutation({
    mutationFn: async (data: Partial<Workout>) => {
      return apiRequest("POST", "/api/workouts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Workout created",
        description: "Your new workout has been created.",
      });
      setLocation("/workouts");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create workout.",
        variant: "destructive",
      });
    },
  });

  // Update workout mutation
  const updateWorkoutMutation = useMutation({
    mutationFn: async (data: Partial<Workout>) => {
      return apiRequest("PATCH", `/api/workouts/${workoutId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Workout updated",
        description: "Your changes have been saved.",
      });
      setLocation("/workouts");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update workout.",
        variant: "destructive",
      });
    },
  });

  // Initialize local state when workout loads
  if (workout && !workoutData.id && !isNewWorkout) {
    setWorkoutData(workout);
  }

  const handleSave = () => {
    if (isNewWorkout) {
      createWorkoutMutation.mutate(workoutData);
    } else {
      updateWorkoutMutation.mutate(workoutData);
    }
  };

  const updateWorkoutField = (field: string, value: string) => {
    setWorkoutData((prev: any) => ({ ...prev, [field]: value }));
  };

  const addBlock = () => {
    const newBlock: WorkoutBlock = {
      id: `temp-${Date.now()}`,
      title: "New Block",
      duration: null,
      order: (workoutData.blocks?.length || 0) + 1,
      exercises: [],
    };
    setWorkoutData((prev: any) => ({
      ...prev,
      blocks: [...(prev.blocks || []), newBlock],
    }));
  };

  const removeBlock = (blockId: string) => {
    setWorkoutData((prev: any) => ({
      ...prev,
      blocks: prev.blocks?.filter((b: WorkoutBlock) => b.id !== blockId) || [],
    }));
  };

  const updateBlock = (blockId: string, field: string, value: string) => {
    setWorkoutData((prev: any) => ({
      ...prev,
      blocks:
        prev.blocks?.map((b: WorkoutBlock) =>
          b.id === blockId ? { ...b, [field]: value } : b
        ) || [],
    }));
  };

  const addExerciseToBlock = (blockId: string) => {
    setWorkoutData((prev: any) => ({
      ...prev,
      blocks:
        prev.blocks?.map((b: WorkoutBlock) => {
          if (b.id === blockId) {
            const newExercise: WorkoutBlockExercise = {
              id: `temp-${Date.now()}`,
              exerciseId: allExercises[0]?.id || "",
              order: (b.exercises?.length || 0) + 1,
              sets: null,
              reps: null,
              rest: null,
              notes: null,
              exercise: allExercises[0] || { id: "", name: "" },
            };
            return { ...b, exercises: [...(b.exercises || []), newExercise] };
          }
          return b;
        }) || [],
    }));
  };

  const removeExerciseFromBlock = (blockId: string, exerciseId: string) => {
    setWorkoutData((prev: any) => ({
      ...prev,
      blocks:
        prev.blocks?.map((b: WorkoutBlock) => {
          if (b.id === blockId) {
            return {
              ...b,
              exercises: b.exercises?.filter((e: WorkoutBlockExercise) => e.id !== exerciseId) || [],
            };
          }
          return b;
        }) || [],
    }));
  };

  const updateExerciseInBlock = (
    blockId: string,
    exerciseId: string,
    field: string,
    value: string
  ) => {
    setWorkoutData((prev: any) => ({
      ...prev,
      blocks:
        prev.blocks?.map((b: WorkoutBlock) => {
          if (b.id === blockId) {
            return {
              ...b,
              exercises:
                b.exercises?.map((e: WorkoutBlockExercise) => {
                  if (e.id === exerciseId) {
                    if (field === "exerciseId") {
                      const selectedExercise = allExercises.find(
                        (ex) => ex.id === value
                      );
                      return {
                        ...e,
                        exerciseId: value,
                        exercise: selectedExercise || e.exercise,
                      };
                    }
                    return { ...e, [field]: value };
                  }
                  return e;
                }) || [],
            };
          }
          return b;
        }) || [],
    }));
  };

  const parseWorkoutText = (text: string) => {
    const lines = text.split('\n');
    const parsed: any = {
      title: "",
      dayOfWeek: "",
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
        parsed.dayOfWeek = titleMatch[1].charAt(0) + titleMatch[1].slice(1).toLowerCase();
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

      const exerciseMatch = line.match(/^-\s*(.+?):\s*(.+)/);
      if (exerciseMatch && currentBlock) {
        const exerciseName = exerciseMatch[1].trim();
        const exerciseDetails = exerciseMatch[2].trim();
        
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

        const matchingExercise = allExercises.find(e => 
          e.name.toLowerCase() === exerciseName.toLowerCase()
        );

        currentBlock.exercises.push({
          id: `temp-exercise-${exerciseIdCounter++}`,
          exerciseId: matchingExercise?.id || "",
          order: currentBlock.exercises.length + 1,
          sets: sets,
          reps: reps,
          rest: rest,
          notes: exerciseDetails,
          exercise: matchingExercise || { id: "", name: exerciseName }
        });
      }
    }

    if (currentBlock) {
      parsed.blocks.push(currentBlock);
    }

    return parsed;
  };

  const handleUploadWorkout = () => {
    if (!uploadText.trim()) {
      toast({
        title: "No text provided",
        description: "Please paste workout details before uploading.",
        variant: "destructive",
      });
      return;
    }

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
      
      if (overwriteMode) {
        setWorkoutData({
          ...workoutData,
          title: parsed.title || workoutData.title,
          dayOfWeek: parsed.dayOfWeek || workoutData.dayOfWeek,
          duration: parsed.duration || workoutData.duration,
          location: parsed.location || workoutData.location,
          equipment: parsed.equipment || workoutData.equipment,
          blocks: parsed.blocks
        });
      } else {
        const existingBlockCount = workoutData.blocks?.length || 0;
        const adjustedBlocks = parsed.blocks.map((block: any, index: number) => ({
          ...block,
          order: existingBlockCount + index + 1
        }));
        
        setWorkoutData({
          ...workoutData,
          title: parsed.title || workoutData.title,
          dayOfWeek: parsed.dayOfWeek || workoutData.dayOfWeek,
          duration: parsed.duration || workoutData.duration,
          location: parsed.location || workoutData.location,
          equipment: parsed.equipment || workoutData.equipment,
          blocks: [...(workoutData.blocks || []), ...adjustedBlocks]
        });
      }

      setIsUploadOpen(false);
      setUploadText("");
      toast({
        title: "Workout uploaded",
        description: `Successfully parsed ${parsed.blocks.length} block(s) with ${totalExercises} exercise(s).`,
      });
    } catch (error) {
      console.error("Parse error:", error);
      toast({
        title: "Parse error",
        description: "Could not parse the workout text. Please check the format.",
        variant: "destructive",
      });
    }
  };

  if (isLoading && !isNewWorkout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading workout...</div>
        </div>
      </div>
    );
  }

  const isSaving = isNewWorkout ? createWorkoutMutation.isPending : updateWorkoutMutation.isPending;

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/workouts")}
              data-testid="button-back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">
              {isNewWorkout ? "Create Workout" : "Edit Workout"}
            </h1>
            <div className="w-16"></div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsUploadOpen(true)}
              className="flex-1"
              data-testid="button-upload-workout"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Workout Details
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
              data-testid="button-save"
            >
              {isSaving ? "Saving..." : "Save Workout Details"}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Workout Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={workoutData.title || ""}
                onChange={(e) => updateWorkoutField("title", e.target.value)}
                placeholder="Workout Title"
                data-testid="input-title"
              />
            </div>
            <div>
              <Label htmlFor="day">Day of Week</Label>
              <Select
                value={workoutData.dayOfWeek || ""}
                onValueChange={(value) => updateWorkoutField("dayOfWeek", value)}
              >
                <SelectTrigger id="day" data-testid="select-day">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monday">Monday</SelectItem>
                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                  <SelectItem value="Thursday">Thursday</SelectItem>
                  <SelectItem value="Friday">Friday</SelectItem>
                  <SelectItem value="Saturday">Saturday</SelectItem>
                  <SelectItem value="Sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mode">Mode</Label>
              <Select
                value={workoutData.mode || ""}
                onValueChange={(value) => updateWorkoutField("mode", value)}
              >
                <SelectTrigger id="mode" data-testid="select-mode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Solo</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={workoutData.duration || ""}
                onChange={(e) => updateWorkoutField("duration", e.target.value)}
                placeholder="e.g., 60 min"
                data-testid="input-duration"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={workoutData.location || ""}
                onChange={(e) => updateWorkoutField("location", e.target.value)}
                placeholder="e.g., Field, Gym"
                data-testid="input-location"
              />
            </div>
            <div>
              <Label htmlFor="equipment">Equipment</Label>
              <Input
                id="equipment"
                value={workoutData.equipment || ""}
                onChange={(e) => updateWorkoutField("equipment", e.target.value)}
                placeholder="e.g., Ball, Cones, Ladder"
                data-testid="input-equipment"
              />
            </div>
          </div>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Blocks</h2>
            <Button onClick={addBlock} size="sm" data-testid="button-add-block">
              <Plus className="h-4 w-4 mr-2" />
              Add Block
            </Button>
          </div>

          <div className="space-y-4">
            {workoutData.blocks?.map((block: WorkoutBlock) => (
              <Card key={block.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={block.title}
                          onChange={(e) =>
                            updateBlock(block.id, "title", e.target.value)
                          }
                          placeholder="Block Title"
                          data-testid={`input-block-title-${block.id}`}
                        />
                        <Input
                          value={block.duration || ""}
                          onChange={(e) =>
                            updateBlock(block.id, "duration", e.target.value)
                          }
                          placeholder="Duration"
                          className="w-32"
                          data-testid={`input-block-duration-${block.id}`}
                        />
                      </div>

                      <div className="space-y-2">
                        {block.exercises?.map((exercise: WorkoutBlockExercise) => (
                          <div
                            key={exercise.id}
                            className="flex gap-2 items-start bg-muted/30 p-3 rounded-md"
                          >
                            <div className="flex-1 space-y-2">
                              <div className="flex gap-2">
                                <Select
                                  value={exercise.exerciseId}
                                  onValueChange={(value) =>
                                    updateExerciseInBlock(
                                      block.id,
                                      exercise.id,
                                      "exerciseId",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger data-testid={`select-exercise-${exercise.id}`} className="flex-1">
                                    <SelectValue />
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
                                  data-testid="button-create-exercise"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <Input
                                  value={exercise.sets || ""}
                                  onChange={(e) =>
                                    updateExerciseInBlock(
                                      block.id,
                                      exercise.id,
                                      "sets",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Sets"
                                  data-testid={`input-sets-${exercise.id}`}
                                />
                                <Input
                                  value={exercise.reps || ""}
                                  onChange={(e) =>
                                    updateExerciseInBlock(
                                      block.id,
                                      exercise.id,
                                      "reps",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Reps"
                                  data-testid={`input-reps-${exercise.id}`}
                                />
                                <Input
                                  value={exercise.rest || ""}
                                  onChange={(e) =>
                                    updateExerciseInBlock(
                                      block.id,
                                      exercise.id,
                                      "rest",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Rest"
                                  data-testid={`input-rest-${exercise.id}`}
                                />
                              </div>

                              <Textarea
                                value={exercise.notes || ""}
                                onChange={(e) =>
                                  updateExerciseInBlock(
                                    block.id,
                                    exercise.id,
                                    "notes",
                                    e.target.value
                                  )
                                }
                                placeholder="Notes (optional)"
                                className="resize-none"
                                rows={2}
                                data-testid={`input-notes-${exercise.id}`}
                              />
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeExerciseFromBlock(block.id, exercise.id)
                              }
                              data-testid={`button-remove-exercise-${exercise.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addExerciseToBlock(block.id)}
                          className="w-full"
                          data-testid={`button-add-exercise-${block.id}`}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Exercise
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBlock(block.id)}
                      data-testid={`button-remove-block-${block.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

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
              <Label htmlFor="exercise-name">Exercise Name</Label>
              <Input
                id="exercise-name"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="e.g., Inside-Foot Finishing"
                data-testid="input-exercise-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exercise-category">Category</Label>
                <Select
                  value={newExercise.category}
                  onValueChange={(value) => setNewExercise({ ...newExercise, category: value })}
                >
                  <SelectTrigger id="exercise-category">
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
                <Label htmlFor="exercise-type">Type</Label>
                <Select
                  value={newExercise.type}
                  onValueChange={(value) => setNewExercise({ ...newExercise, type: value })}
                >
                  <SelectTrigger id="exercise-type">
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
                    id="hasLeftRight"
                    checked={newExercise.hasLeftRight}
                    onCheckedChange={(checked) =>
                      setNewExercise({ ...newExercise, hasLeftRight: checked as boolean })
                    }
                  />
                  <label htmlFor="hasLeftRight" className="text-sm">
                    Left/Right Foot
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasNearFar"
                    checked={newExercise.hasNearFar}
                    onCheckedChange={(checked) =>
                      setNewExercise({ ...newExercise, hasNearFar: checked as boolean })
                    }
                  />
                  <label htmlFor="hasNearFar" className="text-sm">
                    Near/Far Target
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasTime"
                    checked={newExercise.hasTime}
                    onCheckedChange={(checked) =>
                      setNewExercise({ ...newExercise, hasTime: checked as boolean })
                    }
                  />
                  <label htmlFor="hasTime" className="text-sm">
                    Time
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDistance"
                    checked={newExercise.hasDistance}
                    onCheckedChange={(checked) =>
                      setNewExercise({ ...newExercise, hasDistance: checked as boolean })
                    }
                  />
                  <label htmlFor="hasDistance" className="text-sm">
                    Distance
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasWeight"
                    checked={newExercise.hasWeight}
                    onCheckedChange={(checked) =>
                      setNewExercise({ ...newExercise, hasWeight: checked as boolean })
                    }
                  />
                  <label htmlFor="hasWeight" className="text-sm">
                    Weight
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasHeartRate"
                    checked={newExercise.hasHeartRate}
                    onCheckedChange={(checked) =>
                      setNewExercise({ ...newExercise, hasHeartRate: checked as boolean })
                    }
                  />
                  <label htmlFor="hasHeartRate" className="text-sm">
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
                data-testid="button-cancel-exercise"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => createExerciseMutation.mutate(newExercise)}
                disabled={!newExercise.name || createExerciseMutation.isPending}
                data-testid="button-submit-exercise"
              >
                {createExerciseMutation.isPending ? "Creating..." : "Create Exercise"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
