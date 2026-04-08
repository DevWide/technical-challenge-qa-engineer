# TEST-STRATEGY.md — Smart To-Do List com IA

**Autor:** Rafael Barbosa  
**Data:** 2026-04-08  
**Produto:** Smart To-Do — Sinky  
**Stack:** Next.js 14 · NestJS · SQLite (TypeORM) · OpenRouter (gemma-3-4b-it:free) · Docker Compose

---

## 1. Análise de Risco

### 1.1 Mapa de risco por funcionalidade

A análise combina dois eixos: **probabilidade de falha** (com base nos achados da auditoria exploratória e na revisão do PRD) e **impacto no negócio** (com base nos objetivos de produto definidos na seção 2 do PRD).

| Funcionalidade | Probabilidade de Falha | Impacto no Negócio | Nível de Risco |
|---|---|---|---|
| Geração de tarefas por IA (RF-05) | Alta | Crítico | 🔴 Crítico |
| Criação manual de tarefa (RF-02) | Média | Alto | 🟠 Alto |
| Persistência de estado (RF-03, RF-04) | Baixa | Alto | 🟡 Médio |
| Configuração de API Key (RF-06) | Média | Alto | 🟠 Alto |
| Listagem e estado vazio (RF-01) | Baixa | Médio | 🟡 Médio |
| Contratos de API (todos os endpoints) | Média | Médio | 🟡 Médio |

### 1.2 Justificativa por área de risco

**🔴 Geração de tarefas por IA — risco crítico**

Esta é a feature diferenciadora da Sinky (meta: 40% de adoção semanal) e a de maior complexidade técnica. Os riscos são múltiplos e se combinam:

- **Dependência externa não controlada:** o sistema depende do OpenRouter e do modelo `gemma-3-4b-it:free`, ambos fora do controle da equipe. O próprio histórico do repositório registra uma troca forçada de modelo por indisponibilidade (`mistral-7b` → `gemma-3-4b-it`), confirmando que esse risco já se materializou uma vez.
- **Não-determinismo:** LLMs produzem respostas variáveis em formato e conteúdo. O parsing das subtarefas pode falhar silenciosamente se a resposta não estiver no formato esperado.
- **Falha silenciosa comprovada:** a auditoria exploratória confirmou que um HTTP 500 na segunda geração consecutiva não exibe nenhum feedback ao usuário (BUG-003), violando diretamente o RF-05 e a expectativa da persona Marina ("baixa tolerância para erros silenciosos").
- **Ausência de loading indicator:** o RF-05 exige explicitamente um indicador de carregamento, que não foi implementado (BUG-005).

**🟠 Criação manual de tarefa — risco alto**

É o fluxo mais básico do produto e já apresenta falha de validação confirmada: campo vazio não gera feedback (BUG-001). A ausência de validação no frontend, combinada com a validação existente apenas no backend, cria inconsistência que pode gerar experiências confusas em cenários de falha de rede.

**🟠 Configuração de API Key — risco alto**

A API Key é uma credencial com custo financeiro associado. Embora o campo já esteja mascarado (comportamento positivo observado), não há requisitos claros sobre armazenamento, persistência entre sessões ou tratamento de chave inválida. O fluxo de onboarding da feature de IA depende inteiramente dessa configuração.

**🟡 Persistência de estado — risco médio**

O PRD não define explicitamente que a persistência deve sobreviver a reloads (PRD-004 na revisão). O SQLite com TypeORM em Docker Volume garante persistência, mas isso não foi testado em cenário de reinicialização de container. A desconclusão de tarefas também não está especificada no PRD (PRD-005).

**🟡 Contratos de API — risco médio**

A auditoria identificou inconsistências de schema entre endpoints (BUG-008), endpoint `PATCH` aceitando campo fora do escopo (BUG-006), e respostas de erro não documentadas no Swagger (BUG-007). Em um produto com integração frontend-backend, contratos inconsistentes aumentam a superfície de regressão a cada mudança.

---

## 2. Pirâmide de Testes

### 2.1 Estrutura recomendada para a stack Smart To-Do

