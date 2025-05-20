import { useMemo } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Event } from '@shared/types';

export function useCalendar() {
  // Function to get array of dates that have events
  const getDaysWithEvents = (events: Event[]) => {
    return events.map(event => event.date);
  };
  
  // Function to group events by date
  const getEventsByDate = (events: Event[]) => {
    return events.reduce((acc: Record<string, Event[]>, event) => {
      const dateKey = format(parseISO(event.date), 'yyyy-MM-dd');
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
      acc[dateKey].push(event);
      return acc;
    }, {});
  };
  
  // Function to check if date has events
  const hasEventsOnDate = (events: Event[], date: Date) => {
    return events.some(event => isSameDay(parseISO(event.date), date));
  };
  
  // Function to get events for a specific date
  const getEventsForDate = (events: Event[], date: Date) => {
    return events.filter(event => isSameDay(parseISO(event.date), date));
  };
  
  // Format date for display
  const formatEventDate = (date: string) => {
    return format(parseISO(date), "EEEE, dd 'de' MMMM 'de' yyyy • HH:mm", { locale: ptBR });
  };
  
  return {
    getDaysWithEvents,
    getEventsByDate,
    hasEventsOnDate,
    getEventsForDate,
    formatEventDate
  };
}
