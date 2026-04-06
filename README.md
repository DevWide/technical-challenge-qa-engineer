# Sinky Technical Challenge — QA Engineer

## Contexto

Na Sinky, qualidade não é uma etapa no final do processo — é uma responsabilidade **distribuída, contínua e estratégica**. Como QA Engineer, você atua em todas as fases do ciclo de desenvolvimento: desde a revisão de requisitos, passando pela auditoria da aplicação, até a construção da malha de testes automatizados.

Este desafio simula exatamente esse ciclo. Você receberá:

1. Um **PRD** (Product Requirements Document) já escrito pelo time de produto
2. Uma **aplicação funcional** desenvolvida com base nesse PRD
3. A missão de garantir a qualidade em cada uma dessas camadas

---

## A Aplicação: Smart To-Do List

Uma lista de tarefas com integração de IA — o usuário descreve um objetivo (ex: "Lançar um produto") e a IA decompõe esse objetivo em subtarefas acionáveis, que são persistidas e gerenciadas pelo sistema.

### Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Backend | NestJS + TypeScript |
| Banco de Dados | SQLite (via TypeORM) |
| IA | OpenRouter (`mistralai/mistral-7b-instruct:free`) |
| Infra | Docker Compose |

### Como rodar (pré-requisito: Docker instalado)

