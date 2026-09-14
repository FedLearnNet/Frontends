# FL-Net Frontend

Angular workspace for the web frontends of FL-Net, the federated learning platform behind dAIbetes, PosyMed
and microbAIome.

| Project      | Purpose                                                                          |
|--------------|----------------------------------------------------------------------------------|
| `global-app` | Global platform UI: projects, queries, tool store, workflows, federated runs      |
| `local-app`  | Local (hospital) UI: data import, local operations, tool runs                    |
| `shared-lib` | Shared components, services, brand assets and styles                            |

## Documentation
- [FL-Net documentation](https://federated-learning.net/documentation/)

## Quick start

Requirements: Node.js 22 LTS (or another version supported by Angular 21) and npm.

```bash
npm install
npm run start-local-fl-net     # http://localhost:4200
npm run start-global-fl-net    # http://localhost:4201
```

Environment files live in `projects/<app>/src/environments/<brand>/`:

| File                     | Target                                   |
|--------------------------|------------------------------------------|
| `environment.ts`         | development (`npm run start-…`)          |
| `environment.staging.ts` | staging (`npm run build-…-staging`)      |
| `environment.prod.ts`    | production (`npm run build-…`)           |


## Testing

```bash
npm run lint       # ESLint (lint-local, lint-global, lint-shared-lib for single projects)
npm test           # unit tests
npm run cy:local   # Cypress end-to-end tests (cy:global for the global app)
```


## License

[Apache License 2.0](LICENSE) © Institute for Computational Systems Biomedicine and contributors.
