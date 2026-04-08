import { test, expect, createTaskViaApi, deleteAllTasksViaApi } from '../fixtures/tasks.fixture';

test.describe('Criação de tarefa', () => {
  test.beforeEach(async ({ taskListPage }) => {
    await deleteAllTasksViaApi();
    await taskListPage.goto();
  });

  test.afterEach(async () => {
    await deleteAllTasksViaApi();
  });

  test('deve criar uma tarefa manual com título válido', async ({ taskFormPage, taskListPage }) => {
    const title = 'Tarefa de teste E2E';
    await taskFormPage.createTask(title);
    await expect(taskListPage.getTaskByTitle(title)).toBeVisible();
  });

  test('deve limpar o campo de título após criação bem-sucedida', async ({ taskFormPage }) => {
    await taskFormPage.createTask('Tarefa para limpar campo');
    await expect(taskFormPage.titleInput).toHaveValue('');
  });

  test('deve exibir a tarefa criada imediatamente na lista', async ({ taskFormPage, taskListPage }) => {
    const title = 'Tarefa imediata';
    await taskFormPage.createTask(title);
    await expect(taskListPage.getTaskByTitle(title)).toBeVisible();
    const count = await taskListPage.getTaskCount();
    expect(count).toBe(1);
  });

  test('não deve criar tarefa com título vazio', async ({ taskFormPage, taskListPage }) => {
    await taskFormPage.submit();
    const count = await taskListPage.getTaskCount();
    expect(count).toBe(0);
  });

  test('não deve criar tarefa com título composto apenas de espaços', async ({
    taskFormPage,
    taskListPage,
  }) => {
    await taskFormPage.fillTitle('     ');
    await taskFormPage.submit();
    // BUG-001 documentado: aplicação atual aceita espaços
    // Quando corrigido, deve manter count = 0
    const count = await taskListPage.getTaskCount();
    expect(count).toBe(0);
  });

  test('deve criar tarefa com título muito longo (255 caracteres)', async ({
    taskFormPage,
    taskListPage,
  }) => {
    const longTitle = 'A'.repeat(255);
    await taskFormPage.createTask(longTitle);
    await expect(taskListPage.getTaskByTitle(longTitle)).toBeVisible();
  });

  test('deve criar tarefa com caracteres especiais no título', async ({
    taskFormPage,
    taskListPage,
  }) => {
    const specialTitle = 'Tarefa com símbolos <>&"\'';
    await taskFormPage.createTask(specialTitle);
    await expect(taskListPage.getTaskByTitle(specialTitle)).toBeVisible();
  });

  test('tarefa criada manualmente não deve exibir badge IA', async ({
    taskFormPage,
    taskListPage,
  }) => {
    const title = 'Tarefa manual sem IA';
    await taskFormPage.createTask(title);
    await expect(taskListPage.getAiBadgeByTitle(title)).not.toBeVisible();
  });
});