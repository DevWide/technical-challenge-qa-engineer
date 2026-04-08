import { test, expect, createTaskViaApi, deleteAllTasksViaApi } from '../fixtures/tasks.fixture';

test.describe('Estado vazio da lista', () => {
  test.beforeEach(async () => {
    await deleteAllTasksViaApi();
  });

  test.afterEach(async () => {
    await deleteAllTasksViaApi();
  });

  test('deve exibir lista vazia sem itens na primeira visita', async ({ taskListPage }) => {
    await taskListPage.goto();
    expect(await taskListPage.getTaskCount()).toBe(0);
  });

  test('lista vazia deve conter ul sem itens filhos', async ({ taskListPage }) => {
    await taskListPage.goto();
    await expect(taskListPage.taskList).toBeAttached();
    await expect(taskListPage.taskItems).toHaveCount(0);
  });

  test('deve exibir lista vazia após excluir única tarefa', async ({ taskListPage }) => {
    const title = 'Única tarefa';
    await createTaskViaApi(title);
    await taskListPage.goto();
    await taskListPage.deleteTask(title);
    await expect(taskListPage.getTaskByTitle(title)).not.toBeVisible();
    expect(await taskListPage.getTaskCount()).toBe(0);
  });

  test('formulário de criação deve estar visível no estado vazio', async ({
    taskListPage,
    taskFormPage,
  }) => {
    await taskListPage.goto();
    await expect(taskFormPage.form).toBeVisible();
    await expect(taskFormPage.titleInput).toBeVisible();
    await expect(taskFormPage.submitButton).toBeVisible();
  });

  test('gerador de IA deve estar visível no estado vazio', async ({
    taskListPage,
    aiGeneratorPage,
  }) => {
    await taskListPage.goto();
    await expect(aiGeneratorPage.container).toBeVisible();
    await expect(aiGeneratorPage.objectiveInput).toBeVisible();
    await expect(aiGeneratorPage.generateButton).toBeVisible();
  });

  test('deve exibir tarefas normalmente após criar a partir do estado vazio', async ({
    taskListPage,
    taskFormPage,
  }) => {
    await taskListPage.goto();
    expect(await taskListPage.getTaskCount()).toBe(0);
    await taskFormPage.createTask('Primeira tarefa após estado vazio');
    await expect(taskListPage.getTaskByTitle('Primeira tarefa após estado vazio')).toBeVisible();
    expect(await taskListPage.getTaskCount()).toBe(1);
  });
});