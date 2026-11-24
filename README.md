# Microger — SaaS modular (v0.2)

Starter de uma plataforma de gestão **multi-organização / multiespaço**. Inclui autenticação por e-mail/senha, criação de organizações, templates Academia e Financeiro, personalização por espaço (nome, cores e logo) e lançamentos financeiros básicos com isolamento no Firestore.

## O que já funciona

- Criar conta e entrar com Firebase Authentication.
- Criar organizações, cada uma pertencente ao usuário logado.
- Criar espaços a partir dos templates `academy` e `financial`.
- Navegação por módulos conforme o template, com visual responsivo.
- Personalizar nome, cores e logo do espaço.
- Registrar / excluir entradas e saídas e visualizar totais do mês.
- Gerenciar categorias de entradas e saídas por espaço: criar, renomear, arquivar e reativar.
- Inicializar automaticamente as categorias padrão em espaços novos ou já existentes, sem apagar lançamentos antigos.
- Ler e gravar lançamentos no caminho **do espaço corrente**, nunca em uma coleção financeira global.

O módulo **Academia é apenas uma página preparatória**, ainda sem cadastro de alunos e turmas. O módulo **Financeiro é um MVP básico**, com categorias gerenciáveis mas ainda sem recorrências, contas a receber e relatórios avançados.

## Requisitos

- Node.js 20.19+ ou Node.js 22+
- Projeto Firebase novo, habilitado para Web
- Firebase Authentication com método **E-mail/Senha** habilitado
- Cloud Firestore criado
- Cloud Storage configurado (atenção às condições comerciais do Firebase)

## Configuração local (Windows / macOS / Linux)

```bash
npm install
```

Crie um arquivo `.env` copiando `.env.example` e preencha com as configurações do aplicativo Web exibidas no console do Firebase.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**

```bash
cp .env.example .env
```

Exemplo de chaves (sem dados reais):

```env
VITE_FIREBASE_API_KEY=SUA_CHAVE
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=123456
VITE_FIREBASE_APP_ID=1:123456:web:abcdef
```

> As chaves de configuração do Firebase Web não são credenciais administrativas, mas **não** coloque chaves privadas de service account em `.env` com prefixo `VITE_`. As regras de segurança são essenciais.

## Publicar regras

As regras estão nos arquivos `firestore.rules` e `storage.rules`. Publique-as em um **projeto Firebase novo**, após revisar o conteúdo. Nunca substitua as regras do JP Studio Fit por estas.

Pode publicar pelo Firebase Console ou pela CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,storage
```

Para publicar o site, execute:

```bash
npm run build
firebase deploy --only hosting
```

Iniciar em desenvolvimento:

```bash
npm start
```

Use `npm run build` para compilar — **não** `npm start build`.

## Estrutura do banco

```text
users/{uid}
organizations/{orgId}
  { name, ownerId, createdAt }
  workspaces/{spaceId}
    { name, templateId, enabledModules[], theme, logoPath, createdBy, createdAt, updatedAt }
    financeCategoryConfig/initialization
      { initialized, schemaVersion, createdBy, createdAt }
    financeCategories/{categoryId}
      { name, type, active, createdBy, createdAt, updatedAt }
    financeTransactions/{transactionId}
      { type, amountCents, category, categoryId?, description, occurredOn, createdBy, createdAt }
```

### Categorias do Financeiro

Em qualquer espaço com o módulo Financeiro ativo, entre em **Financeiro → Gerenciar categorias** ou clique em **Categorias** no menu lateral. As categorias padrão são criadas **automaticamente uma única vez por espaço**, inclusive nos espaços criados antes dessa atualização.

- Cada categoria pertence a um único tipo: entrada ou saída. O nome `Outros` existe nos dois tipos.
- É possível criar, renomear, arquivar e reativar. O tipo da categoria não é alterado depois de criada.
- **Arquivar substitui excluir**, para não apagar nem invalidar históricos. Categorias arquivadas deixam de aparecer nos novos lançamentos.
- Lançamentos novos guardam `categoryId` e uma cópia do nome; os registros vinculados exibem o nome atualizado ao renomear a categoria.
- Lançamentos criados antes da atualização continuam válidos, guardam o nome de categoria que foi registrado na época e não são modificados.
- A lista de categorias é isolada por `orgId/spaceId`; nenhuma organização ou espaço compartilha categorias com outra.

**Atualização em um projeto já instalado:** faça backup dos seus arquivos locais e copie os arquivos modificados mantendo o `.env` e seus dados Firebase. Publique `firestore.rules` **antes de usar a versão nova**, pois o gerenciamento de categorias usa duas subcoleções adicionais. Use:

```bash
firebase deploy --only firestore:rules --project micro-ger
npm install
npm run build
firebase deploy --only hosting --project micro-ger
```

Para testar localmente, use `npm start`. Não use `firebase deploy` sem `--only` se sua configuração contiver App Hosting ou outros produtos que você não quer publicar.

### Por que a organização é separada do espaço?

Uma pessoa pode administrar mais de um negócio. Cada organização pode ter vários espaços, e cada espaço tem **financeTransactions** próprio. O mesmo código de módulo é compartilhado, mas os registros nunca são compartilhados.

### Modelo de dados

- Valores monetários salvos em **centavos inteiros** (`amountCents`), evitando erros de ponto flutuante.
- `occurredOn` é data local no formato `AAAA-MM-DD`, permitindo relatórios mensais simples.
- `createdAt` é data do servidor.
- `enabledModules` vem do catálogo de templates e não pode ser alterado pelo cliente após criação nesta versão.
- O logo fica no Storage e o caminho (não um URL público) fica no documento do espaço.

## Segurança e limitações importantes

- **Versão 0.1 é de proprietário único**: o usuário que cria a organização administra todos os espaços. O suporte real a gestores, funcionários, convites e permissões por espaço virá em uma próxima fase.
- As regras de Firestore restringem a leitura das organizações ao proprietário. Consultas devem filtrar por `ownerId == auth.uid`; regras **não filtram** resultados automaticamente.
- As regras de Firestore negam atualizações e exclusões de organizações/espaços; isso será implementado com fluxos seguros, inclusive exclusão recursiva no servidor, mais adiante.
- Não inclui cobrança de assinatura do SaaS, integrações bancárias, conciliação, auditoria, pagamentos online ou mecanismo de faturamento por empresa.
- As operações financeiras são lançamentos manuais, sem função de contas a pagar/receber e sem conciliação.
- Não apresenta relatórios consolidados entre espaços.
- Antes de produção: testar regras no **Firebase Emulator Suite**, validar permissões negativas, incluir política de privacidade, LGPD, verificações adicionais de login, backups e controles de custo.
- O isolamento é **lógico por caminhos e regras**, não uma instância de Firebase separada para cada cliente.

## Próximos passos

1. Migrar o cadastro de alunos e turmas do JP Studio Fit para `modules/academy`, sem tocar no projeto original.
2. Expandir o financeiro compartilhado: recorrências, contas a receber e relatórios.
3. Integrar o pagamento de mensalidades dos alunos ao mesmo financeiro, distinguindo mensalidades em aberto de receitas recebidas.
4. Criar membros, papéis e convites com índice de organizações por usuário, mantendo autorização no backend/regras.
5. Implementar planos comerciais, limites por assinatura e processos administrativos.

## Testes de utilitários

```bash
npm test
```

Os testes incluídos validam a seleção de módulos dos templates e a conversão de valores monetários.
