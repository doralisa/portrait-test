import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { loginAsAdmin, verifyCurrentUrl } from '../helpers/test-helpers';
import testData from '../../data/test-products.json';

test.describe('Login Functionality', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.describe('Valid Login Scenarios', () => {
    const validUsers = testData.testUsers.filter(user => user.valid);

    for (const user of validUsers) {
      test(`should successfully login with ${user.role} credentials`, async ({ page }) => {
        await loginPage.login(user.email, user.password);
        await verifyCurrentUrl(page, '/dashboard');
        await expect(loginPage.dashboardTitle).toContainText('Dashboard');
      });
    }
  });

  test.describe('Invalid Login Scenarios', () => {
    const invalidCredentials = [
      {
        email: testData.testUsers.find(u => !u.valid)?.email || 'invalid@test.com',
        password: testData.testUsers.find(u => u.valid)?.password || 'Admin123!',
        scenario: 'wrong email'
      },
      {
        email: testData.testUsers.find(u => u.valid)?.email || 'admin@test.com',
        password: testData.testUsers.find(u => !u.valid)?.password || 'wrongpassword',
        scenario: 'wrong password'
      },
      {
        email: '',
        password: testData.testUsers.find(u => u.valid)?.password || 'Admin123!',
        scenario: 'empty email'
      },
      {
        email: testData.testUsers.find(u => u.valid)?.email || 'admin@test.com',
        password: '',
        scenario: 'empty password'
      },
      {
        email: '',
        password: '',
        scenario: 'both fields empty'
      },
      {
        email: 'invalid-email-format',
        password: testData.testUsers.find(u => u.valid)?.password || 'Admin123!',
        scenario: 'invalid email format'
      }
    ];

    for (const credentials of invalidCredentials) {
      test(`should show error with ${credentials.scenario}`, async () => {
        await loginPage.login(credentials.email, credentials.password);
        
        if (credentials.scenario === 'wrong email' || credentials.scenario === 'wrong password') {
          await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });
          const errorText = await loginPage.getErrorMessage();
          expect(errorText).toContain(testData.testUsers.find(u => !u.valid)?.expectedError || 'Invalid email or password');
        } else {
          await expect(loginPage.page).not.toHaveURL(/.*\/dashboard/);
          await expect(loginPage.page).toHaveURL(/.*\/login/);
          await expect(loginPage.emailInput).toBeVisible();
          await expect(loginPage.passwordInput).toBeVisible();
        }
      });
    }
  });

  test.describe('Password Visibility Toggle', () => {
    test('should toggle password visibility', async () => {
      const testPassword = testData.testUsers.find(u => u.valid && u.role === 'user')?.password || 'User123!';
      expect(await loginPage.isPasswordVisible()).toBe(false);
      await loginPage.passwordInput.fill(testPassword);
      await loginPage.togglePasswordVisibility();
      expect(await loginPage.isPasswordVisible()).toBe(true);
      const visiblePassword = await loginPage.passwordInput.inputValue();
      expect(visiblePassword).toBe(testPassword);
      await loginPage.togglePasswordVisibility();
      expect(await loginPage.isPasswordVisible()).toBe(false);
    });
  });

  test.describe('Logout Functionality', () => {
    test('should successfully logout and redirect to login page', async ({ page }) => {
      await loginAsAdmin(page);
      if (await loginPage.logoutButton.isVisible()) {
        await loginPage.logoutButton.click();
        await verifyCurrentUrl(page, '/login');
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
      }
    });
  });

});