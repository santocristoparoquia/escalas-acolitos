# Sistema de Escalas - Paróquia Senhor Santo Cristo dos Milagres

Sistema de gerenciamento de escalas para acólitos e coroinhas da Paróquia Senhor Santo Cristo dos Milagres.

## 📋 Funcionalidades

- **Landing Page**: Página inicial informativa sobre o sistema
- **Autenticação**: Sistema de login e cadastro de usuários
- **Gestão de Pessoas**: Cadastro e gerenciamento de acólitos, coroinhas e cerimoniários
- **Criação de Escalas**: Interface para criar e organizar escalas por comunidade
- **Consulta de Escalas**: Visualização e edição de escalas existentes
- **Escalas Públicas**: Página pública para consulta de escalas sem necessidade de login
- **Relatórios**: Estatísticas e relatórios mensais de participação
- **Multi-comunidade**: Suporte para múltiplas comunidades

## 🚀 Tecnologias

- **React** 18.3.1 - Framework JavaScript
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Framework de estilos
- **Shadcn/ui** - Componentes de UI
- **Supabase** - Backend (autenticação e banco de dados)
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de dados
- **date-fns** - Manipulação de datas
- **Lucide React** - Ícones

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd sistema-escalas
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configure o banco de dados

Execute o arquivo `backup-database.sql` no seu banco de dados PostgreSQL/Supabase:

```bash
psql -U seu_usuario -d seu_banco < backup-database.sql
```

Ou importe via interface do Supabase Dashboard:
1. Acesse seu projeto no Supabase
2. Vá para SQL Editor
3. Cole o conteúdo do arquivo `backup-database.sql`
4. Execute o script

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase
VITE_SUPABASE_PROJECT_ID=seu_id_do_projeto
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
src/
├── assets/              # Imagens e recursos estáticos
│   └── logo-paroquia.png
├── components/
│   ├── dashboard/       # Componentes do painel administrativo
│   │   ├── ConsultarEscalasTab.tsx
│   │   ├── EscalasTab.tsx
│   │   ├── PessoasTab.tsx
│   │   └── RelatoriosTab.tsx
│   └── ui/              # Componentes reutilizáveis (shadcn)
├── integrations/
│   └── supabase/        # Configuração do Supabase
├── pages/               # Páginas da aplicação
│   ├── Auth.tsx         # Página de autenticação
│   ├── Dashboard.tsx    # Painel administrativo
│   ├── EscalasPublicas.tsx  # Página pública de escalas
│   ├── Index.tsx        # Página inicial (redirecionamento)
│   ├── Landing.tsx      # Landing page
│   └── NotFound.tsx     # Página 404
└── lib/                 # Utilitários
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **profiles**: Perfis de usuários (ligado ao auth.users)
- **comunidades**: Comunidades da paróquia
- **pessoas**: Cadastro de acólitos, coroinhas e cerimoniários
- **escalas**: Escalas criadas
- **escala_participantes**: Participantes de cada escala
- **horarios**: Horários de missas por comunidade

### Views

- **escalas_publicas**: View pública com escalas e participantes
- **estatisticas_mensais**: Estatísticas de participação mensal

## 👤 Primeiro Acesso - Criar Administrador

Após instalar o sistema, você precisa promover manualmente o primeiro usuário a administrador:

1. Faça o cadastro normalmente pelo sistema
2. Execute no banco de dados:

```sql
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'seu-email@exemplo.com';
```

## 🌐 Deploy

### Netlify

O projeto já está configurado para deploy no Netlify. O arquivo `public/_redirects` garante que o roteamento funcione corretamente.

1. Faça push do código para seu repositório Git
2. Conecte seu repositório no Netlify
3. Configure as variáveis de ambiente no Netlify
4. Deploy automático será realizado

### Lovable

Você pode fazer o deploy diretamente através do [Lovable](https://lovable.dev/projects/d83c2efd-bc91-4adc-8994-a1ef5e8f6fcf):
- Clique em Share → Publish

### Outras Plataformas

O projeto pode ser hospedado em qualquer serviço que suporte aplicações React:
- Vercel
- Cloudflare Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 📱 Funcionalidades por Perfil

### Administrador
- ✅ Gerenciar pessoas (criar, editar, desativar)
- ✅ Criar e editar escalas
- ✅ Consultar todas as escalas
- ✅ Visualizar relatórios e estatísticas
- ✅ Gerenciar comunidades

### Usuário Regular
- ✅ Visualizar mensagem de boas-vindas
- ✅ Aguardar aprovação do administrador

### Acesso Público (sem login)
- ✅ Visualizar escalas públicas
- ✅ Filtrar escalas por comunidade e mês

## 🔒 Segurança

O sistema implementa:
- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Autenticação via Supabase Auth
- ✅ Políticas de acesso baseadas em perfil
- ✅ Proteção de rotas no frontend

### ⚠️ Avisos de Segurança Conhecidos

O sistema possui algumas vulnerabilidades conhecidas que devem ser corrigidas antes do uso em produção:

1. **Roles de administrador armazenados inseguramente** - O campo `is_admin` está na tabela `profiles` ao invés de uma tabela separada de roles
2. **RLS não habilitado em `escala_participantes`** - Necessário executar: `ALTER TABLE public.escala_participantes ENABLE ROW LEVEL SECURITY;`
3. **Telefones expostos publicamente** - Números de telefone visíveis para todos os usuários autenticados
4. **View pública sem RLS** - A view `escalas_publicas` não possui políticas de acesso definidas
5. **Falta validação de entrada** - Implementar validação com Zod em todos os formulários

Consulte a seção de segurança na documentação para mais detalhes sobre como corrigir esses problemas.

## 🎨 Personalização

### Alterar o Logo

Substitua o arquivo `src/assets/logo-paroquia.png` pelo logo da sua paróquia.

### Alterar Cores

As cores do tema podem ser ajustadas em:
- `src/index.css` - Variáveis CSS
- `tailwind.config.ts` - Configuração do Tailwind

## 📞 Suporte

Para dúvidas ou problemas:
- Acesse o [Projeto no Lovable](https://lovable.dev/projects/d83c2efd-bc91-4adc-8994-a1ef5e8f6fcf)
- Abra uma issue no repositório

## 📄 Licença

Este projeto foi desenvolvido para uso interno da Paróquia Senhor Santo Cristo dos Milagres.

---

**Desenvolvido com ❤️ para a comunidade paroquial**
