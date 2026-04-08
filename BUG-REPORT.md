# BUG-REPORT.md — Smart To-Do List com IA

**Autor:** Rafael Barbosa  
**Data da sessão exploratória:** 2026-04-08  
**Ambiente:** Docker Compose local — Frontend http://localhost:3000 · Backend http://localhost:3001  
**Versão:** commit `fc8c933` (fix: update AI model from mistral-7b to gemma-3-4b-it:free)

---

## Sumário

| ID | Título | Severidade | Prioridade | Componente |
|---|---|---|---|---|
| BUG-001 | Campo de título aceita submissão vazia sem feedback ao usuário | Alta | P2 | Frontend |
| BUG-002 | Estado vazio da lista não exibe mensagem orientativa | Média | P3 | Frontend / UX |
| BUG-003 | Erro 500 na geração por IA não exibe feedback ao usuário | Crítica | P1 | Frontend / Backend |
| BUG-004 | Campo de objetivo não é limpo após geração bem-sucedida por IA | Baixa | P4 | Frontend / UX |
| BUG-005 | Ausência de indicador de carregamento durante geração por IA | Alta | P2 | Frontend / UX |
| BUG-006 | Backend aceita `PATCH /tasks/{id}` com campo `title` — fora do escopo do PRD | Média | P3 | Backend / API |
| BUG-007 | Resposta 400 do `POST /tasks` não documentada no contrato Swagger | Baixa | P4 | API |
| BUG-008 | Schema de resposta de erro inconsistente entre endpoints | Média | P3 | Backend / API |
| BUG-009 | Exclusão de tarefa sem confirmação e sem opção de desfazer | Média | P3 | Frontend / UX |
| BUG-010 | Rota raiz do backend (`GET /`) expõe mensagem de erro técnica | Baixa | P4 | Backend / Segurança |
| BUG-011 | Header `x-powered-by: Express` exposto em todas as respostas | Baixa | P4 | Backend / Segurança |
| BUG-012 | Contador de tarefas no header não distingue concluídas de pendentes | Baixa | P4 | Frontend / UX |

---

## [BUG-001] Campo de título aceita submissão vazia sem feedback ao usuário

**Severidade:** Alta  
**Prioridade:** P2  
**Componente:** Frontend

### Descrição

Ao clicar no botão "Adicionar" com o campo de título vazio (ou preenchido apenas com espaços), nenhuma ação ocorre e nenhuma mensagem de erro é exibida ao usuário. A interface permanece silenciosa, sem indicar que o campo é obrigatório.

### Passos para Reproduzir

1. Acessar http://localhost:3000
2. Deixar o campo "Adicionar nova tarefa..." vazio
3. Clicar no botão "Adicionar"

### Resultado Esperado

A interface deve exibir uma mensagem de erro inline informando que o título é obrigatório (ex: "O título não pode ser vazio") e manter o foco no campo.

### Resultado Obtido

Nenhum feedback visual ou mensagem de erro. O botão não executa nenhuma ação visível. O usuário não sabe se houve falha ou se o sistema ignorou a ação.

### Evidência

Reproduzido manualmente em sessão exploratória (2026-04-08). O backend retorna `400 Bad Request` com `"title must be a string"` quando a API é chamada diretamente com `{}` — confirmando que a validação existe no backend mas não foi implementada no frontend.

### Sugestão de Correção

```typescript
if (!title.trim()) {
  setError('O título não pode ser vazio');
  return;
}
```

---

## [BUG-002] Estado vazio da lista não exibe mensagem orientativa

**Severidade:** Média  
**Prioridade:** P3  
**Componente:** Frontend / UX

### Descrição

Quando não há tarefas cadastradas — seja na primeira visita ou após excluir todas as tarefas — a área de listagem exibe apenas espaço em branco, sem nenhuma mensagem, ilustração ou chamada para ação.

### Passos para Reproduzir

1. Acessar http://localhost:3000 com lista vazia (ou excluir todas as tarefas)
2. Observar a área abaixo do formulário de adição

