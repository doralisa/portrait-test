import { Page, Locator } from '@playwright/test';
import { waitForElement } from '../tests/helpers/test-helpers';

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly lowStockAlert: Locator;
  readonly inventoryTable: Locator;
  readonly productRows: Locator;
  readonly adjustStockButton: Locator;
  readonly adjustModal: Locator;
  readonly adjustmentInput: Locator;
  readonly confirmAdjustmentButton: Locator;
  readonly cancelAdjustmentButton: Locator;
  readonly adjustmentError: Locator;
  readonly navbar: Locator;
  readonly navLogo: Locator;
  readonly navDashboard: Locator;
  readonly navProducts: Locator;
  readonly navInventory: Locator;
  readonly userName: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('inventory-title');
    this.lowStockAlert = page.getByTestId('low-stock-alert');
    this.inventoryTable = page.getByTestId('inventory-table');
    this.productRows = page.locator('[data-testid^="inventory-row-"]');
    this.adjustStockButton = page.getByTestId('adjust-stock-button');
    this.adjustModal = page.getByTestId('adjust-stock-modal');
    this.adjustmentInput = page.getByTestId('adjustment-input');
    this.confirmAdjustmentButton = page.getByTestId('confirm-adjust-button');
    this.cancelAdjustmentButton = page.getByTestId('cancel-adjust-button');
    this.adjustmentError = page.getByTestId('adjustment-error');
    this.navbar = page.getByTestId('navbar');
    this.navLogo = page.getByTestId('nav-logo');
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navProducts = page.getByTestId('nav-products');
    this.navInventory = page.getByTestId('nav-inventory');
    this.userName = page.getByTestId('user-name');
    this.logoutButton = page.getByTestId('logout-button');
  }

  async goto() {
    await this.page.goto('/inventory');
  }

  async getProductRow(productId: string) {
    return this.page.getByTestId(`inventory-row-${productId}`);
  }

  async getProductStock(productId: string) {
    const row = await this.getProductRow(productId);
    return await row.locator('td:nth-child(3)').textContent();
  }

  async clickAdjustStock(productId: string) {
    await this.page.getByTestId(`adjust-stock-${productId}`).click();
  }

  async fillAdjustment(amount: string) {
    await this.adjustmentInput.fill(amount);
  }

  async confirmAdjustment() {
    await this.confirmAdjustmentButton.click();
  }

  async cancelAdjustment() {
    await this.cancelAdjustmentButton.click();
  }

  async getAdjustmentError() {
    return await this.adjustmentError.textContent();
  }


  async getLowStockCount() {
    const alertText = await this.lowStockAlert.textContent();
    const match = alertText?.match(/(\d+) products/);
    return match ? parseInt(match[1]) : 0;
  }

  async getActualLowStockCount() {
    const lowStockBadges = this.page.locator('[data-testid^="low-stock-badge-"]');
    return await lowStockBadges.count();
  }

  async verifyLowStockAlertAccuracy() {
    const alertCount = await this.getLowStockCount();
    const actualCount = await this.getActualLowStockCount();
    
    return {
      alertCount,
      actualCount,
      isAccurate: alertCount === actualCount
    };
  }

  async getProductCount() {
    return await this.productRows.count();
  }

  async getFirstProductId() {
    const firstRow = this.productRows.first();
    const productId = await firstRow.getAttribute('data-testid');
    return productId?.replace('inventory-row-', '') || '';
  }

  async isProductInTable(productName: string): Promise<boolean> {
    const productNameCell = this.page.locator(`[data-testid^="inventory-row-"] td:nth-child(2):has-text("${productName}")`);
    return (await productNameCell.count()) > 0;
  }

  async getLowStockBadge(productId: string) {
    return this.page.getByTestId(`low-stock-badge-${productId}`);
  }

  async waitForLowStockBadge(productId: string) {
    const badge = await this.getLowStockBadge(productId);
    await badge.waitFor({ state: 'visible' });
  }


  async getNewStockValue() {
    const newStockText = await this.page.locator('text=New Stock:').locator('..').textContent();
    const match = newStockText?.match(/New Stock:\s*<strong>(\d+)<\/strong>/);
    return match ? parseInt(match[1]) : 0;
  }

  async adjustStockAndVerify(productId: string, adjustment: string) {
    const initialStock = await this.getProductStock(productId);
    const initialStockValue = parseInt(initialStock || '0');
    
    await this.clickAdjustStock(productId);
    await this.fillAdjustment(adjustment);
    
    const expectedNewStock = initialStockValue + parseInt(adjustment);
    const displayedNewStock = await this.getNewStockValue();
    
    await this.confirmAdjustment();
    await this.adjustModal.waitFor({ state: 'hidden' });
    
    const finalStock = await this.getProductStock(productId);
    
    return {
      initialStock: initialStockValue,
      adjustment: parseInt(adjustment),
      expectedNewStock,
      displayedNewStock,
      finalStock: parseInt(finalStock || '0')
    };
  }

  async attemptNegativeStockAdjustment(productId: string) {
    const initialStock = await this.getProductStock(productId);
    const initialStockValue = parseInt(initialStock || '0');
    
    if (initialStockValue > 0) {
      await this.clickAdjustStock(productId);
      await this.fillAdjustment(`-${initialStockValue + 10}`);
      await this.confirmAdjustment();
      
      return {
        initialStock: initialStockValue,
        adjustment: -(initialStockValue + 10),
        canProceed: true
      };
    }
    
    return {
      initialStock: initialStockValue,
      adjustment: 0,
      canProceed: false
    };
  }

  async setProductToLowStock(productId: string) {
    const initialStock = await this.getProductStock(productId);
    const initialStockValue = parseInt(initialStock || '0');
    
    if (initialStockValue > 1) {
      const adjustment = -(initialStockValue - 1);
      await this.clickAdjustStock(productId);
      await this.fillAdjustment(adjustment.toString());
      await this.confirmAdjustment();
      await this.adjustModal.waitFor({ state: 'hidden' });
      
      return {
        initialStock: initialStockValue,
        adjustment: adjustment,
        finalStock: 1,
        canProceed: true
      };
    }
    
    return {
      initialStock: initialStockValue,
      adjustment: 0,
      finalStock: initialStockValue,
      canProceed: false
    };
  }

}
