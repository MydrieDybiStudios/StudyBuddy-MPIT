import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, MessageSquare, PlayCircle, RotateCcw, Save } from 'lucide-react';
import type { Task, TaskStatus } from '../types/task';
import { formatDeadline } from '../utils/deadline';
import {
  getTaskPriorityLabel,
  getTaskPriorityTone,
  getTaskStatusLabel,
  getTaskStatusTone,
} from '../utils/taskStatus';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  commentEditable?: boolean;
  onSaveComment?: (taskId: string, comment: string) => void;
  showStudentMeta?: boolean;
}

export function TaskCard({ task, onStatusChange, commentEditable = false, onSaveComment, showStudentMeta = false }: TaskCardProps) {
  const [draftComment, setDraftComment] = useState(task.teacherComment ?? '');

  useEffect(() => {
    setDraftComment(task.teacherComment ?? '');
  }, [task.teacherComment]);

  const canStart = task.status === 'todo';
  const canComplete = task.status === 'in_progress' || task.status === 'overdue' || task.status === 'todo';
  const canReset = task.status === 'done' || task.status === 'in_progress' || task.status === 'overdue';

  return (
    <article className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getTaskPriorityTone(task.priority)}`}>
              {getTaskPriorityLabel(task.priority)}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getTaskStatusTone(task.status)}`}>
              {getTaskStatusLabel(task.status)}
            </span>
            {task.subject && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{task.subject}</span>}
          </div>
          <h3 className="text-base font-semibold text-slate-950 md:text-lg">{task.title}</h3>
          {task.description && <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>}
          {showStudentMeta && task.studentName && <p className="mt-2 text-sm text-slate-500">Ученик: {task.studentName}</p>}
        </div>

        <div className="min-w-52 rounded-3xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Clock3 className="h-4 w-4" />
            {formatDeadline(task.deadline)}
          </div>
          {typeof task.reminderMissedCount === 'number' && task.reminderMissedCount > 0 && (
            <p className="mt-3 text-xs text-rose-600">Пропущено напоминаний: {task.reminderMissedCount}</p>
          )}
        </div>
      </div>

      {task.teacherComment && !commentEditable && (
        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <MessageSquare className="h-4 w-4" />
            Комментарий
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{task.teacherComment}</p>
        </div>
      )}

      {commentEditable && onSaveComment && (
        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <MessageSquare className="h-4 w-4" />
            Комментарий учителя
          </div>
          <textarea
            value={draftComment}
            onChange={(event) => setDraftComment(event.target.value)}
            className="mt-3 min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            placeholder="Добавь короткий комментарий к задаче"
          />
          <button
            onClick={() => onSaveComment(task.id, draftComment)}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Save className="mr-2 h-4 w-4" />
            Сохранить комментарий
          </button>
        </div>
      )}

      {onStatusChange && (
        <div className="mt-4 flex flex-wrap gap-3">
          {canStart && (
            <button
              onClick={() => onStatusChange(task.id, 'in_progress')}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Начать
            </button>
          )}
          {canComplete && (
            <button
              onClick={() => onStatusChange(task.id, 'done')}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Выполнено
            </button>
          )}
          {canReset && (
            <button
              onClick={() => onStatusChange(task.id, 'todo')}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Вернуть в план
            </button>
          )}
        </div>
      )}
    </article>
  );
}
