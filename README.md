# FLNet Frontend
## Development 
### Code scaffolding
You can then generate applications (`ng generate application my-app`) and libraries (`ng generate library my-lib`) with names that are unique within the workspace. 
Run `ng generate component component-name --project=my-app ` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project=my-app|my-lib`.

## Running the frontend
### Install dependencies
Simply install via npm
- `npm install`

### Deciding which frontend you want to work with
This repo is created from developers from different software projects, 
all differing slightly in their Frontend.

These software projects are
- FL-Net (The overarching general project)
- dAIbetes
- MicrobAIome
- Posymed

Right now they only differ in styling and the logo 
(found in `projects/shared-lib/src/assets/images/<project-name>`). 
Chose whichever software project you like.

Per software project there is the local and global frontend angular project. 

Per each of these there is always a development, staging and production version.

### Relevant other services
Which other services are required depends on the angular project, the services listed below 
each service are then the services dependencies:

global-app:
- datamodeler-api
    - datamodeler-db (neo4j)
- global-learning-api
    - datamodeler-api (plus db)
    - orch-api (plus db) (only required for tool usage)
    - controller (only required for fl-tool usage)
    - relay-server (only required for fl-tool usage)
- keycloak (the global auth server plus own psql db)

local-app:
- local-learning-api
    - dataimporter-api (plus db)
    - orch-api (plus psql db) (only required for tool usage)
    - controller (only required for fl-tool usage)
- the global frontend to load the transformation apps
- keycloak  (the local auth server plus own psql db)

For both keycloak instances make sure that the ALL local/global services use the SAME keycloak instance.

Please note that these services themselves might then need other services to work correctly!
You can specify these services when [you set up your environment](#setting-the-relevant-environment).
You can use globally deployed services for testing [specified here](#global-deployments-that-might-be-useful-for-testing).

### Global deployments that might be useful for testing
- Global Platform deployment:
  - Auth server (used in dev environment file): https://staging.featurecloud.ai/feddb/global-auth
  - Frontend (use to get the tools): https://dev.federated-learning.net/
  - Datamodeler API: https://dev.federated-learning.net/data-modeler
  - Global Learning API: https://dev.federated-learning.net/api
- Local Platform deployment:
  - Auth server (used in dev environment file): https://staging.featurecloud.ai/feddb/local-auth


### Setting the relevant environment
After deciding which 
software project (FLNet, ...), angular project (local, global) and tag (dev, staging, prod)
you want to use, you can edit the environment here (MAKE SURE TO NOT PUSH CHANGES HERE):
```sh
projects/<angular-project>/src/environments/<software-project>/<tag-specific-file>
# Examples:
# micreobAIOme global app in staging version
projects/global-app/src/environments/microb-AI-ome/environment.staging.ts
# FLNet local app in dev version
projects/local-app/src/environments/FLNet/environment.ts 
# dAIbetes local app in prod version
projects/local-app/src/environments/dAIbetes/environment.prod.ts
```

### Building or starting the project
In `package.json` you can find all possible builds and starts. 
Generally, you can start the combination of angular project, software project and tag
you want via e.g.:
```sh
npm run build-local-dAIbetes
npm run start-global-microbAIome
```
These all start in development mode.
TO test staging or production mode, you can use the relevant build and the provided `Dockerfile`.

## Testing

### Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests
Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.