```
                    ▲
                   /E2E\
                  / 10%  \
                 /─────────\
                / Integração \
               /    25%       \
              /─────────────────\
             /    Unitários       \
            /        65%           \
           /─────────────────────────\
```

### 2.2 Camada unitária (65%) — base da pirâmide

**Backend (NestJS):**

- `TasksService`: testar cada método isoladamente com repositório mockado (TypeORM `Repository` mock)
  - `create()`: validação de título, geração de UUID, flag `isAiGenerated: false`
  - `findAll()`: retorno correto de lista vazia e lista com itens
  - `findOne()`: comportamento com ID existente e ID inexistente (deve lançar `NotFoundException`)
  - `update()`: atualização de `isCompleted`, rejeição de campo `title` (após correção do BUG-006)
  - `remove()`: confirmação de remoção e comportamento com ID inexistente

- `AiService`: testar o parsing da resposta do LLM de forma isolada
  - Parsing de resposta bem-formatada (lista de itens)
  - Parsing de resposta mal-formatada (texto narrativo, JSON inesperado, resposta vazia)
  - Comportamento com timeout do OpenRouter
  - Comportamento com resposta de erro HTTP 4xx/5xx do OpenRouter

**Frontend (Next.js):**

- Componentes React com Testing Library:
  - `TaskForm`: validação de campo vazio, trim de espaços, submit com valor válido
  - `TaskItem`: renderização de checkbox, badge IA, botão de exclusão
  - `AiGenerator`: estado de loading, exibição de erro, limpeza de campo após sucesso
  - `EmptyState`: renderização condicional quando lista vazia

**Framework sugerido:** Jest + Testing Library para frontend; Jest + `@nestjs/testing` para backend.

### 2.3 Camada de integração (25%) — meio da pirâmide

Foco nos contratos entre camadas e na integração com o banco de dados real (SQLite em memória para testes):

- **API → Banco de dados:** testes de controller + service + repositório sem mock de banco
  - `POST /tasks` com título válido persiste e retorna 201 com schema correto
  - `POST /tasks` com body vazio retorna 400 com schema de erro padronizado
  - `PATCH /tasks/:id` com ID inexistente retorna 404
  - `DELETE /tasks/:id` remove do banco e retorna 204
  - `GET /tasks` após série de operações reflete estado correto

- **AiService → OpenRouter:** testes de integração com servidor mock (MSW ou `nock`)
  - Resposta bem-formatada do OpenRouter → tarefas criadas corretamente
  - Resposta mal-formatada → zero tarefas criadas + erro adequado retornado
  - Timeout de rede → erro tratado sem 500 genérico

- **Testes de contrato de API:** usando Playwright `request` context ou Supertest
  - Validar schema de todas as respostas de sucesso contra tipos TypeScript
  - Validar schema consistente de todas as respostas de erro

**Framework sugerido:** Jest + Supertest para backend; MSW para mock de rede no frontend.

### 2.4 Camada E2E (10%) — topo da pirâmide

Foco nos fluxos críticos de negócio de ponta a ponta, conforme estrutura da Fase 3:

- Criação manual de tarefa (incluindo edge cases de validação)
- Toggle de conclusão/desconclusão com verificação de persistência após reload
- Exclusão e confirmação de ausência na lista
- Estado vazio da UI
- Comportamento de erro de API (simulado via `page.route()`)

**Cobertura proposital excluída do E2E:** casos de borda de banco de dados, validações de campo individuais, parsing de resposta da IA — esses pertencem às camadas inferiores onde são mais rápidos e determinísticos.

**Framework:** Playwright + TypeScript com padrão Page Object Model.

### 2.5 Testes especiais — fora da pirâmide tradicional

**Testes de contrato (contract testing):**  
Dado que o sistema depende do OpenRouter como provedor externo, é altamente recomendável implementar testes de contrato que verifiquem se a resposta do modelo de IA ainda atende ao formato esperado pelo parser do backend. Ferramentas como Pact podem automatizar esse contrato, mas para a escala atual, um smoke test periódico contra o endpoint real é suficiente.

**Testes de acessibilidade:**  
Integrar `@axe-core/playwright` na suíte E2E para detectar violações WCAG automaticamente a cada execução. Não substituem auditoria manual, mas capturam regressões.

---

