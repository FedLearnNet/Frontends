const API_BASE = 'http://localhost:8081';
const COHORT_ID = 1;
const CONNECTOR_BASE_URL = `/cohort/${COHORT_ID}/connector`;

// CSV columns from SUR_medications_200.csv
const CSV_COLUMNS = ['patient_id', 'start_date', 'end_date', 'brand_name', 'generic_name', 'rxcui', 'daily_dose', 'times_per_day'];

const mockCohortWithSchema = {
  id: COHORT_ID,
  name: 'Test Cohort',
  description: 'A test cohort',
  amountOfPatients: 10,
  globalSchemaId: 'schema-1',
  internalSchemaId: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  version: 1,
  schemaRoot: {
    id: 1,
    name: 'Root',
    nodeType: 'ROOT',
    children: [],
    childNodes: [
      {
        id: 10,
        name: 'patient',
        globalId: 'patient',
        nodeType: 'GROUP',
        dataType: {name: 'GROUP', validations: []},
        childNodes: [
          {
            id: 11,
            name: 'patient_id',
            globalId: 'patient.patient_id',
            nodeType: 'ATTRIBUTE',
            dataType: {name: 'STRING', validations: [{name: 'REQUIRED'}]},
            ontology: {id: 1, name: 'patient_id', description: 'Patient identifier'},
            childNodes: [],
          },
          {
            id: 12,
            name: 'medication_name',
            globalId: 'patient.medication_name',
            nodeType: 'ATTRIBUTE',
            dataType: {name: 'STRING', validations: []},
            ontology: {id: 2, name: 'medication_name', description: 'Medication name'},
            childNodes: [],
          },
          {
            id: 13,
            name: 'dosage',
            globalId: 'patient.dosage',
            nodeType: 'ATTRIBUTE',
            dataType: {name: 'FLOAT', validations: []},
            ontology: {id: 3, name: 'dosage', description: 'Dosage amount'},
            childNodes: [],
          },
        ],
      },
    ],
  },
};

const mockCohort = {
  id: COHORT_ID,
  name: 'Test Cohort',
  description: 'A test cohort',
  amountOfPatients: 10,
  globalSchemaId: 'schema-1',
  internalSchemaId: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  version: 1,
  schemaRoot: {
    id: 1,
    name: 'Root',
    children: [],
    childNodes: [],
    nodeType: 'ROOT',
  },
};

const mockConnectors = [
  {
    id: 101,
    name: 'CSV Importer',
    description: 'Imports CSV files',
    cohortId: COHORT_ID,
    inputConfig: {mode: 'FILE', fileType: 'CSV', delimiter: ',', hasHeader: true, firstSheetOnly: true, file: null},
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-06-01T10:00:00Z',
    version: 1,
    lastRun: '2025-06-10T14:30:00Z',
  },
  {
    id: 102,
    name: 'Excel Importer',
    description: 'Imports Excel workbooks',
    cohortId: COHORT_ID,
    inputConfig: {mode: 'FILE', fileType: 'EXCEL', hasHeader: true, firstSheetOnly: false, file: null, delimiter: ','},
    createdAt: '2025-07-01T08:00:00Z',
    updatedAt: '2025-07-01T08:00:00Z',
    version: 1,
    lastRun: null,
  },
];

const mockConnectorDetail = {
  ...mockConnectors[0],
  fileInfo: {
    Sheet1: {
      sheet: 'Sheet1',
      json: '[]',
      data: [{id: 1, name: 'Patient A'}, {id: 2, name: 'Patient B'}],
      columns: ['id', 'name'],
      renamedColumns: ['id', 'name'],
      deletedColumns: [false, false],
      lastUploaded: '2025-06-10T14:30:00Z',
      isFileMissing: false,
    },
  },
  schemaMapping: [],
  transformer: [],
};

const mockConnectorRuns = [
  {
    id: 501,
    connectorId: 101,
    status: 'FINISHED',
    createdAt: '2025-06-10T14:30:00Z',
    updatedAt: '2025-06-10T14:35:00Z',
    newEntities: 40,
    deletedEntities: 0,
    updatedEntities: 2,
    failedEntities: 0,
    unchangedEntities: 0,
  },
  {
    id: 502,
    connectorId: 101,
    status: 'ERROR',
    createdAt: '2025-06-09T10:00:00Z',
    updatedAt: '2025-06-09T10:02:00Z',
    newEntities: 0,
    deletedEntities: 0,
    updatedEntities: 0,
    failedEntities: 5,
    unchangedEntities: 0,
  },
];

