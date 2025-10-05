# Compara-Lá App - Backend

Backend serverless do aplicativo Compara-Lá, desenvolvido com Firebase Functions.

## 🚀 Tecnologias

- **Firebase Functions** - Serverless backend
- **Express.js** - Framework web
- **OpenAI API** - Inteligência artificial
- **Multer** - Upload de arquivos
- **csv-parser & xlsx** - Processamento de planilhas

## 📦 Instalação

```bash
cd functions
npm install
```

## 🔑 Configuração

Configure as variáveis de ambiente:

```bash
firebase functions:config:set openai.key="sua-chave-openai"
```

Para desenvolvimento local, crie um arquivo `.env`:

```env
OPENAI_API_KEY=sua-chave-openai
PORT=5001
```

## 🏃 Executar em Desenvolvimento

### Com Firebase Emulators:

```bash
firebase emulators:start
```

### Modo standalone (Node.js):

```bash
cd functions
npm start
```

## 🚀 Deploy

```bash
firebase deploy --only functions
```

## 📡 Endpoints

- `GET /` - Informações da API
- `GET /health` - Health check
- `POST /search` - Busca de produtos
- `POST /upload` - Upload de planilhas

## 🧠 Integração OpenAI

O backend utiliza a API OpenAI para gerar comparações inteligentes de preços. Configure a chave da API nas variáveis de ambiente.

## 📁 Estrutura

```
functions/
├── index.js           # Servidor principal
├── searchHandler.js   # Handler de busca
├── uploadHandler.js   # Handler de upload
└── openaiHandler.js   # Integração OpenAI
```