### Resultado Esperado

Mensagem de estado vazio (ex: "Nenhuma tarefa ainda. Adicione sua primeira tarefa ou use a IA para gerar um plano.") com visual distinto de um estado de erro.

### Resultado Obtido

Área completamente em branco. O contador no header exibe "0 tarefas" mas a área da lista não oferece nenhuma orientação.

### Evidência

Screenshot da sessão exploratória — lista com "0 tarefas" exibe área vazia sem conteúdo orientativo.

### Sugestão de Correção

```tsx
{tasks.length === 0 && (
  <div role="status">
    <p>Nenhuma tarefa ainda. Crie sua primeira tarefa ou use a IA para gerar um plano.</p>
  </div>
)}
```

---

## [BUG-003] Erro 500 na geração por IA não exibe nenhum feedback ao usuário

**Severidade:** Crítica  
**Prioridade:** P1  
**Componente:** Frontend / Backend

### Descrição

Ao acionar a geração por IA pela segunda vez consecutiva na mesma sessão, o backend retorna HTTP 500 Internal Server Error. A interface não exibe nenhuma mensagem de erro — a tela permanece no estado anterior silenciosamente. O erro é visível apenas no painel de rede do DevTools.

### Passos para Reproduzir

1. Acessar http://localhost:3000
2. Inserir API Key válida do OpenRouter
3. Digitar objetivo "Lançar um novo produto de software" e clicar "Gerar tarefas" → sucesso (6 tarefas geradas)
4. Digitar novo objetivo "Lançar um Produto de Front-End" e clicar "Gerar tarefas" novamente

### Resultado Esperado

- Se sucesso: novas tarefas aparecem na lista
- Se erro: mensagem amigável exibida (ex: "Não foi possível gerar as tarefas. Tente novamente.")

### Resultado Obtido

Backend retorna `HTTP 500 Internal Server Error` para `POST /ai/generate`. A interface não exibe nenhuma mensagem — lista permanece inalterada e o usuário não recebe qualquer indicação de falha.

### Evidência

Screenshot Image 4 da sessão exploratória (segunda rodada com API Key):
- DevTools → Rede: `POST /ai/generate` → **500 Internal Server Error**
- UI: nenhuma mensagem de erro exibida
- Ícone de erro vermelho visível na aba DevTools

### Sugestão de Correção

**Frontend:** Tratar o erro e exibir feedback:
```typescript
try {
  await generateTasks(apiKey, objective);
} catch (error) {
  setErrorMessage('Não foi possível gerar as tarefas. Tente novamente.');
}
```
**Backend:** Investigar causa raiz do 500 na segunda requisição consecutiva — possível problema de estado interno no serviço de IA, timeout ou leak de conexão com o OpenRouter.

---

## [BUG-004] Campo de objetivo não é limpo após geração bem-sucedida por IA

**Severidade:** Baixa  
**Prioridade:** P4  
**Componente:** Frontend / UX

### Descrição

Após geração bem-sucedida de tarefas por IA, o campo de texto do objetivo permanece preenchido. O campo de título de criação manual é limpo após uso (comportamento correto), mas o campo de objetivo da IA não segue o mesmo padrão.

### Passos para Reproduzir

1. Inserir API Key válida e digitar um objetivo
2. Clicar "Gerar tarefas" e aguardar as tarefas aparecerem
3. Observar o campo de objetivo após a geração

### Resultado Esperado

Campo de objetivo limpo após geração bem-sucedida, sinalizando ao usuário que a ação foi concluída.

### Resultado Obtido

Campo permanece preenchido com o texto do objetivo anterior, convidando re-submissão acidental.

### Evidência

Screenshot Image 2 da segunda sessão exploratória — após geração bem-sucedida, campo de objetivo permanece preenchido.

### Sugestão de Correção

```typescript
const handleGenerate = async () => {
  await generateTasks(apiKey, objective);
  setObjective('');
};
```

