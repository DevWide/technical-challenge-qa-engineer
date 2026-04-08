import { Page, Locator } from '@playwright/test';

export class TaskFormPage {
  readonly page: Page;
  readonly form: Locator;
  readonly titleInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.getByTestId('task-form');
    this.titleInput = page.getByTestId('task-title-input');
    this.submitButton = page.getByTestId('task-submit-button');
  }

  async fillTitle(title: string): Promise<void> {
    await this.titleInput.fill(title);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async createTask(title: string): Promise<void> {
    await this.fillTitle(title);
    await this.submit();
  }

  async clearTitle(): Promise<void> {
    await this.titleInput.clear();
  }

  async getTitleValue(): Promise<string> {
    return this.titleInput.inputValue();
  }

  async isSubmitDisabled(): Promise<boolean> {
    return this.submitButton.isDisabled();
  }

  async submitWithEnter(): Promise<void> {
    await this.titleInput.press('Enter');
  }
}