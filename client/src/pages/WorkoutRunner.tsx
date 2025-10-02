import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Timer, 
  PlayCircle,
  PauseCircle,
  SkipForward,
  Save
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  name: string;
  category: string;
  type: string;
  hasLeftRight: boolean;
  hasNearFar: boolean;
  hasTime: boolean;
  hasDistance: boolean;
  hasWeight: boolean;
  hasHeartRate: boolean;
}

interface BlockExercise {
  id: string;
  order: number;
  sets: number | null;
  reps: number | null;
  rest: number | null;
  notes: string | null;
  exercise: Exercise;
}

interface Block {
  id: string;
  title: string;
  duration: number | null;
  order: number;
  exercises: BlockExercise[];
}

interface Workout {
  id: string;
  title: string;
  dayOfWeek: string;
  mode: string;
  duration: number | null;
  location: string | null;
  equipment: string | null;
  blocks: Block[];
}

interface SetLog {
  setNumber: number;
  completed: boolean;
  leftCompleted?: number;
  rightCompleted?: number;
  nearCompleted?: number;
  farCompleted?: number;
  distance?: number;
  time?: number;
  weight?: number;
  heartRate?: number;
  notes?: string;
}

export default function WorkoutRunner() {
  const [, params] = useRoute("/workout/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check for sessionId in URL (for resume functionality)
  const urlParams = new URLSearchParams(window.location.search);
  const resumeSessionId = urlParams.get('sessionId');
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, SetLog[]>>({});
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [setInputs, setSetInputs] = useState<Record<string, any>>({});
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);

  const { data: workout, isLoading } = useQuery<Workout>({
    queryKey: ["/api/workouts", params?.id],
    enabled: !!params?.id,
    queryFn: async () => {
      const res = await fetch(`/api/workouts/${params?.id}`);
      if (!res.ok) throw new Error("Failed to fetch workout");
      return res.json();
    },
  });

  const { data: resumeSession } = useQuery<any>({
    queryKey: ["/api/sessions", resumeSessionId],
    enabled: !!resumeSessionId,
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${resumeSessionId}`);
      if (!res.ok) throw new Error("Failed to fetch session");
      return res.json();
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      if (!workout) throw new Error("No workout data");
      const res = await apiRequest("POST", `/api/sessions`, {
        userId: "test-user-id", // TODO: Get from auth
        workoutId: params?.id,
        startedAt: new Date(),
        status: "in_progress",
        mode: workout.mode,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      setWorkoutStartTime(new Date());
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/complete`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Workout Complete!",
        description: "Great job! Your progress has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setLocation("/");
    },
  });

  const pauseSessionMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;
      
      const pausedState = {
        currentBlockIndex,
        currentExerciseIndex,
        exerciseLogs,
        workoutDuration,
        timerSeconds,
        timerRunning,
      };
      
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/pause`, {
        state: pausedState,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Progress Saved",
        description: "Your workout progress has been saved. You can resume later.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/paused/list"] });
      setLocation("/");
    },
  });

  const resumeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/resume`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Workout Resumed",
        description: "Continuing from where you left off.",
      });
    },
  });

  const saveExerciseLogMutation = useMutation({
    mutationFn: async (log: any) => {
      const res = await apiRequest("POST", `/api/session-logs`, log);
      return await res.json();
    },
  });

  // Start timer immediately when workout loads
  useEffect(() => {
    if (workout && !workoutStartTime && !resumeSessionId) {
      setWorkoutStartTime(new Date());
    }
  }, [workout, resumeSessionId]);

  useEffect(() => {
    // If we have a resumeSessionId in the URL, wait for resumeSession data
    if (resumeSessionId) {
      if (resumeSession) {
        // Resume session data is loaded, restore state
        if (resumeSession.pausedState) {
          try {
            const state = JSON.parse(resumeSession.pausedState);
            setSessionId(resumeSessionId);
            setCurrentBlockIndex(state.currentBlockIndex || 0);
            setCurrentExerciseIndex(state.currentExerciseIndex || 0);
            setExerciseLogs(state.exerciseLogs || {});
            setWorkoutDuration(state.workoutDuration || 0);
            setTimerSeconds(state.timerSeconds || 0);
            setTimerRunning(state.timerRunning || false);
            
            // Set workout start time to account for previous duration
            const now = new Date();
            const startTime = new Date(now.getTime() - (state.workoutDuration || 0) * 1000);
            setWorkoutStartTime(startTime);
            
            // Call resume API to mark session as in_progress
            resumeSessionMutation.mutate(resumeSessionId);
          } catch (error) {
            console.error("Failed to restore paused state:", error);
            toast({
              title: "Error",
              description: "Failed to restore workout state. Starting fresh.",
              variant: "destructive",
            });
          }
        }
      }
      // If resumeSessionId exists but resumeSession hasn't loaded yet, do nothing (wait)
    } else if (workout && !sessionId) {
      // No resumeSessionId, create a new session
      createSessionMutation.mutate();
    }
  }, [workout, resumeSession, resumeSessionId]);

  useEffect(() => {
    let interval: number | undefined;
    if (timerRunning && timerSeconds > 0) {
      interval = window.setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  // Workout duration timer
  useEffect(() => {
    let interval: number | undefined;
    if (workoutStartTime) {
      interval = window.setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000);
        setWorkoutDuration(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [workoutStartTime]);

  if (isLoading || !workout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workout...</p>
        </div>
      </div>
    );
  }

  const currentBlock = workout.blocks[currentBlockIndex];
  const currentExercise = currentBlock?.exercises[currentExerciseIndex];
  const totalBlocks = workout.blocks.length;
  const totalExercises = currentBlock?.exercises.length || 0;
  
  const exerciseKey = `${currentBlock?.id}-${currentExercise?.id}`;
  const currentSets = exerciseLogs[exerciseKey] || [];
  const totalSets = currentExercise?.sets || 1;

  const overallProgress = workout.blocks.reduce((total, block, blockIdx) => {
    const blockExercises = block.exercises.length;
    if (blockIdx < currentBlockIndex) return total + blockExercises;
    if (blockIdx === currentBlockIndex) return total + currentExerciseIndex;
    return total;
  }, 0);

  const totalExercisesInWorkout = workout.blocks.reduce(
    (sum, block) => sum + block.exercises.length,
    0
  );
  const progressPercent = (overallProgress / totalExercisesInWorkout) * 100;

  const handleCompleteSet = (setNumber: number, data?: Partial<SetLog>) => {
    const newSets = [...currentSets];
    const existingSet = newSets.find((s) => s.setNumber === setNumber);
    
    if (existingSet) {
      // Toggle completion
      if (existingSet.completed) {
        existingSet.completed = false;
      } else {
        Object.assign(existingSet, data, { completed: true });
      }
    } else {
      newSets.push({
        setNumber,
        completed: true,
        ...data,
      });
    }

    setExerciseLogs({
      ...exerciseLogs,
      [exerciseKey]: newSets,
    });

    if (sessionId && currentExercise) {
      saveExerciseLogMutation.mutate({
        sessionId,
        exerciseId: currentExercise.exercise.id,
        blockId: currentBlock.id,
        setNumber,
        repsCompleted: data?.leftCompleted || data?.nearCompleted || currentExercise.reps,
        leftCompleted: data?.leftCompleted,
        rightCompleted: data?.rightCompleted,
        nearCompleted: data?.nearCompleted,
        farCompleted: data?.farCompleted,
        notes: data?.notes,
      });
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setTimerSeconds(0);
      setTimerRunning(false);
    } else if (currentBlockIndex < totalBlocks - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
      setCurrentExerciseIndex(0);
      setTimerSeconds(0);
      setTimerRunning(false);
    } else {
      completeSessionMutation.mutate();
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    } else if (currentBlockIndex > 0) {
      setCurrentBlockIndex(currentBlockIndex - 1);
      const prevBlock = workout.blocks[currentBlockIndex - 1];
      setCurrentExerciseIndex(prevBlock.exercises.length - 1);
    }
  };

  const startRestTimer = () => {
    if (currentExercise?.rest) {
      // Parse rest time (could be string like "30s" or number)
      const restSeconds = typeof currentExercise.rest === 'string' 
        ? parseInt(currentExercise.rest) 
        : currentExercise.rest;
      setTimerSeconds(restSeconds);
      setTimerRunning(true);
    }
  };

  // Check if current block is warmup or cooldown
  const isWarmupOrCooldown = currentBlock?.title?.toLowerCase().includes('warm') || 
                             currentBlock?.title?.toLowerCase().includes('cool');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isSetCompleted = (setNumber: number) => {
    return currentSets.some((s) => s.setNumber === setNumber && s.completed);
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-exit-workout"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-lg font-bold">{workout.title}</h1>
              <p className="text-xs text-muted-foreground">
                Block {currentBlockIndex + 1} of {totalBlocks}: {currentBlock?.title}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{formatTime(workoutDuration)}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" data-testid="progress-workout" />
          <div className="mt-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => pauseSessionMutation.mutate()}
              disabled={pauseSessionMutation.isPending || !sessionId}
              data-testid="button-save-progress"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Progress & Exit
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2" data-testid="text-exercise-name">
              {currentExercise?.exercise.name}
            </h2>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" data-testid="badge-category">
                {currentExercise?.exercise.category}
              </Badge>
              {currentExercise?.exercise.hasLeftRight && (
                <Badge variant="outline" data-testid="badge-left-right">L/R</Badge>
              )}
              {currentExercise?.exercise.hasNearFar && (
                <Badge variant="outline" data-testid="badge-near-far">Near/Far</Badge>
              )}
            </div>
          </div>

          {currentExercise?.notes && (
            <div className="bg-muted p-3 rounded-md mb-4">
              <p className="text-sm" data-testid="text-exercise-notes">{currentExercise.notes}</p>
            </div>
          )}

          {timerRunning && timerSeconds > 0 && (
            <Card className="p-6 mb-4 bg-primary/5 border-primary">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Rest Timer</p>
                <div className="text-6xl font-bold text-primary mb-3" data-testid="text-timer-large">
                  {formatTime(timerSeconds)}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setTimerRunning(false)}
                    data-testid="button-pause-timer"
                  >
                    <PauseCircle className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTimerSeconds(0);
                      setTimerRunning(false);
                    }}
                    data-testid="button-stop-timer"
                  >
                    Stop
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {Array.from({ length: totalSets }, (_, i) => i + 1).map((setNum) => {
              const completed = isSetCompleted(setNum);
              const inputKey = `${exerciseKey}-${setNum}`;
              
              return (
                <Card
                  key={setNum}
                  className={`p-4 ${completed ? "bg-primary/10 border-primary" : ""}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold" data-testid={`text-set-${setNum}`}>
                        Set {setNum} of {totalSets}
                      </span>
                      {currentExercise?.reps && (
                        <span className="text-sm text-muted-foreground">
                          Target: {currentExercise.reps} reps
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {!isWarmupOrCooldown && currentExercise?.exercise.hasLeftRight && (
                        <>
                          <div>
                            <Label className="text-xs">Left</Label>
                            <Input
                              type="number"
                              inputMode="numeric"
                              placeholder="Reps"
                              value={setInputs[`${inputKey}-left`] || ''}
                              onChange={(e) => setSetInputs({...setInputs, [`${inputKey}-left`]: e.target.value})}
                              data-testid={`input-left-${setNum}`}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Right</Label>
                            <Input
                              type="number"
                              inputMode="numeric"
                              placeholder="Reps"
                              value={setInputs[`${inputKey}-right`] || ''}
                              onChange={(e) => setSetInputs({...setInputs, [`${inputKey}-right`]: e.target.value})}
                              data-testid={`input-right-${setNum}`}
                            />
                          </div>
                        </>
                      )}

                      {!isWarmupOrCooldown && currentExercise?.exercise.hasNearFar && (
                        <>
                          <div>
                            <Label className="text-xs">Near</Label>
                            <Input
                              type="number"
                              inputMode="numeric"
                              placeholder="On target"
                              value={setInputs[`${inputKey}-near`] || ''}
                              onChange={(e) => setSetInputs({...setInputs, [`${inputKey}-near`]: e.target.value})}
                              data-testid={`input-near-${setNum}`}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Far</Label>
                            <Input
                              type="number"
                              inputMode="numeric"
                              placeholder="On target"
                              value={setInputs[`${inputKey}-far`] || ''}
                              onChange={(e) => setSetInputs({...setInputs, [`${inputKey}-far`]: e.target.value})}
                              data-testid={`input-far-${setNum}`}
                            />
                          </div>
                        </>
                      )}

                      {!isWarmupOrCooldown && currentExercise?.exercise.hasDistance && (
                        <div>
                          <Label className="text-xs">Distance (km)</Label>
                          <Input
                            type="number"
                            inputMode="decimal"
                            step="0.1"
                            placeholder="e.g. 3.5"
                            value={setInputs[`${inputKey}-distance`] || ''}
                            onChange={(e) => setSetInputs({...setInputs, [`${inputKey}-distance`]: e.target.value})}
                            data-testid={`input-distance-${setNum}`}
                          />
                        </div>
                      )}

                      {!isWarmupOrCooldown && currentExercise?.exercise.hasTime && (
                        <div>
                          <Label className="text-xs">Time (min)</Label>
                          <Input
                            type="number"
                            inputMode="numeric"
                            step="0.5"
                            placeholder="e.g. 15"
                            value={setInputs[`${inputKey}-time`] || ''}
                            onChange={(e) => setSetInputs({...setInputs, [`${inputKey}-time`]: e.target.value})}
                            data-testid={`input-time-${setNum}`}
                          />
                        </div>
                      )}

                      {!isWarmupOrCooldown && currentExercise?.exercise.hasWeight && (
                        <div>
                          <Label className="text-xs">Weight (kg)</Label>
                          <Input
                            type="number"
                            inputMode="numeric"
                            step="2.5"
                            placeholder="e.g. 75"
                            value={setInputs[`${inputKey}-weight`] || ''}
                            onChange={(e) => setSetInputs({...setInputs, [`${inputKey}-weight`]: e.target.value})}
                            data-testid={`input-weight-${setNum}`}
                          />
                        </div>
                      )}

                      {!isWarmupOrCooldown && currentExercise?.exercise.hasHeartRate && (
                        <div>
                          <Label className="text-xs">Avg HR (bpm)</Label>
                          <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="e.g. 145"
                            value={setInputs[`${inputKey}-hr`] || ''}
                            onChange={(e) => setSetInputs({...setInputs, [`${inputKey}-hr`]: e.target.value})}
                            data-testid={`input-hr-${setNum}`}
                          />
                        </div>
                      )}

                      {!isWarmupOrCooldown && !currentExercise?.exercise.hasLeftRight && !currentExercise?.exercise.hasNearFar && !currentExercise?.exercise.hasDistance && !currentExercise?.exercise.hasTime && !currentExercise?.exercise.hasWeight && !currentExercise?.exercise.hasHeartRate && (
                        <div className="col-span-2">
                          <Label className="text-xs">Reps Completed</Label>
                          <Input
                            type="number"
                            inputMode="numeric"
                            placeholder={currentExercise?.reps?.toString() || '10'}
                            value={setInputs[`${inputKey}-reps`] || ''}
                            onChange={(e) => setSetInputs({...setInputs, [`${inputKey}-reps`]: e.target.value})}
                            data-testid={`input-reps-${setNum}`}
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant={completed ? "default" : "outline"}
                      onClick={() => {
                        const logData: any = {};
                        if (currentExercise?.exercise.hasLeftRight) {
                          logData.leftCompleted = parseInt(setInputs[`${inputKey}-left`]) || 0;
                          logData.rightCompleted = parseInt(setInputs[`${inputKey}-right`]) || 0;
                        }
                        if (currentExercise?.exercise.hasNearFar) {
                          logData.nearCompleted = parseInt(setInputs[`${inputKey}-near`]) || 0;
                          logData.farCompleted = parseInt(setInputs[`${inputKey}-far`]) || 0;
                        }
                        if (currentExercise?.exercise.hasDistance) {
                          logData.distance = parseFloat(setInputs[`${inputKey}-distance`]) || 0;
                        }
                        if (currentExercise?.exercise.hasTime) {
                          logData.time = parseFloat(setInputs[`${inputKey}-time`]) || 0;
                        }
                        if (currentExercise?.exercise.hasWeight) {
                          logData.weight = parseFloat(setInputs[`${inputKey}-weight`]) || 0;
                        }
                        if (currentExercise?.exercise.hasHeartRate) {
                          logData.heartRate = parseInt(setInputs[`${inputKey}-hr`]) || 0;
                        }
                        if (!currentExercise?.exercise.hasLeftRight && !currentExercise?.exercise.hasNearFar && !currentExercise?.exercise.hasDistance && !currentExercise?.exercise.hasTime && !currentExercise?.exercise.hasWeight && !currentExercise?.exercise.hasHeartRate) {
                          logData.leftCompleted = parseInt(setInputs[`${inputKey}-reps`]) || 0;
                        }
                        handleCompleteSet(setNum, logData);
                      }}
                      className="w-full"
                      data-testid={`button-complete-set-${setNum}`}
                    >
                      {completed ? <Check className="mr-2 h-4 w-4" /> : null}
                      {completed ? "✓ Complete (tap to undo)" : "Mark Complete"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {currentExercise?.rest && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={startRestTimer}
              disabled={timerRunning}
              data-testid="button-start-rest-timer"
            >
              <Timer className="mr-2 h-4 w-4" />
              Start Rest Timer ({currentExercise.rest}s)
            </Button>
          )}
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePreviousExercise}
            disabled={currentBlockIndex === 0 && currentExerciseIndex === 0}
            className="flex-1"
            data-testid="button-previous-exercise"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleNextExercise}
            className="flex-1"
            data-testid="button-next-exercise"
          >
            {currentBlockIndex === totalBlocks - 1 &&
            currentExerciseIndex === totalExercises - 1 ? (
              "Complete Workout"
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={handleNextExercise}
          className="w-full"
          data-testid="button-skip-exercise"
        >
          <SkipForward className="mr-2 h-4 w-4" />
          Skip Exercise
        </Button>
      </div>
    </div>
  );
}