---

## [BUG-005] Ausência de indicador de carregamento durante geração por IA

**Severidade:** Alta  
**Prioridade:** P2  
**Componente:** Frontend / UX

### Descrição

O PRD (RF-05) especifica explicitamente: "O sistema deve exibir um indicador de carregamento enquanto a IA processa a requisição." Durante os testes com API Key válida, nenhum indicador de carregamento (spinner, skeleton, texto de progresso ou desabilitação do botão) foi observado durante o processamento.

### Passos para Reproduzir

1. Inserir API Key válida e um objetivo
2. Clicar em "Gerar tarefas"
3. Observar o botão e a área de lista durante o processamento

### Resultado Esperado

Indicador visual durante o processamento (spinner, skeleton ou mensagem). Botão "Gerar tarefas" desabilitado para evitar submissões duplicadas.

### Resultado Obtido

Nenhum indicador de carregamento. Botão permanece clicável durante o processamento, podendo gerar múltiplas requisições simultâneas. Transição abrupta de vazio para lista preenchida.

### Evidência

Screenshot Image 1 da segunda sessão exploratória — estado imediatamente antes de clicar "Gerar tarefas": botão ativo, sem qualquer loading state. Comportamento confirmado: UI ficou sem resposta visual durante o processamento.

> **Nota:** Este bug representa uma regressão direta em relação ao RF-05 do PRD, que documenta o loading indicator como requisito funcional obrigatório.

### Sugestão de Correção

```tsx
const [isGenerating, setIsGenerating] = useState(false);

<button disabled={isGenerating}>
  {isGenerating ? <Spinner /> : 'Gerar tarefas'}
</button>
```

---

## [BUG-006] `PATCH /tasks/{id}` aceita atualização de título — fora do escopo do PRD

**Severidade:** Média  
**Prioridade:** P3  
**Componente:** Backend / API

### Descrição

O endpoint `PATCH /tasks/{id}` aceita o campo `title` e efetiva a atualização do título. O PRD v1.2 coloca "Edição de título de tarefas já criadas" explicitamente fora do escopo da v1.0 (seção 7). A funcionalidade está no backend mas não exposta na UI — podendo ser explorada via Swagger ou curl.

### Passos para Reproduzir

1. Acessar http://localhost:3001/api/docs
2. Expandir `PATCH /tasks/{id}`
3. Informar ID válido e body: `{"title": "Novo título", "isCompleted": true}`
4. Clicar Execute

### Resultado Esperado

Endpoint aceita apenas `isCompleted`. Campo `title` deve ser ignorado ou retornar 400.

### Resultado Obtido

HTTP 200 com título efetivamente alterado:
```json
{
  "id": "3a2efdae-ef1f-4957-9c9c-c9b4c0961d85",
  "title": "Novo título",
  "isCompleted": true
}
```

### Evidência

Screenshot Image 6 da primeira sessão exploratória.

### Sugestão de Correção

```typescript
export class UpdateTaskDto {
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
  // title removido do DTO conforme escopo v1.0
}
```

---

## [BUG-007] Resposta 400 do `POST /tasks` não documentada no Swagger

**Severidade:** Baixa  
**Prioridade:** P4  
**Componente:** API

### Descrição

O endpoint `POST /tasks` retorna HTTP 400 para body inválido, mas essa resposta aparece como "Undocumented" no Swagger UI — apenas o caso de sucesso (201) está documentado.

### Passos para Reproduzir

1. Acessar http://localhost:3001/api/docs
2. Executar `POST /tasks` com body `{}`
3. Observar label "Undocumented" na resposta 400

### Evidência

Screenshot Teste B da sessão exploratória.

### Sugestão de Correção

```typescript
@ApiResponse({ status: 400, description: 'Dados inválidos — title obrigatório' })
@Post()
create(@Body() dto: CreateTaskDto) { ... }
```

---

## [BUG-008] Schema de resposta de erro inconsistente entre endpoints

