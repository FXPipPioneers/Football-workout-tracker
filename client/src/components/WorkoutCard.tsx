import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Clock, MapPin, PlayCircle, Edit } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface Exercise {
  name: string;
  sets?: string;
  reps?: string;
  rest?: string;
  notes?: string;
}

interface WorkoutBlock {
  title: string;
  duration: string;
  exercises: Exercise[];
}

interface WorkoutCardProps {
  workoutId?: string;
  day: string;
  title: string;
  mode?: string;
  duration: string;
  location: string;
  equipment: string;
  blocks: WorkoutBlock[];
  completed?: boolean;
}

export default function WorkoutCard({
  workoutId,
  day,
  title,
  mode,
  duration,
  location,
  equipment,
  blocks,
  completed = false,
}: WorkoutCardProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set([0]));
  const [, setLocation] = useLocation();

  const toggleBlock = (index: number) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedBlocks(newExpanded);
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                {day}
              </div>
              {mode && (
                <Badge variant={mode === "solo" ? "secondary" : "outline"} className="text-xs">
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            </div>
          </div>
          {completed && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Completed
            </Badge>
          )}
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          <span className="font-medium">Equipment:</span> {equipment}
        </div>

        <div className="space-y-2 mb-4">
          {blocks.map((block, blockIndex) => (
            <div key={blockIndex} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleBlock(blockIndex)}
                className="w-full px-4 py-3 flex items-center justify-between hover-elevate active-elevate-2 bg-card"
                data-testid={`button-toggle-block-${blockIndex}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{block.title}</span>
                  <span className="text-sm text-muted-foreground">({block.duration})</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedBlocks.has(blockIndex) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedBlocks.has(blockIndex) && (
                <div className="px-4 py-3 bg-muted/30 border-t border-border space-y-2">
                  {block.exercises.map((exercise, exerciseIndex) => (
                    <div
                      key={exerciseIndex}
                      className="flex items-start justify-between py-2"
                      data-testid={`exercise-${blockIndex}-${exerciseIndex}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{exercise.name}</div>
                        {exercise.notes && (
                          <div className="text-xs text-muted-foreground mt-1">{exercise.notes}</div>
                        )}
                      </div>
                      {(exercise.sets || exercise.reps || exercise.rest) && (
                        <div className="text-sm text-muted-foreground ml-4 text-right">
                          {exercise.sets && exercise.reps && (
                            <span>{exercise.sets} × {exercise.reps}</span>
                          )}
                          {!exercise.sets && exercise.reps && (
                            <span>{exercise.reps}</span>
                          )}
                          {exercise.sets && !exercise.reps && (
                            <span>{exercise.sets} sets</span>
                          )}
                          {exercise.rest && (
                            <span className="ml-2 text-xs">({exercise.rest})</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {workoutId && (
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => setLocation(`/workout/${workoutId}`)}
              data-testid="button-start-workout"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setLocation(`/workout/${workoutId}/edit`)}
              data-testid="button-edit-workout"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
