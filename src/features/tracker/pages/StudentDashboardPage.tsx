import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AddTaskModal } from '../components/AddTaskModal';
import { InsightsPanel } from '../components/InsightsPanel';
import { NotificationFeed } from '../components/NotificationFeed';
import { ProgressCard } from '../components/ProgressCard';
import { ReminderBanner } from '../components/ReminderBanner';
import { TaskList } from '../components/TaskList';
import type { UseTasksResult } from '../hooks/useTasks';
import { trackerStudent } from '../mocks/users';

interface StudentDashboardPageProps {
  tasksApi: UseTasksResult;
}

export function StudentDashboardPage({ tasksApi }: StudentDashboardPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const studentNotifications = tasksApi.getNotificationsForRole('student');
  const studentInsights = tasksApi.getAiInsightsForRole('student');

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <section className="rounded-[30px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur md:p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Student Dashboard</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950 md:text-3xl">Привет, {trackerStudent.name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Здесь собраны дедлайны, текущие задачи и прогресс. Это главный экран, который делает кейс понятным с первого взгляда.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Добавить задачу
              </button>
            </div>
          </section>

          <ProgressCard
            completedCount={tasksApi.stats.completedCount}
            total={tasksApi.stats.total}
            completionRate={tasksApi.stats.completionRate}
            streak={tasksApi.stats.streak}
            points={tasksApi.stats.points}
          />

          <InsightsPanel
            title="AI-подсказки и аналитика"
            description="Здесь StudyBuddy помогает понять не только что делать, но и с чего лучше начать."
            insights={studentInsights}
            analytics={tasksApi.analytics}
            isLoading={tasksApi.isLoading}
          />
        </div>

        <div className="space-y-6">
          <ReminderBanner overdueCount={tasksApi.stats.overdueCount} todayCount={tasksApi.groupedTasks.today.length} />
          <NotificationFeed
            title="Уведомления"
            description="Mock-логика напоминает о задачах на сегодня и поднимает просрочки как alert."
            items={studentNotifications}
            isLoading={tasksApi.isLoading}
          />
          <section className="rounded-[30px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur">
            <p className="text-sm text-slate-500">Короткая сводка</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Сегодня</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{tasksApi.groupedTasks.today.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Скоро</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{tasksApi.groupedTasks.soon.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Выполнено</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{tasksApi.groupedTasks.completed.length}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <TaskList
          title="Сегодня"
          description="Ближайшие дедлайны, которые лучше не откладывать."
          tasks={tasksApi.groupedTasks.today}
          emptyText="На сегодня задач нет. Можно перейти к блоку «Скоро» и сделать запас."
          isLoading={tasksApi.isLoading}
          onStatusChange={tasksApi.updateTaskStatus}
        />

        <TaskList
          title="Скоро"
          description="Задачи на ближайшие дни, чтобы планировать нагрузку заранее."
          tasks={tasksApi.groupedTasks.soon}
          emptyText="Ближайшие дни пока свободны. Это хороший момент заранее закрыть часть дел."
          isLoading={tasksApi.isLoading}
          onStatusChange={tasksApi.updateTaskStatus}
        />

        <TaskList
          title="Просрочено"
          description="Сигнальный блок, который нужен для контроля и быстрой реакции."
          tasks={tasksApi.groupedTasks.overdue}
          emptyText="Просроченных задач нет. Отличный результат."
          isLoading={tasksApi.isLoading}
          onStatusChange={tasksApi.updateTaskStatus}
        />

        <TaskList
          title="Выполнено"
          description="Закрытые задачи усиливают ощущение прогресса и делают результат видимым."
          tasks={tasksApi.groupedTasks.completed}
          emptyText="Пока нет завершенных задач. Первый закрытый блок даст заметный прирост прогресса."
          isLoading={tasksApi.isLoading}
          onStatusChange={tasksApi.updateTaskStatus}
        />
      </div>

      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddTask={tasksApi.addTask}
        defaultCreatedBy="student"
      />
    </>
  );
}