**Severidade:** Média  
**Prioridade:** P3  
**Componente:** Backend / API

### Descrição

Endpoints retornam schemas de erro estruturalmente diferentes para situações análogas.

### Resultado Obtido

**POST /tasks (400):** `{ "message": ["title must be a string"], "error": "Bad Request", "statusCode": 400 }`

**GET /tasks/{id} (404):** `{ "error": "Task not found" }`

### Evidência

Screenshots Teste B e Teste C da sessão exploratória.

### Sugestão de Correção

Implementar `ExceptionFilter` global no NestJS para normalizar todas as respostas de erro.

---

## [BUG-009] Exclusão de tarefa sem confirmação e sem opção de desfazer

**Severidade:** Média  
**Prioridade:** P3  
**Componente:** Frontend / UX

### Descrição

O botão de exclusão remove a tarefa imediatamente, sem confirmação. A operação é irreversível pois não há soft delete no SQLite.

### Passos para Reproduzir

1. Criar uma tarefa
2. Clicar no ícone de lixeira

### Resultado Esperado

Diálogo de confirmação ou toast com opção "Desfazer" por 5 segundos.

### Resultado Obtido

Tarefa removida instantaneamente sem nenhuma proteção contra exclusão acidental.

### Evidência

Reproduzido manualmente. Screenshot Image 3 (segunda rodada) — múltiplos DELETEs visíveis no painel de rede.

---

## [BUG-010] Rota raiz do backend (`GET /`) expõe mensagem de erro técnica

**Severidade:** Baixa  
**Prioridade:** P4  
**Componente:** Backend / Segurança

### Descrição

`http://localhost:3001/` retorna `{"message":"Cannot GET /","error":"Not Found","statusCode":404}`, expondo o framework NestJS.

### Sugestão de Correção

Adicionar controller raiz com resposta genérica ou redirect para `/api/docs`.

---

## [BUG-011] Header `x-powered-by: Express` exposto em todas as respostas

**Severidade:** Baixa  
**Prioridade:** P4  
**Componente:** Backend / Segurança

### Descrição

Header `x-powered-by: Express` presente em 100% das respostas, facilitando fingerprinting da stack.

### Evidência

Visível nos headers de todas as respostas em ambas as sessões exploratórias, incluindo Screenshot Image 3 (segunda rodada): `X-Powered-By: Express`.

### Sugestão de Correção

```typescript
app.getHttpAdapter().getInstance().disable('x-powered-by');
```

---

## [BUG-012] Contador de tarefas no header não distingue concluídas de pendentes

**Severidade:** Baixa  
**Prioridade:** P4  
**Componente:** Frontend / UX

### Descrição

Badge no header exibe total de tarefas sem diferenciar concluídas de pendentes.

### Sugestão de Correção

```typescript
const pendingCount = tasks.filter(t => !t.isCompleted).length;
// Exibir: `${pendingCount} pendente${pendingCount !== 1 ? 's' : ''}`
```

---

## Observações adicionais

### Comportamentos positivos observados

- Campo de API Key implementado com `type="password"` — valor mascarado corretamente 
- Tarefas geradas por IA identificadas com badge "IA" na listagem 
- `DELETE /tasks/{id}` retorna HTTP 204 sem body 
- `GET /tasks/{id}` com ID inexistente retorna HTTP 404 
- `POST /tasks` valida presença do campo `title` no backend 
- CORS configurado corretamente para `http://localhost:3000` 
- IDs das tarefas usam UUID v4 — sem risco de enumeração sequencial 
- Geração por IA funcional com chave válida — 6 tarefas geradas com sucesso na primeira chamada 

### Itens não testados nesta sessão

- Comportamento com API Key inválida (chave sintaticamente válida mas rejeitada pelo OpenRouter)
- Comportamento com rate limiting do OpenRouter atingido
- Persistência do estado após reinicialização do container Docker
- Testes de carga e comportamento com múltiplas requisições simultâneas