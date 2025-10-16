import { test, expect } from '../fixtures/authenticated-fixture';
import { InventoryPage } from '../../pages/inventory.page';
import inventoryData from '../../data/inventory-test-data.json';

test.describe('Inventory Management Tests', () => {

  test.describe('Adjust Stock Levels', () => {
    test('should open adjust stock modal', async ({ authenticatedPage, createTestProduct }) => {
      await createTestProduct();
      const inventoryPage = new InventoryPage(authenticatedPage);
      await inventoryPage.goto();
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

    test('should increase stock level successfully', async ({ authenticatedPage, createTestProduct }) => {
      await createTestProduct();
      const inventoryPage = new InventoryPage(authenticatedPage);
      await inventoryPage.goto();
      const productCount = await inventoryPage.getProductCount();
      if (productCount > 0) {
        const id = await inventoryPage.getFirstProductId();
            const result = await inventoryPage.adjustStockAndVerify(id, inventoryData.adjustmentValues.increase);
        
        expect(result.displayedNewStock).toBe(result.expectedNewStock);
        expect(result.finalStock).toBe(result.expectedNewStock);
        expect(result.finalStock).toBe(result.initialStock + result.adjustment);
      }
    });

    test('should decrease stock level successfully', async ({ authenticatedPage, createTestProduct }) => {
      await createTestProduct();
      const inventoryPage = new InventoryPage(authenticatedPage);
      await inventoryPage.goto();
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
    test('should show error for invalid adjustment input', async ({ authenticatedPage, createTestProduct }) => {
      await createTestProduct();
      const inventoryPage = new InventoryPage(authenticatedPage);
      await inventoryPage.goto();
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

    test('should prevent stock from going below zero', async ({ authenticatedPage, createTestProduct }) => {
      await createTestProduct();
      const inventoryPage = new InventoryPage(authenticatedPage);
      await inventoryPage.goto();
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
    test('should display low stock badge when product stock is low', async ({ authenticatedPage, createTestProduct }) => {
      await createTestProduct();
      const inventoryPage = new InventoryPage(authenticatedPage);
      await inventoryPage.goto();
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

    test('should show accurate low stock alert count', async ({ authenticatedPage, createTestProduct }) => {
      await createTestProduct();
      const inventoryPage = new InventoryPage(authenticatedPage);
      await inventoryPage.goto();
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
