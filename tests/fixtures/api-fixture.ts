import { test as base, APIRequestContext } from '@playwright/test';
import { ApiTestDataManager, createApiTestDataManager } from '../helpers/api-helpers';

export interface ApiFixture {
  api: APIRequestContext;
  apiTestData: ApiTestDataManager;
}

export const test = base.extend<ApiFixture>({
  api: async ({ playwright }, use) => {
    const api = await playwright.request.newContext({
      baseURL: 'http://localhost:3456'
    });
    await use(api);
    await api.dispose();
  },

  apiTestData: async ({ api }, use) => {
    const apiTestData = createApiTestDataManager(api);
    await use(apiTestData);
    
    // Cleanup after test
    await apiTestData.cleanup();
  }
});

export { expect } from '@playwright/test';