\`\`\`bash
git clone <URL_DO_REPOSITÓRIO>
cd <nome-do-repositório>/app
docker-compose up --build
\`\`\`

| Serviço | URL |
|---|---|
| Aplicação | http://localhost:3000 |
| API (Swagger) | http://localhost:3001/api/docs |

> A feature de IA usa o modelo \`mistralai/mistral-7b-instruct:free\` via OpenRouter, que é **gratuito**. Crie uma chave em https://openrouter.ai/keys e insira na interface da aplicação.

---

## O Desafio

O desafio é dividido em **3 fases sequenciais**. As fases refletem o ciclo real de atuação de um QA Engineer na Sinky.

---

## Fase 1 — Revisão de PRD (25% da avaliação)

Antes de qualquer linha de código existir, o QA deve atuar como guardião da qualidade nos requisitos.

O arquivo \`PRD.md\` (na raiz deste repositório) é o documento de produto que guiou o desenvolvimento da aplicação. Seu trabalho nesta fase é analisá-lo **antes de olhar para a aplicação** e identificar tudo que pode causar problemas de qualidade.

### Entregável: \`PRD-REVIEW.md\`

Crie o arquivo \`PRD-REVIEW.md\` na raiz do seu repositório. Para cada problema identificado no PRD, utilize o template abaixo:

\`\`\`markdown
## [PRD-XXX] Título descritivo do problema

**Requisito afetado:** RF-XX ou RNF
**Categoria:** Ambiguidade | Requisito ausente | Critério de aceitação incompleto | Risco técnico | Segurança | Acessibilidade

### Problema identificado
[Descreva o que está errado, incompleto ou ambíguo no PRD]

### Por que isso é um risco
[Qual o impacto se isso for para produção sem ser tratado?]

### Sugestão de melhoria
[Como você reescreveria ou complementaria esse requisito?]
\`\`\`

> **Dica:** Analise não só o que está escrito, mas também o que **não está** escrito. Requisitos de qualidade muitas vezes vivem nas lacunas.

---

## Fase 2 — Auditoria da Aplicação (30% da avaliação)

Agora que você conhece os requisitos, é hora de colocar a aplicação à prova.

Realize uma **sessão de testes exploratórios** cobrindo todas as funcionalidades — interface, API (\`/api/docs\`) e comportamentos de borda. Documente tudo que encontrar.

### Entregáveis

#### \`BUG-REPORT.md\`

Para cada defeito encontrado, use o template:

\`\`\`markdown
## [BUG-XXX] Título descritivo e objetivo

**Severidade:** Crítica | Alta | Média | Baixa
**Prioridade:** P1 | P2 | P3 | P4
**Componente:** Frontend | Backend | API | UX | Acessibilidade | Segurança

### Descrição
[O que acontece de errado e por que é um problema]

### Passos para Reproduzir
1. ...
2. ...
3. ...

### Resultado Esperado
[O que deveria acontecer]

### Resultado Obtido
[O que realmente acontece]

### Evidência
[Screenshot, vídeo, log de console ou resposta de API]

### Sugestão de Correção
[Opcional, mas valorizado]
\`\`\`

#### \`TEST-STRATEGY.md\`

Um documento estratégico com sua visão sobre qualidade nesta plataforma:

- **Análise de risco:** quais funcionalidades representam maior risco para o negócio e por quê
- **Pirâmide de testes:** como você estruturaria os tipos de teste nessa stack (unitário, integração, E2E, contrato)
- **Processo:** o que você mudaria no processo de desenvolvimento para antecipar problemas de qualidade nas próximas features

> **Dica:** Não se limite à interface. Teste os contratos de API diretamente, inspecione o console do browser, avalie mensagens de erro e comportamentos de borda. Conecte o que encontrar na aplicação com o que você identificou no PRD na Fase 1.

---

## Fase 3 — Suíte de Testes E2E com Playwright (45% da avaliação)

Construa uma suíte de testes automatizados E2E utilizando **Playwright + TypeScript** para cobrir os fluxos críticos da aplicação.

### Requisitos obrigatórios

- [ ] Configurar o projeto Playwright dentro de um diretório \`e2e/\` na raiz do repositório
- [ ] Implementar o padrão **Page Object Model (POM)**
- [ ] Cobrir os seguintes fluxos críticos:
  - **Criação de tarefa** — incluindo validação de campos (edge cases)
  - **Conclusão e desconclusão** — toggle de status e verificação de persistência após reload de página
  - **Exclusão** — remoção e confirmação de ausência na lista
  - **Estado vazio** — comportamento da UI quando não há tarefas
  - **Erro de API** — UX quando a API retorna erro (simule via \`page.route()\`)
- [ ] Testes **determinísticos** — cada teste cria e limpa seu próprio estado, sem depender de dados pré-existentes
- [ ] Selectors estáveis — priorize \`data-testid\`, \`role\` e \`aria-label\` sobre classes CSS ou XPath

### Requisitos de qualidade do código

- \`playwright.config.ts\` configurado com \`baseURL\`, \`retries\`, \`screenshot: 'only-on-failure'\`
- Estrutura de pastas clara e escalável
- TypeScript com tipagem forte
- \`README.md\` dentro de \`e2e/\` com instruções de execução

### Estrutura de pastas esperada

\`\`\`
e2e/
  pages/
    TaskListPage.ts
    TaskFormPage.ts
    AiGeneratorPage.ts
  fixtures/
    tasks.fixture.ts
  tests/
    task-creation.spec.ts
    task-completion.spec.ts
    task-deletion.spec.ts
    empty-state.spec.ts
    error-handling.spec.ts
  playwright.config.ts
  package.json
  README.md
\`\`\`

### Comandos que o avaliador vai executar

\`\`\`bash
cd e2e
npm install
npx playwright test
npx playwright show-report
\`\`\`

---

## Bônus (diferencial)

Estes itens **não são obrigatórios**, mas serão fortemente valorizados:

#### B1 — Testes de API
Usando Playwright \`request\` context ou outro framework, implemente testes de contrato cobrindo:
- Status codes corretos para cada operação
- Schema de resposta (campos obrigatórios, tipos de dados)
- Casos de borda (payload inválido, ID inexistente, campo ausente)

#### B2 — CI com GitHub Actions
Configure \`.github/workflows/e2e.yml\` que:
- Execute a suíte E2E em pull requests
- Publique o relatório HTML do Playwright como artefato do workflow

#### B3 — Acessibilidade
Usando \`@axe-core/playwright\` ou equivalente, documente pelo menos 3 problemas de acessibilidade encontrados na aplicação.

---

## Critérios de Avaliação

### Fase 1 — Revisão de PRD (25%)

| Critério | Peso |
|---|---|
| Cobertura de problemas identificados (quantidade e variedade de categorias) | 40% |
| Qualidade da análise (risco justificado, não apenas "falta detalhes") | 35% |
| Qualidade das sugestões de melhoria | 25% |

### Fase 2 — Auditoria da Aplicação (30%)

| Critério | Peso |
|---|---|
| Cobertura de defeitos encontrados | 35% |
| Qualidade dos bug reports (clareza, reprodutibilidade, evidências) | 30% |
| Classificação adequada de severidade e prioridade | 15% |
| Profundidade estratégica no TEST-STRATEGY.md | 20% |

### Fase 3 — Suíte Playwright (45%)

| Critério | Peso |
|---|---|
| Cobertura dos fluxos críticos obrigatórios | 30% |
| Arquitetura (POM, fixtures, organização de pastas) | 25% |
| Qualidade e estabilidade dos selectors | 20% |
| Código limpo, tipado e idiomático em TypeScript | 15% |
| Documentação e facilidade de execução | 10% |

---

## Estrutura de entrega esperada

\`\`\`
repositório/
  app/                        ← aplicação (não modificar)
  e2e/                        ← Fase 3: suíte Playwright
    pages/
    fixtures/
    tests/
    playwright.config.ts
    package.json
    README.md
  PRD.md                      ← fornecido (não modificar)
  PRD-REVIEW.md               ← Fase 1: sua entrega
  BUG-REPORT.md               ← Fase 2: sua entrega
  TEST-STRATEGY.md            ← Fase 2: sua entrega
  README.md                   ← como rodar a app e os testes
\`\`\`

---

## Prazo e Entrega

- **Prazo:** 5 dias corridos a partir do recebimento deste desafio
- **Entrega:** Repositório público no GitHub (ou privado com acesso ao avaliador)

---

## Mensagem Final

Na Sinky, valorizamos **clareza de raciocínio** tanto quanto capacidade técnica. Se você tomou uma decisão de arquitetura por limitação de tempo, encontrou um defeito mas não conseguiu reproduzi-lo de forma consistente, ou identificou um risco no PRD mas não tem certeza do impacto — **documente isso**. Queremos entender como você pensa, prioriza e comunica.

Boa sorte.
