/// <reference types="jest" />
import { 
  createTokenSetRest, updateTokenSetRest, deleteTokenSetRest, 
  createTokenRest, updateTokenRest, deleteTokenRest, 
  createThemeGroupRest, updateThemeGroupRest, deleteThemeGroupRest 
} from '../restApi';

import 'whatwg-fetch';

const API_BASE_URL = 'https://api-staging.tokens.studio';
const EMAIL = 'akshay@tokens.studio';
const PASSWORD = 'Test@123';

let authToken = '';
let projectId = process.env.TOKENS_STUDIO_PROJECT_ID || '';

describe('Tokens Studio REST API Integration', () => {
  // Use a longer timeout for integration testing
  jest.setTimeout(60000);

  beforeAll(async () => {
    // 1. Obtain authToken via login
    const authRes = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: { email: EMAIL, password: PASSWORD } })
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
          Accept: 'application/json'
        }
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
  });

  describe('Token Sets', () => {
    let tokenSetId = '';
    
    it('creates a token set', async () => {
      const result = await createTokenSetRest(authToken, API_BASE_URL, projectId, {
        name: 'test-integration-set',
        type: 'global',
        order_index: 0
      });
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.attributes.name).toBe('test-integration-set');
      tokenSetId = result.data.id;
    });

    it('updates a token set', async () => {
      const result = await updateTokenSetRest(authToken, API_BASE_URL, projectId, tokenSetId, {
        name: 'test-integration-set-updated'
      });
      expect(result.data).toBeDefined();
      expect(result.data.attributes.name).toBe('test-integration-set-updated');
    });

    it('deletes a token set', async () => {
      const result = await deleteTokenSetRest(authToken, API_BASE_URL, projectId, tokenSetId);
      expect(result).toBeDefined();
    });
  });

  describe('Tokens', () => {
    let tokenSetId = '';
    let tokenId = '';
    
    beforeAll(async () => {
      // Need a token set to wrap tokens into
      const set = await createTokenSetRest(authToken, API_BASE_URL, projectId, {
        name: 'test-tokens-container'
      });
      tokenSetId = set.data.id;
    });

    afterAll(async () => {
      // Clean up the token set container
      await deleteTokenSetRest(authToken, API_BASE_URL, projectId, tokenSetId);
    });

    it('creates a token', async () => {
      const result = await createTokenRest(authToken, API_BASE_URL, projectId, {
        name: 'color.test',
        value: '#ff0000',
        type: 'color',
        token_set_id: tokenSetId,
        description: 'a test token'
      }, 'main');
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.attributes.name).toBe('color.test');
      expect(result.data.attributes.value).toBe('#ff0000');
      tokenId = result.data.id;
    });

    it('updates a token', async () => {
      const result = await updateTokenRest(authToken, API_BASE_URL, projectId, tokenId, {
        value: '#00ff00',
        description: 'updated description'
      }, 'main');
      expect(result.data).toBeDefined();
      expect(result.data.attributes.value).toBe('#00ff00');
      expect(result.data.attributes.description).toBe('updated description');
    });

    it('deletes a token', async () => {
      const result = await deleteTokenRest(authToken, API_BASE_URL, projectId, tokenId, 'main');
      expect(result).toBeDefined();
    });
  });

  describe('Theme Groups', () => {
    let themeGroupId = '';
    
    it('creates a theme group', async () => {
      const result = await createThemeGroupRest(authToken, API_BASE_URL, projectId, {
        name: 'test-integration-theme',
        options: []
      });
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.attributes.name).toBe('test-integration-theme');
      themeGroupId = result.data.id;
    });

    it('updates a theme group', async () => {
      const result = await updateThemeGroupRest(authToken, API_BASE_URL, projectId, themeGroupId, {
        name: 'test-integration-theme-updated'
      });
      expect(result.data).toBeDefined();
      expect(result.data.attributes.name).toBe('test-integration-theme-updated');
    });

    it('deletes a theme group', async () => {
      const result = await deleteThemeGroupRest(authToken, API_BASE_URL, projectId, themeGroupId);
      expect(result).toBeDefined();
    });
  });
});
