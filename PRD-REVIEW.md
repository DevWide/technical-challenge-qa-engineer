# PRD-REVIEW.md — Smart To-Do List com IA

**Revisor:** Rafael Barbosa  
**Data da revisão:** 2026-04-08  
**Documento revisado:** PRD — Smart To-Do List com IA (v1.2)  
**Status do PRD:** Aprovado para desenvolvimento

---

## Sumário executivo

A revisão identificou **12 problemas** distribuídos entre ambiguidades, requisitos ausentes, critérios de aceitação incompletos, riscos técnicos, segurança e acessibilidade. Os pontos de maior risco estão concentrados na feature de geração por IA (RF-05) e na ausência total de requisitos de segurança e acessibilidade para uma aplicação que manipula chaves de API de terceiros diretamente na interface.

---

## [PRD-001] API Key exposta na interface sem qualquer requisito de segurança

**Requisito afetado:** RF-06  
**Categoria:** Segurança

### Problema identificado

O RF-06 descreve apenas que "a interface deve disponibilizar um campo para que o usuário insira essa chave", sem nenhuma menção a como essa chave deve ser armazenada, transmitida ou protegida. Não há requisito sobre mascaramento do campo (tipo `password`), criptografia em trânsito, armazenamento seguro no cliente ou no servidor, nem sobre o tempo de vida da chave na sessão.

### Por que isso é um risco

Uma API Key do OpenRouter tem custo financeiro direto associado. Se armazenada em `localStorage` sem criptografia, exposta em logs do servidor, ou transmitida via query string, pode ser capturada por scripts de terceiros (XSS), por ferramentas de monitoramento ou simplesmente visível em replays de sessão (ex: Hotjar, FullStory). O impacto vai desde uso indevido da cota do usuário até cobranças financeiras inesperadas.

### Sugestão de melhoria

```
RF-06 — Configuração de API Key do Provedor de IA

Critérios de aceitação adicionais:
- O campo de inserção da API Key deve ser do tipo `password` (valor mascarado por padrão)
- A chave deve ser transmitida exclusivamente via HTTPS, nunca como parâmetro de URL
- A chave não deve ser armazenada em logs de servidor nem em ferramentas de analytics
- O frontend deve armazenar a chave apenas em memória de sessão (sessionStorage ou estado
  React), não em localStorage persistente
- A chave não deve aparecer em nenhum relatório de erro ou stack trace exposto ao cliente
```

---

## [PRD-002] Comportamento da UI no estado vazio não especificado

**Requisito afetado:** RF-01  
**Categoria:** Requisito ausente

### Problema identificado

O RF-01 descreve o comportamento da lista quando há tarefas, mas não especifica o que a interface deve exibir quando a lista está vazia — nem na primeira visita do usuário, nem após exclusão de todas as tarefas. O critério de aceitação correspondente também omite esse cenário.

### Por que isso é um risco

Uma tela em branco sem orientação é um ponto de abandono clássico em produtos de produtividade. Para a persona Marina (baixa tolerância para erros silenciosos), uma interface vazia sem nenhuma instrução pode ser interpretada como falha técnica, não como estado vazio esperado. Além disso, a ausência de especificação leva cada desenvolvedor a implementar o estado vazio de forma diferente, gerando inconsistência entre sprints.

### Sugestão de melhoria

```
RF-01 — Listagem de Tarefas (adição ao critério de aceitação):
- Quando não houver tarefas cadastradas, a interface deve exibir uma mensagem de estado
  vazio (ex: "Nenhuma tarefa ainda. Crie sua primeira tarefa ou use a IA para gerar um
  plano.") acompanhada de uma chamada para ação visível.
- O estado vazio deve ser visualmente distinto de um erro de carregamento.
```

---

## [PRD-003] Ausência de limite de caracteres no título da tarefa

**Requisito afetado:** RF-02  
**Categoria:** Critério de aceitação incompleto

### Problema identificado

O RF-02 especifica que o usuário pode inserir o título da tarefa em um formulário, mas não define nenhum limite mínimo ou máximo de caracteres. Não há requisito sobre o que acontece ao submeter um campo vazio, um título com apenas espaços, ou um título excessivamente longo (ex: 10.000 caracteres).

