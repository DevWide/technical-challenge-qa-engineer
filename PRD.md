# PRD — Smart To-Do List com IA

**Produto:** Smart To-Do  
**Versão do documento:** 1.2  
**Autor:** Time de Produto — Sinky  
**Última atualização:** 18 mar 2026  
**Status:** ✅ Aprovado para desenvolvimento

---

## 1. Contexto e Motivação

Pesquisas internas mostram que aproximadamente 60% dos usuários que chegam à Sinky sabem exatamente o que querem alcançar — um **objetivo de alto nível** ("Lançar meu produto", "Preparar a migração do cliente X") — mas travam na hora de traduzir esse objetivo em ações concretas e priorizadas. Essa fricção gera abandono precoce da plataforma, especialmente nas primeiras sessões.

A funcionalidade **Smart To-Do** resolve esse problema ao permitir que o usuário descreva seu objetivo em linguagem natural e receba automaticamente um plano de ação estruturado em subtarefas, gerado por IA. Além disso, oferece gerenciamento completo desse plano dentro da própria plataforma.

---

## 2. Objetivos e Métricas de Sucesso

| Objetivo                               | Métrica                                        | Meta                    |
| -------------------------------------- | ---------------------------------------------- | ----------------------- |
| Reduzir a fricção de planejamento      | Tempo médio entre login e criação da 1ª tarefa | Redução de 20%          |
| Aumentar engajamento de novos usuários | % de usuários que criam ≥1 tarefa na 1ª sessão | +30%                    |
| Diferenciar a Sinky com IA             | Adoção semanal da feature de geração por IA    | 40% dos usuários ativos |

---

## 3. Personas

### Lucas — Gerente de Projetos, 34 anos

- Gerencia múltiplos projetos simultâneos para clientes diferentes
- Precisa transformar briefs e reuniões em listas de ação rapidamente
- Usa principalmente desktop durante o horário de trabalho
- Tem alta tolerância técnica mas pouca paciência para lentidão

### Marina — Empreendedora, 28 anos

- Lida com muitas frentes ao mesmo tempo: marketing, operação, produto, financeiro
- Prefere capturar ideias no celular e organizar depois no desktop
- É o perfil que mais se beneficia da geração por IA: transforma ideias soltas em planos
- Baixa tolerância para erros silenciosos — se algo não funcionar sem aviso, não volta

---

## 4. Requisitos Funcionais

### RF-01 — Listagem de Tarefas

O sistema deve exibir todas as tarefas em uma lista unificada.

Cada item da lista deve apresentar:

- Título da tarefa
- Estado de conclusão, com diferenciação visual entre tarefas concluídas e não concluídas
- Indicação de que a tarefa foi gerada por IA, quando aplicável

---

### RF-02 — Criação Manual de Tarefa

O usuário deve poder criar uma nova tarefa manualmente, inserindo o título da tarefa em um formulário.

A tarefa recém-criada deve aparecer na lista imediatamente após a confirmação.

---

### RF-03 — Marcar Tarefa como Concluída

O usuário deve poder marcar uma tarefa como concluída através de um elemento interativo (ex: checkbox).

A tarefa deve exibir feedback visual ao ser marcada como concluída. A mudança de estado deve persistir.

---

### RF-04 — Exclusão de Tarefa

O usuário deve poder excluir individualmente qualquer tarefa da lista.

Após a exclusão, a tarefa não deve mais aparecer na listagem.

---

### RF-05 — Geração de Tarefas por IA

O usuário deve poder descrever um objetivo em linguagem natural em um campo de texto dedicado.

Ao confirmar, o sistema deve:

1. Enviar o objetivo para o provedor de IA configurado
2. Processar a resposta recebida e extrair as subtarefas sugeridas
3. Salvar automaticamente as subtarefas geradas na lista do usuário

O sistema deve exibir um indicador de carregamento enquanto a IA processa a requisição.

