describe('Startup', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays Welcome to dAIbetes', () => {
    cy.get('p').contains('Welcome to dAIbetes').should('be.visible');
  });
});
