/// <reference types="jest" />
import {
  createTokenSetRest, updateTokenSetRest, deleteTokenSetRest,
  createTokenRest, updateTokenRest, deleteTokenRest,
  batchCreateTokensRest,
  createThemeGroupRest, updateThemeGroupRest, deleteThemeGroupRest,
  createThemeOptionRest, updateThemeOptionRest, deleteThemeOptionRest,
} from '../restApi';
import { parseBranchesFromResponse } from '../fetchBranchesListRest';

import 'whatwg-fetch';

const API_BASE_URL = 'https://api-staging.tokens.studio';
const EMAIL = process.env.TOKENS_STUDIO_TEST_EMAIL;
const PASSWORD = process.env.TOKENS_STUDIO_TEST_PASSWORD;

let authToken = '';
let projectId = process.env.TOKENS_STUDIO_PROJECT_ID || '';
let changeSetId = '';

const skipIntegration = !EMAIL || !PASSWORD;

describe('Tokens Studio REST API Integration', () => {
  // Use a longer timeout for integration testing
  jest.setTimeout(60000);

  beforeAll(async () => {
    if (skipIntegration) {
      console.warn('Skipping integration tests: TOKENS_STUDIO_TEST_EMAIL / TOKENS_STUDIO_TEST_PASSWORD not set');
      return;
    }

    // 1. Obtain authToken via login
    const authRes = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: { email: EMAIL, password: PASSWORD } }),
    });

    if (!authRes.ok) {
      throw new Error(`Auth failed: ${authRes.statusText} ${await authRes.text()}`);
    }

    const authData = await authRes.json();
    authToken = authData.meta.token;

    // 2. Obtain a projectId to run tests against if not provided
    if (authToken && !projectId) {
      const projRes = await fetch(`${API_BASE_URL}/api/v1/projects`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
      });

      if (!projRes.ok) {
        throw new Error(`Projects fetch failed: ${projRes.statusText} ${await projRes.text()}`);
      }

      const projData = await projRes.json();
      const projects = projData.data || [];
      if (projects.length === 0) {
        throw new Error('No projects found to run tests. Please create at least one project manually.');
      }

      const targetProject = projects.find((p) => p.attributes?.name === 'Project1' || p.name === 'Project1');

      if (targetProject) {
        projectId = targetProject.id;
      } else {
        // Fallback to the first project if Project1 is not found
        projectId = projects[0].id;
      }
    }

    // 3. Resolve changeSetId for the main branch
    if (authToken && projectId) {
      const branchesRes = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/branches`, {
        headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
      });
      if (branchesRes.ok) {
        const branchesData = await branchesRes.json();
        const branches = parseBranchesFromResponse(branchesData);
        const mainBranch = branches.find((b) => b.name === 'main' || b.is_default) || branches[0];
        changeSetId = mainBranch?.change_set_id || '';
      }
    }
  });

  describe('Token Sets', () => {
    let tokenSetId = '';

    it('creates a token set', async () => {
      if (skipIntegration) return;
      const result = await createTokenSetRest(authToken, API_BASE_URL, projectId, {
        name: 'test-integration-set',
        type: 'global',
        order_index: 0,
      });
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.attributes.name).toBe('test-integration-set');
      tokenSetId = result.data.id;
    });

    it('updates a token set', async () => {
      if (skipIntegration) return;
      const result = await updateTokenSetRest(authToken, API_BASE_URL, projectId, tokenSetId, {
        name: 'test-integration-set-updated',
      });
      expect(result.data).toBeDefined();
      expect(result.data.attributes.name).toBe('test-integration-set-updated');
    });

    it('deletes a token set', async () => {
      if (skipIntegration) return;
      const result = await deleteTokenSetRest(authToken, API_BASE_URL, projectId, tokenSetId);
      expect(result).toBeDefined();
    });
  });

  describe('Tokens', () => {
    let tokenSetId = '';
    let tokenId = '';

    beforeAll(async () => {
      if (skipIntegration) return;
      // Need a token set to wrap tokens into
      const set = await createTokenSetRest(authToken, API_BASE_URL, projectId, {
        name: 'test-tokens-container',
      }, undefined, changeSetId);
      tokenSetId = set.data.id;
    });

    afterAll(async () => {
      if (skipIntegration) return;
      // Clean up the token set container
      await deleteTokenSetRest(authToken, API_BASE_URL, projectId, tokenSetId, undefined, changeSetId);
    });

    it('creates a token', async () => {
      if (skipIntegration) return;
      const result = await createTokenRest(authToken, API_BASE_URL, projectId, {
        name: 'color.test',
        value: '#ff0000',
        type: 'color',
        token_set_id: tokenSetId,
        description: 'a test token',
      }, undefined, changeSetId);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.attributes.name).toBe('color.test');
      expect(result.data.attributes.value).toBe('#ff0000');
      tokenId = result.data.id;
    });

    it('updates a token', async () => {
      if (skipIntegration) return;
      const result = await updateTokenRest(authToken, API_BASE_URL, projectId, tokenId, {
        value: '#00ff00',
        description: 'updated description',
      }, undefined, changeSetId);
      expect(result.data).toBeDefined();
      expect(result.data.attributes.value).toBe('#00ff00');
      expect(result.data.attributes.description).toBe('updated description');
    });

    it('deletes a token', async () => {
      if (skipIntegration) return;
      const result = await deleteTokenRest(authToken, API_BASE_URL, projectId, tokenId, undefined, changeSetId);
      expect(result).toBeDefined();
    });
  });

  // Simulates the write-back that happens when a user imports Figma variables into an empty project.
  // The sequence mirrors setTokensFromVariables.ts: create token sets → create tokens → create
  // theme group → create theme options referencing the token sets.
  describe('Import Variables Flow', () => {
    let primitiveSetId = '';
    let semanticSetId = '';
    let themeGroupId = '';
    let themeOptionId = '';
    let primitiveName = '';
    let semanticName = '';

    it('creates token sets for imported variable collections', async () => {
      if (skipIntegration) return;

      // Use unique names to avoid collisions with pre-existing sets or failed prior runs.
      primitiveName = `import-primitives-${Date.now()}`;
      const primitiveResult = await createTokenSetRest(authToken, API_BASE_URL, projectId, {
        name: primitiveName,
        type: 'global',
        order_index: 0,
      }, undefined, changeSetId);
      expect(primitiveResult.data).toBeDefined();
      expect(primitiveResult.data.id).toBeDefined();
      expect(primitiveResult.data.attributes.name).toBe(primitiveName);
      primitiveSetId = primitiveResult.data.id;

      semanticName = `import-semantic-${Date.now()}`;
      const semanticResult = await createTokenSetRest(authToken, API_BASE_URL, projectId, {
        name: semanticName,
        type: 'global',
        order_index: 1,
      }, undefined, changeSetId);
      expect(semanticResult.data).toBeDefined();
      expect(semanticResult.data.id).toBeDefined();
      semanticSetId = semanticResult.data.id;
    });

    it('batch-creates tokens across both imported token sets in one request', async () => {
      if (skipIntegration) return;

      const result = await batchCreateTokensRest(authToken, API_BASE_URL, projectId, [
        { name: 'color.brand', value: '#7B61FF', type: 'color', token_set_id: primitiveSetId, description: 'Imported from Figma variable' },
        { name: 'spacing.sm', value: '8', type: 'dimension', token_set_id: primitiveSetId },
        { name: 'color.bg', value: '{color.brand}', type: 'color', token_set_id: semanticSetId },
      ], changeSetId);
      expect(result.data).toBeDefined();
      expect(result.data.created_count).toBe(3);
      expect(result.data.requested_count).toBe(3);
    });

    it('creates a theme group for an imported variable collection', async () => {
      if (skipIntegration) return;

      const result = await createThemeGroupRest(authToken, API_BASE_URL, projectId, {
        name: 'Mode',
        options: [],
      }, undefined, changeSetId);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.attributes.name).toBe('Mode');
      themeGroupId = result.data.id;
    });

    it('creates a theme option referencing the imported token sets', async () => {
      if (skipIntegration) return;

      const result = await createThemeOptionRest(authToken, API_BASE_URL, projectId, {
        name: 'Light',
        theme_group_id: themeGroupId,
        selected_token_sets: {
          [primitiveSetId]: 'enabled',
          [semanticSetId]: 'enabled',
        },
      }, undefined, changeSetId);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.attributes.name).toBe('Light');
      themeOptionId = result.data.id;
    });

    it('updates a theme option (e.g. adding a second mode)', async () => {
      if (skipIntegration) return;

      const result = await updateThemeOptionRest(authToken, API_BASE_URL, projectId, themeOptionId, {
        name: 'Light Mode',
      }, undefined, changeSetId);
      expect(result.data).toBeDefined();
      expect(result.data.attributes.name).toBe('Light Mode');
    });

    // Clean up in reverse dependency order
    it('deletes the theme option', async () => {
      if (skipIntegration) return;
      const result = await deleteThemeOptionRest(authToken, API_BASE_URL, projectId, themeOptionId, undefined, changeSetId);
      expect(result).toBeDefined();
    });

    it('deletes the theme group', async () => {
      if (skipIntegration) return;
      const result = await deleteThemeGroupRest(authToken, API_BASE_URL, projectId, themeGroupId, undefined, changeSetId);
      expect(result).toBeDefined();
    });

    it('deletes the imported token sets', async () => {
      if (skipIntegration) return;
      await deleteTokenSetRest(authToken, API_BASE_URL, projectId, primitiveSetId, undefined, changeSetId);
      await deleteTokenSetRest(authToken, API_BASE_URL, projectId, semanticSetId, undefined, changeSetId);
    });
  });

  // Simulates the write-back that happens when a user imports Figma styles into a project and
  // confirms via the ImportedTokensDialog. The sequence mirrors createMultipleTokens.ts:
  // create the active token set (if absent) → batch-create all confirmed style tokens in one call.
  // No themes are involved — styles have no collection/mode concept.
  describe('Import Styles Flow', () => {
    let styleSetId = '';
    let styleSetName = '';

    it('creates a token set for the active set (styles have no parent)', async () => {
      if (skipIntegration) return;

      // Use a unique name to avoid collisions with pre-existing sets or failed prior runs.
      styleSetName = `import-styles-${Date.now()}`;
      const result = await createTokenSetRest(authToken, API_BASE_URL, projectId, {
        name: styleSetName,
        type: 'global',
        order_index: 0,
      }, undefined, changeSetId);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.attributes.name).toBe(styleSetName);
      styleSetId = result.data.id;
    });

    it('batch-creates all confirmed style tokens in one request', async () => {
      if (skipIntegration) return;

      const result = await batchCreateTokensRest(authToken, API_BASE_URL, projectId, [
        { name: 'color.primary', value: '#0D99FF', type: 'color', token_set_id: styleSetId, description: 'Imported from Figma color style' },
        { name: 'typography.heading', value: { fontFamily: 'Inter', fontWeight: '700', fontSize: '32' }, type: 'typography', token_set_id: styleSetId, description: 'Imported from Figma text style' },
        { name: 'spacing.md', value: '16', type: 'dimension', token_set_id: styleSetId },
      ], changeSetId);
      expect(result.data).toBeDefined();
      expect(result.data.created_count).toBe(3);
      expect(result.data.requested_count).toBe(3);
    });

    it('batch-creates tokens into an existing set (reuse path — set already has a server ID)', async () => {
      if (skipIntegration) return;

      // Simulates createMultipleTokens reusing an existing set ID rather than re-creating it.
      const result = await batchCreateTokensRest(authToken, API_BASE_URL, projectId, [
        { name: 'color.secondary', value: '#FF6250', type: 'color', token_set_id: styleSetId },
      ], changeSetId);
      expect(result.data).toBeDefined();
      expect(result.data.created_count).toBe(1);
    });

    it('deletes the style token set', async () => {
      if (skipIntegration) return;
      const result = await deleteTokenSetRest(authToken, API_BASE_URL, projectId, styleSetId, undefined, changeSetId);
      expect(result).toBeDefined();
    });
  });

  describe('Theme Groups', () => {
    let themeGroupId = '';

    it('creates a theme group', async () => {
      if (skipIntegration) return;
      const result = await createThemeGroupRest(authToken, API_BASE_URL, projectId, {
        name: 'test-integration-theme',
        options: [],
      });
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.attributes.name).toBe('test-integration-theme');
      themeGroupId = result.data.id;
    });

    it('updates a theme group', async () => {
      if (skipIntegration) return;
      const result = await updateThemeGroupRest(authToken, API_BASE_URL, projectId, themeGroupId, {
        name: 'test-integration-theme-updated',
      });
      expect(result.data).toBeDefined();
      expect(result.data.attributes.name).toBe('test-integration-theme-updated');
    });

    it('deletes a theme group', async () => {
      if (skipIntegration) return;
      const result = await deleteThemeGroupRest(authToken, API_BASE_URL, projectId, themeGroupId);
      expect(result).toBeDefined();
    });
  });
});
