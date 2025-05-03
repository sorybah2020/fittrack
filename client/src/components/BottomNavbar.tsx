import * as React from "react";
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
  
  // Create navbar items array including the add button
  const navElements = [];
  
  // Add the first two elements
  for (let i = 0; i < 2; i++) {
    const item = navItems[i];
    const isActive = location === item.path;
    const itemClass = cn(
      "flex flex-col items-center justify-center py-2",
      isActive ? "text-white" : "text-gray-500",
      "w-1/5"
    );
    
    navElements.push(
      <Link key={item.path} href={item.path} className={itemClass}>
        {item.icon}
        <span className="text-xs mt-1">{item.label}</span>
      </Link>
    );
  }
  
  // Add the center button
  navElements.push(
    <button
      key="add-button"
      onClick={onAddClick}
      className="w-1/5 flex flex-col items-center justify-center"
    >
      <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center">
        <Plus className="h-6 w-6 text-white" />
      </div>
    </button>
  );
  
  // Add the remaining elements
  for (let i = 2; i < navItems.length; i++) {
    const item = navItems[i];
    const isActive = location === item.path;
    const itemClass = cn(
      "flex flex-col items-center justify-center py-2",
      isActive ? "text-white" : "text-gray-500",
      "w-1/5"
    );
    
    navElements.push(
      <Link key={item.path} href={item.path} className={itemClass}>
        {item.icon}
        <span className="text-xs mt-1">{item.label}</span>
      </Link>
    );
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 bottom-tab border-t border-gray-800 safe-area-bottom z-10">
      <div className="flex items-center h-16">
        {navElements}
      </div>
    </div>
  );
}
