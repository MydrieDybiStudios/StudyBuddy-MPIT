import React from 'react';
import type { StudyNotification } from '../types/notification';

interface NotificationFeedProps {
  title: string;
  description: string;
  items: StudyNotification[];
  isLoading?: boolean;
}

function getSeverityTone(severity: StudyNotification['severity']) {
  return {
    info: 'border-blue-200 bg-blue-50 text-blue-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    critical: 'border-rose-200 bg-rose-50 text-rose-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }[severity];
}

export function NotificationFeed({ title, description, items, isLoading = false }: NotificationFeedProps) {
  return (
    <section className="rounded-[30px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-full rounded bg-slate-200" />
              <div className="mt-2 h-3 w-3/4 rounded bg-slate-200" />
            </div>
          ))}

        {!isLoading &&
          items.map((item) => (
            <div key={item.id} className={`rounded-3xl border p-4 ${getSeverityTone(item.severity)}`}>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.message}</p>
            </div>
          ))}

        {!isLoading && items.length === 0 && (
          <div className="rounded-3xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">Сейчас нет новых уведомлений. Это спокойный режим.</div>
        )}
      </div>
    </section>
  );
}
