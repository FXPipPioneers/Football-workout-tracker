import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ChevronRight, Download } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CheckinFormProps {
  onSubmit: (data: CheckinData) => void;
  checkInNumber?: number;
  scheduledDate?: Date;
}

export interface CheckinData {
  // Left vs Right
  passingLeft: number;
  passingRight: number;
  finishingLeftNear: number;
  finishingLeftFar: number;
  finishingRightNear: number;
  finishingRightFar: number;
  firstTouchLeft: number;
  firstTouchRight: number;
  comfortLeft: number;
  comfortRight: number;
  
  // Technical & Skill Moves
  fakeShotBallRollLeft: number;
  fakeShotBallRollRight: number;
  croquetaLeft: number;
  croquetaRight: number;
  flipFlapLeft: number;
  flipFlapRight: number;
  gameRealismSuccess: number;
  
  // Conditioning/Stamina
  enduranceJog1km: number;
  enduranceJog2km: number;
  enduranceJog3km: number;
  enduranceJog4km: number;
  enduranceJog5km: number;
  enduranceAvgHR: number;
  hiitDistance: number;
  maxSprintTime: number;
  fatiguedFinishingNearLeft: number;
  fatiguedFinishingFarLeft: number;
  fatiguedFinishingNearRight: number;
  fatiguedFinishingFarRight: number;
  
  // Strength & Power
  squatWeight: number;
  benchWeight: number;
  rdlWeight: number;
  pullUps: number;
  
  // Nutrition & Body
  weight: number;
  proteinIntake: number;
  sleepHours: number;
  energyLevel: number;
  
  // Mental & Confidence
  leftFootConfidence: number;
  overallConfidence: number;
  motivationCheck: string;
}

type Step = "left-right" | "technical" | "conditioning" | "strength" | "nutrition" | "mental";

