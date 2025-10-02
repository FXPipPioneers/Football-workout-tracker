import { Home, Calendar, TrendingUp, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Today", path: "/" },
    { icon: Calendar, label: "Workouts", path: "/workouts" },
    { icon: TrendingUp, label: "Progress", path: "/progress" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors min-w-[64px] ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover-elevate active-elevate-2"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
