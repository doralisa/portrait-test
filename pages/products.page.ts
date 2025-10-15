import { Page, Locator } from '@playwright/test';
import { waitForElement } from '../tests/helpers/test-helpers';

export class ProductsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly addProductButton: Locator;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly sortSelect: Locator;
  readonly productsTable: Locator;
  readonly noProductsMessage: Locator;
  readonly deleteModal: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;
  readonly navbar: Locator;
  readonly navLogo: Locator;
  readonly navDashboard: Locator;
  readonly navProducts: Locator;
  readonly navInventory: Locator;
  readonly userName: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('products-title');
    this.addProductButton = page.getByTestId('add-product-button');
    this.searchInput = page.getByTestId('search-input');
    this.categoryFilter = page.getByTestId('category-filter');
    this.sortSelect = page.getByTestId('sort-select');
    this.productsTable = page.getByTestId('products-table');
    this.noProductsMessage = page.getByTestId('no-products-message');
    this.deleteModal = page.getByTestId('delete-modal');
    this.confirmDeleteButton = page.getByTestId('confirm-delete-button');
    this.cancelDeleteButton = page.getByTestId('cancel-delete-button');
    this.navbar = page.getByTestId('navbar');
    this.navLogo = page.getByTestId('nav-logo');
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navProducts = page.getByTestId('nav-products');
    this.navInventory = page.getByTestId('nav-inventory');
    this.userName = page.getByTestId('user-name');
    this.logoutButton = page.getByTestId('logout-button');
  }

  async goto() {
    await this.page.goto('/products');
  }

  async clickAddProduct() {
    await waitForElement(this.page, 'add-product-button');
    await this.addProductButton.click();
  }

  async filterByCategory(category: string) {
    await this.categoryFilter.selectOption(category);
  }

  async sortBy(sortOption: 'name' | 'price' | 'stock') {
    await this.sortSelect.selectOption(sortOption);
  }

  async getProductRow(productId: string) {
    return this.page.getByTestId(`product-row-${productId}`);
  }

  async getProductCount() {
    const rows = this.page.locator('[data-testid^="product-row-"]');
    return await rows.count();
  }

  async isProductInTable(productName: string): Promise<boolean> {
    const productNameCell = this.page.locator(`[data-testid^="product-row-"] td:nth-child(2):has-text("${productName}")`);
    return (await productNameCell.count()) > 0;
  }

  async clickEditProduct(productId: string) {
    await this.page.getByTestId(`edit-product-${productId}`).click();
  }

  async clickDeleteProduct(productId: string) {
    await waitForElement(this.page, `delete-product-${productId}`);
    await this.page.getByTestId(`delete-product-${productId}`).click();
  }

  async confirmDelete() {
    await waitForElement(this.page, 'confirm-delete-button');
    await this.confirmDeleteButton.click();
  }

  async cancelDelete() {
    await this.cancelDeleteButton.click();
  }

  async isDeleteModalVisible() {
    return await this.deleteModal.isVisible();
  }

  async getProductData(productId: string) {
    const row = await this.getProductRow(productId);
    const cells = row.locator('td');
    
    return {
      sku: await cells.nth(0).textContent(),
      name: await cells.nth(1).textContent(),
      category: await cells.nth(2).textContent(),
      price: await cells.nth(3).textContent(),
      stock: await cells.nth(4).textContent()
    };
  }

  async isProductVisible(productId: string) {
    const row = await this.getProductRow(productId);
    return await row.isVisible();
  }

  async deleteFirstProduct() {
    if (await this.getProductCount() > 0) {
      const productRows = this.page.locator('[data-testid^="product-row-"]');
      const firstRow = productRows.first();
      const productId = await firstRow.getAttribute('data-testid');
      const id = productId?.replace('product-row-', '') || '';
      await this.clickDeleteProduct(id);
      return id;
    }
    return null;
  }
}
