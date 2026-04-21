import { useEffect, useMemo, useState } from 'react';
import { mockTasks } from '../mocks/tasks';
import { trackerStudent } from '../mocks/users';
import type { Task, TaskPriority, TaskRoleOwner, TaskStatus } from '../types/task';
import type { AnalyticsSummary, AiInsight, StudyNotification } from '../types/notification';
import type { TrackerRole } from '../types/user';
import { isTomorrow, toDate } from '../utils/deadline';
import { groupTasksByTimeline, normalizeTask } from '../utils/taskStatus';
import { getStoredJson, setStoredJson } from '../../../services/storage/localStorage';
import { sessionService } from '../../../services/auth/session.service';
import { supabaseTaskService } from '../../../services/supabase/task.service';

const STORAGE_KEY = 'studybuddy.tracker.tasks';
const WEEKDAYS_RU = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

export interface CreateTaskInput {
  title: string;
  subject?: string;
  description?: string;
  deadline: string;
  priority: TaskPriority;
  createdBy?: TaskRoleOwner;
}

function loadInitialTasks() {
  return getStoredJson<Task[]>(STORAGE_KEY, mockTasks);
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadInitialTasks);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setStoredJson(STORAGE_KEY, tasks);
  }, [tasks]);

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      if (!supabaseTaskService.isEnabled) {
        window.setTimeout(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        }, 220);
        return;
      }

      try {
        const session = await sessionService.restoreSession();
        if (session?.id) {
          const remoteTasks = await supabaseTaskService.listTasks(session.id);
          if (isMounted && remoteTasks.length > 0) {
            setTasks(remoteTasks);
          }
        }
      } catch {
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedTasks = useMemo(() => tasks.map((task) => normalizeTask(task)), [tasks]);
  const groupedTasks = useMemo(() => groupTasksByTimeline(tasks), [tasks]);

  const stats = useMemo(() => {
    const total = normalizedTasks.length;
    const completedCount = normalizedTasks.filter((task) => task.status === 'done').length;
    const overdueCount = normalizedTasks.filter((task) => task.status === 'overdue').length;
    const inProgressCount = normalizedTasks.filter((task) => task.status === 'in_progress').length;
    const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    const streak = Math.max(2, completedCount);
    const points = completedCount * 15 + (total - overdueCount) * 3;

    return {
      total,
      completedCount,
      overdueCount,
      inProgressCount,
      completionRate,
      streak,
      points,
    };
  }, [normalizedTasks]);

  const analytics = useMemo<AnalyticsSummary>(() => {
    const subjectMap = new Map<string, { total: number; risky: number }>();
    const weekdayMap = new Map<string, number>();

    normalizedTasks.forEach((task) => {
      const subject = task.subject ?? 'Без предмета';
      const currentSubject = subjectMap.get(subject) ?? { total: 0, risky: 0 };
      const riskyIncrement = task.status === 'overdue' || task.status === 'in_progress' ? 1 : 0;
      subjectMap.set(subject, {
        total: currentSubject.total + 1,
        risky: currentSubject.risky + riskyIncrement,
      });

      const weekday = WEEKDAYS_RU[toDate(task.deadline).getDay()];
      weekdayMap.set(weekday, (weekdayMap.get(weekday) ?? 0) + 1);
    });

    const weakestSubject =
      [...subjectMap.entries()].sort((left, right) => {
        const leftScore = left[1].risky / left[1].total;
        const rightScore = right[1].risky / right[1].total;
        return rightScore - leftScore;
      })[0]?.[0] ?? 'Алгебра';

    const busiestWeekday = [...weekdayMap.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'пятница';
    const tomorrowCount = normalizedTasks.filter((task) => task.status !== 'done' && isTomorrow(task.deadline)).length;
    const overdueSubjects = [...new Set(normalizedTasks.filter((task) => task.status === 'overdue').map((task) => task.subject ?? 'Без предмета'))];
    const reviewQueueCount = normalizedTasks.filter((task) => task.createdBy === 'teacher' && (task.status === 'in_progress' || task.status === 'overdue')).length;

    return {
      weakestSubject,
      busiestWeekday,
      tomorrowCount,
      overdueSubjects,
      reviewQueueCount,
    };
  }, [normalizedTasks]);

  const notifications = useMemo<StudyNotification[]>(() => {
    const totalMissedReminders = normalizedTasks.reduce((sum, task) => sum + (task.reminderMissedCount ?? 0), 0);
    const items: StudyNotification[] = [];

    if (groupedTasks.overdue.length > 0) {
      items.push({
        id: 'student-overdue-alert',
        role: 'student',
        title: 'Просроченные задачи',
        message: `У тебя ${groupedTasks.overdue.length} задач(и) с просроченным сроком. Начни с самой близкой по дедлайну.`,
        severity: 'critical',
      });
      items.push({
        id: 'parent-overdue-alert',
        role: 'parent',
        title: 'Нужен сигнал родителю',
        message: `У ребенка ${groupedTasks.overdue.length} просроченных задач. Лучше подключиться сегодня.`,
        severity: 'critical',
      });
    }

    if (groupedTasks.today.length > 0) {
      items.push({
        id: 'student-today-reminder',
        role: 'student',
        title: 'Напоминание на сегодня',
        message: `На сегодня запланировано ${groupedTasks.today.length} задач(и). Самое важное стоит закрыть до вечера.`,
        severity: 'warning',
      });
    }

    if (analytics.reviewQueueCount > 0) {
      items.push({
        id: 'teacher-review-queue',
        role: 'teacher',
        title: 'Есть задания под контролем',
        message: `В зоне внимания ${analytics.reviewQueueCount} задач(и): часть в работе, часть уже рискует уйти в просрочку.`,
        severity: 'warning',
      });
    }

    if (totalMissedReminders > 0) {
      items.push({
        id: 'parent-reminder-signal',
        role: 'parent',
        title: 'Сигнал по напоминаниям',
        message: `Система заметила ${totalMissedReminders} пропущенных напоминаний. Это может означать потерю темпа.`,
        severity: 'warning',
      });
    }

    if (stats.completionRate >= 60) {
      items.push({
        id: 'success-progress',
        role: 'all',
        title: 'Прогресс растет',
        message: `Уже закрыто ${stats.completedCount} из ${stats.total} задач. Темп выглядит устойчиво.`,
        severity: 'success',
      });
    }

    return items;
  }, [analytics.reviewQueueCount, groupedTasks.overdue.length, groupedTasks.today.length, normalizedTasks, stats.completedCount, stats.completionRate, stats.total]);

  const aiInsights = useMemo<AiInsight[]>(() => {
    const earliestUrgentTask = [...normalizedTasks]
      .filter((task) => task.status !== 'done')
      .sort((left, right) => toDate(left.deadline).getTime() - toDate(right.deadline).getTime())[0];

    return [
      {
        id: 'student-tomorrow',
        role: 'student',
        label: 'AI-подсказка',
        text: analytics.tomorrowCount > 0 ? `У тебя ${analytics.tomorrowCount} задачи на завтра. Лучше закрыть одну из них уже сегодня.` : 'На завтра нет перегруза. Можно заранее закрыть часть блока “Скоро”.',
        tone: 'blue',
      },
      {
        id: 'student-urgent',
        role: 'student',
        label: 'AI-приоритет',
        text: earliestUrgentTask ? `Начни с ${earliestUrgentTask.subject ?? 'самой важной задачи'} — дедлайн скоро и это снимет давление по срокам.` : 'Сейчас нет срочных задач, можно выбрать приоритетный предмет спокойно.',
        tone: 'amber',
      },
      {
        id: 'student-weakness',
        role: 'student',
        label: 'AI-аналитика',
        text: `Похоже, слабое место сейчас — ${analytics.weakestSubject.toLowerCase()}. Здесь чаще всего скапливаются рискованные задачи.`,
        tone: 'rose',
      },
      {
        id: 'teacher-focus',
        role: 'teacher',
        label: 'AI-подсказка',
        text: analytics.reviewQueueCount > 0 ? `Сначала проверь блок по предмету "${analytics.weakestSubject}" — там выше шанс просрочек.` : 'У очереди на проверку нет критичных задач. Можно сосредоточиться на новых назначениях.',
        tone: 'emerald',
      },
      {
        id: 'parent-signal',
        role: 'parent',
        label: 'AI-сигнал',
        text: analytics.overdueSubjects.length > 0 ? `Риск смещается в сторону предметов: ${analytics.overdueSubjects.join(', ')}.` : 'Сейчас у ребенка нет явной зоны провала по предметам. Это хороший сигнал.',
        tone: 'blue',
      },
      {
        id: 'parent-pattern',
        role: 'parent',
        label: 'AI-наблюдение',
        text: `Чаще всего нагрузка скапливается в ${analytics.busiestWeekday}. В этот день лучше заранее смотреть на дедлайны.`,
        tone: 'amber',
      },
    ];
  }, [analytics.busiestWeekday, analytics.overdueSubjects, analytics.reviewQueueCount, analytics.tomorrowCount, analytics.weakestSubject, normalizedTasks]);

  const getTasks = () => normalizedTasks;

  const addTask = async (input: CreateTaskInput) => {
    const nextTask: Task = {
      id: globalThis.crypto?.randomUUID?.() ?? `task-${Date.now()}`,
      title: input.title,
      subject: input.subject,
      description: input.description,
      deadline: input.deadline,
      priority: input.priority,
      status: 'todo',
      createdBy: input.createdBy ?? 'student',
      assignedToStudentId: trackerStudent.id,
      createdAt: new Date().toISOString(),
      studentName: trackerStudent.name,
      teacherComment: input.createdBy === 'teacher' ? 'Новая задача создана и отправлена ученику.' : 'Задача добавлена в личный трекер.',
      reminderMissedCount: 0,
    };

    setTasks((current) => [nextTask, ...current]);

    if (supabaseTaskService.isEnabled) {
      try {
        const session = await sessionService.restoreSession();
        if (session?.id) {
          const remoteTask = await supabaseTaskService.createTask(session.id, nextTask);
          setTasks((current) => [remoteTask, ...current.filter((task) => task.id !== nextTask.id)]);
        }
      } catch {
      }
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)));

    if (supabaseTaskService.isEnabled) {
      try {
        await supabaseTaskService.updateTaskStatus(taskId, status);
      } catch {
      }
    }
  };

  const updateTaskComment = (taskId: string, teacherComment: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              teacherComment,
            }
          : task,
      ),
    );
  };

  const getNotificationsForRole = (role: TrackerRole) =>
    notifications.filter((item) => item.role === role || item.role === 'all');

  const getAiInsightsForRole = (role: TrackerRole) =>
    aiInsights.filter((item) => item.role === role || item.role === 'all');

  return {
    isLoading,
    tasks: normalizedTasks,
    groupedTasks,
    stats,
    analytics,
    notifications,
    aiInsights,
    getTasks,
    addTask,
    updateTaskStatus,
    updateTaskComment,
    getNotificationsForRole,
    getAiInsightsForRole,
  };
}

export type UseTasksResult = ReturnType<typeof useTasks>;
