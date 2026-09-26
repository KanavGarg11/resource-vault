export type CardTheme =
  | "study"
  | "study-to-do"
  | "schedules"
  | "to-do"
  | "personal";

export type CardItemType = "text" | "link" | "image" | "pdf" | "file";

export interface CardItem {
  id: string;
  cardId: string;
  type: CardItemType;
  content: string | null;
  filePath: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string | Date;
}

export interface Card {
  id: string;
  title: string;
  theme: CardTheme;
  isPinned: boolean;
  isPublic?: boolean;
  shareToken?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  items?: CardItem[];
  _count?: {
    items: number;
  };
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: string;
  subject: string;
  code: string | null;
  startTime: string;
  endTime: string;
  room: string | null;
  professor: string | null;
  order: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const THEME_CONFIG: Record<
  CardTheme,
  { label: string; href: string; color: string; bg: string; border: string; icon: string }
> = {
  study: {
    label: "Study",
    href: "/theme/study",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    border: "border-blue-200 dark:border-blue-900/60",
    icon: "BookOpen",
  },
  "study-to-do": {
    label: "Study To-Do",
    href: "/theme/study-to-do",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    border: "border-amber-200 dark:border-amber-900/60",
    icon: "Clock",
  },
  schedules: {
    label: "Schedules",
    href: "/theme/schedules",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/50",
    border: "border-violet-200 dark:border-violet-900/60",
    icon: "CalendarDays",
  },
  "to-do": {
    label: "To-Do",
    href: "/theme/to-do",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    border: "border-emerald-200 dark:border-emerald-900/60",
    icon: "CheckSquare",
  },
  personal: {
    label: "Personal",
    href: "/theme/personal",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/50",
    border: "border-rose-200 dark:border-rose-900/60",
    icon: "Sparkles",
  },
};
