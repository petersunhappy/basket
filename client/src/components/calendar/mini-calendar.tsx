import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CardTitle } from "@/components/ui/card";
import { Event } from "@shared/types";
import { useCalendar } from "@/hooks/use-calendar";
import { EventItem } from "./event-item";

interface MiniCalendarProps {
  events: Event[];
}

export function MiniCalendar({ events }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { getDaysWithEvents } = useCalendar();
  
  const daysWithEvents = getDaysWithEvents(events);
  
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  // Get the days for the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the days of the week
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  
  // Calculate days from previous month needed to fill the first row
  const dayOfWeek = monthStart.getDay(); // 0 for Sunday, 1 for Monday, etc.
  
  // Filter events for the next week
  const today = new Date();
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <CardTitle className="font-semibold text-neutral-medium">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </CardTitle>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Mini Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center mb-4">
        {/* Week days */}
        {weekDays.map((day, i) => (
          <div key={i} className="text-xs text-neutral-medium font-semibold">{day}</div>
        ))}
        
        {/* Empty cells for days before the start of the month */}
        {Array.from({ length: dayOfWeek }).map((_, index) => (
          <div key={`empty-start-${index}`} className="text-sm py-1 text-gray-400"></div>
        ))}
        
        {/* Days of the month */}
        {days.map(day => {
          const isToday = isSameDay(day, new Date());
          const hasEvent = daysWithEvents.some(eventDay => isSameDay(day, parseISO(eventDay)));
          
          return (
            <div 
              key={day.toString()}
              className={`text-sm py-1 relative ${
                isToday 
                  ? 'font-bold bg-primary text-white rounded-full' 
                  : ''
              }`}
            >
              {format(day, 'd')}
              {hasEvent && !isToday && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Upcoming Events List */}
      <div className="space-y-3 mt-6">
        <h3 className="font-semibold text-secondary">Eventos dos próximos dias:</h3>
        
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(event => (
            <EventItem key={event.id} event={event} />
          ))
        ) : (
          <p className="text-sm text-neutral-medium py-2">Nenhum evento agendado para os próximos dias.</p>
        )}
      </div>
    </>
  );
}
