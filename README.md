# Compara-Lá App - Frontend

Frontend do aplicativo Compara-Lá, desenvolvido com Next.js e Tailwind CSS.

## 🚀 Tecnologias

- **Next.js 14** - Framework React
- **Tailwind CSS** - Estilização
- **Axios** - Requisições HTTP
- **Recharts** - Gráficos e visualizações

## 📦 Instalação

```bash
npm install
```

## 🏃 Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🏗️ Build para Produção

```bash
npm run build
npm start
```

## 📁 Estrutura

```
src/
├── pages/          # Páginas da aplicação
├── components/     # Componentes reutilizáveis
├── lib/            # Utilitários e API
└── styles/         # Estilos globais
```

## 🔧 Configuração

Crie um arquivo `.env.local` na raiz do frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## 📄 Páginas Disponíveis

- `/` - Página inicial com busca
- `/dashboard` - Dashboard com histórico
- `/upload` - Upload de planilhas
- `/login` - Tela de login
