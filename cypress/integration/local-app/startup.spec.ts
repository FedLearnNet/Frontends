before(() => {
  cy.visit('/');
})

after(() => {
  cy.logout();
});


describe('Module One (local-app)', () => {

  it('displays Welcome to dAIbetes', () => {
    cy.get('p').contains('Welcome to dAIbetes').should('be.visible');
  });
  it('displays Welcome to dAIbetes', () => {
    cy.loginUI("test", "test", "/logs");
    cy.get('span').contains('Patient Update').should('be.visible');
  });
});