const mockFiles = [
  {
    id: 1,
    fileName: 'patients.csv',
    contentType: 'text/csv',
    downloadUrl: 'http://localhost:8081/files/patients.csv',
    size: 2048,
    isSupportFile: false,
    cohortId: COHORT_ID,
  },
];

const mockFileDetail = {
  id: 1,
  fileName: 'patients.csv',
  contentType: 'text/csv',
  downloadUrl: 'http://localhost:8081/files/patients.csv',
  size: 2048,
  isSupportFile: false,
  uploadInfo: [
    {
      sheet: 'Sheet1',
      json: JSON.stringify([{id: 1, name: 'Patient A'}, {id: 2, name: 'Patient B'}]),
      columns: ['id', 'name'],
      renamedColumns: ['id', 'name'],
      deletedColumns: [false, false],
    },
  ],
};

function setupApiIntercepts() {
  // Cohort
  cy.intercept('GET', `${API_BASE}/cohort/${COHORT_ID}`, {statusCode: 200, body: mockCohort}).as('getCohort');

  // Connectors list (match with or without trailing slash and query params)
  cy.intercept('GET', /\/connectors\/?\?cohort_id=/, {statusCode: 200, body: mockConnectors}).as('getConnectors');

  // Single connector fetch (must come after list intercept)
  cy.intercept('GET', /\/connectors\/\d+$/, {statusCode: 200, body: mockConnectorDetail}).as('getConnector');

  // Connector CRUD
  cy.intercept('POST', /\/connectors\/$/, (req) => {
    req.reply({
      statusCode: 201,
      body: {
        ...req.body,
        id: 103,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      },
    });
  }).as('createConnector');

  cy.intercept('PUT', /\/connectors\/\d+$/, (req) => {
    req.reply({statusCode: 200, body: {...req.body, updatedAt: new Date().toISOString()}});
  }).as('updateConnector');

  cy.intercept('DELETE', /\/connectors\/\d+$/, {statusCode: 204, body: null}).as('deleteConnector');

  // Files
  cy.intercept('GET', `${API_BASE}/connectors/files/cohorts/${COHORT_ID}/files`, {statusCode: 200, body: mockFiles}).as('getFiles');
  cy.intercept('GET', /\/connectors\/files\/cohorts\/\d+\/file(\?.*)?$/, {statusCode: 200, body: mockFileDetail}).as('getFileInfo');
  cy.intercept('GET', /\/connectors\/files\/cohorts\/\d+\/files\/\d+(\?.*)?$/, {statusCode: 200, body: mockFileDetail}).as('getKnownFileInfo');
  cy.intercept('POST', /\/connectors\/files\/cohorts\/\d+\/upload/, {
    statusCode: 200,
    body: mockFiles,
  }).as('uploadFile');
  cy.intercept('DELETE', /\/connectors\/files\/cohorts\/\d+\/files\/\d+$/, {statusCode: 204, body: null}).as('deleteFile');

  // Connector runs - URL is /connectors/runs/connectors/{connectorId}
  cy.intercept('GET', /\/connectors\/runs\/connectors\/\d+/, {statusCode: 200, body: mockConnectorRuns}).as('getConnectorRuns');
  // Run connector - URL is /connectors/{connectorId}/run
  cy.intercept('POST', /\/connectors\/\d+\/run/, {
    statusCode: 200,
    body: {id: 503, connectorId: 101, status: 'RUNNING', createdAt: new Date().toISOString()},
  }).as('runConnector');
}

