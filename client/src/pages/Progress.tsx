import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import CheckinForm from "@/components/CheckinForm";
import CheckinSchedule from "@/components/CheckinSchedule";
import DualAxisChart from "@/components/progress-charts/DualAxisChart";
import SkillMovesChart from "@/components/progress-charts/SkillMovesChart";
import SimpleLineChart from "@/components/progress-charts/SimpleLineChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { CheckIn } from "@shared/schema";

type WeeklyLog = {
  category: string;
  exerciseName: string;
  log: any;
  date: Date;
};

export default function Progress() {
  const [showCheckin, setShowCheckin] = useState(false);
  const [selectedCheckInNumber, setSelectedCheckInNumber] = useState<number | null>(null);
  const [weeksFilter, setWeeksFilter] = useState("8");
  const [showCustomDateDialog, setShowCustomDateDialog] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);

  const { data: completedCheckIns = [] } = useQuery<CheckIn[]>({
    queryKey: ["/api/check-ins"],
  });

  const { data: progressData, isLoading } = useQuery({
    queryKey: ["/api/progress/weekly", weeksFilter, customStartDate, customEndDate],
    queryFn: async () => {
      let url = `/api/progress/weekly`;
      if (weeksFilter === "custom" && customStartDate && customEndDate) {
        const startStr = format(customStartDate, "yyyy-MM-dd");
        const endStr = format(customEndDate, "yyyy-MM-dd");
        url += `?startDate=${startStr}&endDate=${endStr}`;
      } else {
        url += `?weeks=${weeksFilter}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch progress data");
      return response.json();
    },
  });

  const handleStartCheckIn = (checkInNumber: number, scheduledDate: Date) => {
    setSelectedCheckInNumber(checkInNumber);
    setShowCheckin(true);
  };

  // Process data for Shooting & Finishing chart
  const shootingData = useMemo(() => {
    if (!progressData?.weeklyData) return [];
    
    const weeklyStats: Record<string, any> = {};
    
    Object.entries(progressData.weeklyData).forEach(([weekKey, logs]) => {
      const shootingLogs = (logs as WeeklyLog[]).filter(l => l.category === "Shooting");
      
      let leftNearHits = 0, leftNearAttempts = 0;
      let leftFarHits = 0, leftFarAttempts = 0;
      let rightNearHits = 0, rightNearAttempts = 0;
      let rightFarHits = 0, rightFarAttempts = 0;
      
      shootingLogs.forEach(({ log }) => {
        // For shooting drills, we track successful reps per target
        // Each drill typically has 10 attempts per target
        // If totalReps is logged, divide by 4 targets to estimate attempts per target
        const attemptsPerTarget = log.totalReps ? Math.ceil(log.totalReps / 4) : 10;
        
        if (log.leftNearReps !== null && log.leftNearReps !== undefined) {
          leftNearHits += log.leftNearReps;
          leftNearAttempts += attemptsPerTarget;
        }
        if (log.leftFarReps !== null && log.leftFarReps !== undefined) {
          leftFarHits += log.leftFarReps;
          leftFarAttempts += attemptsPerTarget;
        }
        if (log.rightNearReps !== null && log.rightNearReps !== undefined) {
          rightNearHits += log.rightNearReps;
          rightNearAttempts += attemptsPerTarget;
        }
        if (log.rightFarReps !== null && log.rightFarReps !== undefined) {
          rightFarHits += log.rightFarReps;
          rightFarAttempts += attemptsPerTarget;
        }
      });
      
      const weekDate = new Date(weekKey);
      weeklyStats[weekKey] = {
        week: `${weekDate.getMonth() + 1}/${weekDate.getDate()}`,
        leftNearHits,
        leftFarHits,
        rightNearHits,
        rightFarHits,
        leftNearPct: leftNearAttempts ? Math.round((leftNearHits / leftNearAttempts) * 100) : 0,
        leftFarPct: leftFarAttempts ? Math.round((leftFarHits / leftFarAttempts) * 100) : 0,
        rightNearPct: rightNearAttempts ? Math.round((rightNearHits / rightNearAttempts) * 100) : 0,
        rightFarPct: rightFarAttempts ? Math.round((rightFarHits / rightFarAttempts) * 100) : 0,
      };
    });
    
    return Object.values(weeklyStats);
  }, [progressData]);

  // Process data for Passing Accuracy chart
  const passingData = useMemo(() => {
    if (!progressData?.weeklyData) return [];
    
    const weeklyStats: Record<string, any> = {};
    
    Object.entries(progressData.weeklyData).forEach(([weekKey, logs]) => {
      const passingLogs = (logs as WeeklyLog[]).filter(l => l.category === "Passing");
      
      let leftHits = 0, leftAttempts = 0;
      let rightHits = 0, rightAttempts = 0;
      
      passingLogs.forEach(({ log }) => {
        // For passing drills, totalReps typically includes both feet
        // Divide by 2 to estimate attempts per foot
        const attemptsPerFoot = log.totalReps ? Math.ceil(log.totalReps / 2) : (log.leftReps || 0) + (log.rightReps || 0);
        
        if (log.leftReps !== null && log.leftReps !== undefined) {
          leftHits += log.leftReps;
          leftAttempts += attemptsPerFoot;
        }
        if (log.rightReps !== null && log.rightReps !== undefined) {
          rightHits += log.rightReps;
          rightAttempts += attemptsPerFoot;
        }
      });
      
      const weekDate = new Date(weekKey);
      weeklyStats[weekKey] = {
        week: `${weekDate.getMonth() + 1}/${weekDate.getDate()}`,
        leftHits,
        rightHits,
        leftPct: leftAttempts ? Math.round((leftHits / leftAttempts) * 100) : 0,
        rightPct: rightAttempts ? Math.round((rightHits / rightAttempts) * 100) : 0,
      };
    });
    
    return Object.values(weeklyStats);
  }, [progressData]);

  // Process data for First-Touch Control chart
  const firstTouchData = useMemo(() => {
    if (!progressData?.weeklyData) return [];
    
    const weeklyStats: Record<string, any> = {};
    
    Object.entries(progressData.weeklyData).forEach(([weekKey, logs]) => {
      const firstTouchLogs = (logs as WeeklyLog[]).filter(l => 
        l.exerciseName.toLowerCase().includes('first-touch') || 
        l.exerciseName.toLowerCase().includes('first touch')
      );
      
      let leftControlled = 0, leftAttempts = 0;
      let rightControlled = 0, rightAttempts = 0;
      
      firstTouchLogs.forEach(({ log }) => {
        // For first-touch drills, totalReps includes both feet
        // Divide by 2 to estimate attempts per foot
        const attemptsPerFoot = log.totalReps ? Math.ceil(log.totalReps / 2) : 20;
        
        if (log.leftReps !== null && log.leftReps !== undefined) {
          leftControlled += log.leftReps;
          leftAttempts += attemptsPerFoot;
        }
        if (log.rightReps !== null && log.rightReps !== undefined) {
          rightControlled += log.rightReps;
          rightAttempts += attemptsPerFoot;
        }
      });
      
      const weekDate = new Date(weekKey);
      weeklyStats[weekKey] = {
        week: `${weekDate.getMonth() + 1}/${weekDate.getDate()}`,
        leftControlled,
        rightControlled,
        leftPct: leftAttempts ? Math.round((leftControlled / leftAttempts) * 100) : 0,
        rightPct: rightAttempts ? Math.round((rightControlled / rightAttempts) * 100) : 0,
      };
    });
    
    return Object.values(weeklyStats);
  }, [progressData]);

  // Process data for Skill Moves chart (from check-ins)
  const skillMovesData = useMemo(() => {
    if (!completedCheckIns.length) return [];
    
    return completedCheckIns.map((checkIn) => {
      const checkInDate = new Date(checkIn.checkInDate);
      return {
        week: `Week ${checkIn.checkInNumber}`,
        fakeShotLeft: checkIn.skillMoveFakeShotLeft || 0,
        fakeShotRight: checkIn.skillMoveFakeShotRight || 0,
        fakeShotLeftPct: Math.round(((checkIn.skillMoveFakeShotLeft || 0) / 20) * 100),
        fakeShotRightPct: Math.round(((checkIn.skillMoveFakeShotRight || 0) / 20) * 100),
        croquetaLeft: checkIn.skillMoveCroquetaLeft || 0,
        croquetaRight: checkIn.skillMoveCroquetaRight || 0,
        croquetaLeftPct: Math.round(((checkIn.skillMoveCroquetaLeft || 0) / 20) * 100),
        croquetaRightPct: Math.round(((checkIn.skillMoveCroquetaRight || 0) / 20) * 100),
        flipFlapLeft: checkIn.skillMoveFlipFlapLeft || 0,
        flipFlapRight: checkIn.skillMoveFlipFlapRight || 0,
        flipFlapLeftPct: Math.round(((checkIn.skillMoveFlipFlapLeft || 0) / 20) * 100),
        flipFlapRightPct: Math.round(((checkIn.skillMoveFlipFlapRight || 0) / 20) * 100),
      };
    });
  }, [completedCheckIns]);

  // Process data for Endurance chart
  const enduranceData = useMemo(() => {
    if (!completedCheckIns.length) return [];
    
    return completedCheckIns.map((checkIn) => ({
      week: `Week ${checkIn.checkInNumber}`,
      runTime: checkIn.enduranceJog5km || 0,
      avgHR: checkIn.enduranceAvgHR || 0,
    }));
  }, [completedCheckIns]);

  // Process data for Speed/Anaerobic chart
  const speedData = useMemo(() => {
    if (!completedCheckIns.length) return [];
    
    return completedCheckIns.map((checkIn) => ({
      week: `Week ${checkIn.checkInNumber}`,
      maxSprint: checkIn.maxSprintTime || 0,
      hiitDistance: checkIn.hiitDistance || 0,
    }));
  }, [completedCheckIns]);

  // Process data for Core Lifts chart
  const coreLiftsData = useMemo(() => {
    if (!completedCheckIns.length) return [];
    
    return completedCheckIns.map((checkIn) => ({
      week: `Week ${checkIn.checkInNumber}`,
      squat: checkIn.squatWeight || 0,
      rdl: checkIn.rdlWeight || 0,
      bench: checkIn.benchWeight || 0,
      pullUps: checkIn.pullUps || 0,
    }));
  }, [completedCheckIns]);

  // Process data for Explosiveness chart
  // Note: boxJumpHeight and broadJumpDistance fields need to be added to check_ins table
  const explosivenessData = useMemo(() => {
    if (!completedCheckIns.length) return [];
    
    return completedCheckIns.map((checkIn: any) => ({
      week: `Week ${checkIn.checkInNumber}`,
      boxJump: checkIn.boxJumpHeight || 0, // cm
      broadJump: checkIn.broadJumpDistance || 0, // meters
    }));
  }, [completedCheckIns]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <p className="text-muted-foreground">Loading progress data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Progress</h1>
            {!showCheckin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedCheckInNumber(null);
                  setShowCheckin(true);
                }}
                data-testid="button-checkin"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Quick Check-in
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {showCheckin ? (
          <CheckinForm
            onSubmit={(data) => {
              console.log("Check-in data:", data);
              setShowCheckin(false);
              setSelectedCheckInNumber(null);
            }}
          />
        ) : (
          <>
            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="charts" className="flex-1" data-testid="tab-charts">
                  Charts
                </TabsTrigger>
                <TabsTrigger value="checkins" className="flex-1" data-testid="tab-checkins">
                  Check-ins
                </TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="space-y-6">
                <div className="flex justify-end gap-2 mb-4">
                  <Select value={weeksFilter} onValueChange={(value) => {
                    if (value === "custom") {
                      setShowCustomDateDialog(true);
                    } else {
                      setWeeksFilter(value);
                      setCustomStartDate(undefined);
                      setCustomEndDate(undefined);
                    }
                  }}>
                    <SelectTrigger className="w-48" data-testid="select-date-range">
                      <SelectValue placeholder="Date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">This week</SelectItem>
                      <SelectItem value="4">1 month</SelectItem>
                      <SelectItem value="8">2 months</SelectItem>
                      <SelectItem value="12">3 months</SelectItem>
                      <SelectItem value="24">6 months</SelectItem>
                      <SelectItem value="52">This year</SelectItem>
                      <SelectItem value="custom">Custom range...</SelectItem>
                    </SelectContent>
                  </Select>
                  {customStartDate && customEndDate && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowCustomDateDialog(true)}
                      data-testid="button-edit-custom-range"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(customStartDate, "MMM d")} - {format(customEndDate, "MMM d, yyyy")}
                    </Button>
                  )}
                </div>

                {/* Shooting & Finishing */}
                {shootingData.length > 0 && (
                  <DualAxisChart
                    title="Shooting & Finishing"
                    data={shootingData}
                    barKeys={[
                      { key: 'leftNearHits', name: 'Left Near', color: 'hsl(var(--chart-1))' },
                      { key: 'leftFarHits', name: 'Left Far', color: 'hsl(var(--chart-2))' },
                      { key: 'rightNearHits', name: 'Right Near', color: 'hsl(var(--chart-3))' },
                      { key: 'rightFarHits', name: 'Right Far', color: 'hsl(var(--chart-4))' },
                    ]}
                    lineKeys={[
                      { key: 'leftNearPct', name: 'Left Near %', color: 'hsl(var(--chart-1))' },
                      { key: 'leftFarPct', name: 'Left Far %', color: 'hsl(var(--chart-2))' },
                      { key: 'rightNearPct', name: 'Right Near %', color: 'hsl(var(--chart-3))' },
                      { key: 'rightFarPct', name: 'Right Far %', color: 'hsl(var(--chart-4))' },
                    ]}
                  />
                )}

                {/* Passing Accuracy */}
                {passingData.length > 0 && (
                  <DualAxisChart
                    title="Passing Accuracy"
                    data={passingData}
                    barKeys={[
                      { key: 'leftHits', name: 'Left Foot Hits', color: 'hsl(var(--chart-1))' },
                      { key: 'rightHits', name: 'Right Foot Hits', color: 'hsl(var(--chart-2))' },
                    ]}
                    lineKeys={[
                      { key: 'leftPct', name: 'Left %', color: 'hsl(var(--chart-1))' },
                      { key: 'rightPct', name: 'Right %', color: 'hsl(var(--chart-2))' },
                    ]}
                  />
                )}

                {/* First-Touch Control */}
                {firstTouchData.length > 0 && (
                  <DualAxisChart
                    title="First-Touch Control"
                    data={firstTouchData}
                    barKeys={[
                      { key: 'leftControlled', name: 'Left Foot', color: 'hsl(var(--chart-3))' },
                      { key: 'rightControlled', name: 'Right Foot', color: 'hsl(var(--chart-4))' },
                    ]}
                    lineKeys={[
                      { key: 'leftPct', name: 'Left %', color: 'hsl(var(--chart-3))' },
                      { key: 'rightPct', name: 'Right %', color: 'hsl(var(--chart-4))' },
                    ]}
                  />
                )}

                {/* Skill Moves */}
                {skillMovesData.length > 0 && (
                  <SkillMovesChart
                    title="Skill Moves Execution"
                    data={skillMovesData}
                  />
                )}

                {/* Conditioning - Endurance */}
                {enduranceData.length > 0 && (
                  <SimpleLineChart
                    title="Endurance / Aerobic"
                    data={enduranceData}
                    lines={[
                      { key: 'runTime', name: '5km Time (min)', color: 'hsl(var(--primary))' },
                      { key: 'avgHR', name: 'Avg HR (bpm)', color: 'hsl(var(--chart-2))' },
                    ]}
                  />
                )}

                {/* Conditioning - Speed */}
                {speedData.length > 0 && (
                  <SimpleLineChart
                    title="Speed / Anaerobic"
                    data={speedData}
                    lines={[
                      { key: 'maxSprint', name: 'Max Sprint 30m (sec)', color: 'hsl(var(--chart-3))' },
                      { key: 'hiitDistance', name: 'HIIT Distance (m)', color: 'hsl(var(--chart-4))' },
                    ]}
                  />
                )}

                {/* Strength - Core Lifts */}
                {coreLiftsData.length > 0 && (
                  <SimpleLineChart
                    title="Core Lifts"
                    data={coreLiftsData}
                    yAxisLabel="Weight (kg) / Reps"
                    lines={[
                      { key: 'squat', name: 'Squat (kg)', color: 'hsl(var(--chart-1))' },
                      { key: 'rdl', name: 'RDL (kg)', color: 'hsl(var(--chart-2))' },
                      { key: 'bench', name: 'Bench (kg)', color: 'hsl(var(--chart-3))' },
                      { key: 'pullUps', name: 'Pull-ups (reps)', color: 'hsl(var(--chart-4))' },
                    ]}
                  />
                )}

                {/* Strength - Explosiveness */}
                {explosivenessData.length > 0 && (explosivenessData.some((d: any) => d.boxJump > 0 || d.broadJump > 0)) && (
                  <SimpleLineChart
                    title="Explosiveness"
                    data={explosivenessData}
                    lines={[
                      { key: 'boxJump', name: 'Box Jump (cm)', color: 'hsl(var(--primary))' },
                      { key: 'broadJump', name: 'Broad Jump (m)', color: 'hsl(var(--chart-2))' },
                    ]}
                  />
                )}

                {shootingData.length === 0 && passingData.length === 0 && skillMovesData.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No workout data logged yet. Start tracking your workouts to see progress charts!</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="checkins" className="space-y-4">
                <CheckinSchedule
                  completedCheckIns={completedCheckIns.map((c) => ({
                    checkInNumber: c.checkInNumber,
                    checkInDate: new Date(c.checkInDate),
                  }))}
                  onStartCheckIn={handleStartCheckIn}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Custom Date Range Dialog */}
      <Dialog open={showCustomDateDialog} onOpenChange={setShowCustomDateDialog}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-custom-date-range">
          <DialogHeader>
            <DialogTitle>Custom Date Range</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-select-start-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                    data-testid="calendar-start-date"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-select-end-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    disabled={(date) => customStartDate ? date < customStartDate : false}
                    initialFocus
                    data-testid="calendar-end-date"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCustomDateDialog(false)}
              data-testid="button-cancel-custom-range"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (customStartDate && customEndDate) {
                  setWeeksFilter("custom");
                  setShowCustomDateDialog(false);
                }
              }}
              disabled={!customStartDate || !customEndDate}
              data-testid="button-apply-custom-range"
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
