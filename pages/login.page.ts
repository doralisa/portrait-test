import { Page, Locator } from '@playwright/test';
import { waitForElement } from '../tests/helpers/test-helpers';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly passwordToggle: Locator;
  readonly dashboardTitle: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error-message');
    this.passwordToggle = page.getByTestId('password-toggle');
    this.dashboardTitle = page.getByTestId('dashboard-title');
    this.logoutButton = page.getByTestId('logout-button');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isPasswordVisible(): Promise<boolean> {
    const inputType = await this.passwordInput.getAttribute('type');
    return inputType === 'text';
  }

  async togglePasswordVisibility() {
    await this.emailInput.click();
    await waitForElement(this.page, 'password-toggle');
    await this.passwordToggle.click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async isErrorMessageVisible() {
    return await this.errorMessage.isVisible();
  }
}