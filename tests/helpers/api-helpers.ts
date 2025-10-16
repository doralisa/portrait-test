import { APIRequestContext } from '@playwright/test';
import { generateTestProduct } from './test-helpers';

export interface ApiProduct {
  id?: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  lowStockThreshold: number;
}

export class ApiTestDataManager {
  private api: APIRequestContext;
  private createdProducts: string[] = [];

  constructor(api: APIRequestContext) {
    this.api = api;
  }

  /**
   * Create a product via API
   */
  async createProduct(productData?: Partial<ApiProduct>): Promise<ApiProduct> {
    const baseProduct = generateTestProduct();
    const product: ApiProduct = {
      sku: baseProduct.sku,
      name: baseProduct.name,
      description: baseProduct.description,
      price: baseProduct.price,
      stock: baseProduct.stock,
      category: baseProduct.category,
      lowStockThreshold: baseProduct.lowStockThreshold,
      ...productData
    };

    try {
      const response = await this.api.post('/api/products', {
        data: product
      });

      if (response.ok()) {
        const createdProduct = await response.json();
        this.createdProducts.push(createdProduct.id || product.sku);
        return createdProduct;
      } else {
        throw new Error(`Failed to create product: ${response.status()}`);
      }
    } catch (error) {
      console.log('API product creation failed, falling back to UI method');
      throw error;
    }
  }

  /**
   * Delete a product via API
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const response = await this.api.delete(`/api/products/${productId}`);
      return response.ok();
    } catch (error) {
      console.log(`Failed to delete product ${productId} via API:`, error);
      return false;
    }
  }

  /**
   * Get all products via API
   */
  async getAllProducts(): Promise<ApiProduct[]> {
    try {
      const response = await this.api.get('/api/products');
      if (response.ok()) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.log('Failed to get products via API:', error);
      return [];
    }
  }

  /**
   * Update product stock via API
   */
  async updateProductStock(productId: string, newStock: number): Promise<boolean> {
    try {
      const response = await this.api.patch(`/api/products/${productId}/stock`, {
        data: { stock: newStock }
      });
      return response.ok();
    } catch (error) {
      console.log(`Failed to update stock for product ${productId}:`, error);
      return false;
    }
  }

  /**
   * Cleanup all created products
   */
  async cleanup(): Promise<void> {
    for (const productId of this.createdProducts) {
      await this.deleteProduct(productId);
    }
    this.createdProducts = [];
  }

  /**
   * Reset application data via API
   */
  async resetApplicationData(): Promise<boolean> {
    try {
      const response = await this.api.post('/api/reset');
      return response.ok();
    } catch (error) {
      console.log('Failed to reset application data via API:', error);
      return false;
    }
  }
}

/**
 * Create API test data manager
 */
export function createApiTestDataManager(api: APIRequestContext): ApiTestDataManager {
  return new ApiTestDataManager(api);
}
