# Microger — atualização das categorias financeiras (v0.2)

## O que muda

- Agora existe a página **Categorias** no menu do espaço e o botão **Gerenciar categorias** dentro do Financeiro.
- É possível **criar, renomear, arquivar e reativar** categorias para entradas e saídas.
- As categorias padrão (Mensalidade, Vendas, Serviços, Outros, Aluguel, Energia, Manutenção, Outros) são criadas no Firestore automaticamente quando o financeiro é aberto, **uma vez por espaço**.
- A categoria escolhida no novo lançamento é salva também com `categoryId` para acompanhar eventuais alterações de nome.
- Lançamentos anteriores continuam legíveis; **nenhum registro existente é apagado ou regravado** pela inicialização.

## Como atualizar o seu projeto existente

1. **Faça uma cópia da pasta do seu projeto atual.**
2. Extraia o ZIP atualizado. Você pode substituir a pasta de código pelo projeto novo, **mas preserve seu `.env` original** (ele não está incluído no ZIP).
3. Se tiver alterações próprias no código, compare as mudanças antes de substituir. Os principais arquivos modificados/criados estão listados abaixo.
4. Entre na pasta do projeto atualizado e publique **primeiro** as novas regras:

   ```powershell
   firebase deploy --only firestore:rules --project micro-ger
   ```

5. Depois execute:

   ```powershell
   npm install
   npm run build
   firebase deploy --only hosting --project micro-ger
   ```

   Para testar localmente: `npm start`.

6. Acesse o espaço Financeiro → Categorias e confira as categorias iniciais.

> Os comandos acima passam `--project micro-ger` explicitamente para evitar publicar no projeto errado. Confirme sempre o nome do projeto no terminal.
>
> Evite `firebase deploy` sem `--only`: seu projeto pode ter outros produtos (ex.: App Hosting) configurados.

## Arquivos relevantes

- `src/modules/finance/CategoriesPage.jsx` (novo)
- `src/modules/finance/categoryHelpers.js` (novo)
- `src/modules/finance/categoryHelpers.test.js` (novo)
- `src/modules/finance/financeCategories.js` (novo)
- `src/modules/finance/FinancePage.jsx`
- `src/pages/WorkspaceLayout.jsx`
- `src/App.jsx`
- `src/styles.css`
- `firestore.rules`
- `README.md`

## Segurança e dados

As regras continuam restringindo as categorias ao **proprietário da organização**, exigem que o módulo Financeiro esteja ativo no espaço e validam a categoria dos novos lançamentos. Arquivar é seguro para a integridade referencial e não remove lançamentos. O módulo não cria categorias globais.
