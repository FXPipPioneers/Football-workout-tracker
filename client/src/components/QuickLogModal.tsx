import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface QuickLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  onSave: (data: LogData) => void;
}

export interface LogData {
  sets: number;
  reps: number;
  weight?: number;
  rpe: number;
}

export default function QuickLogModal({
  open,
  onOpenChange,
  exerciseName,
  onSave,
}: QuickLogModalProps) {
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [rpe, setRpe] = useState([7]);

  const handleSave = () => {
    onSave({
      sets,
      reps,
      weight: weight || undefined,
      rpe: rpe[0],
    });
    onOpenChange(false);
  };

  const NumberControl = ({
    value,
    onChange,
    label,
    min = 0,
    max = 100,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
    min?: number;
    max?: number;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="outline"
          onClick={() => onChange(Math.max(min, value - 1))}
          data-testid={`button-decrease-${label.toLowerCase()}`}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="flex-1 text-center">
          <span className="text-2xl font-display font-bold" data-testid={`value-${label.toLowerCase()}`}>
            {value}
          </span>
        </div>
        <Button
          size="icon"
          variant="outline"
          onClick={() => onChange(Math.min(max, value + 1))}
          data-testid={`button-increase-${label.toLowerCase()}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Workout</DialogTitle>
          <p className="text-sm text-muted-foreground">{exerciseName}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <NumberControl value={sets} onChange={setSets} label="Sets" min={1} max={10} />
            <NumberControl value={reps} onChange={setReps} label="Reps" min={1} max={50} />
          </div>

          <NumberControl value={weight} onChange={setWeight} label="Weight (kg)" min={0} max={200} />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">RPE (Effort)</Label>
              <span className="text-lg font-display font-bold">{rpe[0]}/10</span>
            </div>
            <Slider
              value={rpe}
              onValueChange={setRpe}
              min={1}
              max={10}
              step={1}
              className="w-full"
              data-testid="slider-rpe"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Easy</span>
              <span>Max</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1" data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1" data-testid="button-save">
            Save Log
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
