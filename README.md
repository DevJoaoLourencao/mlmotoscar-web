<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MLMOTOSCAR - Sistema de Gestão de Veículos

Sistema completo de gestão de veículos com catálogo público e painel administrativo.

## 🚀 Configuração Inicial

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Conta no Supabase (gratuita): https://supabase.com

### 1. Instalar Dependências

```bash
yarn install
# ou
npm install
```

### 2. Configurar Supabase

1. Crie um novo projeto no [Supabase](https://app.supabase.com)
2. Vá em **Settings > API** e copie:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon/public key** (VITE_SUPABASE_ANON_KEY)

3. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

### 3. Configurar o Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Execute o script `supabase-schema.sql` que está na raiz do projeto
3. Isso criará todas as tabelas necessárias:
   - `vehicles` - Veículos do estoque
   - `customers` - Clientes
   - `sales` - Vendas
   - `payment_history` - Histórico de pagamentos
   - `settings` - Configurações do sistema

### 4. Configurar Autenticação

1. No painel do Supabase, vá em **Authentication > Users**
2. Clique em **Add User** e crie um usuário administrador
3. Use esse email e senha para fazer login no painel administrativo

### 5. Testar a Conexão com Supabase

Antes de executar o projeto, teste se a conexão está funcionando:

```bash
yarn test:supabase
# ou
npm run test:supabase
```

Este comando irá verificar:
- ✅ Se as variáveis de ambiente estão configuradas
- ✅ Se a conexão com o Supabase está funcionando
- ✅ Se todas as tabelas existem e estão acessíveis
- ✅ Se as políticas RLS estão configuradas corretamente

### 6. Executar o Projeto

```bash
yarn dev
# ou
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
mlmotoscar/
├── components/          # Componentes React reutilizáveis
├── pages/              # Páginas da aplicação
│   ├── admin/         # Páginas administrativas
│   └── ...            # Páginas públicas
├── services/           # Serviços de integração
│   ├── supabase.ts    # Cliente Supabase
│   ├── authService.ts # Autenticação
│   ├── vehicleService.ts
│   ├── customerService.ts
│   ├── salesService.ts
│   └── settingsService.ts
├── types.ts           # Tipos TypeScript
└── supabase-schema.sql # Schema do banco de dados
```

## 🔐 Segurança

O sistema utiliza **Row Level Security (RLS)** do Supabase:
- **Público**: Pode visualizar veículos e configurações
- **Autenticado**: Pode gerenciar veículos, clientes, vendas e configurações

## 📝 Notas Importantes

- As imagens dos veículos são armazenadas como URLs (array de strings)
- Para upload de imagens, considere usar o Supabase Storage
- O campo `payment` na tabela `sales` é armazenado como JSONB
- As configurações são armazenadas em uma única linha na tabela `settings`

## 🤖 MCP Supabase - Começar Agora

O MCP do Supabase está **CONECTADO** e funcionando! 🎉

### 📚 Guias Disponíveis

- **[COMECE_AQUI.md](./COMECE_AQUI.md)** ⭐ - **Comece por aqui!** Próximos passos imediatos
- **[GUIA_PRIMEIROS_PASSOS.md](./GUIA_PRIMEIROS_PASSOS.md)** - Comandos práticos para usar o MCP
- **[MCP_SUPABASE_SETUP.md](./MCP_SUPABASE_SETUP.md)** - Configuração técnica do MCP

### 🚀 Primeiro Passo

1. Execute o `supabase-schema.sql` no SQL Editor do Supabase para criar as tabelas
2. Depois teste pedindo: **"Liste todas as tabelas do meu banco de dados"**

**⚠️ Importante**: O arquivo `.cursor/mcp.json` está no `.gitignore` para proteger suas credenciais.

## 🛠️ Tecnologias Utilizadas

- React 19
- TypeScript
- Vite
- Supabase (PostgreSQL + Auth)
- React Router
- Tailwind CSS
- Lucide Icons
