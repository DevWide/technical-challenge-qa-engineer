import { test, expect, createTaskViaApi, deleteAllTasksViaApi } from '../fixtures/tasks.fixture';

test.describe('Exclusão de tarefa', () => {
  test.beforeEach(async () => {
    await deleteAllTasksViaApi();
  });

  test.afterEach(async () => {
    await deleteAllTasksViaApi();
  });

  test('deve remover a tarefa da lista após exclusão', async ({ taskListPage }) => {
    const title = 'Tarefa para excluir';
    await createTaskViaApi(title);
    await taskListPage.goto();
    await taskListPage.deleteTask(title);
    await expect(taskListPage.getTaskByTitle(title)).not.toBeVisible();
  });

  test('deve decrementar o contador de tarefas após exclusão', async ({ taskListPage }) => {
    await createTaskViaApi('Tarefa A');
    await createTaskViaApi('Tarefa B');
    await taskListPage.goto();
    expect(await taskListPage.getTaskCount()).toBe(2);
    await taskListPage.deleteTask('Tarefa A');
    await expect(taskListPage.getTaskByTitle('Tarefa A')).not.toBeVisible();
    expect(await taskListPage.getTaskCount()).toBe(1);
  });

  test('tarefa excluída não deve reaparecer após reload', async ({ taskListPage }) => {
    const title = 'Tarefa persistência exclusão';
    await createTaskViaApi(title);
    await taskListPage.goto();
    await taskListPage.deleteTask(title);
    await taskListPage.reload();
    await expect(taskListPage.getTaskByTitle(title)).not.toBeVisible();
  });

  test('deve manter tarefas restantes após excluir uma', async ({ taskListPage }) => {
    await createTaskViaApi('Manter esta');
    await createTaskViaApi('Excluir esta');
    await taskListPage.goto();
    await taskListPage.deleteTask('Excluir esta');
    await expect(taskListPage.getTaskByTitle('Manter esta')).toBeVisible();
    await expect(taskListPage.getTaskByTitle('Excluir esta')).not.toBeVisible();
  });

  test('deve excluir tarefa concluída corretamente', async ({ taskListPage }) => {
    const title = 'Tarefa concluída para excluir';
    await createTaskViaApi(title);
    await taskListPage.goto();
    await taskListPage.toggleTask(title);
    await taskListPage.deleteTask(title);
    await expect(taskListPage.getTaskByTitle(title)).not.toBeVisible();
  });
});