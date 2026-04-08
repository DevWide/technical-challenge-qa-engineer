import { Page, Locator } from '@playwright/test';

export class TaskListPage {
  readonly page: Page;
  readonly taskList: Locator;
  readonly taskItems: Locator;
  readonly tasksLoading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.taskList = page.getByTestId('task-list');
    this.taskItems = page.getByTestId('task-item');
    this.tasksLoading = page.getByTestId('tasks-loading');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForList(): Promise<void> {
    await this.taskList.waitFor({ state: 'visible' });
  }

  getTaskByTitle(title: string): Locator {
    return this.page
      .getByTestId('task-item')
      .filter({ has: this.page.getByTestId('task-title').filter({ hasText: title }) });
  }

  getCheckboxByTitle(title: string): Locator {
    return this.getTaskByTitle(title).getByTestId('task-checkbox');
  }

  getDeleteButtonByTitle(title: string): Locator {
    return this.getTaskByTitle(title).getByTestId('task-delete-button');
  }

  getAiBadgeByTitle(title: string): Locator {
    return this.getTaskByTitle(title).getByTestId('task-ai-badge');
  }

  async toggleTask(title: string): Promise<void> {
    await this.getCheckboxByTitle(title).click();
  }

  async deleteTask(title: string): Promise<void> {
    await this.getDeleteButtonByTitle(title).click();
  }

  async getTaskCount(): Promise<number> {
    return this.taskItems.count();
  }

  async isTaskCompleted(title: string): Promise<boolean> {
    return this.getCheckboxByTitle(title).isChecked();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }
}