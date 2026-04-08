import { test as base, request } from '@playwright/test';
import { TaskListPage } from '../pages/TaskListPage';
import { TaskFormPage } from '../pages/TaskFormPage';
import { AiGeneratorPage } from '../pages/AiGeneratorPage';

const API_BASE = 'http://localhost:3001';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  isAiGenerated: boolean;
  createdAt: string;
}

export async function createTaskViaApi(title: string): Promise<Task> {
  const ctx = await request.newContext({ baseURL: API_BASE });
  const response = await ctx.post('/tasks', {
    data: { title },
  });
  const task = await response.json() as Task;
  await ctx.dispose();
  return task;
}

export async function deleteAllTasksViaApi(): Promise<void> {
  const ctx = await request.newContext({ baseURL: API_BASE });
  const response = await ctx.get('/tasks');
  const tasks = await response.json() as Task[];
  await Promise.all(
    tasks.map((task) => ctx.delete(`/tasks/${task.id}`))
  );
  await ctx.dispose();
}

export const test = base.extend<{
  taskListPage: TaskListPage;
  taskFormPage: TaskFormPage;
  aiGeneratorPage: AiGeneratorPage;
  cleanupTasks: void;
}>({
  taskListPage: async ({ page }, use) => {
    await use(new TaskListPage(page));
  },

  taskFormPage: async ({ page }, use) => {
    await use(new TaskFormPage(page));
  },

  aiGeneratorPage: async ({ page }, use) => {
    await use(new AiGeneratorPage(page));
  },

  cleanupTasks: [async ({}, use) => {
    await deleteAllTasksViaApi();
    await use();
    await deleteAllTasksViaApi();
  }, { auto: false }],
});

export { expect } from '@playwright/test';