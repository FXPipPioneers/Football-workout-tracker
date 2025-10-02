import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { format, isPast, isFuture, startOfDay, isSameDay } from "date-fns";

interface CheckinScheduleProps {
  completedCheckIns: Array<{
    checkInNumber: number;
    checkInDate: Date;
  }>;
  onStartCheckIn: (checkInNumber: number, scheduledDate: Date) => void;
}

const SCHEDULED_CHECKINS = [
  { number: 1, date: new Date("2025-10-30"), label: "Week 4" },
  { number: 2, date: new Date("2025-11-29"), label: "Week 8" },
  { number: 3, date: new Date("2025-12-30"), label: "Week 12" },
];

export default function CheckinSchedule({
  completedCheckIns,
  onStartCheckIn,
}: CheckinScheduleProps) {
  const isCheckInCompleted = (checkInNumber: number) => {
    return completedCheckIns.some((c) => c.checkInNumber === checkInNumber);
  };

  const getCheckInStatus = (scheduledDate: Date) => {
    const today = startOfDay(new Date());
    const checkInDay = startOfDay(scheduledDate);
    
    if (isSameDay(today, checkInDay)) {
      return "due-today";
    }
    if (isPast(checkInDay)) {
      return "overdue";
    }
    return "upcoming";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Check-in Schedule</h3>
        <p className="text-sm text-muted-foreground">
          {completedCheckIns.length} of {SCHEDULED_CHECKINS.length} completed
        </p>
      </div>

      <div className="space-y-3">
        {SCHEDULED_CHECKINS.map((checkin) => {
          const completed = isCheckInCompleted(checkin.number);
          const status = getCheckInStatus(checkin.date);
          const completedData = completedCheckIns.find(
            (c) => c.checkInNumber === checkin.number
          );

          return (
            <Card
              key={checkin.number}
              className={`p-4 ${
                completed
                  ? "border-primary/50 bg-primary/5"
                  : status === "overdue"
                  ? "border-destructive/50"
                  : ""
              }`}
              data-testid={`card-checkin-${checkin.number}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    )}
                    <h4 className="font-semibold">
                      Check-in #{checkin.number} — {checkin.label}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Clock className="h-4 w-4" />
                    <span>
                      Scheduled: {format(checkin.date, "MMM dd, yyyy")}
                    </span>
                  </div>

                  {completed && completedData && (
                    <p className="text-sm text-primary font-medium">
                      Completed on{" "}
                      {format(new Date(completedData.checkInDate), "MMM dd, yyyy")}
                    </p>
                  )}

                  {!completed && (
                    <div className="flex items-center gap-2">
                      {status === "overdue" && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                      {status === "due-today" && (
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                          Due Today
                        </Badge>
                      )}
                      {status === "upcoming" && (
                        <Badge variant="secondary" className="text-xs">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant={completed ? "outline" : "default"}
                  size="sm"
                  onClick={() => onStartCheckIn(checkin.number, checkin.date)}
                  data-testid={`button-checkin-${checkin.number}`}
                >
                  {completed ? "View" : "Start"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Check-ins help you track your progress and
          prepare for coach meetings. Complete them on or near the scheduled
          dates to get the most accurate progress assessment.
        </p>
      </Card>
    </div>
  );
}
