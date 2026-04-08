import { Page, Locator } from '@playwright/test';

export class AiGeneratorPage {
  readonly page: Page;
  readonly container: Locator;
  readonly apiKeyInput: Locator;
  readonly objectiveInput: Locator;
  readonly generateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('ai-generator');
    this.apiKeyInput = page.getByTestId('ai-api-key-input');
    this.objectiveInput = page.getByTestId('ai-objective-input');
    this.generateButton = page.getByTestId('ai-generate-button');
  }

  async fillApiKey(apiKey: string): Promise<void> {
    await this.apiKeyInput.fill(apiKey);
  }

  async fillObjective(objective: string): Promise<void> {
    await this.objectiveInput.fill(objective);
  }

  async clickGenerate(): Promise<void> {
    await this.generateButton.click();
  }

  async generate(apiKey: string, objective: string): Promise<void> {
    await this.fillApiKey(apiKey);
    await this.fillObjective(objective);
    await this.clickGenerate();
  }

  async getObjectiveValue(): Promise<string> {
    return this.objectiveInput.inputValue();
  }

  async getGenerateButtonText(): Promise<string> {
    return this.generateButton.innerText();
  }

  async isGenerating(): Promise<boolean> {
    const text = await this.getGenerateButtonText();
    return text.includes('Carregando');
  }
}