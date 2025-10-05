# 🛒 Compara-Lá App

**Comparador global de preços inteligente e automatizado**

Um aplicativo web completo voltado para vendedores e compradores dos segmentos alimentício, farmacêutico, eletrodomésticos e industrial. Sistema altamente tecnológico, personalizável e visualmente moderno.

## 🎯 Características

- 🔍 **Busca Inteligente** - Comparação de preços com IA
- 📊 **Dashboard Completo** - Histórico e análises visuais
- 📁 **Upload de Planilhas** - Suporte para CSV e XLSX
- 🎨 **Interface Moderna** - Design responsivo com Tailwind CSS
- 🤖 **Integração OpenAI** - Comparações inteligentes com GPT
- 🔥 **Backend Serverless** - Firebase Functions

## 🚀 Tecnologias

### Frontend
- Next.js 14
- React 18
- Tailwind CSS
- Axios
- Recharts

### Backend
- Firebase Functions
- Node.js 20
- Express.js
- OpenAI API
- Multer (upload)
- csv-parser & xlsx

## 📦 Instalação

### Pré-requisitos
- Node.js 20+
- npm ou yarn
- Firebase CLI (opcional)

### Passo 1: Clonar o repositório

```bash
git clone https://github.com/erickbrendal/compara-la-app.git
cd compara-la-app
```

### Passo 2: Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas chaves de API.

### Passo 3: Instalar dependências

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd ../backend/functions
npm install
```

## 🏃 Executar o Projeto

### Modo Desenvolvimento

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Acesse: http://localhost:3000

**Terminal 2 - Backend:**
```bash
cd backend/functions
npm start
```
API disponível em: http://localhost:5001

### Com Firebase Emulators

```bash
cd backend
firebase emulators:start
```

## 📁 Estrutura do Projeto

```
compara-la-app/
├── frontend/              # Aplicação Next.js
│   ├── src/
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── components/   # Componentes React
│   │   ├── lib/          # Utilitários e API
│   │   └── styles/       # Estilos globais
│   └── public/           # Arquivos estáticos
│
├── backend/              # Firebase Functions
│   └── functions/
│       ├── index.js      # Servidor principal
│       ├── searchHandler.js
│       ├── uploadHandler.js
│       └── openaiHandler.js
│
├── .env.example          # Exemplo de variáveis
├── LICENSE               # Licença MIT
└── README.md             # Este arquivo
```

## 🔧 Configuração OpenAI

1. Obtenha uma chave de API em: https://platform.openai.com
2. Adicione a chave no arquivo `.env`:
   ```
   OPENAI_API_KEY=sua-chave-aqui
   ```

## 🚀 Deploy

### Frontend (Vercel)

```bash
cd frontend
vercel deploy
```

### Backend (Firebase)

```bash
cd backend
firebase deploy --only functions
```

## 📱 Funcionalidades

### 🔍 Busca de Preços
- Pesquisa inteligente com IA
- Comparação entre múltiplos fornecedores
- Exibição de preços, descontos e estoque

### 📊 Dashboard
- Histórico de buscas
- Gráficos de variação de preços
- Análise comparativa

### 📁 Upload de Dados
- Suporte para arquivos CSV e XLSX
- Processamento automático de planilhas
- Validação de dados

### 🎨 Interface
- Design moderno e responsivo
- Modo escuro
- Animações suaves
- Feedback visual

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Erick Brendal**
- GitHub: [@erickbrendal](https://github.com/erickbrendal)

## 🙏 Agradecimentos

- OpenAI pela API de IA
- Firebase pelo backend serverless
- Vercel pelo hosting do Next.js
- Comunidade open source

---

⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!
