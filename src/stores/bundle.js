import { defineStore } from 'pinia';

export const useBundleStore = defineStore('bundle', {
  state: () => ({
    selectedProducts: [],
    selectedSkladId: 0,
    selectedCategoryId: 0,
  }),
  
  getters: {
    getSelectedProducts: (state) => state.selectedProducts,
    getSelectedSkladId: (state) => state.selectedSkladId,
    getSelectedCategoryId: (state) => state.selectedCategoryId,
    getSelectedProductsCount: (state) => state.selectedProducts.length,
  },
  
  actions: {
    setSelectedProducts(products) {
      this.selectedProducts = products;
    },
    
    addSelectedProduct(product) {
      const existingIndex = this.selectedProducts.findIndex(p => p.id === product.id);
      if (existingIndex !== -1) {
        // Update existing product
        this.selectedProducts[existingIndex] = { ...product };
      } else {
        // Add new product
        this.selectedProducts.push({ ...product });
      }
    },
    
    removeSelectedProduct(productId) {
      this.selectedProducts = this.selectedProducts.filter(p => p.id !== productId);
    },
    
    updateProductSelection(productId, updates) {
      const productIndex = this.selectedProducts.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        this.selectedProducts[productIndex] = {
          ...this.selectedProducts[productIndex],
          ...updates
        };
      }
    },
    
    setSelectedSklad(skladId) {
      this.selectedSkladId = skladId;
    },
    
    setSelectedCategory(categoryId) {
      this.selectedCategoryId = categoryId;
    },
    
    clearSelectedProducts() {
      this.selectedProducts = [];
    },
    
    clearNavigationState() {
      this.selectedSkladId = 0;
      this.selectedCategoryId = 0;
    },
    
    // Restore product selections from local products
    restoreProductSelections(localProducts) {
      if (!localProducts) return localProducts;
      
      // If no selected products, return original products
      if (!this.selectedProducts.length) return localProducts;
      
      return localProducts.map(product => {
        const selectedProduct = this.selectedProducts.find(sp => sp.id === product.id);
        if (selectedProduct) {
          if (product.useNumberOfSizes) {
            return { ...product, qty: selectedProduct.qty || 0 };
          } else {
            return { ...product, selectedSizes: selectedProduct.selectedSizes || [] };
          }
        }
        return product;
      });
    },
    
    // Sync local products with selected products
    syncWithLocalProducts(localProducts) {
      if (!localProducts) return;
      // Update existing selected products with current data
      this.selectedProducts = this.selectedProducts.map(sp => {
        const localProduct = localProducts.find(lp => lp.id === sp.id);
        if (localProduct) {
          return {
            ...sp,
            name: localProduct.name,
            sizes: localProduct.sizes || [],
            countSizes: localProduct.countSizes,
            useNumberOfSizes: localProduct.useNumberOfSizes
          };
        }
        return sp;
      });
      
      // Keep only products that still exist in current data
      this.selectedProducts = this.selectedProducts.filter(sp => 
        localProducts.some(lp => lp.id === sp.id)
      );
    },
    
    // Update selected products from modal
    updateSelectedProducts(updatedItems) {
      this.selectedProducts = updatedItems;
    }
  },
});
