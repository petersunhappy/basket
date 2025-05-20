import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  progress?: {
    value: number;
    max: number;
    label: string;
  };
  subtext?: string;
  date?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  progress,
  subtext,
  date,
}: StatsCardProps) {
  // Determine border color based on the passed color
  const borderColor = `border-${color}`;
  const bgColor = `bg-${color}`;
  
  // Calculate progress percentage if progress is provided
  const progressPercentage = progress ? Math.round((progress.value / progress.max) * 100) : null;
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${borderColor}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-neutral-medium">{title}</h3>
          <p className="text-3xl font-accent font-bold mt-1">{value}</p>
        </div>
        <div className={`p-2 ${bgColor} bg-opacity-10 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
      </div>
      
      {progress && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-neutral-medium">{progress.label}</span>
            <span className="text-xs font-semibold">{progressPercentage}%</span>
          </div>
          <Progress value={progress.value} max={progress.max} color={bgColor} />
        </div>
      )}
      
      {subtext && (
        <p className="mt-4 text-sm">
          <span className="font-semibold">{subtext}</span>
          {date && <br />}
          {date && <span className="text-neutral-medium">{date}</span>}
        </p>
      )}
    </div>
  );
}
