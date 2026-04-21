# StudyBuddy

Локальная финальная демо-версия сервиса для школьных задач, прогресса и связи между учеником, учителем и родителем.

## Что изменилось

- бренд переименован из `FocusTrack EDU` в `StudyBuddy`;
- вместо старта сразу в трекер появился нормальный продуктовый поток:
  - `/`
  - `/login`
  - `/register`
  - `/onboarding/role`
  - `/app/student`
  - `/app/teacher`
  - `/app/parent`
- добавлен mock-auth через `localStorage`;
- кабинеты завернуты в общий `AppShell` с sidebar;
- публичная часть получила отдельный landing и auth UI;
- добавлены mock-уведомления, AI-подсказки и аналитика;
- в кабинетах появились разные сценарии для ученика, учителя и родителя;
- для защиты есть быстрый demo-switch между ролями прямо в sidebar.

## Структура

```text
src/
  App.tsx
  features/
    tracker/
      components/
        AddTaskModal.tsx
        AppShell.tsx
        AppSidebar.tsx
        InsightsPanel.tsx
        NotificationFeed.tsx
        ProgressCard.tsx
        PublicNavbar.tsx
        ReminderBanner.tsx
        RoleSwitcher.tsx
        TaskCard.tsx
        TaskList.tsx
      hooks/
        useMockSession.ts
        useTasks.ts
      mocks/
        tasks.ts
        users.ts
      pages/
        LandingPage.tsx
        LoginPage.tsx
        ParentDashboardPage.tsx
        RegisterPage.tsx
        RoleSelectPage.tsx
        StudentDashboardPage.tsx
        TeacherDashboardPage.tsx
        TrackerHomePage.tsx
      types/
        auth.ts
        notification.ts
        task.ts
        user.ts
      utils/
        deadline.ts
        parserMock.ts
        taskStatus.ts
```

## Основной путь пользователя

1. Пользователь заходит на `/`.
2. Нажимает `Начать` или `Войти`.
3. После регистрации или логина получает роль.
4. Система ведет его в нужный кабинет:
   - ученик -> `/app/student`
   - учитель -> `/app/teacher`
   - родитель -> `/app/parent`

## Mock Auth

Для демо уже есть три тестовых аккаунта:

- `student@studybuddy.local` / `123456`
- `teacher@studybuddy.local` / `123456`
- `parent@studybuddy.local` / `123456`

Сессия хранится в `localStorage`. Регистрация тоже локальная, без сервера.

## Запуск

```bash
npm install
npm run dev
```

Если PowerShell блокирует `npm`, используй:

```bash
npm.cmd run dev
```

После запуска открой адрес из терминала, обычно `http://localhost:5173/`.

## Что уже покрывает финальная демо-версия

### Landing

- hero-блок;
- секция `Как это работает`;
- описание сервиса;
- блок ролей;
- преимущества продукта.

### Student

- задачи `Сегодня`;
- задачи `Скоро`;
- блок `Просрочено`;
- блок `Выполнено`;
- прогресс;
- добавление задачи;
- разбор текстового задания через mock-parser;
- AI-подсказки и аналитика;
- уведомления и alert-сигналы;
- действия `Начать`, `Выполнено`, `Вернуть в план`.

### Teacher

- созданные задания;
- блок задач под контролем;
- статусы;
- создание новых заданий;
- комментарии к заданиям;
- AI-аналитика по рисковым задачам.

### Parent

- прогресс ребенка;
- уведомления и сигналы;
- проблемные задания;
- достижения и положительная динамика;
- аналитические наблюдения по предметам и дням нагрузки.

## Demo-сценарий для защиты

1. Заходим на landing `/`.
2. Регистрируемся или входим в demo-аккаунт ученика.
3. Добавляем задачу через обычную форму или AI-ввод.
4. Видим задачу в блоке `Сегодня` или `Скоро`.
5. Получаем напоминание и AI-подсказку.
6. Меняем статус и видим рост прогресса.
7. Переключаем роль через demo-switch в sidebar.
8. Показываем кабинет родителя с сигналами и аналитикой.
9. При желании открываем кабинет учителя и комментарии к заданиям.

## Следующий шаг

После фронтового MVP можно перейти к `Supabase`:

- `users`
- `tasks`
- `task_comments`
- `notifications`

и заменить mock-auth и localStorage на реальную БД и авторизацию.

## Материалы

- Текстовая защита кейса: [CASE_SOLUTION.md](./CASE_SOLUTION.md)
