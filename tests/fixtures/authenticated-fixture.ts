import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { ProductsPage } from '../../pages/products.page';
import { NewProductPage } from '../../pages/new-product.page';
import testData from '../../data/test-products.json';

export interface AuthenticatedFixture {
  authenticatedPage: Page;
  productsPage: ProductsPage;
  newProductPage: NewProductPage;
  createTestProduct: (productData?: any) => Promise<string>;
  cleanupTestProduct: (productId: string) => Promise<void>;
}

export const test = base.extend<AuthenticatedFixture>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // Login with admin credentials
    await loginPage.login('admin@test.com', 'Admin123!');
    await page.waitForURL('**/dashboard');
    
    await use(page);
  },

  productsPage: async ({ authenticatedPage }, use) => {
    const productsPage = new ProductsPage(authenticatedPage);
    await use(productsPage);
  },

  newProductPage: async ({ authenticatedPage }, use) => {
    const newProductPage = new NewProductPage(authenticatedPage);
    await use(newProductPage);
  },

  createTestProduct: async ({ authenticatedPage, productsPage, newProductPage }, use) => {
    const createdProducts: string[] = [];
    
    const createProduct = async (productData?: any) => {
      const product = productData || testData.validProducts[0];
      const productId = `TEST-${Date.now()}`;
      
      await productsPage.goto();
      await productsPage.clickAddProduct();
      
      await newProductPage.createProduct({
        sku: productId,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        lowStockThreshold: product.lowStockThreshold.toString()
      });
      
      createdProducts.push(productId);
      return productId;
    };
    
    await use(createProduct);
    
    // Cleanup after test - this is the "teardown" part
    for (const productId of createdProducts) {
      try {
        await productsPage.goto();
        const productCount = await productsPage.getProductCount();
        if (productCount > 0) {
          await productsPage.deleteFirstProduct();
          await productsPage.confirmDeleteButton.click();
        }
      } catch (error) {
        console.log(`Failed to cleanup product ${productId}:`, error);
      }
    }
  },

  cleanupTestProduct: async ({ authenticatedPage, productsPage }, use) => {
    const cleanup = async (productId: string) => {
      try {
        await productsPage.goto();
        const productCount = await productsPage.getProductCount();
        if (productCount > 0) {
          await productsPage.deleteFirstProduct();
          await productsPage.confirmDeleteButton.click();
        }
      } catch (error) {
        console.log(`Failed to cleanup product ${productId}:`, error);
      }
    };
    
    await use(cleanup);
  }
});

export { expect } from '@playwright/test';
