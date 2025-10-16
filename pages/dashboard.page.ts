import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly title: Locator;
  readonly totalProductsStat: Locator;
  readonly lowStockItemsStat: Locator;
  readonly totalValueStat: Locator;
  readonly recentActivitySection: Locator;
  readonly navbar: Locator;
  readonly navLogo: Locator;
  readonly navDashboard: Locator;
  readonly navProducts: Locator;
  readonly navInventory: Locator;
  readonly userName: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('dashboard-title');
    this.totalProductsStat = page.getByTestId('stat-total-products');
    this.lowStockItemsStat = page.getByTestId('stat-low-stock-items');
    this.totalValueStat = page.getByTestId('stat-total-value');
    this.recentActivitySection = page.getByTestId('recent-activity');
    this.navbar = page.getByTestId('navbar');
    this.navLogo = page.getByTestId('nav-logo');
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navProducts = page.getByTestId('nav-products');
    this.navInventory = page.getByTestId('nav-inventory');
    this.userName = page.getByTestId('user-name');
    this.logoutButton = page.getByTestId('logout-button');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async getTotalProductsCount() {
    const statText = await this.totalProductsStat.textContent();
    const match = statText?.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  async getLowStockItemsCount() {
    const statText = await this.lowStockItemsStat.textContent();
    const match = statText?.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  async getTotalValue() {
    const statText = await this.totalValueStat.textContent();
    const match = statText?.match(/[\d,]+\.?\d*/);
    return match ? parseFloat(match[0].replace(',', '')) : 0;
  }

  async getRecentActivityItems() {
    const activityItems = this.page.locator('[data-testid^="activity-item-"]');
    const count = await activityItems.count();
    const items = [];
    
    for (let i = 0; i < count; i++) {
      const item = activityItems.nth(i);
      const action = await item.locator('[data-testid="activity-action"]').textContent();
      const product = await item.locator('[data-testid="activity-product"]').textContent();
      const timestamp = await item.locator('[data-testid="activity-timestamp"]').textContent();
      
      items.push({
        action: action || '',
        product: product || '',
        timestamp: timestamp || ''
      });
    }
    
    return items;
  }

  async waitForStatCard(statType: 'total-products' | 'low-stock-items' | 'total-value') {
    const statCard = this.page.getByTestId(`stat-${statType}`);
    await statCard.waitFor({ state: 'visible' });
  }

  async waitForRecentActivity() {
    await this.recentActivitySection.waitFor({ state: 'visible' });
  }

}
