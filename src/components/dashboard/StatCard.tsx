import { IconType } from "react-icons";
import { FiChevronRight } from "react-icons/fi";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: IconType;
  iconBg: string;
  iconColor: string;
  hasArrow?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  hasArrow,
}: StatsCardProps) {
  return (
    <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
          <Icon size={22} strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">{title}</p>
        </div>
      </div>
      {hasArrow && <FiChevronRight className="text-slate-400" size={18} />}
    </div>
  );
}
