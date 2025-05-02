import { useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  BarChart3, 
  Heart, 
  User, 
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface BottomNavbarProps {
  onAddClick: () => void;
}

export function BottomNavbar({ onAddClick }: BottomNavbarProps) {
  const [location] = useLocation();
  
  const navItems: BottomNavItem[] = [
    {
      label: "Summary",
      icon: <BarChart3 className="h-6 w-6" />,
      path: "/"
    },
    {
      label: "Workouts",
      icon: <Heart className="h-6 w-6" />,
      path: "/workouts"
    },
    {
      label: "Profile",
      icon: <User className="h-6 w-6" />,
      path: "/profile"
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-95 bottom-tab border-t border-gray-200 safe-area-bottom z-10">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item, index) => {
          const isActive = location === item.path;
          const itemClass = cn(
            "flex flex-col items-center justify-center",
            isActive ? "text-primary" : "text-neutral-mid"
          );
          
          if (index === 1) {
            return (
              <div key={item.path} className="flex flex-col items-center justify-center">
                <Link href={item.path} className={itemClass}>
                  {item.icon}
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              </div>
            );
          }
          
          return (
            <Link key={item.path} href={item.path} className={itemClass}>
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
        
        <div className="flex flex-col items-center justify-center">
          <button 
            onClick={onAddClick}
            className="rounded-full bg-primary w-12 h-12 flex items-center justify-center"
          >
            <Plus className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
