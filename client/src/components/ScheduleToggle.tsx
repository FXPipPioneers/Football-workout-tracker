import { Button } from "@/components/ui/button";

interface ScheduleToggleProps {
  mode: "solo" | "friend";
  onChange: (mode: "solo" | "friend") => void;
}

export default function ScheduleToggle({ mode, onChange }: ScheduleToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant={mode === "solo" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("solo")}
        className="relative"
        data-testid="button-solo-mode"
      >
        Solo
      </Button>
      <Button
        variant={mode === "friend" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("friend")}
        data-testid="button-friend-mode"
      >
        Friend
      </Button>
    </div>
  );
}
