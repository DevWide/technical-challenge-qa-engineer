# E2E — Smart To-Do Sinky

Suíte de testes automatizados E2E com **Playwright + TypeScript** para o Smart To-Do.

## Pré-requisitos

- Node.js 18+
- A aplicação rodando localmente via Docker:
```bash
  cd ../app
  docker compose up --build
```
  - Frontend: http://localhost:3000
  - Backend: http://localhost:3001

## Instalação

```bash
cd e2e
npm install
npx playwright install chromium
```

## Execução

```bash
# Rodar todos os testes (headless)
npx playwright test

# Rodar com browser visível
npx playwright test --headed

# Rodar um arquivo específico
npx playwright test tests/task-creation.spec.ts

# Ver relatório HTML após execução
npx playwright show-report
```

## Estrutura

```
e2e/
├── pages/
│   ├── TaskListPage.ts
│   ├── TaskFormPage.ts
│   └── AiGeneratorPage.ts
├── fixtures/
│   └── tasks.fixture.ts
├── tests/
│   ├── task-creation.spec.ts
│   ├── task-completion.spec.ts
│   ├── task-deletion.spec.ts
│   ├── empty-state.spec.ts
│   └── error-handling.spec.ts
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Estratégia de isolamento

Cada teste é **determinístico e independente**:

- `beforeEach`: limpa todas as tarefas via API e navega para a página
- `afterEach`: limpa todas as tarefas via API
- Dados criados via API REST — não via UI — para velocidade e confiabilidade
- Nenhum teste depende de estado deixado por outro

## Seletores utilizados

Todos os seletores usam `data-testid` presentes no código-fonte:

| `data-testid` | Elemento |
|---|---|
| `task-form` | Formulário de criação |
| `task-title-input` | Input de título |
| `task-submit-button` | Botão "Adicionar" |
| `task-list` | Lista de tarefas |
| `task-item` | Item individual |
| `task-checkbox` | Checkbox de conclusão |
| `task-title` | Span com título |
| `task-ai-badge` | Badge "IA" |
| `task-delete-button` | Botão de exclusão |
| `tasks-loading` | Indicador de carregamento |
| `ai-generator` | Container do gerador de IA |
| `ai-api-key-input` | Input da API Key |
| `ai-objective-input` | Input do objetivo |
| `ai-generate-button` | Botão "Gerar tarefas" |