# FinTrack — Ajustes de Responsividade (2025-09-25)

Mudanças principais:
- **Grids**: `grid-cols-N` sem breakpoints passaram a ser mobile-first, por ex.:  
  - `grid-cols-2` → `grid-cols-1 md:grid-cols-2`  
  - `grid-cols-3` → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`  
  - `grid-cols-4` → `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- **Flex containers**: `flex-row` virou `flex-col md:flex-row` onde não havia variações responsivas.
- **Larguras fixas**: classes como `w-[320px]` e `w-96` ganharam fallback móvel `w-full` (`sm:`/`md:` mantêm o tamanho original em telas maiores).
- **Alturas fixas**: `h-XX`/`h-[NNNpx]` ganharam `h-auto` no mobile para evitar cortes, com altura original a partir de `md:`.
- **CSS global**: adicionados em `src/index.css`
  - `box-sizing: border-box;` global
  - Mídia com `max-width: 100%; height: auto;`
  - Utilitários `.container` e `.safe-px` para layout fluido.

Arquivos ajustados (18):
- `src/components/login-form.tsx`
- `src/components/nav-projects.tsx`
- `src/components/nav-user.tsx`
- `src/layouts/AdminLayout.tsx`
- `src/pages/admin/finance/components/InvestmentChart.tsx`
- `src/pages/admin/finance/components/NatureManager.tsx`
- `src/pages/admin/finance/components/TypeManager.tsx`
- `src/pages/admin/home/Dashboard.tsx`
- `src/pages/admin/home/components/BudgetGauge.tsx`
- `src/pages/admin/home/components/ClassManager.tsx`
- `src/pages/admin/home/components/overview.tsx`
- `src/pages/admin/home/components/TransactionsTable.tsx`
- `src/pages/admin/movies/Movies.tsx`
- `src/pages/admin/movies/components/MovieCard.tsx`
- `src/pages/admin/movies/components/MovieEditModal.tsx`
- `src/pages/admin/movies/components/MovieSearchModal.tsx`
- `src/pages/admin/social/components/RankingPage.tsx`
- `src/pages/admin/social/components/UserProfile.tsx`

> Observações:
> - Todos os ajustes são **não-destrutivos** e mobile-first: em telas pequenas ocupa a largura total; em `sm`/`md`/`lg` retoma a densidade original.
> - Se algum card ficar alto demais no mobile, ajuste pontualmente o conteúdo/ordem ou aplique `line-clamp`/`truncate` quando fizer sentido.
> - Tabelas já possuíam `overflow-auto` no componente base.
