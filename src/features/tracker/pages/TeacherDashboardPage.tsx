import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AddTaskModal } from '../components/AddTaskModal';
import { InsightsPanel } from '../components/InsightsPanel';
import { NotificationFeed } from '../components/NotificationFeed';
import { TaskList } from '../components/TaskList';
import type { UseTasksResult } from '../hooks/useTasks';

interface TeacherDashboardPageProps {
  tasksApi: UseTasksResult;
}

export function TeacherDashboardPage({ tasksApi }: TeacherDashboardPageProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const teacherTasks = tasksApi.tasks.filter((task) => task.createdBy === 'teacher');
  const activeTeacherTasks = teacherTasks.filter((task) => task.status !== 'done');
  const completedTeacherTasks = teacherTasks.filter((task) => task.status === 'done');
  const reviewQueue = teacherTasks.filter((task) => task.status === 'in_progress' || task.status === 'overdue');
  const teacherNotifications = tasksApi.getNotificationsForRole('teacher');
  const teacherInsights = tasksApi.getAiInsightsForRole('teacher');

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur md:p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Teacher Dashboard</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950 md:text-3xl">Кабинет учителя</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
            Здесь видно, какие задания созданы, кто их выполняет и где нужны комментарии или проверка.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Создано</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{teacherTasks.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Активно</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{activeTeacherTasks.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Закрыто</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{completedTeacherTasks.length}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать задание
            </button>
          </div>
        </section>

        <NotificationFeed
          title="Уведомления учителя"
          description="StudyBuddy подсказывает, где уже нужен контроль, а где можно сосредоточиться на новых назначениях."
          items={teacherNotifications}
          isLoading={tasksApi.isLoading}
        />
      </div>

      <div className="mt-6 space-y-6">
        <InsightsPanel
          title="AI-аналитика для учителя"
          description="Подсказки помогают понять, какой предмет или блок задач сейчас дает больше риска."
          insights={teacherInsights}
          analytics={tasksApi.analytics}
          isLoading={tasksApi.isLoading}
        />

        <TaskList
          title="Созданные задания"
          description="Основной список задач, назначенных ученику."
          tasks={teacherTasks}
          emptyText="Пока нет созданных заданий. Можно начать с быстрого добавления из модального окна."
          isLoading={tasksApi.isLoading}
          onStatusChange={tasksApi.updateTaskStatus}
          commentEditable
          onSaveComment={tasksApi.updateTaskComment}
          showStudentMeta
        />

        <TaskList
          title="На проверке и под риском"
          description="Компактный журнал статусов: что в работе и где уже требуется внимание."
          tasks={reviewQueue}
          emptyText="Сейчас нет задач, которые требуют дополнительного контроля."
          isLoading={tasksApi.isLoading}
          onStatusChange={tasksApi.updateTaskStatus}
          commentEditable
          onSaveComment={tasksApi.updateTaskComment}
          showStudentMeta
        />

        <TaskList
          title="Завершенные задания"
          description="Закрытые работы, чтобы быстро оценить общий прогресс по классу."
          tasks={completedTeacherTasks}
          emptyText="Закрытых заданий пока нет."
          isLoading={tasksApi.isLoading}
          onStatusChange={tasksApi.updateTaskStatus}
          commentEditable
          onSaveComment={tasksApi.updateTaskComment}
          showStudentMeta
        />
      </div>

      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddTask={tasksApi.addTask}
        defaultCreatedBy="teacher"
      />
    </>
  );
}
