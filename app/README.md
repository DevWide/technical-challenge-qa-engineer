# Smart To-Do — Aplicação de referência

Esta é a aplicação entregue como parte do desafio técnico para a vaga de **QA Engineer** na Sinky.

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/) instalados
- Porta **3000** e **3001** disponíveis na sua máquina

## Como rodar

```bash
# Clone o repositório
git clone <URL_DO_REPOSITÓRIO>
cd <nome-do-repositório>/app

# Suba a stack completa (primeira execução pode levar alguns minutos)
docker-compose up --build

# Aguarde até ver: "Backend rodando em http://localhost:3001"
```

Acesse:

| Serviço       | URL                            |
| ------------- | ------------------------------ |
| Aplicação     | http://localhost:3000          |
| API (Swagger) | http://localhost:3001/api/docs |

## Feature de geração por IA

A feature de geração por IA usa o modelo `mistralai/mistral-7b-instruct:free` via **OpenRouter**, que é **gratuito e não exige cartão de crédito**.

Para utilizá-la:

1. Crie uma conta em https://openrouter.ai
2. Gere uma API Key em https://openrouter.ai/keys
3. Cole a chave no campo "API Key" da interface da aplicação

## Parar a aplicação

```bash
docker-compose down
```

Para remover os dados do banco também:

```bash
docker-compose down -v
```
