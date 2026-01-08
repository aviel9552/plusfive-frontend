/**
 * Catalog Page
 * Displays and manages the product catalog
 */

import React, { useState, useEffect, useRef } from "react";
import { FiPackage, FiPlus, FiSearch, FiChevronDown, FiEdit, FiTrash2, FiEye, FiDownload, FiX, FiSave, FiDollarSign, FiTag, FiCheckCircle, FiTrendingUp, FiBarChart2, FiFilter } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { BRAND_COLOR } from "../../utils/calendar/constants";
import { NewProductModal } from "../../components/calendar/Modals/NewProductModal";
import gradientImage from "../../assets/gradientteam.jpg";

const PRODUCTS_STORAGE_KEY = "products";
const SUPPLIERS_STORAGE_KEY = "suppliers";
const PRODUCT_CATEGORIES_STORAGE_KEY = "product_categories";

export default function CatalogPage() {
  const { language } = useLanguage();
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null); // null = כל הסטטוסים
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [products, setProducts] = useState(() => {
    // Load products from localStorage
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading products:", error);
      return [];
    }
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [openStatusDropdowns, setOpenStatusDropdowns] = useState({});
  const [statusDropdownPositions, setStatusDropdownPositions] = useState({});
  const [categoryDropdownPositions, setCategoryDropdownPositions] = useState({});
  const [isColumnFilterDropdownOpen, setIsColumnFilterDropdownOpen] = useState(false);
  const [editingFieldInList, setEditingFieldInList] = useState(null); // Track which field is being edited in the list
  const [sortBy, setSortBy] = useState("newest");
  const [visibleFields, setVisibleFields] = useState(() => {
    const defaultFields = {
      name: true,
      status: true,
      category: true,
      supplier: true,
      customerPrice: true,
      currentQuantity: true,
    };
    try {
      const stored = sessionStorage.getItem("products_visible_fields");
      if (stored) {
        return { ...defaultFields, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Error loading visible fields:", error);
    }
    return defaultFields;
  });
  
  // Product Card State
  const [selectedProductForView, setSelectedProductForView] = useState(null);
  const [showProductSummary, setShowProductSummary] = useState(false);
  const [productViewTab, setProductViewTab] = useState("details"); // "details" or "inventory"
  const [editingField, setEditingField] = useState(null);
  const [isCategoryDropdownOpenInCard, setIsCategoryDropdownOpenInCard] = useState(false);
  const [editedProductData, setEditedProductData] = useState({
    name: "",
    category: "",
    supplier: "",
    supplierPrice: "",
    customerPrice: "",
    barcode: "",
    enableCommission: false,
    currentQuantity: "",
    lowStockThreshold: "",
    reorderQuantity: "",
    lowStockAlerts: false
  });
  const [isProductCardStatusDropdownOpen, setIsProductCardStatusDropdownOpen] = useState(false);
  const prevSelectedProductIdRef = useRef(null);
  
  // Custom categories state
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const stored = localStorage.getItem(PRODUCT_CATEGORIES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading custom categories:", error);
      return [];
    }
  });
  const [isAddingCategory, setIsAddingCategory] = useState({}); // Track which dropdown is in "add category" mode: { "category-{productId}": true } or { "card": true }
  const [newCategoryName, setNewCategoryName] = useState({}); // Track new category name for each dropdown: { "category-{productId}": "..." } or { "card": "..." }
  
  // New Product Modal State
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductSupplier, setNewProductSupplier] = useState("");
  const [newProductSupplierPrice, setNewProductSupplierPrice] = useState("");
  const [newProductCustomerPrice, setNewProductCustomerPrice] = useState("");
  const [newProductBarcode, setNewProductBarcode] = useState("");
  const [newProductEnableCommission, setNewProductEnableCommission] = useState(false);
  const [newProductCurrentQuantity, setNewProductCurrentQuantity] = useState("");
  const [newProductLowStockThreshold, setNewProductLowStockThreshold] = useState("");
  const [newProductReorderQuantity, setNewProductReorderQuantity] = useState("");
  const [newProductLowStockAlerts, setNewProductLowStockAlerts] = useState(false);
  const [newProductErrors, setNewProductErrors] = useState({});

  // Save products to localStorage whenever products change
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error("Error saving products:", error);
    }
  }, [products]);

  // Save visible fields to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("products_visible_fields", JSON.stringify(visibleFields));
    } catch (error) {
      console.error("Error saving visible fields:", error);
    }
  }, [visibleFields]);

  // Save custom categories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCT_CATEGORIES_STORAGE_KEY, JSON.stringify(customCategories));
    } catch (error) {
      console.error("Error saving custom categories:", error);
    }
  }, [customCategories]);

  // Filter products based on search and status
  const filteredProducts = products.filter((product) => {
    const matchesSearch = !searchQuery || 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === null || product.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Sort products
  const filteredAndSortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    } else if (sortBy === "name") {
      return (a.name || "").localeCompare(b.name || "", 'he');
    }
    return 0;
  });

  // Toggle field visibility
  const toggleFieldVisibility = (fieldKey) => {
    setVisibleFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  // Select all fields in category
  const selectAllFieldsInCategory = (fieldKeys) => {
    const allSelected = fieldKeys.every(key => visibleFields[key]);
    setVisibleFields(prev => {
      const updated = { ...prev };
      fieldKeys.forEach(key => {
        updated[key] = !allSelected;
      });
      return updated;
    });
  };

  // Handle selecting/deselecting products
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle selecting all products
  const handleSelectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  // Handle downloading selected products
  const handleDownloadSelectedProducts = () => {
    if (selectedProducts.length === 0) {
      alert("אנא בחר לפחות מוצר אחד להורדה");
      return;
    }

    const selectedProductsData = products.filter((p) => selectedProducts.includes(p.id));
    
    // Convert to CSV
    const headers = ["שם מוצר", "קטגוריה", "ספק", "מחיר ספק", "מחיר לקוח", "אחוז רווח", "ברקוד", "כמות במלאי", "סטטוס"];
    const rows = selectedProductsData.map(product => [
      product.name || "",
      product.category || "",
      product.supplier || "",
      product.supplierPrice || "0",
      product.customerPrice || "0",
      product.grossProfitPercentage || "0",
      product.barcode || "",
      product.currentQuantity || "0",
      product.status || "פעיל"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Add BOM for Hebrew support in Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `מוצרים_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle deleting selected products
  const handleDeleteSelectedProducts = () => {
    if (selectedProducts.length === 0) {
      alert("אנא בחר לפחות מוצר אחד למחיקה");
      return;
    }

    if (window.confirm(`האם אתה בטוח שאתה רוצה למחוק ${selectedProducts.length} מוצרים?`)) {
      setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
    }
  };

  // Handle updating product field in list
  const handleUpdateProductFieldInList = (productId, field, value) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          [field]: value
        };
      }
      return product;
    });

    setProducts(updatedProducts);
    
    // Update selectedProductForView if it's the same product
    if (selectedProductForView && selectedProductForView.id === productId) {
      const updatedProduct = updatedProducts.find(p => p.id === productId);
      setSelectedProductForView(updatedProduct);
    }
  };

  // Handle updating product status
  const handleUpdateProductStatus = (productId, newStatus) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, status: newStatus } : p
    ));
    setOpenStatusDropdowns(prev => ({
      ...prev,
      [productId]: false
    }));
    
    // Update selectedProductForView if it's the same product
    if (selectedProductForView && selectedProductForView.id === productId) {
      setSelectedProductForView(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Update edited data when product changes
  useEffect(() => {
    if (selectedProductForView) {
      setEditedProductData({
        name: selectedProductForView.name || "",
        category: selectedProductForView.category || "",
        supplier: selectedProductForView.supplier || "",
        supplierPrice: selectedProductForView.supplierPrice || "",
        customerPrice: selectedProductForView.customerPrice || "",
        barcode: selectedProductForView.barcode || "",
        enableCommission: selectedProductForView.enableCommission || false,
        currentQuantity: selectedProductForView.currentQuantity || "",
        lowStockThreshold: selectedProductForView.lowStockThreshold || "",
        reorderQuantity: selectedProductForView.reorderQuantity || "",
        lowStockAlerts: selectedProductForView.lowStockAlerts || false
      });
      setEditingField(null);
      if (!prevSelectedProductIdRef.current || selectedProductForView.id !== prevSelectedProductIdRef.current) {
        setProductViewTab("details");
        prevSelectedProductIdRef.current = selectedProductForView.id;
      }
    }
  }, [selectedProductForView]);

  // Handle saving edited field
  const handleSaveField = (fieldName) => {
    if (!selectedProductForView) return;
    
    const updatedProducts = products.map(product => {
      if (product.id === selectedProductForView.id) {
        let updatedProduct = { ...product };
        
        if (fieldName === "supplierPrice" || fieldName === "customerPrice") {
          const supplierPrice = fieldName === "supplierPrice" 
            ? parseFloat(editedProductData.supplierPrice) || 0
            : product.supplierPrice || 0;
          const customerPrice = fieldName === "customerPrice"
            ? parseFloat(editedProductData.customerPrice) || 0
            : product.customerPrice || 0;
          
          const grossProfitPercentage = supplierPrice > 0 && customerPrice > 0
            ? ((customerPrice - supplierPrice) / supplierPrice * 100).toFixed(1)
            : 0;
          
          updatedProduct = {
            ...updatedProduct,
            [fieldName]: fieldName === "supplierPrice" 
              ? parseFloat(editedProductData.supplierPrice) || 0
              : parseFloat(editedProductData.customerPrice) || 0,
            grossProfitPercentage: parseFloat(grossProfitPercentage)
          };
        } else if (fieldName === "currentQuantity" || fieldName === "lowStockThreshold" || fieldName === "reorderQuantity") {
          updatedProduct[fieldName] = parseInt(editedProductData[fieldName]) || 0;
        } else if (fieldName === "enableCommission" || fieldName === "lowStockAlerts") {
          updatedProduct[fieldName] = editedProductData[fieldName];
        } else {
          updatedProduct[fieldName] = editedProductData[fieldName];
        }
        
        return updatedProduct;
      }
      return product;
    });
    
    setProducts(updatedProducts);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
    const updatedProduct = updatedProducts.find(p => p.id === selectedProductForView.id);
    if (updatedProduct) {
      setSelectedProductForView(updatedProduct);
    }
    setEditingField(null);
  };

  // Handle canceling edit
  const handleCancelEditField = (fieldName) => {
    setEditingField(null);
    if (selectedProductForView) {
      setEditedProductData({
        name: selectedProductForView.name || "",
        category: selectedProductForView.category || "",
        supplier: selectedProductForView.supplier || "",
        supplierPrice: selectedProductForView.supplierPrice || "",
        customerPrice: selectedProductForView.customerPrice || "",
        barcode: selectedProductForView.barcode || "",
        enableCommission: selectedProductForView.enableCommission || false,
        currentQuantity: selectedProductForView.currentQuantity || "",
        lowStockThreshold: selectedProductForView.lowStockThreshold || "",
        reorderQuantity: selectedProductForView.reorderQuantity || "",
        lowStockAlerts: selectedProductForView.lowStockAlerts || false
      });
    }
  };

  // Format date helper
  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "-";
    }
  };

  // Handle creating new product
  const handleCreateNewProduct = () => {
    const errors = {};
    
    if (!newProductName.trim()) {
      errors.name = "שם המוצר הוא שדה חובה";
    }
    
    if (!newProductCustomerPrice || parseFloat(newProductCustomerPrice) <= 0) {
      errors.customerPrice = "מחיר ללקוח חייב להיות גדול מ-0";
    }
    
    if (Object.keys(errors).length > 0) {
      setNewProductErrors(errors);
      return;
    }
    
    // Calculate gross profit percentage
    const supplierPrice = parseFloat(newProductSupplierPrice) || 0;
    const customerPrice = parseFloat(newProductCustomerPrice);
    const grossProfitPercentage = supplierPrice > 0 && customerPrice > 0
      ? ((customerPrice - supplierPrice) / supplierPrice * 100).toFixed(1)
      : 0;
    
    // Check if supplier exists, if not create a new one
    if (newProductSupplier && newProductSupplier.trim()) {
      try {
        const storedSuppliers = localStorage.getItem(SUPPLIERS_STORAGE_KEY);
        const suppliers = storedSuppliers ? JSON.parse(storedSuppliers) : [];
        
        // Check if supplier with this name already exists
        const supplierExists = suppliers.some(
          (supplier) => supplier.name?.toLowerCase().trim() === newProductSupplier.toLowerCase().trim()
        );
        
        // If supplier doesn't exist, create a new one
        if (!supplierExists) {
          const newSupplier = {
            id: Date.now().toString(),
            name: newProductSupplier.trim(),
            phone: "",
            email: "",
            status: "פעיל",
            createdAt: new Date().toISOString(),
          };
          
          const updatedSuppliers = [...suppliers, newSupplier];
          localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(updatedSuppliers));
        }
      } catch (error) {
        console.error("Error checking/creating supplier:", error);
      }
    }
    
    // Create product object
    const newProduct = {
      id: Date.now().toString(),
      name: newProductName,
      category: newProductCategory,
      supplier: newProductSupplier,
      supplierPrice: supplierPrice,
      customerPrice: customerPrice,
      grossProfitPercentage: parseFloat(grossProfitPercentage),
      barcode: newProductBarcode,
      enableCommission: newProductEnableCommission,
      currentQuantity: parseInt(newProductCurrentQuantity) || 0,
      lowStockThreshold: parseInt(newProductLowStockThreshold) || 0,
      reorderQuantity: parseInt(newProductReorderQuantity) || 0,
      lowStockAlerts: newProductLowStockAlerts,
      status: "פעיל", // Default status
      createdAt: new Date().toISOString(),
    };
    
    // Add product to list
    setProducts(prev => [...prev, newProduct]);
    
    // Reset form
    setNewProductName("");
    setNewProductCategory("");
    setNewProductSupplier("");
    setNewProductSupplierPrice("");
    setNewProductCustomerPrice("");
    setNewProductBarcode("");
    setNewProductEnableCommission(false);
    setNewProductCurrentQuantity("");
    setNewProductLowStockThreshold("");
    setNewProductReorderQuantity("");
    setNewProductLowStockAlerts(false);
    setNewProductErrors({});
    setIsNewProductModalOpen(false);
  };

  return (
    <div className="w-full bg-[#ffffff]" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                מוצרים
              </h1>
              {products.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#181818] px-2 py-0.5 rounded">
                  {products.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              צפה, הוסף, ערוך ומחק את המוצרים שלך.{" "}
              <a href="#" className="text-[#ff257c] hover:underline">למד עוד</a>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNewProductName("");
                setNewProductCategory("");
                setNewProductSupplier("");
                setNewProductSupplierPrice("");
                setNewProductCustomerPrice("");
                setNewProductBarcode("");
                setNewProductEnableCommission(false);
                setNewProductCurrentQuantity("");
                setNewProductLowStockThreshold("");
                setNewProductReorderQuantity("");
                setNewProductLowStockAlerts(false);
                setNewProductErrors({});
                setIsNewProductModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all duration-200 font-semibold text-sm flex items-center gap-2"
            >
              חדש
              <FiPlus className="text-base" />
            </button>
          </div>
        </div>


        {/* Search and Filters Bar */}
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          {/* 1. חיפוש */}
          <div className="relative w-1/4">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="חפש מוצר..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-4 pl-12 py-2.5 rounded-full border border-gray-200 dark:border-commonBorder bg-white dark:bg-[#181818] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-[#ff257c] focus:outline-none focus:border-[#ff257c] transition-colors"
            />
          </div>

          {/* 2. כל הסטטוסים */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
              onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
            >
              <span className="whitespace-nowrap">
                {selectedStatus === null ? "כל הסטטוסים" : selectedStatus}
              </span>
              <FiChevronDown className="text-[14px] text-gray-400" />
            </button>

            {isStatusDropdownOpen && (
              <>
                {/* Overlay layer to close dropdown when clicking outside */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsStatusDropdownOpen(false)}
                />
                <div
                  dir="rtl"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                >
                  <div className="py-2">
                    {/* כל הסטטוסים */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                      onClick={() => {
                        setSelectedStatus(null);
                        setIsStatusDropdownOpen(false);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            selectedStatus === null
                              ? "border-[rgba(255,37,124,1)]"
                              : "border-gray-300 dark:border-gray-500"
                          }`}
                        >
                          {selectedStatus === null && (
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: BRAND_COLOR }}
                            />
                          )}
                        </span>
                        <span>כל הסטטוסים</span>
                      </span>
                    </button>

                    {/* פעיל */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                      onClick={() => {
                        setSelectedStatus("פעיל");
                        setIsStatusDropdownOpen(false);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            selectedStatus === "פעיל"
                              ? "border-[rgba(255,37,124,1)]"
                              : "border-gray-300 dark:border-gray-500"
                          }`}
                        >
                          {selectedStatus === "פעיל" && (
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: BRAND_COLOR }}
                            />
                          )}
                        </span>
                        <span>פעיל</span>
                      </span>
                    </button>

                    {/* לא פעיל */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                      onClick={() => {
                        setSelectedStatus("לא פעיל");
                        setIsStatusDropdownOpen(false);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            selectedStatus === "לא פעיל"
                              ? "border-gray-500"
                              : "border-gray-300 dark:border-gray-500"
                          }`}
                        >
                          {selectedStatus === "לא פעיל" && (
                            <span
                              className="w-2 h-2 rounded-full bg-gray-500"
                            />
                          )}
                        </span>
                        <span>לא פעיל</span>
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 3. סינון */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsColumnFilterDropdownOpen((prev) => !prev);
              }}
            >
              <span className="whitespace-nowrap">סינון</span>
              <FiFilter className="text-[14px] text-gray-400" />
            </button>

            {/* Column Filter Dropdown */}
            {isColumnFilterDropdownOpen && (
              <>
                {/* Overlay layer to close dropdown when clicking outside */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsColumnFilterDropdownOpen(false);
                  }}
                />
                <div
                  dir="rtl"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right max-h-[80vh] overflow-y-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="py-2">
                    {/* קטגוריה: מיון */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      מיון
                    </div>
                    {[
                      { key: "newest", label: "חדש ביותר" },
                      { key: "oldest", label: "ישן ביותר" },
                      { key: "name", label: "א-ב" },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSortBy(option.key);
                          setIsColumnFilterDropdownOpen(false);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              sortBy === option.key
                                ? "border-[rgba(255,37,124,1)]"
                                : "border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {sortBy === option.key && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: BRAND_COLOR }}
                              />
                            )}
                          </span>
                          <span>{option.label}</span>
                        </span>
                      </button>
                    ))}

                    {/* הפרדה בין קטגוריות */}
                    <div className="border-b border-gray-200 dark:border-[#262626] my-2"></div>

                    {/* קטגוריה: פרטים */}
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        פרטים
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllFieldsInCategory(["name", "status", "category", "supplier", "customerPrice", "currentQuantity"]);
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#ff257c] transition-colors"
                      >
                        סמן הכל
                      </button>
                    </div>
                    {[
                      { key: "name", label: "שם מוצר" },
                      { key: "status", label: "סטטוס" },
                      { key: "category", label: "קטגוריה" },
                      { key: "supplier", label: "ספק" },
                      { key: "customerPrice", label: "מחיר לקוח" },
                      { key: "currentQuantity", label: "כמות במלאי" },
                    ].map((field) => (
                      <button
                        key={field.key}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFieldVisibility(field.key);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              visibleFields[field.key]
                                ? "border-[rgba(255,37,124,1)]"
                                : "border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {visibleFields[field.key] && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: BRAND_COLOR }}
                              />
                            )}
                          </span>
                          <span>{field.label}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 4. בחר הכל, 5. הורדה, 6. מחיקה */}
          {filteredAndSortedProducts.length > 0 && (
            <div className="relative flex items-center gap-3">
              {/* Select All Button */}
              <button
                onClick={handleSelectAllProducts}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedProducts.length === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0
                      ? "border-[rgba(255,37,124,1)]"
                      : "border-gray-300 dark:border-gray-500"
                  }`}
                >
                  {selectedProducts.length === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0 && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: BRAND_COLOR }}
                    />
                  )}
                </span>
                <span className="whitespace-nowrap text-xs sm:text-sm">
                  בחר הכל ({selectedProducts.length}/{filteredAndSortedProducts.length})
                </span>
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownloadSelectedProducts}
                disabled={selectedProducts.length === 0}
                className={`p-2 rounded-full border border-gray-200 dark:border-commonBorder transition-colors ${
                  selectedProducts.length === 0
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#1a1a1a]"
                    : "text-gray-600 dark:text-gray-400 hover:text-[#ff257c] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] bg-white dark:bg-[#181818]"
                }`}
                title="הורדת מוצרים נבחרים"
              >
                <FiDownload className="text-sm" />
              </button>

              {/* Delete Button */}
              <button
                onClick={handleDeleteSelectedProducts}
                disabled={selectedProducts.length === 0}
                className={`p-2 rounded-full border border-gray-200 dark:border-commonBorder transition-colors ${
                  selectedProducts.length === 0
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#1a1a1a]"
                    : "text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] bg-white dark:bg-[#181818]"
                }`}
                title="מחיקת מוצרים נבחרים"
              >
                <FiTrash2 className="text-sm" />
              </button>
            </div>
          )}
          </div>

        {/* Products List */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="p-12 text-center">
              <FiPackage className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {searchQuery ? "לא נמצאו מוצרים התואמים לחיפוש" : "אין מוצרים עדיין"}
              </p>
              {!searchQuery && (
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  מוצרים חדשים שנוצרים יופיעו כאן
                </p>
              )}
            </div>
        ) : (
          <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* Table Headers */}
            <div className="flex items-center gap-6 px-4 py-3 border-b border-gray-200 dark:border-[#2b2b2b] relative min-w-max">
              {/* Checkbox placeholder for alignment */}
              <div className="w-3.5 flex-shrink-0"></div>
              
              {visibleFields.name && (
                <div className="w-32 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `16px` }}>
                  <div className="w-8 h-8 flex-shrink-0"></div>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    שם מוצר
                  </span>
                </div>
              )}
              
              {visibleFields.status && (
                <div className="w-28 flex items-center justify-center flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    סטטוס
                  </span>
                </div>
              )}
              
              {visibleFields.category && (
                <div className="w-32 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    קטגוריה
                  </span>
                </div>
              )}
              
              {visibleFields.supplier && (
                <div className="w-32 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    ספק
                  </span>
                </div>
              )}
              
              {visibleFields.customerPrice && (
                <div className="w-40 flex items-center justify-start flex-shrink-0" style={{ marginRight: `8px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    מחיר לקוח
                  </span>
                </div>
              )}
              
              {visibleFields.currentQuantity && (
                <div className="w-32 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    כמות במלאי
                  </span>
                </div>
              )}
              
              <div className="w-24 flex items-center justify-start flex-shrink-0">
                <p className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                  מציג {filteredAndSortedProducts.length} מתוך {products.length} תוצאות
                </p>
              </div>
            </div>

            {/* Product Rows */}
            {filteredAndSortedProducts.map((product, index) => (
              <div
                key={product.id}
                onClick={(e) => {
                  // Open product card if clicking on the row itself or non-interactive elements
                  const target = e.target;
                  const isInteractive = target.closest('button') || target.closest('input') || target.closest('select') || target.closest('textarea') || target.closest('[role="button"]');
                  
                  if (!isInteractive) {
                    setSelectedProductForView(product);
                    setShowProductSummary(true);
                    setProductViewTab("details");
                  }
                }}
                className={`px-4 py-3 flex items-center gap-6 transition-colors cursor-pointer min-w-max ${
                  index % 2 === 0 
                    ? "bg-white dark:bg-[#181818]" 
                    : "bg-gray-50/50 dark:bg-[#1a1a1a]"
                } hover:bg-gray-100 dark:hover:bg-[#222]`}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectProduct(product.id);
                  }}
                  className="flex-shrink-0"
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      selectedProducts.includes(product.id)
                        ? "border-[rgba(255,37,124,1)]"
                        : "border-gray-300 dark:border-gray-500"
                    }`}
                  >
                    {selectedProducts.includes(product.id) && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: BRAND_COLOR }}
                      />
                    )}
                  </span>
                </button>
                
                {/* שם מוצר עם אייקון */}
                {visibleFields.name && (
                  <div className="w-32 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `16px` }}>
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2b2b2b] flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 flex-shrink-0 overflow-hidden">
                      {product.name ? product.name.charAt(0).toUpperCase() : "מ"}
                    </div>
                    {editingFieldInList === `name-${product.id}` ? (
                      <input
                        type="text"
                        value={product.name || ""}
                        onChange={(e) => handleUpdateProductFieldInList(product.id, 'name', e.target.value)}
                        onBlur={() => setEditingFieldInList(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setEditingFieldInList(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 text-sm font-semibold rounded-full px-2 py-1 bg-white dark:bg-[#181818] border border-[#ff257c] text-gray-900 dark:text-gray-100 focus:outline-none text-right"
                        dir="rtl"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-[#ff257c]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFieldInList(`name-${product.id}`);
                        }}
                      >
                        {product.name || "ללא שם"}
                      </div>
                    )}
                  </div>
                )}

                {/* סטטוס */}
                {visibleFields.status && (
                  <div className="w-28 flex items-center justify-center flex-shrink-0 relative" style={{ marginRight: `16px` }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setStatusDropdownPositions(prev => ({
                        ...prev,
                        [product.id]: {
                          top: rect.bottom + window.scrollY + 8,
                          right: window.innerWidth - rect.right
                        }
                      }));
                      setOpenStatusDropdowns(prev => ({
                        ...prev,
                        [product.id]: !prev[product.id]
                      }));
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-90 transition text-white ${
                      (product.status || "פעיל") === "לא פעיל"
                        ? "bg-black"
                        : ""
                    }`}
                    style={
                      (product.status || "פעיל") === "פעיל"
                        ? { 
                            backgroundColor: BRAND_COLOR
                          }
                        : {}
                    }
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-white ${
                      (product.status || "פעיל") === "פעיל" ? "animate-pulse" : ""
                    }`}></span>
                    <span>{product.status || "פעיל"}</span>
                    <FiChevronDown className="text-[10px]" />
                  </button>
                  
                  {openStatusDropdowns[product.id] && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenStatusDropdowns(prev => ({
                            ...prev,
                            [product.id]: false
                          }));
                        }}
                      />
                      <div
                        dir="rtl"
                        className="fixed w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                        style={{
                          top: statusDropdownPositions[product.id]?.top ? `${statusDropdownPositions[product.id].top}px` : 'auto',
                          right: statusDropdownPositions[product.id]?.right ? `${statusDropdownPositions[product.id].right}px` : 'auto'
                        }}
                      >
                        <div className="py-2">
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateProductStatus(product.id, "פעיל");
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  (product.status || "פעיל") === "פעיל"
                                    ? "border-[rgba(255,37,124,1)]"
                                    : "border-gray-300 dark:border-gray-500"
                                }`}
                              >
                                {(product.status || "פעיל") === "פעיל" && (
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                  />
                                )}
                              </span>
                              <span>פעיל</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateProductStatus(product.id, "לא פעיל");
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  (product.status || "פעיל") === "לא פעיל"
                                    ? "border-gray-500"
                                    : "border-gray-300 dark:border-gray-500"
                                }`}
                              >
                                {(product.status || "פעיל") === "לא פעיל" && (
                                  <span className="w-2 h-2 rounded-full bg-gray-500" />
                                )}
                              </span>
                              <span>לא פעיל</span>
                            </span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                )}

                {/* קטגוריה */}
                {visibleFields.category && (
                  <div className="w-40 flex items-center gap-2 flex-shrink-0 relative" style={{ marginRight: `16px` }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setCategoryDropdownPositions(prev => ({
                          ...prev,
                          [product.id]: {
                            top: rect.bottom + window.scrollY + 8,
                            right: window.innerWidth - rect.right
                          }
                        }));
                        setOpenStatusDropdowns(prev => ({
                          ...prev,
                          [`category-${product.id}`]: !prev[`category-${product.id}`]
                        }));
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
                    >
                      <span className="whitespace-nowrap">
                        {product.category || "בחר קטגוריה"}
                      </span>
                      <FiChevronDown className="text-[14px] text-gray-400" />
                    </button>
                    {openStatusDropdowns[`category-${product.id}`] && (
                      <>
                        {/* Overlay layer to close dropdown when clicking outside */}
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => {
                            setOpenStatusDropdowns(prev => ({ ...prev, [`category-${product.id}`]: false }));
                          }}
                        />
                        <div
                          dir="rtl"
                          className="fixed w-56 max-h-80 overflow-y-scroll rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                          style={{
                            maxHeight: '320px',
                            overflowY: 'scroll',
                            WebkitOverflowScrolling: 'touch',
                            top: categoryDropdownPositions[product.id]?.top ? `${categoryDropdownPositions[product.id].top}px` : 'auto',
                            right: categoryDropdownPositions[product.id]?.right ? `${categoryDropdownPositions[product.id].right}px` : 'auto'
                          }}
                        >
                          <div className="py-2">
                            {/* כללי */}
                            <button
                              type="button"
                              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                              onClick={() => {
                                handleUpdateProductFieldInList(product.id, 'category', 'כללי');
                                setOpenStatusDropdowns(prev => ({ ...prev, [`category-${product.id}`]: false }));
                                setIsAddingCategory(prev => ({ ...prev, [`category-${product.id}`]: false }));
                              }}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    product.category === 'כללי'
                                      ? "border-[rgba(255,37,124,1)]"
                                      : "border-gray-300 dark:border-gray-500"
                                  }`}
                                >
                                  {product.category === 'כללי' && (
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: BRAND_COLOR }}
                                    />
                                  )}
                                </span>
                                <span>כללי</span>
                              </span>
                            </button>

                            {/* Custom categories */}
                            {customCategories.map((category) => {
                              const isSelected = product.category === category;
                              
                              return (
                                <button
                                  key={category}
                                  type="button"
                                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                  onClick={() => {
                                    handleUpdateProductFieldInList(product.id, 'category', category);
                                    setOpenStatusDropdowns(prev => ({ ...prev, [`category-${product.id}`]: false }));
                                    setIsAddingCategory(prev => ({ ...prev, [`category-${product.id}`]: false }));
                                  }}
                                >
                                  <span className="flex items-center gap-2">
                                    <span
                                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                        isSelected
                                          ? "border-[rgba(255,37,124,1)]"
                                          : "border-gray-300 dark:border-gray-500"
                                      }`}
                                    >
                                      {isSelected && (
                                        <span
                                          className="w-2 h-2 rounded-full"
                                          style={{ backgroundColor: BRAND_COLOR }}
                                        />
                                      )}
                                    </span>
                                    <span>{category}</span>
                                  </span>
                                </button>
                              );
                            })}

                            {/* הוסף קטגוריה */}
                            {isAddingCategory[`category-${product.id}`] ? (
                              <div className="px-3 py-2">
                                <input
                                  type="text"
                                  value={newCategoryName[`category-${product.id}`] || ""}
                                  onChange={(e) => {
                                    setNewCategoryName(prev => ({
                                      ...prev,
                                      [`category-${product.id}`]: e.target.value
                                    }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && newCategoryName[`category-${product.id}`]?.trim()) {
                                      const newCategory = newCategoryName[`category-${product.id}`].trim();
                                      if (!customCategories.includes(newCategory) && newCategory !== "כללי") {
                                        setCustomCategories(prev => [...prev, newCategory]);
                                        handleUpdateProductFieldInList(product.id, 'category', newCategory);
                                        setOpenStatusDropdowns(prev => ({ ...prev, [`category-${product.id}`]: false }));
                                        setIsAddingCategory(prev => ({ ...prev, [`category-${product.id}`]: false }));
                                        setNewCategoryName(prev => ({ ...prev, [`category-${product.id}`]: "" }));
                                      }
                                    } else if (e.key === "Escape") {
                                      setIsAddingCategory(prev => ({ ...prev, [`category-${product.id}`]: false }));
                                      setNewCategoryName(prev => ({ ...prev, [`category-${product.id}`]: "" }));
                                    }
                                  }}
                                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-commonBorder rounded-full bg-white dark:bg-[#181818] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c]"
                                  placeholder="הזן שם קטגוריה"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-[#ff257c]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsAddingCategory(prev => ({ ...prev, [`category-${product.id}`]: true }));
                                  setNewCategoryName(prev => ({ ...prev, [`category-${product.id}`]: "" }));
                                }}
                              >
                                <span>הוסף קטגוריה</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ספק */}
                {visibleFields.supplier && (
                  <div className="w-32 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                    {editingFieldInList === `supplier-${product.id}` ? (
                      <input
                        type="text"
                        value={product.supplier || ""}
                        onChange={(e) => handleUpdateProductFieldInList(product.id, 'supplier', e.target.value)}
                        onBlur={() => setEditingFieldInList(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setEditingFieldInList(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-sm rounded-full px-2 py-1 bg-white dark:bg-[#181818] border border-[#ff257c] text-gray-900 dark:text-gray-100 focus:outline-none text-right"
                        dir="rtl"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="text-sm text-gray-700 dark:text-gray-300 truncate cursor-pointer hover:text-[#ff257c]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFieldInList(`supplier-${product.id}`);
                        }}
                      >
                        {product.supplier || "-"}
                      </div>
                    )}
                  </div>
                )}

                {/* מחיר לקוח */}
                {visibleFields.customerPrice && (
                  <div className="w-40 flex items-center justify-start flex-shrink-0" style={{ marginRight: `8px` }}>
                    {editingFieldInList === `customerPrice-${product.id}` ? (
                      <input
                        type="number"
                        value={product.customerPrice || ""}
                        onChange={(e) => handleUpdateProductFieldInList(product.id, 'customerPrice', parseFloat(e.target.value) || 0)}
                        onBlur={() => setEditingFieldInList(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setEditingFieldInList(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-sm rounded-full px-2 py-1 bg-white dark:bg-[#181818] border border-[#ff257c] text-gray-900 dark:text-gray-100 focus:outline-none text-right"
                        dir="rtl"
                        autoFocus
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      <div 
                        className="text-sm text-gray-700 dark:text-gray-300 truncate cursor-pointer hover:text-[#ff257c]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFieldInList(`customerPrice-${product.id}`);
                        }}
                      >
                        ₪{product.customerPrice?.toFixed(2) || "0.00"}
                      </div>
                    )}
                  </div>
                )}

                {/* כמות במלאי */}
                {visibleFields.currentQuantity && (
                  <div className="w-32 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                    {editingFieldInList === `currentQuantity-${product.id}` ? (
                      <input
                        type="number"
                        value={product.currentQuantity || ""}
                        onChange={(e) => handleUpdateProductFieldInList(product.id, 'currentQuantity', parseInt(e.target.value) || 0)}
                        onBlur={() => setEditingFieldInList(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setEditingFieldInList(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-sm font-medium rounded-full px-2 py-1 bg-white dark:bg-[#181818] border border-[#ff257c] text-gray-900 dark:text-gray-100 focus:outline-none text-right"
                        dir="rtl"
                        autoFocus
                        min="0"
                      />
                    ) : (
                      <div 
                        className={`text-sm font-medium cursor-pointer hover:text-[#ff257c] ${
                          product.currentQuantity <= product.lowStockThreshold
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFieldInList(`currentQuantity-${product.id}`);
                        }}
                      >
                        {product.currentQuantity || 0}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>

      {/* Product Summary Popup */}
      {showProductSummary && selectedProductForView && (
        <div className="fixed inset-0 z-50 flex justify-end" dir="ltr">
          <style>{`
            .calendar-slide-in {
              animation: calendarSlideIn 260ms ease-out forwards;
            }
            @keyframes calendarSlideIn {
              0% {
                transform: translateX(100%);
                opacity: 0;
              }
              100% {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
          
          {/* קליק על הרקע – סוגר את הכרטיס */}
          <div className="flex-1 bg-black/0" onClick={() => {
            setShowProductSummary(false);
            setSelectedProductForView(null);
          }} />

          <div
            dir="rtl"
            className="relative h-screen w-[380px] sm:w-[480px] bg-white dark:bg-[#111]
                 border-l border-gray-200 dark:border-commonBorder shadow-2xl
                 flex flex-col calendar-slide-in text-right"
            onClick={(e) => {
              e.stopPropagation();
              // If clicking on the card itself (not on input, button, etc.) and there's an active edit, save it
              if (editingField && !e.target.closest('input') && !e.target.closest('button') && !e.target.closest('[role="button"]')) {
                handleSaveField(editingField);
              }
            }}
          >
            {/* X מחוץ לפופ בצד שמאל למעלה */}
            <button
              className="absolute -left-10 top-7 w-8 h-8 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-commonBorder shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
              onClick={() => {
                setShowProductSummary(false);
                setSelectedProductForView(null);
              }}
            >
              <FiX className="text-[16px]" />
            </button>

            {/* HEADER */}
            <div className="px-5 py-7 min-h-[125px] relative overflow-visible">
              {/* Background image */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  backgroundImage: `url(${gradientImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: '40% 16%',
                  backgroundRepeat: 'no-repeat',
                  transform: 'scaleX(-1)',
                }}
              />
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 text-sm text-gray-800 dark:text-gray-100">
              <div className="space-y-6">
                {/* Product Information */}
                <div className="space-y-4">
                  {/* Avatar and Name */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-black text-white overflow-hidden"
                      >
                        {selectedProductForView?.name?.charAt(0)?.toUpperCase() || "מ"}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col relative">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1.5">
                        {selectedProductForView?.name || "ללא שם"}
                      </div>
                      {selectedProductForView?.customerPrice && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ₪{selectedProductForView.customerPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {selectedProductForView?.grossProfitPercentage && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            רווח גולמי: {selectedProductForView.grossProfitPercentage}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* קטגוריות תצוגה */}
                  <div className="border-b border-gray-200 dark:border-[#262626] mb-4 mt-4">
                    <div className="flex items-center gap-6 text-xs sm:text-sm px-2">
                      {[
                        { key: "details", label: "פרטים" },
                        { key: "inventory", label: "ניהול מלאי" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductViewTab(key);
                          }}
                          className={`relative pb-3 pt-1 font-medium transition-colors ${
                            productViewTab === key
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {label}
                          {productViewTab === key && (
                            <span
                              className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
                              style={{ backgroundColor: BRAND_COLOR }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product Details */}
                  {productViewTab === "details" && (
                    <div className="space-y-4 mt-6">
                      {/* שם מוצר */}
                      <div 
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "name") {
                            e.stopPropagation();
                            setEditingField("name");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiPackage className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">שם מוצר</div>
                          {editingField === "name" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editedProductData.name}
                                onChange={(e) => setEditedProductData({ ...editedProductData, name: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleSaveField("name");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveField("name");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                style={{ backgroundColor: BRAND_COLOR }}
                              >
                                <FiSave className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("name");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedProductForView?.name || "-"}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("name");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* קטגוריה */}
                      <div 
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "category") {
                            e.stopPropagation();
                            setEditingField("category");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiTag className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 relative">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">קטגוריה</div>
                          <div className="relative">
                            <button
                              type="button"
                              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCategoryDropdownOpenInCard((prev) => !prev);
                              }}
                            >
                              <span className="whitespace-nowrap">
                                {selectedProductForView?.category || "בחר קטגוריה"}
                              </span>
                              <FiChevronDown className="text-[14px] text-gray-400" />
                            </button>

                            {isCategoryDropdownOpenInCard && (
                              <>
                                {/* Overlay layer to close dropdown when clicking outside */}
                                <div
                                  className="fixed inset-0 z-20"
                                  onClick={() => setIsCategoryDropdownOpenInCard(false)}
                                />
                                <div
                                  dir="rtl"
                                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                                >
                                  <div className="py-2">
                                    {/* כללי */}
                                    <button
                                      type="button"
                                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedData = { ...editedProductData, category: 'כללי' };
                                        setEditedProductData(updatedData);
                                        const updatedProducts = products.map(product => {
                                          if (product.id === selectedProductForView.id) {
                                            return { ...product, category: 'כללי' };
                                          }
                                          return product;
                                        });
                                        setProducts(updatedProducts);
                                        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
                                        const updatedProduct = updatedProducts.find(p => p.id === selectedProductForView.id);
                                        if (updatedProduct) {
                                          setSelectedProductForView(updatedProduct);
                                        }
                                        setIsCategoryDropdownOpenInCard(false);
                                        setIsAddingCategory(prev => ({ ...prev, "card": false }));
                                      }}
                                    >
                                      <span className="flex items-center gap-2">
                                        <span
                                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                            (selectedProductForView?.category || editedProductData.category) === 'כללי'
                                              ? "border-[rgba(255,37,124,1)]"
                                              : "border-gray-300 dark:border-gray-500"
                                          }`}
                                        >
                                          {(selectedProductForView?.category || editedProductData.category) === 'כללי' && (
                                            <span
                                              className="w-2 h-2 rounded-full"
                                              style={{ backgroundColor: BRAND_COLOR }}
                                            />
                                          )}
                                        </span>
                                        <span>כללי</span>
                                      </span>
                                    </button>

                                    {/* Custom categories */}
                                    {customCategories.map((category) => {
                                      const isSelected = (selectedProductForView?.category || editedProductData.category) === category;
                                      
                                      return (
                                        <button
                                          key={category}
                                          type="button"
                                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const updatedData = { ...editedProductData, category };
                                            setEditedProductData(updatedData);
                                            const updatedProducts = products.map(product => {
                                              if (product.id === selectedProductForView.id) {
                                                return { ...product, category };
                                              }
                                              return product;
                                            });
                                            setProducts(updatedProducts);
                                            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
                                            const updatedProduct = updatedProducts.find(p => p.id === selectedProductForView.id);
                                            if (updatedProduct) {
                                              setSelectedProductForView(updatedProduct);
                                            }
                                            setIsCategoryDropdownOpenInCard(false);
                                            setIsAddingCategory(prev => ({ ...prev, "card": false }));
                                          }}
                                        >
                                          <span className="flex items-center gap-2">
                                            <span
                                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                                isSelected
                                                  ? "border-[rgba(255,37,124,1)]"
                                                  : "border-gray-300 dark:border-gray-500"
                                              }`}
                                            >
                                              {isSelected && (
                                                <span
                                                  className="w-2 h-2 rounded-full"
                                                  style={{ backgroundColor: BRAND_COLOR }}
                                                />
                                              )}
                                            </span>
                                            <span>{category}</span>
                                          </span>
                                        </button>
                                      );
                                    })}

                                    {/* הוסף קטגוריה */}
                                    {isAddingCategory["card"] ? (
                                      <div className="px-3 py-2">
                                        <input
                                          type="text"
                                          value={newCategoryName["card"] || ""}
                                          onChange={(e) => {
                                            setNewCategoryName(prev => ({
                                              ...prev,
                                              "card": e.target.value
                                            }));
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter" && newCategoryName["card"]?.trim()) {
                                              const newCategory = newCategoryName["card"].trim();
                                              if (!customCategories.includes(newCategory) && newCategory !== "כללי") {
                                                setCustomCategories(prev => [...prev, newCategory]);
                                                const updatedData = { ...editedProductData, category: newCategory };
                                                setEditedProductData(updatedData);
                                                const updatedProducts = products.map(product => {
                                                  if (product.id === selectedProductForView.id) {
                                                    return { ...product, category: newCategory };
                                                  }
                                                  return product;
                                                });
                                                setProducts(updatedProducts);
                                                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
                                                const updatedProduct = updatedProducts.find(p => p.id === selectedProductForView.id);
                                                if (updatedProduct) {
                                                  setSelectedProductForView(updatedProduct);
                                                }
                                                setIsCategoryDropdownOpenInCard(false);
                                                setIsAddingCategory(prev => ({ ...prev, "card": false }));
                                                setNewCategoryName(prev => ({ ...prev, "card": "" }));
                                              }
                                            } else if (e.key === "Escape") {
                                              setIsAddingCategory(prev => ({ ...prev, "card": false }));
                                              setNewCategoryName(prev => ({ ...prev, "card": "" }));
                                            }
                                          }}
                                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-commonBorder rounded-full bg-white dark:bg-[#181818] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c]"
                                          placeholder="הזן שם קטגוריה"
                                          autoFocus
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-[#ff257c]"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsAddingCategory(prev => ({ ...prev, "card": true }));
                                          setNewCategoryName(prev => ({ ...prev, "card": "" }));
                                        }}
                                      >
                                        <span>הוסף קטגוריה</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ספק */}
                      <div 
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "supplier") {
                            e.stopPropagation();
                            setEditingField("supplier");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiPackage className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ספק</div>
                          {editingField === "supplier" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editedProductData.supplier}
                                onChange={(e) => setEditedProductData({ ...editedProductData, supplier: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleSaveField("supplier");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveField("supplier");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                style={{ backgroundColor: BRAND_COLOR }}
                              >
                                <FiSave className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("supplier");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedProductForView?.supplier || "-"}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("supplier");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* מחיר ספק */}
                      <div 
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "supplierPrice") {
                            e.stopPropagation();
                            setEditingField("supplierPrice");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiDollarSign className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">מחיר ספק</div>
                          {editingField === "supplierPrice" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editedProductData.supplierPrice}
                                onChange={(e) => setEditedProductData({ ...editedProductData, supplierPrice: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleSaveField("supplierPrice");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                dir="rtl"
                                autoFocus
                              />
                              <span className="text-gray-400 text-sm">₪</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveField("supplierPrice");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                style={{ backgroundColor: BRAND_COLOR }}
                              >
                                <FiSave className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("supplierPrice");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedProductForView?.supplierPrice ? `₪${selectedProductForView.supplierPrice.toFixed(2)}` : "-"}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("supplierPrice");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* מחיר ללקוח */}
                      <div 
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "customerPrice") {
                            e.stopPropagation();
                            setEditingField("customerPrice");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiDollarSign className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">מחיר ללקוח</div>
                          {editingField === "customerPrice" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editedProductData.customerPrice}
                                onChange={(e) => setEditedProductData({ ...editedProductData, customerPrice: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleSaveField("customerPrice");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                dir="rtl"
                                autoFocus
                              />
                              <span className="text-gray-400 text-sm">₪</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveField("customerPrice");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                style={{ backgroundColor: BRAND_COLOR }}
                              >
                                <FiSave className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("customerPrice");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedProductForView?.customerPrice ? `₪${selectedProductForView.customerPrice.toFixed(2)}` : "-"}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("customerPrice");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* אחוז רווח גולמי */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiTrendingUp className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">אחוז רווח גולמי</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {selectedProductForView?.grossProfitPercentage ? `${selectedProductForView.grossProfitPercentage}%` : "0%"}
                          </div>
                        </div>
                      </div>

                      {/* ברקוד */}
                      <div 
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "barcode") {
                            e.stopPropagation();
                            setEditingField("barcode");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiBarChart2 className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ברקוד</div>
                          {editingField === "barcode" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editedProductData.barcode}
                                onChange={(e) => setEditedProductData({ ...editedProductData, barcode: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleSaveField("barcode");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveField("barcode");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                style={{ backgroundColor: BRAND_COLOR }}
                              >
                                <FiSave className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("barcode");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedProductForView?.barcode || "-"}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("barcode");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* הפעלת עמלה לאיש צוות */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiCheckCircle className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">הפעלת עמלה לאיש צוות</div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                            המערכת תחושב אוטומטית עמלה לאיש הצוות כאשר המוצר נמכר
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!selectedProductForView) return;
                              const newValue = !selectedProductForView.enableCommission;
                              
                              const updatedProducts = products.map(p => {
                                if (p.id === selectedProductForView.id) {
                                  return { ...p, enableCommission: newValue };
                                }
                                return p;
                              });
                              
                              setProducts(updatedProducts);
                              const updatedProduct = updatedProducts.find(p => p.id === selectedProductForView.id);
                              setSelectedProductForView(updatedProduct);
                            }}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out flex items-center ${
                              selectedProductForView?.enableCommission
                                ? "bg-[#ff257c] justify-end"
                                : "bg-gray-300 dark:bg-gray-600 justify-start"
                            }`}
                          >
                            <span className="w-5 h-5 bg-white rounded-full shadow-sm mx-0.5" />
                          </button>
                        </div>
                      </div>

                      {/* סטטוס */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiCheckCircle className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 relative">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">סטטוס</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsProductCardStatusDropdownOpen((prev) => !prev);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-90 transition ${
                              (selectedProductForView?.status || "פעיל") === "לא פעיל"
                                ? "bg-black text-white dark:bg-white dark:text-black"
                                : ""
                            }`}
                            style={
                              (selectedProductForView?.status || "פעיל") === "פעיל"
                                ? { 
                                    backgroundColor: BRAND_COLOR,
                                    color: "white"
                                  }
                                : {}
                            }
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              (selectedProductForView?.status || "פעיל") === "פעיל" 
                                ? "bg-white animate-pulse" 
                                : "bg-white dark:bg-black"
                            }`}></span>
                            <span>{selectedProductForView?.status || "פעיל"}</span>
                            <FiChevronDown className="text-[10px]" />
                          </button>
                          
                          {isProductCardStatusDropdownOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setIsProductCardStatusDropdownOpen(false)}
                              />
                              <div
                                dir="rtl"
                                className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                              >
                                <div className="py-2">
                                  <button
                                    type="button"
                                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateProductStatus(selectedProductForView.id, "פעיל");
                                      setIsProductCardStatusDropdownOpen(false);
                                    }}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                          (selectedProductForView?.status || "פעיל") === "פעיל"
                                            ? "border-[rgba(255,37,124,1)]"
                                            : "border-gray-300 dark:border-gray-500"
                                        }`}
                                      >
                                        {(selectedProductForView?.status || "פעיל") === "פעיל" && (
                                          <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: BRAND_COLOR }}
                                          />
                                        )}
                                      </span>
                                      <span>פעיל</span>
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateProductStatus(selectedProductForView.id, "לא פעיל");
                                      setIsProductCardStatusDropdownOpen(false);
                                    }}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                          (selectedProductForView?.status || "פעיל") === "לא פעיל"
                                            ? "border-gray-500"
                                            : "border-gray-300 dark:border-gray-500"
                                        }`}
                                      >
                                        {(selectedProductForView?.status || "פעיל") === "לא פעיל" && (
                                          <span className="w-2 h-2 rounded-full bg-gray-500" />
                                        )}
                                      </span>
                                      <span>לא פעיל</span>
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inventory Management Tab */}
                  {productViewTab === "inventory" && (
                    <div className="space-y-4 mt-6">
                      {/* כמות נוכחית */}
                      <div 
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "currentQuantity") {
                            e.stopPropagation();
                            setEditingField("currentQuantity");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiBarChart2 className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">כמות נוכחית</div>
                          {editingField === "currentQuantity" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editedProductData.currentQuantity}
                                onChange={(e) => setEditedProductData({ ...editedProductData, currentQuantity: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleSaveField("currentQuantity");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                dir="rtl"
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveField("currentQuantity");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                style={{ backgroundColor: BRAND_COLOR }}
                              >
                                <FiSave className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("currentQuantity");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedProductForView?.currentQuantity || 0}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("currentQuantity");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* סף מלאי נמוך */}
                      <div 
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "lowStockThreshold") {
                            e.stopPropagation();
                            setEditingField("lowStockThreshold");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiBarChart2 className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">סף מלאי נמוך</div>
                          {editingField === "lowStockThreshold" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editedProductData.lowStockThreshold}
                                onChange={(e) => setEditedProductData({ ...editedProductData, lowStockThreshold: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleSaveField("lowStockThreshold");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                dir="rtl"
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveField("lowStockThreshold");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                style={{ backgroundColor: BRAND_COLOR }}
                              >
                                <FiSave className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("lowStockThreshold");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedProductForView?.lowStockThreshold || 0}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("lowStockThreshold");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* כמות להזמנה מחדש */}
                      <div 
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "reorderQuantity") {
                            e.stopPropagation();
                            setEditingField("reorderQuantity");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiBarChart2 className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">כמות להזמנה מחדש</div>
                          {editingField === "reorderQuantity" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editedProductData.reorderQuantity}
                                onChange={(e) => setEditedProductData({ ...editedProductData, reorderQuantity: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleSaveField("reorderQuantity");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                dir="rtl"
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveField("reorderQuantity");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                style={{ backgroundColor: BRAND_COLOR }}
                              >
                                <FiSave className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("reorderQuantity");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedProductForView?.reorderQuantity || 0}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("reorderQuantity");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* קבלת התראות על מלאי נמוך */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiCheckCircle className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">קבלת התראות על מלאי נמוך</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!selectedProductForView) return;
                              const newValue = !selectedProductForView.lowStockAlerts;
                              
                              const updatedProducts = products.map(p => {
                                if (p.id === selectedProductForView.id) {
                                  return { ...p, lowStockAlerts: newValue };
                                }
                                return p;
                              });
                              
                              setProducts(updatedProducts);
                              const updatedProduct = updatedProducts.find(p => p.id === selectedProductForView.id);
                              setSelectedProductForView(updatedProduct);
                            }}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out flex items-center ${
                              selectedProductForView?.lowStockAlerts
                                ? "bg-[#ff257c] justify-end"
                                : "bg-gray-300 dark:bg-gray-600 justify-start"
                            }`}
                          >
                            <span className="w-5 h-5 bg-white rounded-full shadow-sm mx-0.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        newProductName={newProductName}
        newProductCategory={newProductCategory}
        newProductSupplier={newProductSupplier}
        newProductSupplierPrice={newProductSupplierPrice}
        newProductCustomerPrice={newProductCustomerPrice}
        newProductBarcode={newProductBarcode}
        newProductEnableCommission={newProductEnableCommission}
        newProductCurrentQuantity={newProductCurrentQuantity}
        newProductLowStockThreshold={newProductLowStockThreshold}
        newProductReorderQuantity={newProductReorderQuantity}
        newProductLowStockAlerts={newProductLowStockAlerts}
        newProductErrors={newProductErrors}
        onNameChange={setNewProductName}
        onCategoryChange={setNewProductCategory}
        onSupplierChange={setNewProductSupplier}
        onSupplierPriceChange={setNewProductSupplierPrice}
        onCustomerPriceChange={setNewProductCustomerPrice}
        onBarcodeChange={setNewProductBarcode}
        onEnableCommissionChange={setNewProductEnableCommission}
        onCurrentQuantityChange={setNewProductCurrentQuantity}
        onLowStockThresholdChange={setNewProductLowStockThreshold}
        onReorderQuantityChange={setNewProductReorderQuantity}
        onLowStockAlertsChange={setNewProductLowStockAlerts}
        onSubmit={handleCreateNewProduct}
      />
    </div>
  );
}
