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
  readonly navbar: Locator;
  readonly navLogo: Locator;
  readonly navDashboard: Locator;
  readonly navProducts: Locator;
  readonly navInventory: Locator;
  readonly userName: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error-message');
    this.passwordToggle = page.getByTestId('password-toggle');
    this.dashboardTitle = page.getByTestId('dashboard-title');
    this.logoutButton = page.getByTestId('logout-button');
    this.navbar = page.getByTestId('navbar');
    this.navLogo = page.getByTestId('nav-logo');
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navProducts = page.getByTestId('nav-products');
    this.navInventory = page.getByTestId('nav-inventory');
    this.userName = page.getByTestId('user-name');
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