import { useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  BarChart3, 
  Heart, 
  Plus,
  PlayCircle,
  User,
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
      label: "Videos",
      icon: <PlayCircle className="h-6 w-6" />,
      path: "/workout-videos"
    },
    {
      label: "Profile",
      icon: <User className="h-6 w-6" />,
      path: "/profile"
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 bottom-tab border-t border-gray-800 safe-area-bottom z-10">
      <div className="flex items-center h-16">
        {/* First two navigation items */}
        <Link key="nav-summary" href={navItems[0].path} className={cn(
          "flex flex-col items-center justify-center py-2",
          location === navItems[0].path ? "text-white" : "text-gray-500",
          "w-1/5"
        )}>
          {navItems[0].icon}
          <span className="text-xs mt-1">{navItems[0].label}</span>
        </Link>
        
        <Link key="nav-workouts" href={navItems[1].path} className={cn(
          "flex flex-col items-center justify-center py-2",
          location === navItems[1].path ? "text-white" : "text-gray-500",
          "w-1/5"
        )}>
          {navItems[1].icon}
          <span className="text-xs mt-1">{navItems[1].label}</span>
        </Link>
        
        {/* Add button in the middle */}
        <button
          key="add-button"
          onClick={onAddClick}
          className="w-1/5 flex flex-col items-center justify-center"
        >
          <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center">
            <Plus className="h-6 w-6 text-white" />
          </div>
        </button>
        
        {/* Last two navigation items */}
        <Link key="nav-videos" href={navItems[2].path} className={cn(
          "flex flex-col items-center justify-center py-2",
          location === navItems[2].path ? "text-white" : "text-gray-500",
          "w-1/5"
        )}>
          {navItems[2].icon}
          <span className="text-xs mt-1">{navItems[2].label}</span>
        </Link>
        
        <Link key="nav-profile" href={navItems[3].path} className={cn(
          "flex flex-col items-center justify-center py-2",
          location === navItems[3].path ? "text-white" : "text-gray-500",
          "w-1/5"
        )}>
          {navItems[3].icon}
          <span className="text-xs mt-1">{navItems[3].label}</span>
        </Link>
      </div>
    </div>
  );
}