export default function CheckinForm({ onSubmit, checkInNumber, scheduledDate }: CheckinFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("left-right");
  const [data, setData] = useState<Partial<CheckinData>>({
    comfortLeft: 5,
    comfortRight: 5,
    energyLevel: 5,
    leftFootConfidence: 5,
    overallConfidence: 5,
  });

  const saveMutation = useMutation({
    mutationFn: async (checkInData: any) => {
      return await apiRequest("/api/check-ins", "POST", checkInData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/check-ins"] });
      toast({
        title: "Check-in saved!",
        description: "Your progress has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save check-in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateData = (key: keyof CheckinData, value: any) => {
    setData({ ...data, [key]: value });
  };

  const steps: Step[] = ["left-right", "technical", "conditioning", "strength", "nutrition", "mental"];
  const currentStepIndex = steps.indexOf(step);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    const checkInData = {
      userId: "test-user-id",
      checkInNumber: checkInNumber || 1,
      checkInDate: scheduledDate || new Date(),
      passingAccuracyLeft: data.passingLeft || 0,
      passingAccuracyRight: data.passingRight || 0,
      finishingNearLeft: data.finishingLeftNear || 0,
      finishingFarLeft: data.finishingLeftFar || 0,
      finishingNearRight: data.finishingRightNear || 0,
      finishingFarRight: data.finishingRightFar || 0,
      firstTouchLeft: data.firstTouchLeft || 0,
      firstTouchRight: data.firstTouchRight || 0,
      comfortLevelLeft: data.comfortLeft || 0,
      comfortLevelRight: data.comfortRight || 0,
      skillMoveFakeShotLeft: data.fakeShotBallRollLeft || 0,
      skillMoveFakeShotRight: data.fakeShotBallRollRight || 0,
      skillMoveCroquetaLeft: data.croquetaLeft || 0,
      skillMoveCroquetaRight: data.croquetaRight || 0,
      skillMoveFlipFlapLeft: data.flipFlapLeft || 0,
      skillMoveFlipFlapRight: data.flipFlapRight || 0,
      gameRealismSuccess: data.gameRealismSuccess || 0,
      enduranceJog1km: data.enduranceJog1km || 0,
      enduranceJog2km: data.enduranceJog2km || 0,
      enduranceJog3km: data.enduranceJog3km || 0,
      enduranceJog4km: data.enduranceJog4km || 0,
      enduranceJog5km: data.enduranceJog5km || 0,
      enduranceAvgHR: data.enduranceAvgHR || 0,
      hiitDistance: data.hiitDistance || 0,
      maxSprintTime: data.maxSprintTime || 0,
      fatiguedFinishingNearLeft: data.fatiguedFinishingNearLeft || 0,
      fatiguedFinishingFarLeft: data.fatiguedFinishingFarLeft || 0,
      fatiguedFinishingNearRight: data.fatiguedFinishingNearRight || 0,
      fatiguedFinishingFarRight: data.fatiguedFinishingFarRight || 0,
      squatWeight: data.squatWeight || 0,
      benchWeight: data.benchWeight || 0,
      rdlWeight: data.rdlWeight || 0,
      pullUps: data.pullUps || 0,
      weight: data.weight || 0,
      proteinIntake: data.proteinIntake || 0,
      sleepHours: data.sleepHours || 0,
      energyLevel: data.energyLevel || 0,
      leftFootConfidence: data.leftFootConfidence || 0,
      overallConfidence: data.overallConfidence || 0,
      motivationCheck: data.motivationCheck || "",
    };

    await saveMutation.mutateAsync(checkInData);
    onSubmit(data as CheckinData);
  };

  const downloadCheckIn = () => {
    const formatted = `
FOOTBALL TRAINING CHECK-IN #${checkInNumber || 1}
Date: ${scheduledDate?.toDateString() || new Date().toDateString()}

═══════════════════════════════════════════════
LEFT VS RIGHT FOOT PROGRESS
═══════════════════════════════════════════════

Passing accuracy (100 passes/foot):
  Left: ${data.passingLeft || 0}/100 | Right: ${data.passingRight || 0}/100

Finishing accuracy (20 shots/foot, split near/far):
  Left near: ${data.finishingLeftNear || 0}/10 | Left far: ${data.finishingLeftFar || 0}/10
  Right near: ${data.finishingRightNear || 0}/10 | Right far: ${data.finishingRightFar || 0}/10

First-touch control (20 serves/foot, 2 touches max):
  Left: ${data.firstTouchLeft || 0}/20 | Right: ${data.firstTouchRight || 0}/20

Comfort level (self-rating, 1–10):
  Left: ${data.comfortLeft || 0} | Right: ${data.comfortRight || 0}

═══════════════════════════════════════════════
TECHNICAL & SKILL MOVES
═══════════════════════════════════════════════

Skill move execution (20 reps/foot each):
  Fake shot + ball roll → Left: ${data.fakeShotBallRollLeft || 0}/20 | Right: ${data.fakeShotBallRollRight || 0}/20
  Body feint + La Croqueta → Left: ${data.croquetaLeft || 0}/20 | Right: ${data.croquetaRight || 0}/20
  Flip Flap → Left: ${data.flipFlapLeft || 0}/20 | Right: ${data.flipFlapRight || 0}/20

Game realism drill (10 reps, cone/1v1): ${data.gameRealismSuccess || 0}% success

═══════════════════════════════════════════════
CONDITIONING / STAMINA
═══════════════════════════════════════════════

Endurance jog (5 km test run):
  1km: ${data.enduranceJog1km || 0} min | 2km: ${data.enduranceJog2km || 0} min
  3km: ${data.enduranceJog3km || 0} min | 4km: ${data.enduranceJog4km || 0} min  
  5km: ${data.enduranceJog5km || 0} min | Avg HR: ${data.enduranceAvgHR || 0} bpm
HIIT (4×4 min): Distance per interval: ${data.hiitDistance || 0} m
Max Sprint Test (30 m flying sprint): Best time: ${data.maxSprintTime || 0} sec
Fatigued finishing test (Thursday block - Inside-foot: 1×10 far + 1×10 near L | 1×10 far + 1×10 near R):
  Left near: ${data.fatiguedFinishingNearLeft || 0}/10 | Left far: ${data.fatiguedFinishingFarLeft || 0}/10
  Right near: ${data.fatiguedFinishingNearRight || 0}/10 | Right far: ${data.fatiguedFinishingFarRight || 0}/10

═══════════════════════════════════════════════
STRENGTH & POWER
═══════════════════════════════════════════════

Squat 4×6 @ ${data.squatWeight || 0} kg
Bench Press 4×8 @ ${data.benchWeight || 0} kg
RDL 3×8 @ ${data.rdlWeight || 0} kg
Pull-ups: ${data.pullUps || 0}/set

═══════════════════════════════════════════════
NUTRITION & BODY
═══════════════════════════════════════════════

Weight: ${data.weight || 0} kg
Protein intake avg: ${data.proteinIntake || 0} g/day (goal = 1.6–2.0 g per kg)
Sleep avg: ${data.sleepHours || 0} h/night
Energy levels (self-rating 1–10): ${data.energyLevel || 0}

═══════════════════════════════════════════════
MENTAL & CONFIDENCE
═══════════════════════════════════════════════

Left foot confidence in drills (1–10): ${data.leftFootConfidence || 0}
Overall football confidence (1–10): ${data.overallConfidence || 0}
Motivation / fatigue check: ${data.motivationCheck || ""}
    `.trim();

    const blob = new Blob([formatted], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `check-in-${checkInNumber || 1}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const NumberInput = ({ label, value, onChange, max }: { label: string; value: number; onChange: (val: number) => void; max?: number }) => (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        max={max}
        className="w-full"
        data-testid={`input-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
      />
    </div>
  );

  const SliderInput = ({ label, value, onChange, max = 10 }: { label: string; value: number; onChange: (val: number) => void; max?: number }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm font-bold">{value}/{max}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        min={0}
        max={max}
        step={1}
        className="w-full"
        data-testid={`slider-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
      />
    </div>
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Check-in #{checkInNumber || 1}</h3>
          <span className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1}/{steps.length}
          </span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {step === "left-right" && (
          <>
            <h4 className="font-semibold text-lg">Left vs Right Foot Progress</h4>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium">Passing accuracy (100 passes/foot)</p>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Left"
                  value={data.passingLeft || 0}
                  onChange={(val) => updateData("passingLeft", val)}
                  max={100}
                />
                <NumberInput
                  label="Right"
                  value={data.passingRight || 0}
                  onChange={(val) => updateData("passingRight", val)}
                  max={100}
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium">Finishing accuracy (20 shots/foot, split near/far)</p>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Left near (/10)"
                  value={data.finishingLeftNear || 0}
                  onChange={(val) => updateData("finishingLeftNear", val)}
                  max={10}
                />
                <NumberInput
                  label="Left far (/10)"
                  value={data.finishingLeftFar || 0}
                  onChange={(val) => updateData("finishingLeftFar", val)}
                  max={10}
                />
                <NumberInput
                  label="Right near (/10)"
                  value={data.finishingRightNear || 0}
                  onChange={(val) => updateData("finishingRightNear", val)}
                  max={10}
                />
                <NumberInput
                  label="Right far (/10)"
                  value={data.finishingRightFar || 0}
                  onChange={(val) => updateData("finishingRightFar", val)}
                  max={10}
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium">First-touch control (20 serves/foot, 2 touches max)</p>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Left (/20)"
                  value={data.firstTouchLeft || 0}
                  onChange={(val) => updateData("firstTouchLeft", val)}
                  max={20}
                />
                <NumberInput
                  label="Right (/20)"
                  value={data.firstTouchRight || 0}
                  onChange={(val) => updateData("firstTouchRight", val)}
                  max={20}
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium">Comfort level (self-rating, 1–10)</p>
              <div className="grid grid-cols-2 gap-4">
                <SliderInput
                  label="Left"
                  value={data.comfortLeft || 5}
                  onChange={(val) => updateData("comfortLeft", val)}
                />
                <SliderInput
                  label="Right"
                  value={data.comfortRight || 5}
                  onChange={(val) => updateData("comfortRight", val)}
                />
              </div>
            </div>
          </>
        )}

        {step === "technical" && (
          <>
            <h4 className="font-semibold text-lg">Technical & Skill Moves</h4>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium">Skill move execution (20 reps/foot each)</p>
              
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Fake shot + ball roll Left (/20)"
                  value={data.fakeShotBallRollLeft || 0}
                  onChange={(val) => updateData("fakeShotBallRollLeft", val)}
                  max={20}
                />
                <NumberInput
                  label="Fake shot + ball roll Right (/20)"
                  value={data.fakeShotBallRollRight || 0}
                  onChange={(val) => updateData("fakeShotBallRollRight", val)}
                  max={20}
                />
                <NumberInput
                  label="Body feint + La Croqueta Left (/20)"
                  value={data.croquetaLeft || 0}
                  onChange={(val) => updateData("croquetaLeft", val)}
                  max={20}
                />
                <NumberInput
                  label="Body feint + La Croqueta Right (/20)"
                  value={data.croquetaRight || 0}
                  onChange={(val) => updateData("croquetaRight", val)}
                  max={20}
                />
                <NumberInput
                  label="Flip Flap Left (/20)"
                  value={data.flipFlapLeft || 0}
                  onChange={(val) => updateData("flipFlapLeft", val)}
                  max={20}
                />
                <NumberInput
                  label="Flip Flap Right (/20)"
                  value={data.flipFlapRight || 0}
                  onChange={(val) => updateData("flipFlapRight", val)}
                  max={20}
                />
              </div>

              <NumberInput
                label="Game realism drill (10 reps, cone/1v1) - % success"
                value={data.gameRealismSuccess || 0}
                onChange={(val) => updateData("gameRealismSuccess", val)}
                max={100}
              />
            </div>
          </>
        )}

        {step === "conditioning" && (
          <>
            <h4 className="font-semibold text-lg">Conditioning / Stamina</h4>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium">Endurance jog (5 km test run) - Split times in minutes</p>
              <div className="grid grid-cols-3 gap-4">
                <NumberInput
                  label="1km"
                  value={data.enduranceJog1km || 0}
                  onChange={(val) => updateData("enduranceJog1km", val)}
                />
                <NumberInput
                  label="2km"
                  value={data.enduranceJog2km || 0}
                  onChange={(val) => updateData("enduranceJog2km", val)}
                />
                <NumberInput
                  label="3km"
                  value={data.enduranceJog3km || 0}
                  onChange={(val) => updateData("enduranceJog3km", val)}
                />
                <NumberInput
                  label="4km"
                  value={data.enduranceJog4km || 0}
                  onChange={(val) => updateData("enduranceJog4km", val)}
                />
                <NumberInput
                  label="5km"
                  value={data.enduranceJog5km || 0}
                  onChange={(val) => updateData("enduranceJog5km", val)}
                />
                <NumberInput
                  label="Avg HR (bpm)"
                  value={data.enduranceAvgHR || 0}
                  onChange={(val) => updateData("enduranceAvgHR", val)}
                />
              </div>
            </div>

            <NumberInput
              label="HIIT (4×4 min) - Distance per interval (m)"
              value={data.hiitDistance || 0}
              onChange={(val) => updateData("hiitDistance", val)}
            />

            <NumberInput
              label="Max Sprint Test (30 m) - Best time (sec)"
              value={data.maxSprintTime || 0}
              onChange={(val) => updateData("maxSprintTime", val)}
            />

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium">Fatigued finishing test (Thursday block)</p>
              <p className="text-xs text-muted-foreground">Inside-foot: 1×10 far + 1×10 near L | 1×10 far + 1×10 near R</p>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Left near (/10)"
                  value={data.fatiguedFinishingNearLeft || 0}
                  onChange={(val) => updateData("fatiguedFinishingNearLeft", val)}
                  max={10}
                />
                <NumberInput
                  label="Left far (/10)"
                  value={data.fatiguedFinishingFarLeft || 0}
                  onChange={(val) => updateData("fatiguedFinishingFarLeft", val)}
                  max={10}
                />
                <NumberInput
                  label="Right near (/10)"
                  value={data.fatiguedFinishingNearRight || 0}
                  onChange={(val) => updateData("fatiguedFinishingNearRight", val)}
                  max={10}
                />
                <NumberInput
                  label="Right far (/10)"
                  value={data.fatiguedFinishingFarRight || 0}
                  onChange={(val) => updateData("fatiguedFinishingFarRight", val)}
                  max={10}
                />
              </div>
            </div>
          </>
        )}

        {step === "strength" && (
          <>
            <h4 className="font-semibold text-lg">Strength & Power</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Squat 4×6 (kg)"
                value={data.squatWeight || 0}
                onChange={(val) => updateData("squatWeight", val)}
              />
              <NumberInput
                label="Bench Press 4×8 (kg)"
                value={data.benchWeight || 0}
                onChange={(val) => updateData("benchWeight", val)}
              />
              <NumberInput
                label="RDL 3×8 (kg)"
                value={data.rdlWeight || 0}
                onChange={(val) => updateData("rdlWeight", val)}
              />
              <NumberInput
                label="Pull-ups (/set)"
                value={data.pullUps || 0}
                onChange={(val) => updateData("pullUps", val)}
              />
            </div>
          </>
        )}

        {step === "nutrition" && (
          <>
            <h4 className="font-semibold text-lg">Nutrition & Body</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Weight (kg)"
                value={data.weight || 0}
                onChange={(val) => updateData("weight", val)}
              />
              <NumberInput
                label="Protein intake avg (g/day)"
                value={data.proteinIntake || 0}
                onChange={(val) => updateData("proteinIntake", val)}
              />
              <NumberInput
                label="Sleep avg (h/night)"
                value={data.sleepHours || 0}
                onChange={(val) => updateData("sleepHours", val)}
                max={12}
              />
            </div>

            <SliderInput
              label="Energy levels (self-rating 1–10)"
              value={data.energyLevel || 5}
              onChange={(val) => updateData("energyLevel", val)}
            />
            
            <p className="text-xs text-muted-foreground">
              Goal: 1.6–2.0 g protein per kg body weight
            </p>
          </>
        )}

        {step === "mental" && (
          <>
            <h4 className="font-semibold text-lg">Mental & Confidence</h4>
            
            <SliderInput
              label="Left foot confidence in drills (1–10)"
              value={data.leftFootConfidence || 5}
              onChange={(val) => updateData("leftFootConfidence", val)}
            />

            <SliderInput
              label="Overall football confidence (1–10)"
              value={data.overallConfidence || 5}
              onChange={(val) => updateData("overallConfidence", val)}
            />

            <div className="space-y-2">
              <Label className="text-sm">Motivation / fatigue check</Label>
              <Textarea
                value={data.motivationCheck || ""}
                onChange={(e) => updateData("motivationCheck", e.target.value)}
                placeholder="How are you feeling? Any concerns or highlights?"
                className="w-full"
                rows={4}
                data-testid="textarea-motivation"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        {currentStepIndex > 0 && (
          <Button
            variant="outline"
            onClick={prevStep}
            className="flex-1"
            data-testid="button-prev-step"
          >
            Previous
          </Button>
        )}
        
        <Button
          onClick={nextStep}
          className="flex-1"
          disabled={saveMutation.isPending}
          data-testid="button-next-step"
        >
          {saveMutation.isPending ? "Saving..." : currentStepIndex === steps.length - 1 ? "Submit Check-in" : "Next"}
          {currentStepIndex < steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>

        {currentStepIndex === steps.length - 1 && (
          <Button
            variant="outline"
            onClick={downloadCheckIn}
            data-testid="button-download"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
