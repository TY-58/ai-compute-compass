import { format, addDays, startOfWeek } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeekSelectorProps {
  selectedWeek: string;
  onWeekChange: (week: string) => void;
  availableWeeks: string[];
}

export function WeekSelector({ selectedWeek, onWeekChange, availableWeeks }: WeekSelectorProps) {
  const selectedDate = selectedWeek ? new Date(selectedWeek) : new Date();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Get the Monday of the selected week
      const monday = startOfWeek(date, { weekStartsOn: 1 });
      onWeekChange(monday.toISOString().split('T')[0]);
    }
  };

  const isExistingWeek = availableWeeks.includes(selectedWeek);

  return (
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !selectedWeek && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedWeek ? (
              <span>
                Week of {format(selectedDate, 'MMM d, yyyy')}
              </span>
            ) : (
              <span>Select week</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {isExistingWeek && (
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
          Editing existing week
        </span>
      )}
      {!isExistingWeek && selectedWeek && (
        <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
          New week entry
        </span>
      )}
    </div>
  );
}
