import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { User, Moon, Bell, Download, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const { data: stats } = useQuery<{
    totalSessions: number;
    currentStreak: number;
    thisWeekSessions: number;
    averageAccuracy: number;
  }>({
    queryKey: ["/api/sessions/stats"],
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Athlete</h2>
              <p className="text-sm text-muted-foreground">Football Training</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Total Workouts</p>
                <p className="text-2xl font-display font-bold" data-testid="text-total-workouts">
                  {stats?.totalSessions ?? 0}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                <p className="text-2xl font-display font-bold" data-testid="text-current-streak">
                  {stats?.currentStreak ?? 0} {stats?.currentStreak === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
                data-testid="switch-dark-mode"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="notifications">Notifications</Label>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                data-testid="switch-notifications"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Export all your workout data and progress logs
          </p>
          <Button className="w-full" variant="outline" data-testid="button-export-all">
            <Download className="h-4 w-4 mr-2" />
            Export All Data (CSV)
          </Button>
        </Card>
      </div>
    </div>
  );
}
