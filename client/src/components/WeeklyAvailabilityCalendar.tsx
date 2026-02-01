import { Calendar, Clock } from "lucide-react";

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface WeeklyAvailabilityCalendarProps {
  availability: AvailabilitySlot[];
  compact?: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_SLOTS = [
  { label: "Morning", start: "06:00", end: "12:00" },
  { label: "Afternoon", start: "12:00", end: "18:00" },
  { label: "Evening", start: "18:00", end: "23:59" },
];

export function WeeklyAvailabilityCalendar({ 
  availability, 
  compact = false 
}: WeeklyAvailabilityCalendarProps) {
  // Check if tutor is available during a specific time period on a specific day
  const isAvailable = (dayOfWeek: number, periodStart: string, periodEnd: string): boolean => {
    return availability.some(slot => {
      if (slot.dayOfWeek !== dayOfWeek) return false;
      
      // Convert times to minutes for comparison
      const slotStart = timeToMinutes(slot.startTime);
      const slotEnd = timeToMinutes(slot.endTime);
      const periodStartMin = timeToMinutes(periodStart);
      const periodEndMin = timeToMinutes(periodEnd);
      
      // Check if there's any overlap
      return slotStart < periodEndMin && slotEnd > periodStartMin;
    });
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Weekly Availability
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day, dayIndex) => {
            const hasAvailability = availability.some(slot => slot.dayOfWeek === dayIndex);
            return (
              <div key={day} className="text-center">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {day}
                </div>
                <div 
                  className={`h-8 rounded flex items-center justify-center text-xs ${
                    hasAvailability 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {hasAvailability ? '✓' : '—'}
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-1 text-xs">
          {TIME_SLOTS.map(period => {
            const availableDays = DAYS.filter((_, dayIndex) => 
              isAvailable(dayIndex, period.start, period.end)
            ).length;
            
            return (
              <div 
                key={period.label}
                className={`p-1.5 rounded text-center ${
                  availableDays > 0
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <div className="font-medium">{period.label}</div>
                {availableDays > 0 && (
                  <div className="text-[10px] opacity-70">
                    {availableDays} day{availableDays !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full calendar view
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Calendar className="h-4 w-4" />
        Weekly Availability
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-8 bg-muted">
          <div className="p-2 text-xs font-medium border-r"></div>
          {DAYS.map(day => (
            <div key={day} className="p-2 text-xs font-medium text-center border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Time slots */}
        {TIME_SLOTS.map((period, idx) => (
          <div key={period.label} className={`grid grid-cols-8 ${idx !== TIME_SLOTS.length - 1 ? 'border-b' : ''}`}>
            <div className="p-2 text-xs font-medium border-r bg-muted/50 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {period.label}
            </div>
            {DAYS.map((_, dayIndex) => {
              const available = isAvailable(dayIndex, period.start, period.end);
              return (
                <div 
                  key={dayIndex}
                  className={`p-2 border-r last:border-r-0 flex items-center justify-center ${
                    available 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-background'
                  }`}
                >
                  {available && (
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Available
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-muted"></div>
          Not Available
        </div>
      </div>
    </div>
  );
}
