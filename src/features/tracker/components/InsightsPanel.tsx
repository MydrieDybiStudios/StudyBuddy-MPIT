import React from 'react';
import type { AnalyticsSummary, AiInsight } from '../types/notification';

interface InsightsPanelProps {
  title: string;
  description: string;
  insights: AiInsight[];
  analytics: AnalyticsSummary;
  isLoading?: boolean;
}

function getToneClasses(tone: AiInsight['tone']) {
  return {
    blue: 'border-blue-200 bg-blue-50',
    amber: 'border-amber-200 bg-amber-50',
    rose: 'border-rose-200 bg-rose-50',
    emerald: 'border-emerald-200 bg-emerald-50',
  }[tone];
}

export function InsightsPanel({ title, description, insights, analytics, isLoading = false }: InsightsPanelProps) {
  return (
    <section className="rounded-[30px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-full rounded bg-slate-200" />
              <div className="mt-2 h-3 w-4/5 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {insights.map((item) => (
              <div key={item.id} className={`rounded-3xl border p-4 ${getToneClasses(item.tone)}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Слабое место</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{analytics.weakestSubject}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Пиковый день</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{analytics.busiestWeekday}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">На завтра</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{analytics.tomorrowCount} задач(и)</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
