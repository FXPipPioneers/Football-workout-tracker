import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { TrendingUp, Target, Flame, Calendar, Play, PlayCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import ProgressRing from "@/components/ProgressRing";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Workout {
  id: string;
  title: string;
  dayOfWeek: string;
  mode: string;
  duration: string | null;
  location: string | null;
  equipment: string | null;
}

interface PausedSession {
  id: string;
  workoutId: string;
  startedAt: string;
  pausedAt: string;
  pausedState: string;
  mode: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: allWorkouts = [], isLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: pausedSessions = [] } = useQuery<PausedSession[]>({
    queryKey: ["/api/sessions/paused/list"],
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: stats } = useQuery<{
    totalSessions: number;
    currentStreak: number;
    thisWeekSessions: number;
    averageAccuracy: number;
  }>({
    queryKey: ["/api/sessions/stats"],
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest("DELETE", `/api/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/paused/list"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/stats"] });
      toast({
        title: "Progress deleted",
        description: "Workout progress has been cleared. You can start fresh.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete progress",
        variant: "destructive",
      });
    },
  });

  // Get today's day of the week
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

  // Filter to only show today's workouts (solo and friend)
  const todayWorkouts = allWorkouts.filter(w => w.dayOfWeek === today);
  const todaySolo = todayWorkouts.find(w => w.mode === "solo");
  const todayFriend = todayWorkouts.find(w => w.mode === "friend");

  const handleStartWorkout = (workoutId: string) => {
    setLocation(`/workout/${workoutId}`);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Today's Workout</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* Stats Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4" data-testid="card-stat-streak">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Training Streak</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{stats?.currentStreak || 0}</span>
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-primary">
                <Flame className="h-3 w-3" />
                <span>{stats?.currentStreak ? "Keep it going!" : "Start today!"}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4" data-testid="card-stat-total-sessions">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{stats?.totalSessions || 0}</span>
                <span className="text-sm text-muted-foreground">workouts</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-primary">
                <TrendingUp className="h-3 w-3" />
                <span>{stats?.thisWeekSessions || 0} this week</span>
              </div>
            </div>
          </Card>

          <Card className="p-4" data-testid="card-stat-this-week">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">This Week</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{stats?.thisWeekSessions || 0}</span>
                <span className="text-sm text-muted-foreground">/ 7 days</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{Math.round(((stats?.thisWeekSessions || 0) / 7) * 100)}% complete</span>
              </div>
            </div>
          </Card>

          <Card className="p-4" data-testid="card-stat-accuracy">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg. Accuracy</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{stats?.averageAccuracy || 0}</span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-primary">
                <Target className="h-3 w-3" />
                <span>{stats?.averageAccuracy ? "Great work!" : "Log workouts"}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Paused Workouts */}
        {pausedSessions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Resume Paused Workout</h2>
            {pausedSessions.map((session) => {
              const workout = allWorkouts.find(w => w.id === session.workoutId);
              if (!workout) return null;
              
              const pausedDate = new Date(session.pausedAt);
              const timePaused = pausedDate.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit' 
              });
              
              return (
                <Card key={session.id} className="p-6 border-primary/50" data-testid={`card-paused-${session.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full font-medium">
                          Paused
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {timePaused}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">{workout.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{session.mode} Training</span>
                        {workout.location && (
                          <span>📍 {workout.location}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => setLocation(`/workout/${workout.id}?sessionId=${session.id}`)}
                        size="lg"
                        data-testid={`button-resume-${session.id}`}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Resume Workout
                      </Button>
                      <Button
                        onClick={() => deleteSessionMutation.mutate(session.id)}
                        variant="outline"
                        size="lg"
                        disabled={deleteSessionMutation.isPending}
                        data-testid={`button-delete-progress-${session.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deleteSessionMutation.isPending ? "Deleting..." : "Delete Progress"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Today's Workout Options */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Choose Your Workout Of The Day</h2>
          
          {todayWorkouts.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No workouts scheduled for today</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {todaySolo && (
                <Card className="p-6" data-testid="card-today-solo">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                          Solo Training
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">{todaySolo.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {todaySolo.duration && (
                          <span data-testid="text-duration-solo">
                            ⏱️ {todaySolo.duration}
                          </span>
                        )}
                        {todaySolo.location && (
                          <span data-testid="text-location-solo">
                            📍 {todaySolo.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartWorkout(todaySolo.id)}
                      size="lg"
                      data-testid="button-start-today-solo"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Workout
                    </Button>
                  </div>
                </Card>
              )}

              {todayFriend && (
                <Card className="p-6" data-testid="card-today-friend">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                          Friend Training
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">{todayFriend.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {todayFriend.duration && (
                          <span data-testid="text-duration-friend">
                            ⏱️ {todayFriend.duration}
                          </span>
                        )}
                        {todayFriend.location && (
                          <span data-testid="text-location-friend">
                            📍 {todayFriend.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartWorkout(todayFriend.id)}
                      size="lg"
                      data-testid="button-start-today-friend"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Workout
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
