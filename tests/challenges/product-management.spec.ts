import { test, expect } from '@playwright/test';
import { ProductsPage } from '../../pages/products.page';
import { NewProductPage } from '../../pages/new-product.page';
import { loginAsAdmin } from '../helpers/test-helpers';
import testData from '../../data/test-products.json';

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
    const validProduct = testData.validProducts[0];
    await productsPage.clickAddProduct();
    await newProductPage.createProduct({
      sku: validProduct.sku,
      name: validProduct.name,
      description: validProduct.description,
      price: validProduct.price.toString(),
      stock: validProduct.stock.toString(),
      category: validProduct.category,
      lowStockThreshold: validProduct.lowStockThreshold.toString()
    });
    await expect(productsPage.title).toContainText('Products');
    expect(await productsPage.isProductInTable(validProduct.name)).toBe(true);
  });

  test.describe('Form Validation', () => {
    test('should validate required fields', async () => {
      await productsPage.clickAddProduct();
      await newProductPage.submitForm();
      await expect(newProductPage.skuError).toContainText('SKU is required');
      await expect(newProductPage.nameError).toContainText('Name is required');
      await expect(newProductPage.priceError).toContainText('Price is required');
      await expect(newProductPage.stockError).toContainText('Stock is required');
    });

    test('should show validation error for negative price', async () => {
      await productsPage.clickAddProduct();
      const invalidProduct = testData.invalidProducts.find(p => p.expectedError === 'Price must be greater than 0');
      await newProductPage.fillForm({
        sku: invalidProduct?.sku || 'TEST-001',
        name: invalidProduct?.name || 'Test Product',
        description: 'Test description',
        price: invalidProduct?.price.toString() || '-10.00',
        stock: invalidProduct?.stock.toString() || '10',
        category: 'Electronics',
        lowStockThreshold: '10'
      });
      await newProductPage.submitForm();
      await expect(newProductPage.priceNegativeError).toContainText(invalidProduct?.expectedError || 'Price must be greater than 0');
    });

    test('should show validation error for negative stock', async () => {
      await productsPage.clickAddProduct();
      const invalidProduct = testData.invalidProducts.find(p => p.expectedError === 'Stock cannot be negative');
      await newProductPage.fillForm({
        sku: invalidProduct?.sku || 'TEST-002',
        name: invalidProduct?.name || 'Test Product',
        description: 'Test description',
        price: invalidProduct?.price.toString() || '50.00',
        stock: invalidProduct?.stock.toString() || '-5',
        category: 'Electronics',
        lowStockThreshold: '10'
      });
      await newProductPage.submitForm();
      await expect(newProductPage.stockNegativeError).toContainText(invalidProduct?.expectedError || 'Stock cannot be negative');
    });
  });

  test.describe('Search Products', () => {
    test('should search for products by name', async () => {
      const validProduct = testData.validProducts[0];
      await productsPage.clickAddProduct();
      await newProductPage.createProduct({
        sku: validProduct.sku,
        name: validProduct.name,
        description: validProduct.description,
        price: validProduct.price.toString(),
        stock: validProduct.stock.toString(),
        category: validProduct.category,
        lowStockThreshold: validProduct.lowStockThreshold.toString()
      });
      await productsPage.goto();
      await productsPage.searchInput.fill(validProduct.name);
      await expect(productsPage.productsTable).toBeVisible();
      expect(await productsPage.isProductInTable(validProduct.name)).toBe(true);
    });

    test('should show no results message when no products match', async () => {
      await productsPage.searchInput.fill('NonExistentProduct');
      await expect(productsPage.noProductsMessage).toBeVisible();
      await expect(productsPage.noProductsMessage).toContainText('No products found');
    });
  });

  test.describe('Delete Product', () => {
    test('should delete a product with confirmation', async () => {
      const validProduct = testData.validProducts[0];
      await productsPage.clickAddProduct();
      await newProductPage.createProduct({
        sku: validProduct.sku,
        name: validProduct.name,
        description: validProduct.description,
        price: validProduct.price.toString(),
        stock: validProduct.stock.toString(),
        category: validProduct.category,
        lowStockThreshold: validProduct.lowStockThreshold.toString()
      });
      await productsPage.goto();
      if (await productsPage.isProductInTable(validProduct.name)) {
        await productsPage.deleteFirstProduct();
        await expect(productsPage.deleteModal).toBeVisible();
        await productsPage.confirmDelete();
        await expect(productsPage.deleteModal).not.toBeVisible();
        await productsPage.searchInput.fill(validProduct.name);
        await expect(productsPage.noProductsMessage).toBeVisible();
      }
    });
  });
});