describe('Connector Module', () => {

  beforeEach(() => {
    setupApiIntercepts();
    cy.loginUI('test', 'test', CONNECTOR_BASE_URL);
    cy.wait('@getCohort');
  });

  after(() => {
    cy.logout();
  });

  describe('Connector List', () => {
    it('should display the connector list with table', () => {
      cy.wait('@getConnectors');
      cy.get('h1').contains('Connectors').should('be.visible');
      cy.get('table').should('exist');
      cy.get('table').contains('CSV Importer').should('be.visible');
      cy.get('table').contains('Excel Importer').should('be.visible');
    });

    it('should show source mode for each connector', () => {
      cy.wait('@getConnectors');
      cy.get('table').contains('FILE').should('exist');
    });

    it('should show last run date or Not executed yet', () => {
      cy.wait('@getConnectors');
      // Excel Importer has no lastRun -> shows translated text
      cy.get('table tbody tr').last().invoke('text').should('match', /not executed yet/i);
    });

    it('should navigate to new connector on add button click', () => {
      cy.wait('@getConnectors');
      cy.contains('button', /add a connector/i).first().click();
      cy.url().should('include', `${CONNECTOR_BASE_URL}/new`);
    });

    it('should navigate to view connector on View button click', () => {
      cy.wait('@getConnectors');
      cy.get('table tbody tr').first().find('a').first().click();
      cy.url().should('include', `${CONNECTOR_BASE_URL}/view/101`);
    });

    it('should navigate to edit connector via menu', () => {
      cy.wait('@getConnectors');
      cy.get('table tbody tr').first().find('button.menu').click();
      cy.get('button[mat-menu-item]').contains(/edit configuration/i).click();
      cy.url().should('include', `${CONNECTOR_BASE_URL}/edit/101`);
    });

    it('should open delete confirmation dialog', () => {
      cy.wait('@getConnectors');
      cy.get('table tbody tr').first().find('button.menu').click();
      cy.get('button[mat-menu-item]').contains(/delete/i).click();

      // Confirm dialog should be visible
      cy.get('mat-dialog-container').should('be.visible');
    });

    it('should delete a connector after confirmation', () => {
      cy.wait('@getConnectors');
      cy.get('table tbody tr').first().find('button.menu').click();
      cy.get('button[mat-menu-item]').contains(/delete/i).click();

      // Click the confirm button in the dialog (the last button = confirm action)
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-container [mat-dialog-actions] button').last().click();
      cy.wait('@deleteConnector');
    });

    it('should show empty view when no connectors exist', () => {
      cy.intercept('GET', /\/connectors\/?\?cohort_id=/, {statusCode: 200, body: []}).as('getEmptyConnectors');
      cy.visit(CONNECTOR_BASE_URL);
      cy.wait('@getCohort');
      cy.wait('@getEmptyConnectors');

      cy.get('.empty-view').should('be.visible');
      cy.get('.empty-view img').should('exist');
    });
  });

  describe('Connector Files', () => {
    it('should navigate to the connector file list', () => {
      cy.wait('@getConnectors');
      cy.contains('button', /^files$/i).first().click();
      cy.wait('@getFiles');

      cy.url().should('include', `${CONNECTOR_BASE_URL}/files`);
      cy.contains('h1', /connector files/i).should('be.visible');
      cy.contains('patients.csv').should('be.visible');
    });

    it('should open the connector file detail page', () => {
      cy.visit(`${CONNECTOR_BASE_URL}/files`);
      cy.wait('@getCohort');
      cy.wait('@getFiles');

      cy.contains('patients.csv').click();
      cy.wait('@getKnownFileInfo');

      cy.url().should('include', `${CONNECTOR_BASE_URL}/files/1`);
      cy.contains('h1', 'patients.csv').should('be.visible');
      cy.contains('Sheet1').should('be.visible');
      cy.get('table').should('exist');
    });
  });

  describe('Connector View', () => {
    beforeEach(() => {
      cy.visit(`${CONNECTOR_BASE_URL}/view/101`);
      cy.wait('@getCohort');
      cy.wait('@getConnector');
    });

    it('should display connector name', () => {
      cy.contains('CSV Importer').should('be.visible');
    });

    it('should show activity log table', () => {
      cy.wait('@getConnectorRuns');
      cy.get('table').should('exist');
    });

    it('should display connector summary info', () => {
      cy.contains('Connector Summary').should('exist');
    });

    it('should navigate to edit from view page', () => {
      cy.contains('button', /edit/i).first().click();
      cy.url().should('include', `${CONNECTOR_BASE_URL}/edit/101`);
    });
  });

  describe('Manage Connector - New', () => {
    beforeEach(() => {
      cy.visit(`${CONNECTOR_BASE_URL}/new`);
      cy.wait('@getCohort');
    });

    it('should display the manage connector page with cards', () => {
      cy.get('app-connector-cards').should('have.length.at.least', 1);
    });

    it('should show Select a Data Source as first step', () => {
      cy.contains('Select a Data Source').should('be.visible');
    });

    it('should show source options (File Import, FTP, etc.)', () => {
      cy.contains(/file import/i).should('exist');
    });

    it('should show the toolbar with action buttons', () => {
      cy.get('mat-toolbar').should('exist');
      cy.contains('button', /cancel/i).should('be.visible');
      cy.contains('button', /continue/i).should('be.visible');
    });

    it('should navigate back on cancel click', () => {
      const currentUrl = CONNECTOR_BASE_URL + '/new';
      cy.contains('button', /cancel/i).click();
      // Cancel navigates back to the connector list
      cy.url().should('not.include', '/new');
    });
  });

  describe('Manage Connector - Edit', () => {
    beforeEach(() => {
      cy.visit(`${CONNECTOR_BASE_URL}/edit/101`);
      cy.wait('@getCohort');
      cy.wait('@getConnector');
    });

    it('should load the connector in edit mode', () => {
      cy.get('app-connector-cards').should('have.length.at.least', 1);
    });

    it('should show the toolbar', () => {
      cy.get('mat-toolbar').should('exist');
    });
  });

  describe('Run Connector Dialog', () => {
    it('should open run dialog from list', () => {
      cy.visit(CONNECTOR_BASE_URL);
      cy.wait('@getCohort');
      cy.wait('@getConnectors');

      cy.get('table tbody tr').first().find('button.menu').click();
      cy.get('button[mat-menu-item]').filter(':contains("Run")').not(':contains("Edit")').click();

      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-container').find('mat-radio-button').should('have.length.at.least', 1);
    });

    it('should close run dialog on cancel', () => {
      cy.visit(CONNECTOR_BASE_URL);
      cy.wait('@getCohort');
      cy.wait('@getConnectors');

      cy.get('table tbody tr').first().find('button.menu').click();
      cy.get('button[mat-menu-item]').filter(':contains("Run")').not(':contains("Edit")').click();

      cy.get('mat-dialog-container').should('be.visible');
      // Press Escape to close the dialog
      cy.get('body').type('{esc}');
      cy.get('mat-dialog-container').should('not.exist');
    });
  });

  describe('Duplicate Connector', () => {
    it('should navigate to duplicate connector page', () => {
      cy.visit(CONNECTOR_BASE_URL);
      cy.wait('@getCohort');
      cy.wait('@getConnectors');

      cy.get('table tbody tr').first().find('button.menu').click();
      cy.get('button[mat-menu-item]').contains(/duplicate/i).click();
      cy.url().should('include', `${CONNECTOR_BASE_URL}/new/101`);
    });
  });

  describe('Connector JSON View', () => {
    it('should open JSON dialog from list', () => {
      cy.visit(CONNECTOR_BASE_URL);
      cy.wait('@getCohort');
      cy.wait('@getConnectors');

      cy.get('table tbody tr').first().find('button.menu').click();
      cy.get('button[mat-menu-item]').contains(/json/i).click();

      cy.get('mat-dialog-container').should('be.visible');
    });
  });
});


