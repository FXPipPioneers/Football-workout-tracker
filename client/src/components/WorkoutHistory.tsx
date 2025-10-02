import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Circle } from "lucide-react";

interface HistoryItem {
  id: string;
  date: string;
  day: string;
  title: string;
  completion: number;
  completed: boolean;
}

interface WorkoutHistoryProps {
  items: HistoryItem[];
}

export default function WorkoutHistory({ items }: WorkoutHistoryProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card
          key={item.id}
          className="p-4 hover-elevate active-elevate-2 cursor-pointer"
          data-testid={`history-item-${item.id}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {item.completed ? (
                <div className="p-2 rounded-full bg-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-muted">
                  <Circle className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {item.day}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{item.date}</span>
                </div>
              </div>
              <h4 className="font-medium text-sm truncate">{item.title}</h4>
            </div>

            <div className="flex-shrink-0">
              <Badge
                variant={item.completed ? "default" : "secondary"}
                className={!item.completed ? "bg-muted" : ""}
              >
                {item.completion}%
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
