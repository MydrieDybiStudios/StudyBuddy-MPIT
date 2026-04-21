export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'overdue';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskRoleOwner = 'student' | 'teacher';

export interface Task {
  id: string;
  title: string;
  subject?: string;
  description?: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdBy: TaskRoleOwner;
  assignedToStudentId: string;
  createdAt: string;
  studentName?: string;
  teacherComment?: string;
  reminderMissedCount?: number;
}
