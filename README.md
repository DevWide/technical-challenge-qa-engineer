# Sinky Technical Challenge — QA Engineer

**Candidato:** Rafael Barbosa  
**Data de entrega:** 2026-04-13

**Repositório:** https://github.com/DevWide/technical-challenge-qa-engineer

---

## Estrutura da entrega

```
repositório/
├── app/                    ← aplicação original (não modificada)
├── e2e/                    ← Fase 3: suíte Playwright E2E
│   ├── pages/              ← Page Objects (POM)
│   ├── fixtures/           ← fixtures e helpers de API
│   ├── tests/              ← 5 spec files obrigatórios
│   ├── playwright.config.ts
│   ├── package.json
│   └── README.md
├── .github/
│   └── workflows/
│       └── playwright.yml  ← Bônus B2: CI com GitHub Actions
├── PRD.md                  ← fornecido pela Sinky (não modificado)
├── PRD-REVIEW.md           ← Fase 1: revisão de requisitos
├── BUG-REPORT.md           ← Fase 2: bugs encontrados na auditoria
├── TEST-STRATEGY.md        ← Fase 2: estratégia de testes
└── README.md               ← este arquivo
```

---

## Como rodar a aplicação

**Pré-requisitos:** Docker Desktop instalado e em execução

```bash
git clone https://github.com/DevWide/technical-challenge-qa-engineer.git
cd technical-challenge-qa-engineer/app
docker compose up --build
```

| Serviço | URL |
|---|---|
| Aplicação (Frontend) | http://localhost:3000 |
| API (Swagger) | http://localhost:3001/api/docs |

A feature de geração por IA requer uma API Key gratuita do OpenRouter. Crie uma em https://openrouter.ai/keys e insira no campo disponível na interface.

---

## Como rodar os testes E2E

**Pré-requisitos:** aplicação rodando (passo acima) e Node.js 18+

```bash
cd e2e
npm install
npx playwright install chromium
npx playwright test
```

### Comandos úteis

```bash
# Rodar com browser visível
npx playwright test --headed

# Rodar um spec específico
npx playwright test tests/task-creation.spec.ts

# Rodar com interface visual do Playwright
npx playwright test --ui

# Ver relatório HTML após execução
npx playwright show-report
```

### Resultado esperado

```
31 passed (35s)
```

> **Nota:** Os testes 16 e 17 (`task-completion.spec.ts`) usam `test.fail()` — isso é intencional. Eles documentam um bug conhecido onde o `toggleComplete` não persiste o estado no banco de dados (a chamada `PATCH /tasks/:id` está ausente no hook `useTasks.ts`). O `test.fail()` indica que o teste **deve** falhar enquanto o bug existir — se passar, significa que o bug foi corrigido.

---

## Resumo das fases

### Fase 1 — Revisão de PRD (`PRD-REVIEW.md`)

Análise realizada **antes** de interagir com a aplicação, simulando o processo real de shift-left QA. Foram identificados **12 problemas** distribuídos entre:

| Categoria | Qtd |
|---|---|
| Requisito ausente | 4 |
| Critério de aceitação incompleto | 3 |
| Segurança | 2 |
| Ambiguidade | 2 |
| Acessibilidade | 1 |

Destaques: ausência de requisitos de segurança para a API Key (risco financeiro direto), falta de especificação do formato de resposta da IA, e divergência entre o modelo documentado no PRD (`mistral-7b`) e o modelo em uso (`gemma-3-4b-it`) detectada via histórico de commits.

### Fase 2 — Auditoria da Aplicação (`BUG-REPORT.md` + `TEST-STRATEGY.md`)

Sessão de testes exploratórios cobrindo UI, API (Swagger), console do browser e casos de borda. Foram documentados **12 bugs**, incluindo:

- **BUG-003 (Crítica/P1):** Erro 500 na segunda geração por IA não exibe nenhum feedback ao usuário — confirmado via DevTools com evidência de screenshot
- **BUG-005 (Alta/P2):** Ausência de loading indicator durante geração por IA — regressão direta do RF-05 do PRD
- **BUG-006 (Média/P3):** `PATCH /tasks/{id}` aceita campo `title` — funcionalidade explicitamente fora do escopo da v1.0

O `TEST-STRATEGY.md` conecta os riscos do PRD-REVIEW com os bugs encontrados, e propõe uma pirâmide de testes específica para a stack NestJS + Next.js com estratégias de mock para o serviço de IA.

### Fase 3 — Suíte Playwright E2E (`e2e/`)

**31 testes** cobrindo os 5 fluxos críticos obrigatórios:

| Spec | Testes | Fluxo |
|---|---|---|
| `task-creation.spec.ts` | 8 | Criação manual + edge cases de validação |
| `task-completion.spec.ts` | 6 | Toggle conclusão/desconclusão + persistência |
| `task-deletion.spec.ts` | 5 | Exclusão e confirmação de ausência |
| `empty-state.spec.ts` | 6 | Comportamento da UI com lista vazia |
| `error-handling.spec.ts` | 6 | UX em cenários de erro via `page.route()` |

**Decisões técnicas:**

- **Fixtures via API REST:** dados criados via `POST /tasks` direto na API (não via UI) para velocidade e determinismo — cada teste é completamente isolado com `beforeEach`/`afterEach` que limpam o banco
- **Seletores por `data-testid`:** todos os seletores usam atributos `data-testid` já presentes no código-fonte da aplicação — zero seletores por classe CSS ou XPath
- **`test.fail()` para bugs conhecidos:** testes de persistência documentam o bug do `toggleComplete` sem bloquear a suíte — abordagem preferível a comentar ou pular os testes
- **pnpm:** gerenciador de pacotes mais eficiente que npm, compatível com o ambiente de avaliação via `npm install` conforme instruções

---

## Bônus implementados

### B2 — CI com GitHub Actions

O workflow `.github/workflows/playwright.yml` executa automaticamente em cada push e pull request:

1. Sobe a aplicação via `docker compose`
2. Aguarda os serviços estarem disponíveis (`wait-on`)
3. Instala dependências e browsers do Playwright
4. Executa a suíte completa
5. Publica o relatório HTML como artefato (30 dias de retenção)

**Status do último run:** Success — 2m 52s

---

## Observações finais

Dois pontos merecem destaque pela transparência recomendada no desafio:

**1. Bug de persistência do toggle (testes 16 e 17):** O `useTasks.ts` atualiza apenas o estado React local no `toggleComplete` sem chamar `PATCH /tasks/:id`. Os testes de persistência detectam corretamente esse bug e estão marcados com `test.fail()`. Quando o bug for corrigido, basta remover o `test.fail()` e os testes passarão normalmente.

**2. Modelo de IA divergente:** O PRD documenta `mistralai/mistral-7b-instruct:free` mas a aplicação usa `gemma-3-4b-it:free` (trocado por indisponibilidade conforme commit `fc8c933`). Os testes de erro da IA foram implementados via `page.route()` para serem agnósticos ao modelo — funcionam independentemente de qual modelo estiver em uso.