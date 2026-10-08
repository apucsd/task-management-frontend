import { IconType } from "react-icons";
import { FiChevronRight } from "react-icons/fi";
import Link from "next/link";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: IconType;
  iconBg: string;
  iconColor: string;
  hasArrow?: boolean;
  href?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  hasArrow,
  href,
}: StatsCardProps) {
  const content = (
    <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-200 transition duration-200">
      <div className="flex items-center gap-4 min-w-0">
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor} shrink-0`}>
          <Icon size={22} strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <h3 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">
            {value}
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
            {title}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {hasArrow && <FiChevronRight className="text-slate-400 shrink-0" size={18} />}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block group cursor-pointer">
        {content}
      </Link>
    );
  }

  return content;
}