## 3. Processo — Melhorias para Antecipar Problemas de Qualidade

### 3.1 Shift-left: QA na fase de requisitos

O principal problema identificado neste ciclo foi a ausência de requisitos para cenários de falha (tratamento de erro, estados vazios, validações de campo) e a falta de especificação de comportamentos de borda na feature de IA. Isso resultou em bugs que poderiam ter sido evitados com 30 minutos de revisão de PRD antes do desenvolvimento.

**Proposta:** Instituir um **QA Gate no PRD** — antes de qualquer story entrar em desenvolvimento, o QA Engineer revisa o documento de requisitos e preenche um checklist mínimo:

```
□ Todos os cenários de erro estão especificados?
□ Os critérios de aceitação cobrem o caminho infeliz (unhappy path)?
□ Dependências externas têm estratégia de fallback definida?
□ Campos de entrada têm limites de tamanho e validações explícitas?
□ Estados vazios e de loading estão descritos?
```

### 3.2 Definition of Done com critérios de qualidade

A Definition of Done atual do time não parece incluir critérios de qualidade técnica. Proposta de adição:

```
□ Testes unitários escritos para lógica de negócio nova
□ Nenhuma resposta de erro sem schema documentado no Swagger
□ Nenhum campo de formulário sem validação de entrada
□ Tratamento de erro implementado para todas as chamadas de API externa
□ Loading state implementado para todas as operações assíncronas > 300ms
□ Testes E2E passando para os fluxos afetados pela mudança
```

### 3.3 Testes de regressão automatizados em PR

A ausência de qualquer automação de testes no repositório atual significa que cada mudança é validada apenas manualmente. Com a suíte Playwright implementada na Fase 3, o próximo passo natural é executá-la em cada Pull Request via GitHub Actions (Bônus B2), garantindo que regressões sejam capturadas antes do merge.

**Fluxo proposto:**

```
PR aberto → CI executa suíte E2E → 
  ✅ Todos passando → merge liberado
  ❌ Falha detectada → merge bloqueado + report publicado como artefato
```

### 3.4 Monitoramento de dependências externas

O histórico do repositório mostra que o modelo de IA foi trocado de emergência por uma indisponibilidade não antecipada. Para evitar que isso se repita em produção:

- Implementar health check periódico do endpoint `/ai/generate` em staging
- Configurar alerta quando a taxa de erro do `POST /ai/generate` ultrapassar 5%
- Documentar formalmente o processo de troca de modelo (qual o critério? quem aprova? como validar que o novo modelo atende ao contrato de resposta?)

### 3.5 Gestão de segredos e API Keys

A feature de geração por IA exige que o usuário forneça sua própria API Key. Isso cria um ponto de atrito no onboarding que não está mitigado no processo atual. Para as próximas features que envolvam credenciais de terceiros:

- Definir no PRD como a chave é armazenada (memória de sessão vs. localStorage vs. backend)
- Incluir no escopo de QA a verificação de que credenciais não aparecem em logs, headers de resposta, ou relatórios de erro

---

## 4. Conexão com os Achados da Fase 1 (PRD-REVIEW)

Os bugs identificados na auditoria exploratória confirmam os riscos levantados na revisão do PRD:

| Risco no PRD | Bug confirmado na auditoria |
|---|---|
| PRD-002: Estado vazio não especificado | BUG-002: Estado vazio sem mensagem |
| PRD-003: Sem limite de caracteres no título | BUG-001: Campo vazio aceito sem feedback |
| PRD-004: "Persistir" ambíguo | Não reproduzido — requer teste de reinicialização |
| PRD-005: Desconclusão não especificada | Comportamento implementado, mas sem cobertura de teste |
| PRD-006: Formato da resposta da IA não definido | BUG-003: 500 silencioso na segunda geração |
| PRD-007: Sem requisito de feedback de erro | BUG-001, BUG-003, BUG-005: múltiplos erros silenciosos |
| PRD-010: Divergência de modelo no PRD | Confirmado pelo histórico de commits |

A correlação entre riscos de PRD e bugs encontrados reforça a tese de que a revisão de requisitos é a forma mais custo-efetiva de prevenção de defeitos nesta plataforma.