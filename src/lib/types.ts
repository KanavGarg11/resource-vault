export type ResourceType =
  | "study"
  | "assignment"
  | "link"
  | "media"
  | "note"
  | "timetable"
  | "calendar";

export type ResourcePriority = "low" | "normal" | "high" | "urgent";

export type ResourceStatus = "pending" | "in-progress" | "completed";

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: ResourceType;
  category: string | null;
  semester: string | null;
  url: string | null;
  filePath: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  tags: string | null;
  isPinned: boolean;
  dueDate: string | Date | null;
  status: ResourceStatus | null;
  priority: ResourcePriority | null;
  createdAt: string | Date;
  updatedAt: string | Date;
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
}

export interface AcademicEvent {
  id: string;
  title: string;
  eventType: "exam" | "holiday" | "deadline" | "calendar" | string;
  startDate: string | Date;
  endDate: string | Date | null;
  description: string | null;
}

export interface Subject {
  id: string;
  name: string;
  code: string | null;
  color: string | null;
  semester: string | null;
}
