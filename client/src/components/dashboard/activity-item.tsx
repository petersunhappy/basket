import { LucideIcon } from "lucide-react";

interface ActivityItemProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  date: string;
}

export function ActivityItem({
  icon: Icon,
  iconColor,
  title,
  description,
  date,
}: ActivityItemProps) {
  const bgColorClass = `bg-${iconColor} bg-opacity-10`;
  const textColorClass = `text-${iconColor}`;
  
  return (
    <li className="py-3 flex items-start">
      <div className={`${bgColorClass} p-2 rounded-full mr-4`}>
        <Icon className={`h-5 w-5 ${textColorClass}`} />
      </div>
      <div className="flex-1">
        <p className="text-secondary font-semibold">{title}</p>
        <p className="text-sm text-neutral-medium">{description}</p>
        <p className="text-xs text-neutral-medium mt-1">{date}</p>
      </div>
    </li>
  );
}
