import React, { useEffect, useState } from 'react';
import { LoaderCircle, Sparkles, X } from 'lucide-react';
import type { CreateTaskInput } from '../hooks/useTasks';
import type { TaskRoleOwner } from '../types/task';
import { parseTaskFromText } from '../utils/parserMock';
import { gigachatClient } from '../../../services/gigachat/client';

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAddTask: (input: CreateTaskInput) => void;
  defaultCreatedBy?: TaskRoleOwner;
}

function formatDateTimeInput(value: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function AddTaskModal({ open, onClose, onAddTask, defaultCreatedBy = 'student' }: AddTaskModalProps) {
  const [rawInput, setRawInput] = useState('Алгебра №245 до пятницы');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isParsing, setIsParsing] = useState(false);
  const [aiNotice, setAiNotice] = useState('AI-режим готов. Если backend недоступен, сработает локальный parser fallback.');

  useEffect(() => {
    if (open) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      setDeadline(formatDateTimeInput(tomorrow.toISOString()));
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = () => {
    if (!title.trim() || !deadline) {
      return;
    }

    onAddTask({
      title: title.trim(),
      subject: subject.trim() || undefined,
      deadline: new Date(deadline).toISOString(),
      priority,
      createdBy: defaultCreatedBy,
    });

    setTitle('');
    setSubject('');
    setPriority('medium');
    setRawInput('Алгебра №245 до пятницы');
    onClose();
  };

  const handleParse = async () => {
    setIsParsing(true);

    try {
      const parsed = await gigachatClient.parseTask(rawInput);
      setTitle(parsed.title);
      setSubject(parsed.subject ?? '');
      setPriority(parsed.priority);
      setDeadline(formatDateTimeInput(parsed.deadline));
      setAiNotice(`AI выделил предмет и дедлайн. Оценка времени: ${parsed.recommendedEstimatedTime ?? '20–30 минут'}.`);
    } catch {
      const parsed = parseTaskFromText(rawInput);
      setTitle(parsed.title);
      setSubject(parsed.subject ?? '');
      setPriority(parsed.priority);
      setDeadline(formatDateTimeInput(parsed.deadline));
      setAiNotice('AI backend недоступен, поэтому применен локальный parser fallback.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Новая задача</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Добавить задачу в трекер</h2>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-slate-100 p-3 text-slate-700 transition hover:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 rounded-[28px] bg-slate-50 p-5">
          <label className="text-sm font-medium text-slate-800">Вставь задание текстом</label>
          <textarea
            value={rawInput}
            onChange={(event) => setRawInput(event.target.value)}
            className="mt-3 min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            placeholder="Например: алгебра №245 до пятницы"
          />
          <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
            {aiNotice}
          </div>
          <button
            onClick={handleParse}
            disabled={isParsing}
            className="mt-3 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {isParsing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isParsing ? 'AI анализирует задание' : 'Разобрать автоматически'}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-800">Название</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Например: Решить №245 и №246"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-800">Предмет</label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Алгебра"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-800">Дедлайн</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-800">Приоритет</label>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as 'low' | 'medium' | 'high')}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleSubmit}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Сохранить задачу
          </button>
          <button
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
