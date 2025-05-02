import { useState, useEffect } from "react";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateSelectorProps {
  onDateSelected: (date: Date) => void;
  selectedDate?: Date;
}

export function DateSelector({ onDateSelected, selectedDate }: DateSelectorProps) {
  const [dates, setDates] = useState<Date[]>([]);
  
  useEffect(() => {
    // Generate dates for the current week
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
    
    const weekDates = Array.from({ length: 7 }, (_, i) => 
      addDays(weekStart, i)
    );
    
    setDates(weekDates);
    
    // If no date is selected, default to today
    if (!selectedDate) {
      onDateSelected(today);
    }
  }, [onDateSelected, selectedDate]);

  return (
    <div className="flex space-x-4 overflow-x-auto py-2 -mx-5 px-5 scrollbar-hide">
      {dates.map((date) => {
        const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
        
        return (
          <Button
            key={date.toISOString()}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center px-4 py-2 rounded-lg",
              isSelected ? "bg-primary text-white" : "bg-neutral-light"
            )}
            onClick={() => onDateSelected(date)}
          >
            <span className={cn(
              "text-xs",
              isSelected ? "opacity-80" : "text-neutral-mid"
            )}>
              {format(date, 'EEE')}
            </span>
            <span className="font-medium">
              {format(date, 'd')}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
