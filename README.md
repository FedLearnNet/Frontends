# FederatedDb Frontend

## Code scaffolding

You can then generate applications (`ng generate application my-app`) and libraries (`ng generate library my-lib`) with names that are unique within the workspace. 
Run `ng generate component component-name --project=my-app ` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project=my-app|my-lib`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

#
#
#

# Separate builds and serving configurations for <u>microb-AI-ome</u> and <u>dAIbetes</u>

## Development server

> ### dAIbetes
> Start local and global apps natively
> - `npm run start-local-dAIbetes`
> - `npm run start-global-dAIbetes` (port 4201)
> 
> Start local and global apps dockerized
> - `docker-compose -p frontend-d -f docker-compose.dAIbetes.yml up -d`


> ### microb-AI-ome
> Start local and global apps natively
> - `npm run start-local-microbAIome`
> - `npm run start-global-microbAIome` (port 4201)
> 
> Start local and global apps dockerized
> - `docker-compose -p frontend-mb -f docker-compose.microbAIome.yml up -d`

## Build
The build artifacts will be stored in the `dist/` directory under subdirectories named `[local/global]-app-[dAIbetes/microb-AI-ome]` (e.g., local-app-dAIbetes)

> ### dAIbetes
> - `npm run build-local-dAIbetes`
> - `npm run build-global-dAIbetes`

> ### microb-AI-ome
> - `npm run build-local-microbAIome`
> - `npm run build-global-microbAIome`
