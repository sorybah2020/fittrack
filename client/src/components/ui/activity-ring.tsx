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
  background = "#1C1C1E",
  className,
}: ActivityRingProps) {
  const sizes = {
    sm: 70,
    md: 100,
    lg: 136,
  };

  const dimension = sizes[size];
  const radius = dimension / 2 - thickness / 2;
  const circumference = 2 * Math.PI * radius;
  // Ensure progress is between 0-100 and dashoffset is a valid number
  const safeProgress = Math.min(Math.max(0, progress || 0), 100);
  const dashoffset = circumference - (safeProgress / 100) * circumference;

  return (
    <svg
      className={cn("activity-ring", className)}
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}
    >
      {/* Background ring with slight transparency */}
      <circle
        cx={dimension / 2}
        cy={dimension / 2}
        r={radius}
        fill="none"
        stroke={background}
        strokeWidth={thickness}
        opacity={0.3}
      />
      
      {/* Progress ring with glow effect */}
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
        filter="url(#glow)"
      />
      
      {/* Glow filter definition */}
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export function ActivityRings({
  moveProgress = 0,
  exerciseProgress = 0,
  standProgress = 0,
  children,
  size = "md",
}: {
  moveProgress: number;
  exerciseProgress: number;
  standProgress: number;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  // Ensure progress values are valid numbers
  const safeMoveProgress = Math.min(Math.max(0, moveProgress || 0), 100);
  const safeExerciseProgress = Math.min(Math.max(0, exerciseProgress || 0), 100);
  const safeStandProgress = Math.min(Math.max(0, standProgress || 0), 100);
  // Size classes based on the parent container
  const containerSizes = {
    sm: "w-32 h-32",
    md: "w-40 h-40",
    lg: "w-48 h-48",
  };
  
  // Size mapping for the individual rings
  const ringSizes: Record<string, {
    outer: "sm" | "md" | "lg",
    middle: "sm" | "md" | "lg",
    inner: "sm" | "md" | "lg"
  }> = {
    sm: { outer: "sm", middle: "sm", inner: "sm" },
    md: { outer: "md", middle: "sm", inner: "sm" },
    lg: { outer: "lg", middle: "md", inner: "sm" },
  };
  
  const ringSize = ringSizes[size];
  const containerSize = containerSizes[size];
  
  return (
    <div className={`relative ${containerSize} flex items-center justify-center`}>
      {/* Move ring (outer) */}
      <ActivityRing
        size={ringSize.outer}
        progress={moveProgress}
        color="#FF453A"
        thickness={10}
        className="absolute"
      />
      
      {/* Exercise ring (middle) */}
      <ActivityRing
        size={ringSize.middle}
        progress={exerciseProgress}
        color="#92F73A"
        thickness={10}
        className="absolute"
      />
      
      {/* Stand ring (inner) */}
      <ActivityRing
        size={ringSize.inner}
        progress={standProgress}
        color="#30D1F9"
        thickness={10}
        className="absolute"
      />
      
      {/* Center content */}
      <div className="text-center z-10">
        {children}
      </div>
    </div>
  );
}
