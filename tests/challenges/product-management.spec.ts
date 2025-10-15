import { test, expect } from '@playwright/test';
import { ProductsPage } from '../../pages/products.page';
import { NewProductPage } from '../../pages/new-product.page';
import { loginAsAdmin } from '../helpers/test-helpers';
import { PRODUCT_CONSTANTS } from '../fixtures/productConstants';

test.describe('Product Management Tests', () => {
  let productsPage: ProductsPage;
  let newProductPage: NewProductPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    newProductPage = new NewProductPage(page);
    await loginAsAdmin(page);
    await productsPage.goto();
  });

  test('should add a new product with valid data', async () => {
    await productsPage.clickAddProduct();
    await newProductPage.createProduct(PRODUCT_CONSTANTS.VALID_PRODUCT);
    await expect(productsPage.title).toContainText('Products');
    expect(await productsPage.isProductInTable(PRODUCT_CONSTANTS.VALID_PRODUCT.name)).toBe(true);
  });

  test.describe('Form Validation', () => {
    test('should validate required fields', async () => {
      await productsPage.clickAddProduct();
      await newProductPage.submitForm();
      await expect(newProductPage.skuError).toContainText(PRODUCT_CONSTANTS.ERROR_MESSAGES.SKU_REQUIRED);
      await expect(newProductPage.nameError).toContainText(PRODUCT_CONSTANTS.ERROR_MESSAGES.NAME_REQUIRED);
      await expect(newProductPage.priceError).toContainText(PRODUCT_CONSTANTS.ERROR_MESSAGES.PRICE_REQUIRED);
      await expect(newProductPage.stockError).toContainText(PRODUCT_CONSTANTS.ERROR_MESSAGES.STOCK_REQUIRED);
    });

    test('should show validation error for negative price', async () => {
      await productsPage.clickAddProduct();
      await newProductPage.fillForm(PRODUCT_CONSTANTS.INVALID_PRICE_PRODUCT);
      await newProductPage.submitForm();
      await expect(newProductPage.priceNegativeError).toContainText(PRODUCT_CONSTANTS.ERROR_MESSAGES.PRICE_NEGATIVE);
    });

    test('should show validation error for negative stock', async () => {
      await productsPage.clickAddProduct();
      await newProductPage.fillForm(PRODUCT_CONSTANTS.INVALID_STOCK_PRODUCT);
      await newProductPage.submitForm();
      await expect(newProductPage.stockNegativeError).toContainText(PRODUCT_CONSTANTS.ERROR_MESSAGES.STOCK_NEGATIVE);
    });
  });

  test.describe('Search Products', () => {
    test('should search for products by name', async () => {
      await productsPage.clickAddProduct();
      await newProductPage.createProduct(PRODUCT_CONSTANTS.VALID_PRODUCT);
      await productsPage.goto();
      await productsPage.searchInput.fill(PRODUCT_CONSTANTS.VALID_PRODUCT.name);
      await expect(productsPage.productsTable).toBeVisible();
      expect(await productsPage.isProductInTable(PRODUCT_CONSTANTS.VALID_PRODUCT.name)).toBe(true);
    });

    test('should show no results message when no products match', async () => {
      await productsPage.searchInput.fill(PRODUCT_CONSTANTS.SEARCH_TERMS.INVALID);
      await expect(productsPage.noProductsMessage).toBeVisible();
      await expect(productsPage.noProductsMessage).toContainText(PRODUCT_CONSTANTS.ERROR_MESSAGES.NO_PRODUCTS_FOUND);
    });
  });

  test.describe('Delete Product', () => {
    test('should delete a product with confirmation', async () => {
      await productsPage.clickAddProduct();
      await newProductPage.createProduct(PRODUCT_CONSTANTS.VALID_PRODUCT);
      await productsPage.goto();
      if (await productsPage.isProductInTable(PRODUCT_CONSTANTS.VALID_PRODUCT.name)) {
        await productsPage.deleteFirstProduct();
        await expect(productsPage.deleteModal).toBeVisible();
        await productsPage.confirmDelete();
        await expect(productsPage.deleteModal).not.toBeVisible();
        await productsPage.searchInput.fill(PRODUCT_CONSTANTS.VALID_PRODUCT.name);
        await expect(productsPage.noProductsMessage).toBeVisible();
      }
    });
  });
});
