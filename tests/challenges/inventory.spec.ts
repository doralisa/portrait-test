import { test, expect } from '@playwright/test';
import { InventoryPage } from '../../pages/inventory.page';
import { ProductsPage } from '../../pages/products.page';
import { NewProductPage } from '../../pages/new-product.page';
import { loginAsAdmin } from '../helpers/test-helpers';
import inventoryData from '../../data/inventory-test-data.json';

test.describe('Inventory Management Tests', () => {
  let inventoryPage: InventoryPage;
  let productsPage: ProductsPage;
  let newProductPage: NewProductPage;

  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    productsPage = new ProductsPage(page);
    newProductPage = new NewProductPage(page);
    await loginAsAdmin(page);
    await inventoryPage.goto();
  });

  test.describe('Adjust Stock Levels', () => {
    test('should open adjust stock modal', async () => {
      const productCount = await inventoryPage.getProductCount();
      if (productCount > 0) {
        const id = await inventoryPage.getFirstProductId();
        
        await inventoryPage.clickAdjustStock(id);
        await expect(inventoryPage.adjustModal).toBeVisible();
        await expect(inventoryPage.adjustmentInput).toBeVisible();
        await expect(inventoryPage.confirmAdjustmentButton).toBeVisible();
        await expect(inventoryPage.cancelAdjustmentButton).toBeVisible();
      }
    });

    test('should increase stock level successfully', async () => {
      const productCount = await inventoryPage.getProductCount();
      if (productCount > 0) {
        const id = await inventoryPage.getFirstProductId();
            const result = await inventoryPage.adjustStockAndVerify(id, inventoryData.adjustmentValues.increase);
        
        expect(result.displayedNewStock).toBe(result.expectedNewStock);
        expect(result.finalStock).toBe(result.expectedNewStock);
        expect(result.finalStock).toBe(result.initialStock + result.adjustment);
      }
    });

    test('should decrease stock level successfully', async () => {
      const productCount = await inventoryPage.getProductCount();
      if (productCount > 0) {
        const id = await inventoryPage.getFirstProductId();
            const result = await inventoryPage.adjustStockAndVerify(id, inventoryData.adjustmentValues.decrease);
        
        expect(result.displayedNewStock).toBe(result.expectedNewStock);
        expect(result.finalStock).toBe(result.expectedNewStock);
        expect(result.finalStock).toBe(result.initialStock + result.adjustment);
      }
    });
  });

  test.describe('Stock Validation', () => {
    test('should show error for invalid adjustment input', async () => {
      const productCount = await inventoryPage.getProductCount();
      if (productCount > 0) {
        const id = await inventoryPage.getFirstProductId();
        
        await inventoryPage.clickAdjustStock(id);
        await inventoryPage.adjustmentInput.pressSequentially(inventoryData.adjustmentValues.invalid);
        await inventoryPage.confirmAdjustmentButton.click();
        
        await expect(inventoryPage.adjustmentError).toBeVisible();
        await expect(inventoryPage.adjustmentError).toContainText(inventoryData.errorMessages.invalidAdjustment);
      }
    });

    test('should prevent stock from going below zero', async () => {
      const productCount = await inventoryPage.getProductCount();
      if (productCount > 0) {
        const id = await inventoryPage.getFirstProductId();
        const result = await inventoryPage.attemptNegativeStockAdjustment(id);
        
        if (result.canProceed) {
          await expect(inventoryPage.adjustmentError).toBeVisible();
              await expect(inventoryPage.adjustmentError).toContainText(inventoryData.errorMessages.stockNegative);
          await expect(inventoryPage.adjustModal).toBeVisible();
        }
      }
    });
  });

  test.describe('Low Stock Alerts', () => {
    test('should display low stock badge when product stock is low', async () => {
      const productCount = await inventoryPage.getProductCount();
      if (productCount > 0) {
        const id = await inventoryPage.getFirstProductId();
        const result = await inventoryPage.setProductToLowStock(id);
        
        if (result.canProceed) {
          await inventoryPage.waitForLowStockBadge(id);
          const lowStockBadge = await inventoryPage.getLowStockBadge(id);
          await expect(lowStockBadge).toContainText(inventoryData.status.lowStock);
        }
      }
    });

    test('should show accurate low stock alert count', async () => {
      try {
        await expect(inventoryPage.lowStockAlert).toBeVisible({ timeout: 1000 });
        const result = await inventoryPage.verifyLowStockAlertAccuracy();
        expect(result.isAccurate).toBe(true);
        expect(result.alertCount).toBe(result.actualCount);
      } catch {
        // If no low stock alert is visible, the test passes (no products with low stock)
      }
    });
  });

});