As tarefas geradas por IA devem ser visualmente diferenciadas das criadas manualmente na listagem.

---

### RF-06 — Configuração de API Key do Provedor de IA

Para utilizar a funcionalidade de geração por IA (RF-05), o usuário deve fornecer sua API Key de um provedor compatível (ex: OpenRouter, OpenAI).

A interface deve disponibilizar um campo para que o usuário insira essa chave.

---

## 5. Requisitos Não Funcionais

- **Compatibilidade:** A interface deve funcionar corretamente nos browsers Chrome e Firefox (duas últimas versões estáveis)
- **Responsividade:** O layout deve ser utilizável em telas a partir de 375px de largura
- **Disponibilidade:** O backend deve estar disponível 99% do tempo (excluindo janelas de manutenção programadas)

---

## 6. Critérios de Aceitação

### RF-01 — Listagem de Tarefas

- [ ] Ao acessar a aplicação, a lista de tarefas é exibida
- [ ] Cada tarefa exibe o título e o estado de conclusão com diferenciação visual
- [ ] Tarefas geradas por IA são visualmente identificadas na lista

### RF-02 — Criação Manual

- [ ] O usuário pode digitar um título no campo de criação e confirmar o formulário
- [ ] A tarefa recém-criada aparece na lista após a confirmação
- [ ] O campo de título é limpo após a criação bem-sucedida

### RF-03 — Marcar como Concluída

- [ ] O usuário clica no elemento interativo e a tarefa passa a exibir o estado "concluída" com feedback visual
- [ ] A mudança de estado persiste

### RF-04 — Exclusão

- [ ] O usuário clica no botão de exclusão e a tarefa não aparece mais na lista

### RF-05 — Geração por IA

- [ ] O usuário descreve um objetivo e aciona a geração
- [ ] O indicador de carregamento é exibido durante o processamento
- [ ] As tarefas geradas aparecem na lista ao final do processamento

### RF-06 — API Key

- [ ] O usuário pode inserir a API Key no campo disponível na interface
- [ ] A funcionalidade de geração por IA fica disponível após a inserção da chave

---

## 7. Fora do Escopo — v1.0

- Autenticação e gestão de múltiplos usuários
- Edição de título de tarefas já criadas
- Ordenação e filtragem manual de tarefas
- Categorias, etiquetas ou projetos
- Notificações e lembretes
- Histórico de objetivos submetidos à IA
- Integração com calendários ou ferramentas externas

---

## 8. Dependências e Riscos

| Tipo             | Descrição                                                                               |
| ---------------- | --------------------------------------------------------------------------------------- |
| Dependência      | Disponibilidade e estabilidade do provedor de IA externo                                |
| Risco técnico    | Latência variável da API de IA pode impactar diretamente a percepção de qualidade       |
| Risco técnico    | Respostas não estruturadas ou parciais da IA podem causar falhas no parsing das tarefas |
| Risco de negócio | Usuários sem API Key própria não conseguem utilizar a feature principal                 |

---

## 9. Questões em Aberto

| #   | Questão                                                                                | Status                                                        |
| --- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Q1  | Devemos mostrar um preview das tarefas geradas antes de salvar, ou salvar diretamente? | ✅ Decidido: salvar diretamente (menos fricção)               |
| Q2  | A indicação "gerada por IA" deve ser um ícone, badge ou texto?                         | ✅ Decidido: time de design define — pode ser ícone ou badge  |
| Q3  | Qual provedor de IA será o padrão?                                                     | 🔄 Em definição — usar OpenRouter como padrão por abrangência |

---

## 10. Notas de Revisão (v1.1 → v1.2)

- Adicionado requisito de identificação visual de tarefas geradas por IA em RF-01 e RF-05
- Funcionalidade de edição de tarefas removida do escopo deste release e movida para backlog
- Confirmado: autenticação e múltiplos usuários permanecem fora do escopo para v1.0
