# 🚀 Instruções para Upload no GitHub

Este documento contém os passos para versionar o projeto **Compara-Lá App** no GitHub.

## 📋 Pré-requisitos

- Git instalado na sua máquina
- Conta no GitHub
- Repositório criado: `https://github.com/erickbrendal/compara-la-app`

## 🔧 Passos para Configuração

### 1. Extrair o arquivo ZIP

```bash
unzip compara-la-app.zip
cd compara-la-app
```

### 2. Inicializar o repositório Git

```bash
git init
```

### 3. Adicionar todos os arquivos

```bash
git add .
```

### 4. Fazer o primeiro commit

```bash
git commit -m "Versão inicial do Compara-Lá App"
```

### 5. Renomear a branch para main

```bash
git branch -M main
```

### 6. Adicionar o repositório remoto

```bash
git remote add origin https://github.com/erickbrendal/compara-la-app.git
```

### 7. Fazer o push para o GitHub

```bash
git push -u origin main
```

## 🔐 Autenticação

Se solicitado, use um dos métodos:

### Personal Access Token (Recomendado)

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione as permissões: `repo`, `workflow`
4. Copie o token gerado
5. Use o token como senha ao fazer push

### SSH (Alternativa)

1. Gere uma chave SSH:
   ```bash
   ssh-keygen -t ed25519 -C "seu-email@example.com"
   ```

2. Adicione a chave ao GitHub:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Cole em: https://github.com/settings/keys

3. Altere a URL do remote:
   ```bash
   git remote set-url origin git@github.com:erickbrendal/compara-la-app.git
   ```

## 📦 Comandos Git Úteis

### Ver status dos arquivos
```bash
git status
```

### Adicionar novos arquivos
```bash
git add .
```

### Fazer commit de mudanças
```bash
git commit -m "Descrição das mudanças"
```

### Enviar para o GitHub
```bash
git push
```

### Criar uma nova branch
```bash
git checkout -b nome-da-branch
```

### Voltar para a branch main
```bash
git checkout main
```

### Atualizar repositório local
```bash
git pull
```

## 🏷️ Criando Tags (Versões)

```bash
git tag -a v1.0.0 -m "Versão 1.0.0"
git push origin v1.0.0
```

## 🌿 Workflow Recomendado

1. **Criar branch para nova feature**
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

2. **Fazer mudanças e commits**
   ```bash
   git add .
   git commit -m "Adiciona nova funcionalidade"
   ```

3. **Enviar branch para o GitHub**
   ```bash
   git push origin feature/nova-funcionalidade
   ```

4. **Criar Pull Request no GitHub**
   - Acesse o repositório no GitHub
   - Clique em "Pull Requests" > "New Pull Request"
   - Selecione a branch e crie o PR

5. **Após aprovação, fazer merge na main**

## 📝 Boas Práticas

- ✅ Faça commits frequentes com mensagens descritivas
- ✅ Use branches para novas features
- ✅ Mantenha o `.gitignore` atualizado
- ✅ Documente mudanças importantes no README
- ✅ Use tags para marcar versões estáveis
- ❌ Nunca commite arquivos sensíveis (`.env`, chaves de API)
- ❌ Evite commits muito grandes

## 🆘 Solução de Problemas

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/erickbrendal/compara-la-app.git
```

### Erro: "failed to push some refs"
```bash
git pull origin main --rebase
git push origin main
```

### Desfazer último commit (mantendo mudanças)
```bash
git reset --soft HEAD~1
```

### Desfazer mudanças não commitadas
```bash
git checkout -- .
```

## 📚 Recursos Adicionais

- [Documentação Git](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

✨ **Pronto!** Seu projeto está versionado e disponível no GitHub!
