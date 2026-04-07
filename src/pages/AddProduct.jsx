import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useProducts } from "../context/ProductContext.jsx";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUpload, FiArrowLeft, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";

/**
 * AddProduct.jsx (~400 lines)
 * Dedicated product creation page for sellers
 * Features:
 * - Professional multi-step form
 * - Drag-drop image upload
 * - Real-time validation
 * - Product preview
 * - Success/error handling
 * - Mobile responsive
 */

export default function AddProduct() {
  const { user } = useContext(AuthContext);
  const { addProduct } = useProducts();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "vegetables",
    image: null
  });

  // UI state
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Image, 3: Review

  // Handle image upload from file input
  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  }

  // Handle drag over
  function handleDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }

  // Handle drag leave
  function handleDragLeave(e) {
    e.preventDefault();
    setDragActive(false);
  }

  // Handle image drop
  function handleDropImage(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  }

  // Process image file (convert to base64)
  function processImageFile(file) {
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, image: "Please select a valid image file" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "Image size must be less than 5MB" }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
      setImagePreview(reader.result);
      setErrors(prev => ({ ...prev, image: "" }));
    };
    reader.onerror = () => {
      setErrors(prev => ({ ...prev, image: "Failed to read image" }));
    };
    reader.readAsDataURL(file);
  }

  // Validate form data
  function validateForm() {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    } else if (formData.name.length > 100) {
      newErrors.name = "Product name must not exceed 100 characters";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.length > 1000) {
      newErrors.description = "Description must not exceed 1000 characters";
    }

    const price = parseFloat(formData.price);
    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(price) || price <= 0) {
      newErrors.price = "Price must be a valid positive number";
    } else if (price > 1000000) {
      newErrors.price = "Price cannot exceed ₹1,000,000";
    }

    const stock = parseInt(formData.stock);
    if (!formData.stock) {
      newErrors.stock = "Stock quantity is required";
    } else if (isNaN(stock) || stock < 0) {
      newErrors.stock = "Stock must be a valid non-negative number";
    } else if (stock > 100000) {
      newErrors.stock = "Stock cannot exceed 100,000 units";
    }

    if (!formData.image) {
      newErrors.image = "Product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Handle form submission
  async function handleSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    // Show an explicit error message next to the submit button
    setErrors(prev => ({
      ...prev,
      submit: "Please fill all required fields correctly (scroll up to see errors)."
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  setLoading(true);

  try {
    await addProduct({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      image: formData.image,
      sellerEmail: user?.email,
      sellerName: user?.name
    });

    setSuccess(true);
    setSuccessMessage(`"${formData.name}" added successfully!`);

    setTimeout(() => {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "vegetables",
        image: null
      });
      setImagePreview(null);
      setCurrentStep(1);
      navigate("/seller-dashboard");
    }, 2000);

  } catch (error) {
    setErrors(prev => ({
      ...prev,
      submit: "Failed to add product. Please try again."
    }));
  } finally {
    setLoading(false); // ✅ IMPORTANT FIX
  }
}
  // Handle input change
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }

  // Remove image
  function removeImage() {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  }

  // Categories
  const categories = [
    { value: "vegetables", label: "🥬 Vegetables" },
    { value: "fruits", label: "🍎 Fruits" },
    { value: "grains", label: "🌾 Grains" },
    { value: "dairy", label: "🥛 Dairy" },
    { value: "other", label: "📦 Other" }
  ];

  // Calculate form completion percentage
  const completionPercentage = Math.round(
    ((formData.name ? 20 : 0) +
      (formData.description ? 20 : 0) +
      (formData.price ? 20 : 0) +
      (formData.stock ? 20 : 0) +
      (imagePreview ? 20 : 0)) / 100 * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/seller-dashboard")}
              className="hover:bg-white/20 p-2 rounded-lg transition"
            >
              <FiArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Add New Product</h1>
              <p className="text-green-100">Create a new product listing</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm">Seller: {user?.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Success message */}
        {success && (
          <motion.div
            className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <FiCheck className="text-green-600 mt-1" size={24} />
            <div>
              <p className="font-bold text-green-800">Success!</p>
              <p className="text-green-700">{successMessage}</p>
              <p className="text-sm text-green-600 mt-1">Redirecting to dashboard...</p>
            </div>
          </motion.div>
        )}

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-gray-700">Form Completion</p>
            <p className="text-sm font-bold text-green-600">{completionPercentage}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Step 1: Product Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Information</h2>

            {/* Product name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="E.g., Organic Tomatoes, Fresh Milk"
                value={formData.name}
                onChange={handleInputChange}
                maxLength="100"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-green-200"
                }`}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <FiAlertCircle size={16} /> {errors.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">{formData.name.length}/100</p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                placeholder="Describe your product: origin, benefits, harvest date, quality, storage info, etc."
                value={formData.description}
                onChange={handleInputChange}
                maxLength="1000"
                rows="5"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                  errors.description
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-green-200"
                }`}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <FiAlertCircle size={16} /> {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000</p>
            </div>

            {/* Price and Stock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.price
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-green-200"
                  }`}
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <FiAlertCircle size={16} /> {errors.price}
                  </p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  placeholder="0"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.stock
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-green-200"
                  }`}
                />
                {errors.stock && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <FiAlertCircle size={16} /> {errors.stock}
                  </p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                    className={`px-4 py-3 rounded-lg font-semibold transition text-sm ${
                      formData.category === cat.value
                        ? "bg-green-500 text-white ring-2 ring-green-700"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Product Image */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Image</h2>

            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDropImage}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
                  dragActive
                    ? "border-green-500 bg-green-50"
                    : errors.image
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 hover:border-green-400 hover:bg-green-50"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-input"
                />
                <label htmlFor="image-input" className="cursor-pointer">
                  <FiUpload className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="font-semibold text-gray-800 mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-sm w-full h-64 object-cover rounded-lg border-2 border-green-300 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => document.getElementById("image-input").click()}
                  className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg font-semibold transition"
                >
                  Change Image
                </button>
              </div>
            )}
            {errors.image && (
              <p className="text-red-600 text-sm mt-3 flex items-center gap-1">
                <FiAlertCircle size={16} /> {errors.image}
              </p>
            )}
          </div>

          {/* Step 3: Review and Submit */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Your Product</h2>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Product Name</p>
                  <p className="text-lg font-bold text-gray-800">{formData.name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
                  <p className="text-lg font-bold text-gray-800">
                    {categories.find(c => c.value === formData.category)?.label || formData.category}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                  <p className="text-lg font-bold text-green-600">₹{formData.price ? parseFloat(formData.price).toLocaleString() : "0"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Stock</p>
                  <p className="text-lg font-bold text-gray-800">{formData.stock || "0"} units</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding Product...
                </>
              ) : (
                <>
                  <FiCheck size={20} /> Add Product to Marketplace
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/seller-dashboard")}
              className="px-8 bg-gray-300 hover:bg-gray-400 text-gray-800 py-4 rounded-lg font-bold transition"
            >
              Cancel
            </button>
          </div>

          {errors.submit && (
            <p className="text-red-600 text-sm mt-4 flex items-center gap-1">
              <FiAlertCircle size={16} /> {errors.submit}
            </p>
          )}
        </motion.form>
      </div>
    </div>
  );
}
