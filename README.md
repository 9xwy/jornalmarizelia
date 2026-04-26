# Jornal Marizelia

Portal escolar da Escola Municipal Marizelia, criado para reunir noticias, agenda, galeria de fotos, producoes dos alunos, avisos e enquetes em uma experiencia unica.

## Visao geral

O projeto funciona como um jornal digital escolar. A area publica usa conteudo demonstrativo quando o Supabase nao esta configurado, o que permite publicar o site estatico imediatamente. O painel administrativo fica pronto para operar com Supabase Auth, regras de permissao por email e tabelas SQL versionadas no repositorio.

## Recursos

- Pagina inicial editorial com destaques, agenda, galeria, trabalhos e avisos.
- Rotas dedicadas para noticias, calendario, galeria, trabalhos dos alunos e mural de avisos.
- Painel administrativo para CRUD de conteudo e enquetes.
- Configuracoes editaveis do site para rodape, contato, equipe editorial e redes sociais.
- Upload de imagens pelo Supabase Storage no painel administrativo.
- Fallback com conteudo demonstrativo para ambientes sem banco configurado.
- Headers de seguranca e fallback de SPA preparados para Vercel, Netlify e Cloudflare Pages.
- Schema SQL do Supabase incluido em `supabase/schema.sql`.

## Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui e Radix UI
- TanStack Query
- Supabase
- Vitest

## Como rodar localmente

```bash
npm install
npm run dev
```

O servidor local usa a porta configurada em `vite.config.ts`:

```txt
http://127.0.0.1:8080/
```

## Variaveis de ambiente

Crie uma copia de `.env.example` como `.env.local` para uso local.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
VITE_ENABLE_TEMP_ADMIN_LOGIN=false
VITE_TEMP_ADMIN_USERNAME=admin-local
VITE_TEMP_ADMIN_PASSWORD=change-me-local
```

Para producao, configure apenas as variaveis do Supabase na plataforma de deploy e mantenha `VITE_ENABLE_TEMP_ADMIN_LOGIN=false`.

## Configurando o Supabase

1. Crie um projeto no Supabase.
2. Rode o arquivo `supabase/schema.sql` no SQL Editor.
3. Crie o usuario administrador em Supabase Auth.
4. Libere exatamente o mesmo email usado para entrar no Supabase Auth:

```sql
insert into public.allowed_admin_emails (email, label)
values ('seu-email@exemplo.com', 'Administrador principal')
on conflict (email) do nothing;
```

Se o email logado no painel nao estiver nessa tabela, o Supabase bloqueia publicacoes e edicoes pelas regras de seguranca.

O schema tambem cria o bucket publico `jornal-media` no Supabase Storage. Esse bucket e usado para enviar imagens pelo painel administrativo e aceita arquivos JPG, PNG, WEBP e GIF de ate 5 MB.

## Scripts

```bash
npm run dev      # servidor local
npm run build    # build de producao
npm run preview  # preview da build
npm run lint     # analise estatica
npm run test     # testes automatizados
```

## Deploy

### Vercel

O repositorio ja inclui `vercel.json` com headers de seguranca e rewrite para SPA.

Configuracoes recomendadas:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Outros hosts estaticos

Netlify e Cloudflare Pages usam os arquivos `public/_headers` e `public/_redirects`. Em outros provedores, configure fallback de todas as rotas para `/index.html`.

## Verificacoes

Antes de publicar uma nova versao:

```bash
npm run lint
npm run test
npm run build
npm audit --omit=dev
```
