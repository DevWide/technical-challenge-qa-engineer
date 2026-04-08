import { test, expect, createTaskViaApi, deleteAllTasksViaApi } from '../fixtures/tasks.fixture';

test.describe('Conclusão e desconclusão de tarefa', () => {
  const TASK_TITLE = 'Tarefa para toggle de conclusão';

  test.beforeEach(async ({ taskListPage }) => {
    await deleteAllTasksViaApi();
    await createTaskViaApi(TASK_TITLE);
    await taskListPage.goto();
  });

  test.afterEach(async () => {
    await deleteAllTasksViaApi();
  });

  test('deve marcar tarefa como concluída ao clicar no checkbox', async ({ taskListPage }) => {
    await taskListPage.toggleTask(TASK_TITLE);
    await expect(taskListPage.getCheckboxByTitle(TASK_TITLE)).toBeChecked();
  });

  test('tarefa concluída deve exibir diferenciação visual (line-through)', async ({
    taskListPage,
  }) => {
    await taskListPage.toggleTask(TASK_TITLE);
    const titleSpan = taskListPage.getTaskByTitle(TASK_TITLE).getByTestId('task-title');
    await expect(titleSpan).toHaveCSS('text-decoration', /line-through/);
  });

  test('deve desmarcar tarefa concluída (toggle reverso)', async ({ taskListPage }) => {
    await taskListPage.toggleTask(TASK_TITLE);
    await expect(taskListPage.getCheckboxByTitle(TASK_TITLE)).toBeChecked();
    await taskListPage.toggleTask(TASK_TITLE);
    await expect(taskListPage.getCheckboxByTitle(TASK_TITLE)).not.toBeChecked();
  });

  test('estado de conclusão deve persistir após reload da página', async ({ taskListPage }) => {
    // BUG documentado: toggleComplete não chama PATCH /tasks/:id
    // O estado é perdido após reload — este teste documenta o comportamento ESPERADO
    test.fail();
    await taskListPage.toggleTask(TASK_TITLE);
    await expect(taskListPage.getCheckboxByTitle(TASK_TITLE)).toBeChecked();
    await taskListPage.page.waitForTimeout(500);
    await taskListPage.reload();
    await expect(taskListPage.getCheckboxByTitle(TASK_TITLE)).toBeChecked();
  });

  test('estado de desconclusão deve persistir após reload da página', async ({ taskListPage }) => {
    // BUG documentado: toggleComplete não chama PATCH /tasks/:id
    // O estado é perdido após reload — este teste documenta o comportamento ESPERADO
    test.fail();
    await taskListPage.toggleTask(TASK_TITLE);
    await taskListPage.reload();
    await expect(taskListPage.getCheckboxByTitle(TASK_TITLE)).toBeChecked();
    await taskListPage.toggleTask(TASK_TITLE);
    await taskListPage.page.waitForTimeout(500);
    await taskListPage.reload();
    await expect(taskListPage.getCheckboxByTitle(TASK_TITLE)).not.toBeChecked();
  });  

  test('tarefa não concluída deve exibir título sem line-through', async ({ taskListPage }) => {
    const titleSpan = taskListPage.getTaskByTitle(TASK_TITLE).getByTestId('task-title');
    await expect(titleSpan).not.toHaveCSS('text-decoration', /line-through/);
  });
});