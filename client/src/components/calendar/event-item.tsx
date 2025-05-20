import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Event } from "@shared/types";

interface EventItemProps {
  event: Event;
}

export function EventItem({ event }: EventItemProps) {
  // Determine the border color based on event type
  const getBorderColor = () => {
    switch (event.type) {
      case "game":
        return "border-accent";
      case "training":
        return "border-primary";
      case "other":
        return "border-secondary";
      default:
        return "border-gray-300";
    }
  };
  
  const formattedDate = format(parseISO(event.date), "EEEE, dd MMM • HH:mm", { locale: ptBR });
  
  return (
    <div className={`flex items-start py-2 border-l-3 ${getBorderColor()} pl-3`}>
      <div className="flex-1">
        <p className="font-semibold">{event.title}</p>
        <p className="text-sm text-neutral-medium">{formattedDate}</p>
        <p className="text-sm text-neutral-medium">{event.location}</p>
      </div>
    </div>
  );
}
