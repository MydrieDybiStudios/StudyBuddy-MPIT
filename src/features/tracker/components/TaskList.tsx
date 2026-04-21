import React from 'react';
import type { Task, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  title: string;
  description: string;
  tasks: Task[];
  emptyText: string;
  isLoading?: boolean;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  commentEditable?: boolean;
  onSaveComment?: (taskId: string, comment: string) => void;
  showStudentMeta?: boolean;
}

export function TaskList({
  title,
  description,
  tasks,
  emptyText,
  isLoading = false,
  onStatusChange,
  commentEditable = false,
  onSaveComment,
  showStudentMeta = false,
}: TaskListProps) {
  return (
    <section className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{tasks.length}</span>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-[26px] border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="w-full">
                  <div className="h-4 w-44 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-3/4 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
                </div>
                <div className="h-20 w-36 rounded-3xl bg-slate-200" />
              </div>
            </div>
          ))
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              commentEditable={commentEditable}
              onSaveComment={onSaveComment}
              showStudentMeta={showStudentMeta}
            />
          ))
        ) : (
          <div className="rounded-3xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">{emptyText}</div>
        )}
      </div>
    </section>
  );
}
