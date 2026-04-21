import React from 'react';
import { BellRing, ShieldAlert } from 'lucide-react';
import { InsightsPanel } from '../components/InsightsPanel';
import { NotificationFeed } from '../components/NotificationFeed';
import { ProgressCard } from '../components/ProgressCard';
import { TaskList } from '../components/TaskList';
import type { UseTasksResult } from '../hooks/useTasks';
import { trackerParent, trackerStudent } from '../mocks/users';

interface ParentDashboardPageProps {
  tasksApi: UseTasksResult;
}

export function ParentDashboardPage({ tasksApi }: ParentDashboardPageProps) {
  const missedReminders = tasksApi.tasks.reduce((sum, task) => sum + (task.reminderMissedCount ?? 0), 0);
  const parentNotifications = tasksApi.getNotificationsForRole('parent');
  const parentInsights = tasksApi.getAiInsightsForRole('parent');

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur md:p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Parent Dashboard</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950 md:text-3xl">{trackerParent.name}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
            В кабинете родителя видно только полезное: прогресс {trackerStudent.name}, просрочки и заметные сигналы по дедлайнам.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Прогресс</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{tasksApi.stats.completionRate}%</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Просрочки</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{tasksApi.stats.overdueCount}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Пропущено напоминаний</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{missedReminders}</p>
            </div>
          </div>
        </section>

        <NotificationFeed
          title="Сигналы и уведомления"
          description="Если у ребенка копятся просрочки или игнорируются напоминания, родитель видит это сразу."
          items={parentNotifications}
          isLoading={tasksApi.isLoading}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ProgressCard
          completedCount={tasksApi.stats.completedCount}
          total={tasksApi.stats.total}
          completionRate={tasksApi.stats.completionRate}
          streak={tasksApi.stats.streak}
          points={tasksApi.stats.points}
        />
        <InsightsPanel
          title="AI-наблюдения"
          description="Даже mock-аналитика помогает показать на защите, что сервис не просто хранит задачи, а объясняет ситуацию."
          insights={parentInsights}
          analytics={tasksApi.analytics}
          isLoading={tasksApi.isLoading}
        />
      </div>

      <section className="rounded-[30px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-rose-700">
              <ShieldAlert className="h-4 w-4" />
              Критический сигнал
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Просроченные задачи вынесены в отдельный блок, чтобы родитель не искал проблему вручную.
            </p>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
              <BellRing className="h-4 w-4" />
              Напоминания
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Система показывает, если ученик проигнорировал часть уведомлений, и это помогает вовремя подключиться.
            </p>
          </div>
        </div>
      </section>

      <TaskList
        title="Просроченные задачи"
        description="Самый важный родительский блок: здесь видно, где ребенку уже нужна помощь."
        tasks={tasksApi.groupedTasks.overdue}
        emptyText="Просроченных задач нет. Это хороший и спокойный сигнал."
        isLoading={tasksApi.isLoading}
      />
    </div>
  );
}