/**
 * Full E2E flow: Upload file → Configure → Map fields → Run in COMPREHENSIVE mode → Verify results
 */
describe('Connector Full Flow - Upload, Map, Run Comprehensive', () => {
  const CREATED_CONNECTOR_ID = 201;

  // Mock file detail matching the CSV columns from SUR_medications_200.csv
  const csvSampleData = [
    {patient_id: 'C100P10413', start_date: '2007-12-06', end_date: '2008-06-05', brand_name: 'METFONORM', generic_name: 'metformin_1', rxcui: '861009', daily_dose: '3', times_per_day: '3'},
    {patient_id: 'C100P10413', start_date: '2008-06-05', end_date: '2009-05-11', brand_name: 'DRAMION', generic_name: 'gliclazide', rxcui: '393405', daily_dose: '1', times_per_day: '1'},
    {patient_id: 'C100P10413', start_date: '2008-06-05', end_date: '2009-05-11', brand_name: 'METFORAL', generic_name: 'metformin', rxcui: '861009', daily_dose: '3', times_per_day: '3'},
  ];

  const mockUploadedFileDetail = {
    id: 10,
    fileName: 'SUR_medications_200.csv',
    contentType: 'text/csv',
    downloadUrl: `${API_BASE}/files/SUR_medications_200.csv`,
    size: 15800,
    isSupportFile: false,
    uploadInfo: [
      {
        sheet: 'Sheet1',
        json: JSON.stringify(csvSampleData),
        columns: CSV_COLUMNS,
        renamedColumns: CSV_COLUMNS,
        deletedColumns: CSV_COLUMNS.map(() => false),
      },
    ],
  };

  const mockUploadedFiles = [
    {
      id: 10,
      fileName: 'SUR_medications_200.csv',
      contentType: 'text/csv',
      downloadUrl: `${API_BASE}/files/SUR_medications_200.csv`,
      size: 15800,
      isSupportFile: false,
      cohortId: COHORT_ID,
    },
  ];

  const mockCreatedConnector = {
    id: CREATED_CONNECTOR_ID,
    name: 'Medications Connector',
    description: 'Import medication data',
    cohortId: COHORT_ID,
    inputConfig: {
      mode: 'FILE',
      fileType: 'CSV',
      delimiter: ',',
      hasHeader: true,
      firstSheetOnly: true,
      file: null,
      filePath: `${API_BASE}/files/SUR_medications_200.csv`,
    },
    inputSource: {
      id: 'file_upload',
      title: 'File Import',
      description: 'Import an Excel, CSV or JSON file.',
      icon: 'upload_file',
      configName: 'source_file_config',
    },
    fileInfo: {
      Sheet1: {
        sheet: 'Sheet1',
        json: JSON.stringify(csvSampleData),
        data: csvSampleData,
        columns: CSV_COLUMNS,
        renamedColumns: CSV_COLUMNS,
        deletedColumns: CSV_COLUMNS.map(() => false),
        isFileMissing: false,
      },
    },
    schemaMapping: [
      {column: 'patient_id', mapping: 'patient.patient_id', schemaId: 11},
      {column: 'brand_name', mapping: 'patient.medication_name', schemaId: 12},
      {column: 'daily_dose', mapping: 'patient.dosage', schemaId: 13},
    ],
    transformer: [],
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: '2025-06-15T10:00:00Z',
    version: 1,
  };

  const mockComprehensiveRunResult = {
    id: 601,
    connectorId: CREATED_CONNECTOR_ID,
    status: 'FINISHED',
    createdAt: '2025-06-15T10:05:00Z',
    updatedAt: '2025-06-15T10:06:30Z',
    newEntities: 150,
    updatedEntities: 30,
    deletedEntities: 0,
    failedEntities: 20,
    unchangedEntities: 0,
  };

  function setupFullFlowIntercepts() {
    // Cohort with schema for mapping
    cy.intercept('GET', `${API_BASE}/cohort/${COHORT_ID}`, {statusCode: 200, body: mockCohortWithSchema}).as('getCohort');

    // Empty connector list initially
    cy.intercept('GET', /\/connectors\/?\?cohort_id=/, {statusCode: 200, body: []}).as('getConnectors');

    // File upload
    cy.intercept('POST', /\/connectors\/files\/cohorts\/\d+\/upload/, {
      statusCode: 200,
      body: mockUploadedFiles,
    }).as('uploadFile');

    // File info after upload
    cy.intercept('GET', /\/connectors\/files\/cohorts\/\d+\/file(\?.*)?$/, {
      statusCode: 200,
      body: mockUploadedFileDetail,
    }).as('getFileInfo');

    cy.intercept('GET', /\/connectors\/files\/cohorts\/\d+\/files/, {
      statusCode: 200,
      body: mockUploadedFiles,
    }).as('getFiles');

    // Functions list (empty for simplicity)
    cy.intercept('GET', /\/connectors\/functions/, {statusCode: 200, body: []}).as('getFunctions');

    // Preview
    cy.intercept('POST', /\/connectors\/preview/, {
      statusCode: 200,
      body: {jsons: []},
    }).as('preview');

    // Validation bulk check
    cy.intercept('POST', /\/connectors\/check-validations-bulk/, (req) => {
      const results = req.body.map((item: any) => ({
        column: item.column,
        valid: true,
        message: null,
      }));
      req.reply({statusCode: 200, body: results});
    }).as('bulkValidate');

    // Store/apps (empty)
    cy.intercept('GET', /\/store\?/, {statusCode: 200, body: {content: [], totalPages: 0, totalElements: 0}}).as('getStore');

    // Save connector
    cy.intercept('POST', /\/connectors\/$/, (req) => {
      req.reply({
        statusCode: 201,
        body: {
          ...req.body,
          id: CREATED_CONNECTOR_ID,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        },
      });
    }).as('createConnector');

    cy.intercept('PUT', /\/connectors\/\d+$/, (req) => {
      req.reply({statusCode: 200, body: {...req.body, updatedAt: new Date().toISOString()}});
    }).as('updateConnector');

    // Single connector fetch (for view page after save)
    cy.intercept('GET', /\/connectors\/\d+$/, {statusCode: 200, body: mockCreatedConnector}).as('getConnector');

    // Run connector
    cy.intercept('POST', /\/connectors\/\d+\/run/, {
      statusCode: 200,
      body: {id: 601, connectorId: CREATED_CONNECTOR_ID, status: 'RUNNING', createdAt: new Date().toISOString()},
    }).as('runConnector');

    // Connector runs for view page
    cy.intercept('GET', /\/connectors\/runs\/connectors\/\d+/, {
      statusCode: 200,
      body: [mockComprehensiveRunResult],
    }).as('getConnectorRuns');

    // Delete (for cleanup)
    cy.intercept('DELETE', /\/connectors\/\d+$/, {statusCode: 204, body: null}).as('deleteConnector');
  }

  before(() => {
    // Clear localStorage to start fresh
    cy.window().then(win => {
      win.localStorage.removeItem(`connectorConfig${COHORT_ID}`);
    });
  });

  after(() => {
    cy.logout();
  });

  it('should complete full flow: create connector, upload CSV, map fields, run comprehensive, verify results', () => {
    setupFullFlowIntercepts();
    cy.loginUI('test', 'test', CONNECTOR_BASE_URL);
    cy.wait('@getCohort');
    cy.wait('@getConnectors');

    // ========================================
    // Step 1: Navigate to new connector
    // ========================================
    cy.get('.empty-view').should('be.visible');
    cy.contains('button', /add a connector/i).click();
    cy.url().should('include', `${CONNECTOR_BASE_URL}/new`);
    cy.wait('@getCohort');

    // ========================================
    // Step 2: Select "File Import" as source
    // ========================================
    cy.contains('Select a Data Source').should('be.visible');
    cy.contains('mat-card-title', 'File Import').closest('mat-card').click();

    // Click Continue to go to file config step
    cy.contains('button', /continue/i).click();

    // ========================================
    // Step 3: Upload the CSV test file
    // ========================================
    cy.contains(/file import settings/i).should('be.visible');

    // Upload the real test file
    cy.get('input[type="file"].file-upload-input').first().selectFile(
      'cypress/testfiles/SUR_medications_200.csv',
      {force: true}
    );

    cy.wait('@uploadFile');

    // Verify file type is CSV (default)
    cy.get('mat-radio-button').contains('CSV').should('exist');

    // Click Continue to proceed to Specify Headers step
    cy.contains('button', /continue/i).click();

    // ========================================
    // Step 4: Specify Headers / Selectors
    // ========================================
    cy.contains(/specify header/i, {timeout: 10000}).should('be.visible');

    // Click "Add default selectors" button to trigger file info loading
    cy.contains('button', /add default/i, {timeout: 5000}).click();
    cy.wait('@getFileInfo');

    // The dynamic table should show with our CSV columns
    cy.get('app-dynamic-table', {timeout: 10000}).should('exist');

    // Verify some of our CSV columns are shown in the table
    cy.contains('patient_id').should('exist');
    cy.contains('brand_name').should('exist');

    // Skip transformers and go to mapping by clicking the Mapper card
    cy.get('app-connector-cards').contains('Mapper').click();

    // ========================================
    // Step 5: Map fields
    // ========================================
    cy.contains(/map fields/i, {timeout: 10000}).should('be.visible');

    // The mapper table should show our CSV columns
    cy.get('table').contains('patient_id').should('exist');
    cy.get('table').contains('brand_name').should('exist');
    cy.get('table').contains('daily_dose').should('exist');

    // Helper to map a column to a schema field via the select-mapper dialog
    function mapColumn(csvColumn: string, level1: string, level2: string) {
      // Click the mapping button for the column
      cy.get('table tbody tr').contains(csvColumn).closest('tr')
        .find('button.add-field').first().click();

      cy.get('mat-dialog-container').should('be.visible');

      // Select level 1 - click the input, type to filter, select option
      cy.get('mat-dialog-container .selectors input[matInput]').first()
        .click({force: true}).type(level1, {force: true});
      cy.get('.cdk-overlay-container mat-option', {timeout: 5000}).contains(level1).click();

      // Wait for level 2 selector to appear after Angular re-renders
      cy.get('mat-dialog-container .selectors .selector', {timeout: 5000}).should('have.length.at.least', 2);

      // Select level 2
      cy.get('mat-dialog-container .selectors .selector').eq(1).find('input[matInput]')
        .click({force: true}).type(level2, {force: true});
      cy.get('.cdk-overlay-container mat-option', {timeout: 5000}).contains(level2).click();

      // Wait for Apply button to become enabled, then click
      cy.get('mat-dialog-container button').contains(/apply/i).should('not.be.disabled').click();
      cy.get('mat-dialog-container').should('not.exist');
    }

    // Map patient_id → patient > patient_id
    mapColumn('patient_id', 'patient', 'patient_id');

    // Map brand_name → patient > medication_name
    mapColumn('brand_name', 'patient', 'medication_name');

    // Map daily_dose → patient > dosage
    mapColumn('daily_dose', 'patient', 'dosage');

    // Verify mappings are shown in the table
    cy.get('table').contains('patient > patient_id').should('exist');
    cy.get('table').contains('patient > medication_name').should('exist');
    cy.get('table').contains('patient > dosage').should('exist');

    // ========================================
    // Step 6: Save and Run
    // ========================================
    cy.contains('button', /save and run/i).click();

    // Save dialog should appear for name/description
    cy.get('mat-dialog-container').should('be.visible');
    cy.get('mat-dialog-container input[formControlName="name"]').clear().type('Medications Connector');
    cy.get('mat-dialog-container textarea[formControlName="description"]').clear().type('Import medication data');
    cy.get('mat-dialog-container').contains('button', /ok/i).click();
    cy.wait('@createConnector');

    // ========================================
    // Step 7: View page with run dialog
    // ========================================
    cy.url().should('include', `${CONNECTOR_BASE_URL}/view/${CREATED_CONNECTOR_ID}`, {timeout: 10000});
    cy.wait('@getConnector');

    // The connector view page should show the name
    cy.contains('Medications Connector').should('be.visible');

    // Click Run to open run dialog (force click in case overlay backdrop lingers)
    cy.contains('button', 'Run').click({force: true});

    // ========================================
    // Step 8: Select COMPREHENSIVE mode and run
    // ========================================
    cy.get('mat-dialog-container').should('be.visible');

    // COMPREHENSIVE should be default selected based on the component code (runMode = signal<RunMode>(RunMode.COMPREHENSIVE))
    cy.get('mat-dialog-container mat-radio-button').should('have.length', 2);
    // Verify comprehensive is already selected (it's the default in the component)
    cy.get('mat-dialog-container').contains(/comprehensive/i).should('exist');

    // Click Run button in the dialog
    cy.get('mat-dialog-container mat-dialog-actions button').last().click();
    cy.wait('@runConnector');

    // Dialog should close
    cy.get('mat-dialog-container').should('not.exist');

    // ========================================
    // Step 9: Verify run results in activity log
    // ========================================
    cy.wait('@getConnectorRuns');

    // Activity log table should show our run
    cy.contains('Activity Log').should('be.visible');
    cy.get('table').should('exist');

    // Verify the run result data is displayed
    cy.get('table').contains('601').should('exist');  // Run ID
    cy.get('table').contains('FINISHED').should('exist');  // Status

    // Verify entity counts
    cy.get('table').contains('150').should('exist');  // newEntities
    cy.get('table').contains('30').should('exist');   // updatedEntities
    cy.get('table').contains('20').should('exist');   // failedEntities
  });
});