### Por que isso é um risco

Sem validação de tamanho mínimo, a aplicação pode criar tarefas com título vazio ou composto só de espaços em branco, corrompendo a lista visualmente. Sem limite máximo, títulos extremamente longos podem quebrar o layout, causar erros de truncamento no banco de dados (SQLite tem limites de coluna), ou gerar payloads inesperadamente grandes. A ausência de feedback de erro para campo vazio viola expectativas básicas de usabilidade.

### Sugestão de melhoria

```
RF-02 — Criação Manual de Tarefa (adição ao critério de aceitação):
- O campo de título deve ter no mínimo 1 caractere não-espaço e no máximo 255 caracteres
- A tentativa de criar uma tarefa com título vazio ou composto apenas de espaços deve
  exibir uma mensagem de erro inline (ex: "O título não pode ser vazio")
- A tentativa de exceder o limite máximo deve bloquear a digitação ou exibir aviso
- O campo deve fazer trim dos espaços iniciais e finais antes de salvar
```

---

## [PRD-004] Critério de aceitação de RF-03 não define o que é "persistir"

**Requisito afetado:** RF-03  
**Categoria:** Ambiguidade

### Problema identificado

O critério de aceitação de RF-03 diz "a mudança de estado deve persistir", mas não especifica em qual escopo: persiste apenas durante a sessão? Persiste após reload da página? Persiste após reinicialização do servidor? Com SQLite como banco de dados, espera-se persistência total, mas o PRD não torna isso explícito.

### Por que isso é um risco

Um desenvolvedor pode implementar persistência apenas em memória (estado React) e passar nos critérios de aceitação conforme escritos. Em produção, qualquer reload perderia o estado de conclusão de todas as tarefas — um bug crítico que o critério atual não capturaria em review.

### Sugestão de melhoria

```
RF-03 — Marcar como Concluída (revisão do critério):
- A mudança de estado deve ser persistida no banco de dados e sobreviver a reloads
  de página e reinicializações do servidor.
- Após marcar uma tarefa como concluída e recarregar a página, a tarefa deve continuar
  exibindo o estado "concluída".
```

---

## [PRD-005] RF-03 não especifica a desconclusão (toggle reverso)

**Requisito afetado:** RF-03  
**Categoria:** Requisito ausente

### Problema identificado

O RF-03 descreve apenas a ação de marcar uma tarefa como concluída, mas não menciona a operação inversa: desmarcar uma tarefa concluída para retorná-la ao estado pendente. O critério de aceitação também omite esse fluxo. A interface implementada (checkbox interativo) naturalmente suporta toggle bidirecional, mas o comportamento esperado na desconclusão não está documentado.

### Por que isso é um risco

Sem especificação, o comportamento de desconclusão pode ser implementado de formas inconsistentes: alguns desenvolvedores podem desabilitar o checkbox após a conclusão, outros podem exigir confirmação, outros podem implementar o toggle livremente. A ausência do requisito também significa que não existe critério de teste para cobrir esse fluxo — que é frequente no uso real de listas de tarefas.

### Sugestão de melhoria

```
RF-03 — Marcar/Desmarcar como Concluída (expansão do requisito):
- O elemento interativo deve funcionar como um toggle bidirecional: clicar em uma
  tarefa pendente a marca como concluída; clicar em uma tarefa concluída a retorna
  ao estado pendente.
- Ambas as direções do toggle devem persistir no banco de dados.
- Critério de aceitação adicional: O usuário clica no checkbox de uma tarefa já
  concluída e a tarefa retorna ao estado "pendente" com feedback visual correspondente.
```

---

## [PRD-006] RF-05 não define formato esperado da resposta da IA nem estratégia de parsing

**Requisito afetado:** RF-05  
**Categoria:** Risco técnico | Critério de aceitação incompleto

### Problema identificado

O RF-05 diz que o sistema deve "processar a resposta recebida e extrair as subtarefas sugeridas", mas não define: qual é o formato esperado da resposta da IA? A IA deve retornar uma lista numerada? JSON? Markdown? Quantas subtarefas são esperadas (mínimo/máximo)? O que acontece se a IA retornar uma resposta em formato inesperado, narrativo, ou recusar o objetivo por políticas de conteúdo?

