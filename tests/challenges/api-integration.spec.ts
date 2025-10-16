import { test, expect } from '../fixtures/api-fixture';

test.describe('API Integration Tests', () => {
  test('should reset application data via API', async ({ api, apiTestData }) => {
    const reset = await apiTestData.resetApplicationData();
    expect(reset).toBe(true);
  });

  test('should handle API reset endpoint correctly', async ({ api }) => {
    const response = await api.post('/api/reset');
    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);
  });
});
