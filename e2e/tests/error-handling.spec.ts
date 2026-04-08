import { test, expect, createTaskViaApi, deleteAllTasksViaApi } from '../fixtures/tasks.fixture';

test.describe('Tratamento de erros de API', () => {
  test.beforeEach(async ({ taskListPage }) => {
    await deleteAllTasksViaApi();
    await taskListPage.goto();
  });

  test.afterEach(async () => {
    await deleteAllTasksViaApi();
  });

  test('deve exibir estado de carregamento ao buscar tarefas', async ({ page }) => {
    await page.route('http://localhost:3001/tasks', async (route) => {
      const response = await route.fetch();
      await new Promise(resolve => setTimeout(resolve, 800));
      await route.fulfill({ response });
    });
    await page.goto('/');
    await expect(page.getByTestId('tasks-loading')).toBeVisible();
  });
  
  test('deve manter lista estável quando POST /tasks retorna erro 500', async ({
    page,
    taskFormPage,
    taskListPage,
  }) => {
    await page.route('http://localhost:3001/tasks', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error', statusCode: 500 }),
        });
      } else {
        await route.continue();
      }
    });
    await taskFormPage.createTask('Tarefa com erro');
    expect(await taskListPage.getTaskCount()).toBe(0);
  });

  test('deve exibir botão "Gerar tarefas" sem loading quando POST /ai/generate retorna erro', async ({
    page,
    aiGeneratorPage,
    taskListPage,
  }) => {
    await page.route('http://localhost:3001/ai/generate', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error', statusCode: 500 }),
      });
    });
    await aiGeneratorPage.fillApiKey('sk-or-v1-fake-key-for-test');
    await aiGeneratorPage.fillObjective('Objetivo que vai falhar');
    await aiGeneratorPage.clickGenerate();
    await expect(aiGeneratorPage.generateButton).toContainText('Gerar tarefas');
    expect(await taskListPage.getTaskCount()).toBe(0);
  });

  test('não deve adicionar tarefas quando POST /ai/generate retorna erro 401', async ({
    page,
    aiGeneratorPage,
    taskListPage,
  }) => {
    await page.route('http://localhost:3001/ai/generate', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid API Key', statusCode: 401 }),
      });
    });
    await aiGeneratorPage.fillApiKey('sk-or-v1-chave-invalida');
    await aiGeneratorPage.fillObjective('Testar chave inválida');
    await aiGeneratorPage.clickGenerate();
    expect(await taskListPage.getTaskCount()).toBe(0);
  });

  test('não deve adicionar tarefas quando POST /ai/generate retorna timeout', async ({
    page,
    aiGeneratorPage,
    taskListPage,
  }) => {
    await page.route('http://localhost:3001/ai/generate', async (route) => {
      await route.abort('timedout');
    });
    await aiGeneratorPage.fillApiKey('sk-or-v1-fake-key-for-test');
    await aiGeneratorPage.fillObjective('Objetivo que vai dar timeout');
    await aiGeneratorPage.clickGenerate();
    await expect(aiGeneratorPage.generateButton).toContainText('Gerar tarefas');
    expect(await taskListPage.getTaskCount()).toBe(0);
  });

  test('deve recuperar lista quando GET /tasks retorna erro e usuário recarrega', async ({
    page,
    taskListPage,
  }) => {
    await createTaskViaApi('Tarefa prévia');
    await page.route('http://localhost:3001/tasks', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });
    await page.goto('/');
    await page.unroute('http://localhost:3001/tasks');
    await taskListPage.reload();
    await expect(taskListPage.getTaskByTitle('Tarefa prévia')).toBeVisible();
  });
});