### Por que isso é um risco

LLMs são não-determinísticos por natureza. O modelo `gemma-3-4b-it:free` (conforme commit recente no repositório) pode retornar respostas em formatos variados dependendo do prompt, temperatura e contexto. Sem um contrato claro de formato e uma estratégia de parsing robusta, a feature pode falhar silenciosamente — criando zero tarefas sem feedback ao usuário — ou criar tarefas malformadas com fragmentos de texto da resposta. Esse risco já está parcialmente listado na seção 8 do PRD ("respostas não estruturadas ou parciais da IA podem causar falhas no parsing"), mas não foi traduzido em requisito funcional ou critério de aceitação.

### Sugestão de melhoria

```
RF-05 — Geração de Tarefas por IA (adição ao requisito):
- O prompt enviado à IA deve instruir explicitamente o formato de resposta esperado
  (ex: lista de itens, um por linha, sem numeração, sem texto introdutório)
- O sistema deve definir um número mínimo (1) e máximo (ex: 10) de subtarefas aceitas
- Se o parsing da resposta retornar zero subtarefas válidas, o sistema deve exibir
  mensagem de erro explicativa ao usuário (ex: "Não foi possível gerar tarefas para
  este objetivo. Tente reformular.")
- Se a IA retornar erro HTTP ou timeout, o sistema deve exibir mensagem de erro
  amigável sem expor detalhes técnicos da falha
```

---

## [PRD-007] Nenhum requisito sobre feedback de erro para o usuário

**Requisito afetado:** RF-02, RF-05, RF-06  
**Categoria:** Requisito ausente

### Problema identificado

O PRD não define em nenhum momento como a aplicação deve se comportar diante de erros: falha na criação de tarefa, API Key inválida, timeout da IA, erro de rede, resposta HTTP 4xx/5xx do backend. Os critérios de aceitação cobrem apenas o caminho feliz (happy path).

### Por que isso é um risco

Para a persona Marina ("baixa tolerância para erros silenciosos — se algo não funcionar sem aviso, não volta"), erros silenciosos são o caminho mais curto para abandono permanente da plataforma. Sem especificação, cada desenvolvedor implementa (ou omite) mensagens de erro de forma inconsistente. Erros técnicos expostos diretamente ao usuário (stack traces, mensagens de banco de dados) também representam risco de segurança.

### Sugestão de melhoria

```
Adicionar seção de Requisitos de Feedback e Tratamento de Erros:

RNF-04 — Feedback de erro ao usuário
- Toda operação que pode falhar (criação, exclusão, geração por IA) deve exibir
  mensagem de erro amigável em caso de falha, sem expor detalhes técnicos internos
- Erros de API Key inválida devem ser comunicados de forma específica
  (ex: "API Key inválida. Verifique sua chave no OpenRouter.")
- Erros de rede/timeout devem oferecer opção de retry
- Mensagens de erro devem desaparecer automaticamente ou ter botão de dismiss
```

---

## [PRD-008] Requisitos não funcionais insuficientes — ausência de performance e segurança

**Requisito afetado:** Seção 5 — Requisitos Não Funcionais  
**Categoria:** Requisito ausente | Segurança

### Problema identificado

A seção de RNFs cobre apenas compatibilidade de browsers, responsividade e disponibilidade do backend. Estão completamente ausentes: requisitos de tempo de resposta (SLA de latência), segurança (HTTPS obrigatório, headers de segurança, proteção contra XSS/CSRF), rate limiting nas rotas de API, e comportamento esperado durante indisponibilidade do provedor de IA.

### Por que isso é um risco

Sem SLA de latência, a feature de IA pode operar com timeouts de 30-60 segundos sem que isso seja considerado um defeito. Sem requisitos de segurança, a aplicação pode ir para produção sem HTTPS, sem headers `Content-Security-Policy`, ou com rotas de API abertas sem qualquer rate limiting — exposta a abuso e scraping. A persona Lucas ("pouca paciência para lentidão") abandonaria a feature se não houver expectativa clara de tempo de resposta.

