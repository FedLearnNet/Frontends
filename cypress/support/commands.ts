import {environment} from "@shared-lib/env/environment";
import {getAuthCodeFromLocation} from "./utils";

/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//https://github.com/Pretius/angular-keycloak-e2e-integration/tree/master

function loginViaAuth0Ui(username: string, password: string, path: string) {
  //https://docs.cypress.io/app/guides/authentication-testing/auth0-authentication#Programmatic-Login
  // App landing page redirects to Auth0.
  cy.visit(path)

  // Login on Auth0.
  cy.origin(
    environment.keycloak.url,
    { args: { username, password } },
    ({ username, password }) => {
      cy.get('input#username').type(username)
      cy.get('input#password').type(password, { log: false })
      cy.get('input#kc-login').click()
    }
  )

  // Ensure Auth0 has redirected us back to the RWA.
  cy.url().should('equal', Cypress.config("baseUrl")+path)
}

Cypress.Commands.add('loginUI', (username: string, password: string, path: string) => {
  const log = Cypress.log({
    displayName: 'AUTH0 LOGIN',
    message: [`🔐 Authenticating | ${username}`],
    // @ts-ignore
    autoEnd: false,
  })
  log.snapshot('before')

  loginViaAuth0Ui(username, password, path)

  log.snapshot('after')
  log.end()
})

Cypress.Commands.add("login", (username: string, password: string) => {
  Cypress.log({name: "Login"});
  //https://vrockai.github.io/blog/2017/10/28/cypress-keycloak-intregration/
  //https://github.com/cypress-io/cypress/issues/3119
  //https://github.com/Fredx87/cypress-keycloak-commands/blob/develop/src/utils.ts

  const authBaseUrl = environment.keycloak.url;
  const realm = environment.keycloak.realm;
  const client_id = environment.keycloak.clientId;
  const storageKey = `kc.${client_id}`;
    cy.request({
      url: `${authBaseUrl}/realms/${realm}/protocol/openid-connect/auth`,
      followRedirect: false,
      qs: {
        scope: "openid",
        response_type: "code",
        approval_prompt: "auto",
        redirect_uri: Cypress.config("baseUrl"),
        client_id
      }
    })
      .then(response => {
        const html = document.createElement("html");
        html.innerHTML = response.body;

        const form = html.getElementsByTagName("form")[0];
        const url = form.action;

        return cy.request({
          method: "POST",
          url,
          followRedirect: false,
          form: true,
          body: {
            username: username,
            password: password
          }
        });
      })
      .then(response => {
        const code = getAuthCodeFromLocation(response.headers["location"]);

        cy.request({
          method: "post",
          url: `${authBaseUrl}/realms/${realm}/protocol/openid-connect/token`,
          body: {
            client_id,
            redirect_uri: Cypress.config("baseUrl"),
            code,
            grant_type: "authorization_code"
          },
          form: true,
          followRedirect: false
        }).then(responseToken => {
          const {
            access_token,
            refresh_token,
            expires_in,
            refresh_expires_in,
            id_token,
            session_state
          } = responseToken.body;

          cy.setCookie("KEYCLOAK_IDENTITY", id_token);
          cy.setCookie("KEYCLOAK_SESSION", session_state);
          cy.window().then(win => {
            win.localStorage.setItem(`${storageKey}.token`, access_token);
            win.localStorage.setItem(`${storageKey}.refreshToken`, refresh_token);
            win.localStorage.setItem(`${storageKey}.idToken`, id_token);
            win.localStorage.setItem(
              `${storageKey}.tokenParsed`,
              JSON.stringify({exp: Math.floor(Date.now() / 1000) + expires_in})
            );
          });
        });
      });
});


Cypress.Commands.add("logout", () => {
  Cypress.log({name: "Logout"});
  const authBaseUrl = environment.keycloak.url;
  const realm = environment.keycloak.realm;

  return cy.request({
    url: `${authBaseUrl}/realms/${realm}/protocol/openid-connect/logout`
  });
});

