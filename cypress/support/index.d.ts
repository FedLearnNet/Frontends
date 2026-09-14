declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(username: string, password: string): void

    loginUI(username: string, password: string, path: string): void

    logout(): Chainable<Response<any>>
  }
}
