# Sinky Technical Challenge - Full Stack Senior Engineer

## 🚀 O Desafio: Smart To-Do List (AI-Powered)

Este desafio visa avaliar suas habilidades como **Engenheiro(a) Full-Stack Sênior** na construção de uma aplicação moderna, funcional e resiliente. O objetivo é desenvolver uma **"Smart To-Do List"**: uma lista de tarefas que integra Inteligência Artificial para decompor objetivos de alto nível (ex: "Planejar uma viagem") em subtarefas acionáveis.

---

## 🛠 Stacks Tecnológicas e Requisitos

### 1. Backend: NestJS com TypeScript

O backend será o cérebro da aplicação, responsável pela lógica de negócios, persistência e comunicação com a IA.

* **Lógica de Negócios:** Implementar o gerenciamento completo do ciclo de vida de tarefas:
* Criação, Leitura/Listagem, Atualização (ex: marcar como concluída) e Exclusão.


* **Persistência de Dados:** Utilizar **SQLite** para garantir portabilidade. O modelo da tarefa deve incluir, no mínimo: `id`, `title`, `isCompleted`, `createdAt` e um campo identificando se foi gerada por IA.
* **Integração com IA:**
* Desenvolver um endpoint que receba um prompt/objetivo do usuário.
* Comunicar-se com uma API de Inferência de LLM (Hugging Face, OpenRouter, OpenAI ou similar).
* **Prompt Engineering:** Enviar o prompt de forma estruturada para garantir uma resposta processável (ex: JSON).
* Processar a resposta, extrair as tarefas e persisti-las automaticamente no banco de dados.
* **Segurança:** Deixe um campo disponível para inserir a API Key do provedor; **não** compartilhe sua chave no código.



### 2. Frontend: Next.js com TypeScript

A interface deve ser reativa, intuitiva e consumir a API criada.

* **Gerenciamento de Estado:** Exibir e gerenciar a lista de tarefas de forma eficiente, refletindo criações e atualizações em tempo real sem recarregar a página.
* **Interatividade:**
* Formulário para criação manual de tarefas.
* Ações para marcar/desmarcar conclusão e deletar tarefas.


* **Funcionalidade de IA:**
* Interface clara com campo de texto e botão para descrever o objetivo, além de um campo para adicionar a API Key do provedor.
* **UX de Latência:** Implementar **Loading States** claros e feedbacks visuais enquanto a IA processa a requisição.



---

## 🏗 Engenharia e Qualidade (Critérios de Elite)

Para este nível de posição, avaliaremos a maturidade da sua engenharia:

1. **Arquitetura:** Separação clara de responsabilidades (Controllers, Services, Providers/Modules).
2. **Resiliência:** Tratamento de erros para falhas na API de IA (timeouts ou respostas inválidas).
3. **Documentação:** Uso de **Swagger** para documentar os endpoints da API.
4. **Testes:** Implementação de testes unitários para a lógica de negócio principal no backend.
5. **Docker:** O projeto deve conter um `docker-compose.yml` para rodar a stack completa (Front + Back) com um único comando.

---

## 📐 Critérios de Avaliação

1. **Qualidade do Código:** SOLID, Clean Code e tipagem forte (TypeScript).
2. **Robustez:** Como o sistema lida com o "não determinismo" e falhas de APIs de IA.
3. **Domínio Técnico:** Uso idiomático das ferramentas (NestJS e Next.js).
4. **UX Consciente:** Feedback de erros e estados de espera para o usuário.

---

## 📤 Entrega

1. Repositório público no GitHub (ou privado com acesso liberado).
2. `README.md` com instruções de execução e uma breve explicação das decisões técnicas e trade-offs realizados.

### Dica

Na Sinky, valorizamos o pragmatismo. Se você precisar tomar uma decisão de arquitetura para ganhar tempo ou garantir performance, sinta-se à vontade para fazê-lo, desde que explique o seu raciocínio no README da entrega. Queremos entender como você pensa e como prioriza trade-offs.

---
