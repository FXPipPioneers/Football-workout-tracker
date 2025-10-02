import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import Dashboard from "@/pages/Dashboard";
import Log from "@/pages/Log";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import WorkoutRunner from "@/pages/WorkoutRunner";
import WorkoutEditor from "@/pages/WorkoutEditor";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/workouts" component={Log} />
      <Route path="/log" component={Log} />
      <Route path="/progress" component={Progress} />
      <Route path="/profile" component={Profile} />
      <Route path="/workout/:id" component={WorkoutRunner} />
      <Route path="/workout/:workoutId/edit" component={WorkoutEditor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Apply dark mode by default on initial load
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Router />
          <BottomNav />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
