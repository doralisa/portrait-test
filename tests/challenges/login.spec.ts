import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { LOGIN_CONSTANTS } from '../fixtures/loginConstants';
import { loginAsAdmin, verifyCurrentUrl } from '../helpers/test-helpers';

test.describe('Login Functionality', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.describe('Valid Login Scenarios', () => {
    const validCredentials = [
      {
        email: LOGIN_CONSTANTS.ADMIN_EMAIL,
        password: LOGIN_CONSTANTS.ADMIN_PASSWORD,
        role: 'admin'
      },
      {
        email: LOGIN_CONSTANTS.REGULAR_EMAIL,
        password: LOGIN_CONSTANTS.REGULAR_PASSWORD,
        role: 'user'
      }
    ];

    for (const credentials of validCredentials) {
      test(`should successfully login with ${credentials.role} credentials`, async ({ page }) => {
        await loginPage.login(credentials.email, credentials.password);
        await verifyCurrentUrl(page, '/dashboard');
        await expect(loginPage.dashboardTitle).toContainText('Dashboard');
      });
    }
  });

  test.describe('Invalid Login Scenarios', () => {
    const invalidCredentials = [
      {
        email: LOGIN_CONSTANTS.INVALID_EMAIL,
        password: LOGIN_CONSTANTS.ADMIN_PASSWORD,
        scenario: 'wrong email'
      },
      {
        email: LOGIN_CONSTANTS.ADMIN_EMAIL,
        password: LOGIN_CONSTANTS.INVALID_PASSWORD,
        scenario: 'wrong password'
      },
      {
        email: LOGIN_CONSTANTS.EMPTY_EMAIL,
        password: LOGIN_CONSTANTS.ADMIN_PASSWORD,
        scenario: 'empty email'
      },
      {
        email: LOGIN_CONSTANTS.ADMIN_EMAIL,
        password: LOGIN_CONSTANTS.EMPTY_PASSWORD,
        scenario: 'empty password'
      },
      {
        email: LOGIN_CONSTANTS.EMPTY_EMAIL,
        password: LOGIN_CONSTANTS.EMPTY_PASSWORD,
        scenario: 'both fields empty'
      },
      {
        email: LOGIN_CONSTANTS.WRONG_FORMAT_EMAIL,
        password: LOGIN_CONSTANTS.ADMIN_PASSWORD,
        scenario: 'invalid email format'
      }
    ];

    for (const credentials of invalidCredentials) {
      test(`should show error with ${credentials.scenario}`, async () => {
        await loginPage.login(credentials.email, credentials.password);
        
        if (credentials.scenario === 'wrong email' || credentials.scenario === 'wrong password') {
          await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });
          const errorText = await loginPage.getErrorMessage();
          expect(errorText).toContain(LOGIN_CONSTANTS.ERROR_MESSAGE);
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
      expect(await loginPage.isPasswordVisible()).toBe(false);
      await loginPage.passwordInput.fill(LOGIN_CONSTANTS.REGULAR_PASSWORD);
      await loginPage.togglePasswordVisibility();
      expect(await loginPage.isPasswordVisible()).toBe(true);
      const visiblePassword = await loginPage.passwordInput.inputValue();
      expect(visiblePassword).toBe(LOGIN_CONSTANTS.REGULAR_PASSWORD);
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