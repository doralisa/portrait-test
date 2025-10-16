import { test, expect } from '../fixtures/authenticated-fixture';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';

test.describe('Visual Regression Tests', () => {
  
  test.describe('Login Page Visual Tests', () => {
    test('should match login page visual baseline', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      
      await expect(page).toHaveScreenshot('login-page-full.png');
    });

    test('should match login page with error message', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      
      await loginPage.login('invalid@test.com', 'wrongpassword');
      await loginPage.waitForErrorMessage();
      await expect(page).toHaveScreenshot('login-page-with-error.png');
    });
  });

  test.describe('Dashboard Page Visual Tests', () => {
    test('should match dashboard page visual baseline', async ({ authenticatedPage }) => {
      const dashboardPage = new DashboardPage(authenticatedPage);
      await dashboardPage.goto();
      
      await expect(authenticatedPage).toHaveScreenshot('dashboard-page-full.png');
    });
  });
});