### Sugestão de melhoria

```
Adicionar à seção 5 — Requisitos Não Funcionais:

- Performance: A criação manual de tarefa deve ter tempo de resposta inferior a 500ms
  em condições normais. A geração por IA deve exibir feedback de progresso para
  operações que excedam 3 segundos.
- Segurança: Todas as comunicações entre frontend e backend devem ocorrer via HTTPS
  em ambiente de produção. As rotas de API devem implementar rate limiting básico
  (ex: máximo 30 requisições/minuto por IP).
- Degradação graciosa: Em caso de indisponibilidade do provedor de IA, a funcionalidade
  de criação manual de tarefas deve continuar operando normalmente.
```

---

## [PRD-009] Ausência completa de requisitos de acessibilidade

**Requisito afetado:** Seção 5 — Requisitos Não Funcionais  
**Categoria:** Acessibilidade

### Problema identificado

O PRD não contém nenhum requisito de acessibilidade. Não há menção a navegação por teclado, compatibilidade com leitores de tela, contraste mínimo de cores, uso de atributos ARIA, ou conformidade com WCAG. Isso inclui o checkbox de conclusão (RF-03), que é um elemento interativo crítico.

### Por que isso é um risco

Sem requisitos de acessibilidade, a aplicação provavelmente será desenvolvida sem semântica HTML adequada, sem `aria-label` em botões com ícones, e sem suporte a navegação por teclado. Além do impacto em usuários com deficiência, a ausência de acessibilidade representa risco legal em mercados regulados e impede que a aplicação atenda padrões mínimos de qualidade para produto SaaS.

### Sugestão de melhoria

```
Adicionar à seção 5 — Requisitos Não Funcionais:

- Acessibilidade: A interface deve atender ao nível WCAG 2.1 AA como baseline mínimo:
  - Todos os elementos interativos devem ser operáveis via teclado
  - Elementos com função não óbvia pelo nome devem ter aria-label descritivo
  - O contraste entre texto e fundo deve respeitar a proporção mínima de 4.5:1
  - O estado de conclusão das tarefas deve ser comunicado a leitores de tela
    (ex: via aria-checked no checkbox ou role="status" em atualizações dinâmicas)
```

---

## [PRD-010] Modelo de IA diverge entre PRD e implementação sem registro formal

**Requisito afetado:** RF-05, RF-06  
**Categoria:** Risco técnico | Ambiguidade

### Problema identificado

O PRD v1.2 especifica o modelo `mistralai/mistral-7b-instruct:free` via OpenRouter. O repositório, no entanto, tem um commit recente (`fix: update AI model from mistral-7b (404) to gemma-3-4b-it:free`) indicando que o modelo foi trocado por indisponibilidade. Essa mudança não foi refletida no PRD nem documentada como decisão formal. A seção "Questões em Aberto" (Q3) permanece com status "Em definição".

### Por que isso é um risco

Uma divergência entre o modelo documentado no PRD e o modelo em produção significa que qualquer QA que tente reproduzir comportamentos da IA com base no PRD estará testando o modelo errado. Diferentes modelos têm capacidades, formatos de resposta e políticas de conteúdo distintos. A Q3 marcada como "Em definição" em um documento "Aprovado para desenvolvimento" é uma inconsistência de processo que pode causar regressões silenciosas se o modelo for trocado novamente sem critério definido.

### Sugestão de melhoria

```
- Atualizar o PRD para refletir o modelo atual em uso (gemma-3-4b-it:free)
- Fechar a Q3 com a decisão registrada e a justificativa técnica
- Adicionar ao RF-05 ou RF-06 um critério sobre o processo de mudança de modelo:
  qualquer troca de modelo de IA deve passar por validação de comportamento antes
  do deploy (smoke test com objetivos representativos)
```

---

## [PRD-011] Risco de negócio de exigir API Key própria não tem mitigação definida

**Requisito afetado:** RF-06, Seção 8 — Dependências e Riscos  
**Categoria:** Risco técnico | Requisito ausente

### Problema identificado

