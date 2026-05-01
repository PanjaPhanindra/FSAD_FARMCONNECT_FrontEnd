import React, { createContext, useContext, useState, useEffect } from "react";

export const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);

  // ✅ GET ALL PRODUCTS (Buyer)
  const fetchProducts = async () => {
    try {
      const res = await fetch("https://fsad-farmconnect-backend-1.onrender.com/products");
      const data = await res.json();
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  // ✅ GET PRODUCTS BY SELLER
  const getProductsBySeller = async (email) => {
    try {
      const res = await fetch(`https://fsad-farmconnect-backend-1.onrender.com/products/seller/${email}`);
      const data = await res.json();
      return data || [];
    } catch (err) {
      console.error("Error fetching seller products", err);
      return [];
    }
  };

  // ✅ ADD PRODUCT
  const addProduct = async (product) => {
    try {
      const res = await fetch("https://fsad-farmconnect-backend-1.onrender.com/products/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          image: product.image,
          sellerName: product.sellerName,
          farmerEmail: product.sellerEmail
        })
      });

      if (!res.ok) throw new Error("Failed to add product");

      const data = await res.json();
      await fetchProducts(); // refresh
      return data;
    } catch (err) {
      console.error("Error adding product", err);
      throw err;
    }
  };

  // ✅ UPDATE PRODUCT (🔥 FIX FOR EDIT)
  const updateProduct = async (id, product) => {
    try {
      const res = await fetch(`https://fsad-farmconnect-backend-1.onrender.com/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          image: product.image,
          sellerName: product.sellerName,
          farmerEmail: product.sellerEmail
        })
      });

      if (!res.ok) throw new Error("Failed to update product");

      const data = await res.json();
      await fetchProducts(); // refresh
      return data;
    } catch (err) {
      console.error("Error updating product", err);
      throw err;
    }
  };

  // ✅ DELETE PRODUCT
  const deleteProduct = async (id) => {
    try {
      await fetch(`https://fsad-farmconnect-backend-1.onrender.com/products/${id}`, {
        method: "DELETE"
      });
      await fetchProducts(); // refresh
    } catch (err) {
      console.error("Error deleting product", err);
    }
  };

  // ✅ INITIAL LOAD
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        fetchProducts,
        addProduct,
        updateProduct, // ✅ IMPORTANT
        deleteProduct,
        getProductsBySeller
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}