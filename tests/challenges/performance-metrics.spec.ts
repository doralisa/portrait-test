import { test, expect } from '../fixtures/authenticated-fixture';
import { LoginPage } from '../../pages/login.page';
import { ProductsPage } from '../../pages/products.page';
import { InventoryPage } from '../../pages/inventory.page';
import { DashboardPage } from '../../pages/dashboard.page';
import testData from '../../data/test-products.json';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  totalBlockingTime: number;
}

test.describe('Performance Metrics Tests', () => {
  
  test.describe('Page Load Performance', () => {
    test('should measure login page performance', async ({ page }) => {
      const loginPage = new LoginPage(page);
      
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: 0,
          cumulativeLayoutShift: 0,
          firstInputDelay: 0,
          totalBlockingTime: 0
        };
      });
      
      expect(metrics.pageLoadTime).toBeLessThan(3000);
      expect(metrics.firstContentfulPaint).toBeLessThan(2000);
      
      console.log('Login Page Performance Metrics:', metrics);
    });

    test('should measure dashboard page performance', async ({ authenticatedPage }) => {
      const dashboardPage = new DashboardPage(authenticatedPage);
      
      await dashboardPage.goto();
      await authenticatedPage.waitForLoadState('networkidle');
      const metrics = await authenticatedPage.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: 0,
          cumulativeLayoutShift: 0,
          firstInputDelay: 0,
          totalBlockingTime: 0
        };
      });
      
      expect(metrics.pageLoadTime).toBeLessThan(3000);
      expect(metrics.firstContentfulPaint).toBeLessThan(2000);
      
      console.log('Dashboard Page Performance Metrics:', metrics);
    });

    test('should measure products page performance', async ({ authenticatedPage }) => {
      const productsPage = new ProductsPage(authenticatedPage);
      
      await productsPage.goto();
      await authenticatedPage.waitForLoadState('networkidle');
      const metrics = await authenticatedPage.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: 0,
          cumulativeLayoutShift: 0,
          firstInputDelay: 0,
          totalBlockingTime: 0
        };
      });
      
      expect(metrics.pageLoadTime).toBeLessThan(3000);
      expect(metrics.firstContentfulPaint).toBeLessThan(2000);
      
      console.log('Products Page Performance Metrics:', metrics);
    });
  });

  test.describe('User Interaction Performance', () => {
    test('should measure login form submission performance', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      
      const startTime = Date.now();
      const adminUser = testData.testUsers.find(u => u.role === 'admin' && u.valid);
      await loginPage.login(adminUser?.email || 'admin@test.com', adminUser?.password || 'Admin123!');
      await page.waitForURL('**/dashboard');
      const endTime = Date.now();
      const submissionTime = endTime - startTime;
      
      expect(submissionTime).toBeLessThan(5000);
      
      console.log('Login Form Submission Time:', submissionTime, 'ms');
    });

    test('should measure product creation performance', async ({ authenticatedPage, productsPage, newProductPage }) => {
      await productsPage.goto();
      await productsPage.clickAddProduct();
      
      const startTime = Date.now();
      await newProductPage.createProduct({
        sku: `PERF-${Date.now()}`,
        name: 'Performance Test Product',
        description: 'Test product for performance measurement',
        price: '99.99',
        stock: '10',
        category: 'Electronics',
        lowStockThreshold: '5'
      });
      const endTime = Date.now();
      const creationTime = endTime - startTime;
      
      expect(creationTime).toBeLessThan(10000);
      
      console.log('Product Creation Time:', creationTime, 'ms');
    });

    test('should measure stock adjustment performance', async ({ authenticatedPage, createTestProduct }) => {
      await createTestProduct();
      
      const inventoryPage = new InventoryPage(authenticatedPage);
      await inventoryPage.goto();
      
      const productCount = await inventoryPage.getProductCount();
      if (productCount > 0) {
        const id = await inventoryPage.getFirstProductId();
        
        const startTime = Date.now();
        await inventoryPage.clickAdjustStock(id);
        await inventoryPage.adjustmentInput.fill('5');
        await inventoryPage.confirmAdjustmentButton.click();
        await inventoryPage.adjustModal.waitFor({ state: 'hidden' });
        const endTime = Date.now();
        const adjustmentTime = endTime - startTime;
        
        expect(adjustmentTime).toBeLessThan(5000);
        
        console.log('Stock Adjustment Time:', adjustmentTime, 'ms');
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should measure API response times', async ({ authenticatedPage }) => {
      const responseTimes: number[] = [];
      
      authenticatedPage.on('response', response => {
        const url = response.url();
        if (url.includes('/api/')) {
          responseTimes.push(response.request().timing().responseEnd - response.request().timing().requestStart);
        }
      });
      
      const dashboardPage = new DashboardPage(authenticatedPage);
      await dashboardPage.goto();
      await authenticatedPage.waitForLoadState('networkidle');
      
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0;
      
      expect(averageResponseTime).toBeLessThan(1000);
      
      console.log('Average API Response Time:', averageResponseTime, 'ms');
      console.log('API Response Times:', responseTimes);
    });

    test('should measure page navigation performance', async ({ authenticatedPage }) => {
      const navigationTimes: number[] = [];
      
      const pages = [
        { name: 'Dashboard', page: new DashboardPage(authenticatedPage) },
        { name: 'Products', page: new ProductsPage(authenticatedPage) },
        { name: 'Inventory', page: new InventoryPage(authenticatedPage) }
      ];
      
      for (const { name, page } of pages) {
        const startTime = Date.now();
        await page.goto();
        await authenticatedPage.waitForLoadState('networkidle');
        const endTime = Date.now();
        
        const navigationTime = endTime - startTime;
        navigationTimes.push(navigationTime);
        
        console.log(`${name} Navigation Time:`, navigationTime, 'ms');
      }
      
      const maxNavigationTime = Math.max(...navigationTimes);
      expect(maxNavigationTime).toBeLessThan(3000);
      
      console.log('Navigation Times:', navigationTimes);
    });
  });
});
