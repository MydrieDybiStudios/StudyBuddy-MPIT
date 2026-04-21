interface AiTaskParseResult {
  subject?: string;
  title: string;
  description?: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  recommendedEstimatedTime?: string;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'AI request failed');
  }

  return response.json() as Promise<T>;
}

export const gigachatClient = {
  async parseTask(input: string) {
    return postJson<AiTaskParseResult>('/api/ai/task-parse', { input });
  },

  async buildReminders(payload: { tasks: Array<{ title: string; subject?: string; deadline: string; priority: string; status: string }> }) {
    return postJson<{ reminders: string[] }>('/api/ai/reminders', payload);
  },

  async buildAnalytics(payload: { tasks: Array<{ title: string; subject?: string; deadline: string; priority: string; status: string }> }) {
    return postJson<{ insight: string; riskLevel: 'low' | 'medium' | 'high'; recommendation: string }>('/api/ai/analytics', payload);
  },
};
