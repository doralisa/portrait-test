import { Page, Locator } from '@playwright/test';
import { waitForElement } from '../tests/helpers/test-helpers';
import { PRODUCT_CONSTANTS } from '../tests/fixtures/productConstants';

export interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  lowStockThreshold: string;
}

export class NewProductPage {
  readonly page: Page;
  readonly title: Locator;
  readonly form: Locator;
  readonly skuInput: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly priceInput: Locator;
  readonly stockInput: Locator;
  readonly categoryInput: Locator;
  readonly thresholdInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly skuError: Locator;
  readonly nameError: Locator;
  readonly priceError: Locator;
  readonly priceNegativeError: Locator;
  readonly stockError: Locator;
  readonly stockNegativeError: Locator;
  readonly navbar: Locator;
  readonly navLogo: Locator;
  readonly navDashboard: Locator;
  readonly navProducts: Locator;
  readonly navInventory: Locator;
  readonly userName: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('new-product-title');
    this.form = page.getByTestId('product-form');
    this.skuInput = page.getByTestId('sku-input');
    this.nameInput = page.getByTestId('name-input');
    this.descriptionInput = page.getByTestId('description-input');
    this.priceInput = page.getByTestId('price-input');
    this.stockInput = page.getByTestId('stock-input');
    this.categoryInput = page.getByTestId('category-input');
    this.thresholdInput = page.getByTestId('threshold-input');
    this.saveButton = page.getByTestId('save-button');
    this.cancelButton = page.getByTestId('cancel-button');
    this.skuError = page.getByRole('paragraph').getByText(PRODUCT_CONSTANTS.ERROR_MESSAGES.SKU_REQUIRED);
    this.nameError = page.getByRole('paragraph').getByText(PRODUCT_CONSTANTS.ERROR_MESSAGES.NAME_REQUIRED);
    this.priceError = page.getByRole('paragraph').getByText(PRODUCT_CONSTANTS.ERROR_MESSAGES.PRICE_REQUIRED);
    this.priceNegativeError = page.getByRole('paragraph').getByText(PRODUCT_CONSTANTS.ERROR_MESSAGES.PRICE_NEGATIVE);
    this.stockError = page.getByRole('paragraph').getByText(PRODUCT_CONSTANTS.ERROR_MESSAGES.STOCK_REQUIRED);
    this.stockNegativeError = page.getByRole('paragraph').getByText(PRODUCT_CONSTANTS.ERROR_MESSAGES.STOCK_NEGATIVE);
    this.navbar = page.getByTestId('navbar');
    this.navLogo = page.getByTestId('nav-logo');
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navProducts = page.getByTestId('nav-products');
    this.navInventory = page.getByTestId('nav-inventory');
    this.userName = page.getByTestId('user-name');
    this.logoutButton = page.getByTestId('logout-button');
  }

  async goto() {
    await this.page.goto('/products/new');
  }

  async fillForm(data: Partial<ProductFormData>) {
    if (data.sku) await this.skuInput.fill(data.sku);
    if (data.name) await this.nameInput.fill(data.name);
    if (data.description) await this.descriptionInput.fill(data.description);
    if (data.price) await this.priceInput.fill(data.price);
    if (data.stock) await this.stockInput.fill(data.stock);
    if (data.category) await this.categoryInput.selectOption(data.category);
    if (data.lowStockThreshold) await this.thresholdInput.fill(data.lowStockThreshold);
  }

  async submitForm() {
    await waitForElement(this.page, 'save-button');
    await this.saveButton.click();
  }

  async cancelForm() {
    await waitForElement(this.page, 'cancel-button');
    await this.cancelButton.click();
  }


  async getValidationErrors() {
    const errors = [];
    const errorSelectors = [
      'text=SKU is required',
      'text=Name is required',
      'text=Price is required',
      'text=Stock is required',
      'text=Price must be greater than 0',
      'text=Stock cannot be negative'
    ];

    for (const selector of errorSelectors) {
      if (await this.page.locator(selector).isVisible()) {
        errors.push(await this.page.locator(selector).textContent());
      }
    }

    return errors;
  }

  async clearField(fieldName: keyof ProductFormData) {
    const fieldMap = {
      sku: this.skuInput,
      name: this.nameInput,
      description: this.descriptionInput,
      price: this.priceInput,
      stock: this.stockInput,
      category: this.categoryInput,
      lowStockThreshold: this.thresholdInput
    };

    await fieldMap[fieldName].fill('');
  }

  async getFieldValue(fieldName: keyof ProductFormData) {
    const fieldMap = {
      sku: this.skuInput,
      name: this.nameInput,
      description: this.descriptionInput,
      price: this.priceInput,
      stock: this.stockInput,
      category: this.categoryInput,
      lowStockThreshold: this.thresholdInput
    };

    return await fieldMap[fieldName].inputValue();
  }

  async createProduct(productData: ProductFormData) {
    await this.fillForm(productData);
    await this.submitForm();
  }
}
