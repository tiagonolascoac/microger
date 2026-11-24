# Arquitetura funcional — Gestão Modular

## Decisões fixadas

- **Usuário** pode criar várias organizações.
- **Organização** possui vários espaços e um proprietário.
- **Espaço** tem um único template, marca, paleta e conjunto de módulos.
- **Template** define módulos permitidos inicialmente; não é um código separado nem uma coleção isolada.
- **Módulo** contém lógica e interfaces reutilizáveis. `finance` é a dependência compartilhada do template `academy`.
- **Dados financeiros sempre pertencem a um espaço**: `organizations/{orgId}/workspaces/{spaceId}/financeTransactions/{id}`.
- **Sem consolidação** entre espaços na V1.

## Catálogo inicial

| Template | Módulos | Situação |
|---|---|---|
| Academia | academy, finance | finance MVP; academy placeholder |
| Financeiro | finance | finance MVP |

## Estrutura de pastas

```text
src/
  auth/             provedor de autenticação
  firebase/         inicialização do SDK Firebase
  config/           catálogo de templates e módulos
  lib/              operações de dados compartilhadas
  components/       componentes reutilizáveis
  modules/          financeiro compartilhado e academia inicial
  pages/            telas comuns e layouts (MVP)
  styles.css        design system responsivo inicial
```

### Próxima refatoração organizada (quando o JP Studio Fit for migrado)

```text
src/
  core/             auth, organizações, espaços, permissões e temas
  modules/
    finance/        transactions, categories, receivables, recurring, reports
    academy/        students, classes, plans, renewals
  templates/        descritores de modelos / composição
  shared/           UI, hooks, utilitários e validação
```

A fase 0.1 usa páginas mais diretas para reduzir complexidade inicial. Na migração, mover essas páginas para `modules/` sem modificar os documentos no banco.

## Integração da Academia com Financeiro

O caminho de negócio futuro deve ser:

```text
academy/students → academy/charges (cobranças)
                                    ↓ pagamento confirmado
finance/transactions (receita efetivamente recebida)
```

Criar um ID de origem / relacionamento, usar transação ou função backend idempotente. A mesma cobrança nunca deve gerar receita duplicada. O lançamento financeiro atual **não implementa** esse fluxo automático.

## Regras de isolamento

1. Nenhuma coleção financeira global.
2. Todas as operações recebem `orgId` + `spaceId` explicitamente.
3. Os documentos financeiros residem dentro do caminho do espaço.
4. Firestore/Storage verificam o proprietário da organização.
5. Um membro de outra organização não tem permissão de leitura.
6. Para o estágio com funcionários, a associação de membro a **cada espaço** será obrigatória e checada em regras/backend.

## Testes de segurança a realizar no Emulator Suite

- Usuário A cria Org A / Espaço A; Usuário B tenta ler Financeiro A -> negado.
- Usuário A tenta alterar `enabledModules` após criação -> negado.
- Usuário A tenta gravar um lançamento com valor negativo -> negado.
- Usuário A tenta fazer upload com MIME inválido ou tamanho acima de 2 MB -> negado.
- Usuário A tenta ler Financeiro de um espaço inexistente -> negado.
- Usuário A tenta consultar organizações sem o filtro `ownerId` -> negado.

## Interfaces e roadmap

Etapa 1: autenticação, organização, espaço, templates, personalização e financeiro básico (starter).
Etapa 2: migrar JP Studio Fit, manter as regras do projeto original intactas.
Etapa 3: financeiro completo, vinculando cobranças e receitas reais.
Etapa 4: equipes, permissão granular e planos comerciais.
