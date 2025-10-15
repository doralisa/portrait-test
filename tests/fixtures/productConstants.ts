export const PRODUCT_CONSTANTS = {
  VALID_PRODUCT: {
    sku: 'TEST-001',
    name: 'Test Product 1',
    description: 'This is a test product',
    price: '99.99',
    stock: '50',
    category: 'Electronics',
    lowStockThreshold: '10'
  },
  INVALID_PRICE_PRODUCT: {
    sku: 'TEST-002',
    name: 'Test Product 2',
    description: 'Test description',
    price: '-10.00',
    stock: '20',
    category: 'Electronics',
    lowStockThreshold: '5'
  },
  INVALID_STOCK_PRODUCT: {
    sku: 'TEST-003',
    name: 'Test Product 3',
    description: 'Test description',
    price: '25.00',
    stock: '-5',
    category: 'Electronics',
    lowStockThreshold: '5'
  },
  SEARCH_TERMS: {
    INVALID: 'NonExistentProduct'
  },
  ERROR_MESSAGES: {
    SKU_REQUIRED: 'SKU is required',
    NAME_REQUIRED: 'Name is required',
    PRICE_REQUIRED: 'Price is required',
    PRICE_NEGATIVE: 'Price must be greater than 0',
    STOCK_REQUIRED: 'Stock is required',
    STOCK_NEGATIVE: 'Stock cannot be negative',
    NO_PRODUCTS_FOUND: 'No products found'
  }
};