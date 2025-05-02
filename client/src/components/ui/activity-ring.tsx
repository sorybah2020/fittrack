import { cn } from "@/lib/utils";

interface ActivityRingProps {
  size?: "sm" | "md" | "lg";
  progress: number; // 0-100
  thickness?: number;
  color: string;
  background?: string;
  className?: string;
}

export function ActivityRing({
  size = "md",
  progress = 0,
  thickness = 8,
  color,
  background = "#F2F2F7",
  className,
}: ActivityRingProps) {
  const sizes = {
    sm: 60,
    md: 100,
    lg: 150,
  };

  const dimension = sizes[size];
  const radius = dimension / 2 - thickness / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      className={cn("activity-ring", className)}
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}
    >
      <circle
        cx={dimension / 2}
        cy={dimension / 2}
        r={radius}
        fill="none"
        stroke={background}
        strokeWidth={thickness}
      />
      <circle
        cx={dimension / 2}
        cy={dimension / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ActivityRings({
  moveProgress,
  exerciseProgress,
  standProgress,
  children,
}: {
  moveProgress: number;
  exerciseProgress: number;
  standProgress: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Move ring (outer) */}
      <ActivityRing
        size="lg"
        progress={moveProgress}
        color="#FF3B30"
        thickness={8}
        className="absolute"
      />
      
      {/* Exercise ring (middle) */}
      <ActivityRing
        size="md"
        progress={exerciseProgress}
        color="#FFCC00"
        thickness={8}
        className="absolute"
      />
      
      {/* Stand ring (inner) */}
      <ActivityRing
        size="sm"
        progress={standProgress}
        color="#34C759"
        thickness={8}
        className="absolute"
      />
      
      {/* Center content */}
      <div className="text-center z-10">
        {children}
      </div>
    </div>
  );
}