A seção 8 reconhece explicitamente o risco: "Usuários sem API Key própria não conseguem utilizar a feature principal." No entanto, esse risco não tem nenhuma mitigação ou requisito associado. O PRD não define: o que a interface exibe para um usuário que não inseriu API Key e tenta gerar tarefas? Existe alguma chave padrão do sistema? Existe orientação de como obter a chave?

### Por que isso é um risco

A feature de geração por IA é descrita como o principal diferencial da Sinky (meta: 40% de adoção semanal). Se o onboarding dessa feature exige que o usuário crie uma conta no OpenRouter, gere uma chave e a insira na interface — sem nenhuma orientação contextual — a fricção de ativação será alta, contradizendo o objetivo de "reduzir a fricção de planejamento". O risco identificado na seção 8 deveria ser um requisito funcional, não apenas uma nota.

### Sugestão de melhoria

```
RF-06 — Configuração de API Key (adição):
- A interface deve exibir uma mensagem orientativa quando o campo de API Key estiver
  vazio e o usuário tentar acionar a geração (ex: "Insira sua API Key do OpenRouter
  para usar esta funcionalidade. Crie uma chave gratuita em openrouter.ai/keys")
- O link para criação da chave deve ser acessível diretamente da interface
- Avaliar para v1.1: disponibilizar uma chave compartilhada da Sinky com cota limitada
  para novos usuários (reduz fricção de onboarding)
```

---

## [PRD-012] Confirmação de exclusão ausente no requisito e nos critérios

**Requisito afetado:** RF-04  
**Categoria:** Critério de aceitação incompleto | Ambiguidade

### Problema identificado

O RF-04 define que "o usuário deve poder excluir individualmente qualquer tarefa da lista" e que "após a exclusão, a tarefa não deve mais aparecer na listagem". Não há nenhuma menção sobre confirmação antes da exclusão: a exclusão é imediata? Existe diálogo de confirmação? Existe opção de desfazer (undo)?

### Por que isso é um risco

Exclusão sem confirmação é uma ação destrutiva e irreversível em um sistema sem histórico de versões. Com SQLite e sem soft delete implementado, uma exclusão acidental destrói dados permanentemente. Para tarefas geradas por IA — onde o usuário pode ter um plano inteiro criado — excluir acidentalmente uma tarefa sem possibilidade de recuperação é uma experiência frustrante que pode gerar abandono. A ausência de especificação levará implementações inconsistentes (alguns devs adicionarão confirmação, outros não).

### Sugestão de melhoria

```
RF-04 — Exclusão de Tarefa (revisão do critério de aceitação):
- Decisão necessária pelo time de produto: a exclusão deve ser imediata (com undo
  temporário tipo "toast com desfazer" por 5 segundos) ou mediante confirmação
  explícita (dialog modal)?
- Para v1.0, recomenda-se ao menos um toast de confirmação com opção de desfazer,
  dado que não há histórico de objetivos e a exclusão é irreversível.
- O critério de aceitação deve cobrir o caminho de cancelamento da exclusão,
  não apenas a exclusão bem-sucedida.
```

---

## Resumo dos problemas por categoria

| Categoria | Quantidade | IDs |
|---|---|---|
| Segurança | 2 | PRD-001, PRD-008 |
| Requisito ausente | 4 | PRD-002, PRD-005, PRD-007, PRD-011 |
| Critério de aceitação incompleto | 3 | PRD-003, PRD-006, PRD-012 |
| Ambiguidade | 2 | PRD-004, PRD-010 |
| Risco técnico | 2 | PRD-006, PRD-010 |
| Acessibilidade | 1 | PRD-009 |

> Nota: PRD-006 e PRD-010 aparecem em duas categorias por natureza híbrida.

---

## Observação final do revisor

O PRD demonstra clareza nos objetivos de negócio e nas personas, e a seção "Fora do Escopo" é bem definida. Os problemas identificados concentram-se nas lacunas entre o que está especificado e o que é necessário para que a aplicação chegue a produção com qualidade aceitável — especialmente nas dimensões de segurança, acessibilidade e resiliência da feature de IA. A divergência entre o modelo documentado e o modelo em uso (PRD-010) sugere que o processo de atualização do PRD após decisões técnicas precisa ser fortalecido.