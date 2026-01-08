/**
 * Suppliers Page
 * Displays and manages the suppliers catalog
 */

import React, { useState, useEffect, useRef } from "react";
import { FiPackage, FiPlus, FiSearch, FiChevronDown, FiEdit, FiTrash2, FiEye, FiDownload, FiX, FiSave, FiDollarSign, FiTag, FiCheckCircle, FiTrendingUp, FiBarChart2, FiFilter, FiPhone, FiMail } from "react-icons/fi";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { BRAND_COLOR } from "../../utils/calendar/constants";
import { NewSupplierModal } from "../../components/calendar/Modals/NewSupplierModal";
import gradientImage from "../../assets/gradientteam.jpg";

const SUPPLIERS_STORAGE_KEY = "suppliers";

export default function SuppliersPage() {
  const { language } = useLanguage();
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null); // null = כל הסטטוסים
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [suppliers, setSuppliers] = useState(() => {
    // Load suppliers from localStorage
    try {
      const stored = localStorage.getItem(SUPPLIERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading suppliers:", error);
      return [];
    }
  });
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [openStatusDropdowns, setOpenStatusDropdowns] = useState({});
  const [statusDropdownPositions, setStatusDropdownPositions] = useState({});
  const [categoryDropdownPositions, setCategoryDropdownPositions] = useState({});
  const [isColumnFilterDropdownOpen, setIsColumnFilterDropdownOpen] = useState(false);
  const [editingFieldInList, setEditingFieldInList] = useState(null); // Track which field is being edited in the list
  const [sortBy, setSortBy] = useState("newest");
  const [visibleFields, setVisibleFields] = useState(() => {
    const defaultFields = {
      name: true,
      phone: true,
      email: true,
      status: true,
    };
    try {
      const stored = sessionStorage.getItem("suppliers_visible_fields");
      if (stored) {
        return { ...defaultFields, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Error loading visible fields:", error);
    }
    return defaultFields;
  });
  
  // Supplier Card State
  const [selectedSupplierForView, setSelectedSupplierForView] = useState(null);
  const [showSupplierSummary, setShowSupplierSummary] = useState(false);
  const [supplierViewTab, setSupplierViewTab] = useState("details");
  const [editingField, setEditingField] = useState(null);
  const [isCategoryDropdownOpenInCard, setIsCategoryDropdownOpenInCard] = useState(false);
  const [editedSupplierData, setEditedSupplierData] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [isSupplierCardStatusDropdownOpen, setIsSupplierCardStatusDropdownOpen] = useState(false);
  const prevSelectedSupplierIdRef = useRef(null);
  
  // New Supplier Modal State
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");
  const [newSupplierEmail, setNewSupplierEmail] = useState("");
  const [newSupplierErrors, setNewSupplierErrors] = useState({});

  // Save suppliers to localStorage whenever suppliers change
  useEffect(() => {
    try {
      localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(suppliers));
    } catch (error) {
      console.error("Error saving suppliers:", error);
    }
  }, [suppliers]);

  // Save visible fields to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("suppliers_visible_fields", JSON.stringify(visibleFields));
    } catch (error) {
      console.error("Error saving visible fields:", error);
    }
  }, [visibleFields]);

  // Filter suppliers based on search and status
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = !searchQuery || 
      supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === null || supplier.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Sort suppliers
  const filteredAndSortedSuppliers = [...filteredSuppliers].sort((a, b) => {
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

  // Handle selecting/deselecting suppliers
  const handleSelectSupplier = (supplierId) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  // Handle selecting all suppliers
  const handleSelectAllSuppliers = () => {
    if (selectedSuppliers.length === filteredSuppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(filteredSuppliers.map(p => p.id));
    }
  };

  // Handle downloading selected suppliers
  const handleDownloadSelectedSuppliers = () => {
    if (selectedSuppliers.length === 0) {
      alert("אנא בחר לפחות ספק אחד להורדה");
      return;
    }

    const selectedSuppliersData = suppliers.filter((p) => selectedSuppliers.includes(p.id));
    
    // Convert to CSV
    const headers = ["שם ספק", "מס נייד", "מייל", "סטטוס"];
    const rows = selectedSuppliersData.map(supplier => [
      supplier.name || "",
      supplier.phone || "",
      supplier.email || "",
      supplier.status || "פעיל"
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
    link.setAttribute("download", `ספקים_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle deleting selected suppliers
  const handleDeleteSelectedSuppliers = () => {
    if (selectedSuppliers.length === 0) {
      alert("אנא בחר לפחות ספק אחד למחיקה");
      return;
    }

    if (window.confirm(`האם אתה בטוח שאתה רוצה למחוק ${selectedSuppliers.length} ספקים?`)) {
      setSuppliers(prev => prev.filter(p => !selectedSuppliers.includes(p.id)));
      setSelectedSuppliers([]);
    }
  };

  // Handle updating supplier field in list
  const handleUpdateSupplierFieldInList = (supplierId, field, value) => {
    const updatedSuppliers = suppliers.map(supplier => {
      if (supplier.id === supplierId) {
        return {
          ...supplier,
          [field]: value
        };
      }
      return supplier;
    });

    setSuppliers(updatedSuppliers);
    
    // Update selectedSupplierForView if it's the same supplier
    if (selectedSupplierForView && selectedSupplierForView.id === supplierId) {
      const updatedSupplier = updatedSuppliers.find(p => p.id === supplierId);
      setSelectedSupplierForView(updatedSupplier);
    }
  };

  // Handle updating supplier status
  const handleUpdateSupplierStatus = (supplierId, newStatus) => {
    setSuppliers(prev => prev.map(p => 
      p.id === supplierId ? { ...p, status: newStatus } : p
    ));
    setOpenStatusDropdowns(prev => ({
      ...prev,
      [supplierId]: false
    }));
    
    // Update selectedSupplierForView if it's the same supplier
    if (selectedSupplierForView && selectedSupplierForView.id === supplierId) {
      setSelectedSupplierForView(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Update edited data when supplier changes
  useEffect(() => {
    if (selectedSupplierForView) {
      setEditedSupplierData({
        name: selectedSupplierForView.name || "",
        phone: selectedSupplierForView.phone || "",
        email: selectedSupplierForView.email || ""
      });
      setEditingField(null);
      if (!prevSelectedSupplierIdRef.current || selectedSupplierForView.id !== prevSelectedSupplierIdRef.current) {
        setSupplierViewTab("details");
        prevSelectedSupplierIdRef.current = selectedSupplierForView.id;
      }
    }
  }, [selectedSupplierForView]);

  // Handle saving edited field
  const handleSaveField = (fieldName) => {
    if (!selectedSupplierForView) return;
    
    const updatedSuppliers = suppliers.map(supplier => {
      if (supplier.id === selectedSupplierForView.id) {
        return {
          ...supplier,
          [fieldName]: editedSupplierData[fieldName]
        };
      }
      return supplier;
    });
    
    setSuppliers(updatedSuppliers);
    localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(updatedSuppliers));
    const updatedSupplier = updatedSuppliers.find(p => p.id === selectedSupplierForView.id);
    if (updatedSupplier) {
      setSelectedSupplierForView(updatedSupplier);
    }
    setEditingField(null);
  };

  // Handle canceling edit
  const handleCancelEditField = (fieldName) => {
    setEditingField(null);
    if (selectedSupplierForView) {
      setEditedSupplierData({
        name: selectedSupplierForView.name || "",
        phone: selectedSupplierForView.phone || "",
        email: selectedSupplierForView.email || ""
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

  // Handle creating new supplier
  const handleCreateNewSupplier = () => {
    const errors = {};
    
    if (!newSupplierName.trim()) {
      errors.name = "שם הספק הוא שדה חובה";
    }
    
    if (Object.keys(errors).length > 0) {
      setNewSupplierErrors(errors);
      return;
    }
    
    // Create supplier object
    const newSupplier = {
      id: Date.now().toString(),
      name: newSupplierName,
      phone: newSupplierPhone || "",
      email: newSupplierEmail || "",
      status: "פעיל", // Default status
      createdAt: new Date().toISOString(),
    };
    
    // Add supplier to list
    setSuppliers(prev => [...prev, newSupplier]);
    
    // Open supplier card
    setSelectedSupplierForView(newSupplier);
    setShowSupplierSummary(true);
    setSupplierViewTab("details");
    
    // Reset form
    setNewSupplierName("");
    setNewSupplierPhone("");
    setNewSupplierEmail("");
    setNewSupplierErrors({});
    setIsNewSupplierModalOpen(false);
  };

  return (
    <div className="w-full bg-[#ffffff]" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                ספקים
              </h1>
              {suppliers.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#181818] px-2 py-0.5 rounded">
                  {suppliers.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              צפה, הוסף, ערוך ומחק את הספקים שלך.{" "}
              <a href="#" className="text-[#ff257c] hover:underline">למד עוד</a>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNewSupplierName("");
                setNewSupplierPhone("");
                setNewSupplierEmail("");
                setNewSupplierErrors({});
                setIsNewSupplierModalOpen(true);
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
              placeholder="חפש ספק..."
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
                          selectAllFieldsInCategory(["name", "phone", "email", "status"]);
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-[#ff257c] transition-colors"
                      >
                        סמן הכל
                      </button>
                    </div>
                    {[
                      { key: "name", label: "שם ספק" },
                      { key: "phone", label: "מס נייד" },
                      { key: "email", label: "מייל" },
                      { key: "status", label: "סטטוס" },
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
          {filteredAndSortedSuppliers.length > 0 && (
            <div className="relative flex items-center gap-3">
              {/* Select All Button */}
              <button
                onClick={handleSelectAllSuppliers}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity px-3 py-2 rounded-full border border-gray-200 dark:border-commonBorder text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:border-[#ff257c] transition-colors"
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedSuppliers.length === filteredAndSortedSuppliers.length && filteredAndSortedSuppliers.length > 0
                      ? "border-[rgba(255,37,124,1)]"
                      : "border-gray-300 dark:border-gray-500"
                  }`}
                >
                  {selectedSuppliers.length === filteredAndSortedSuppliers.length && filteredAndSortedSuppliers.length > 0 && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: BRAND_COLOR }}
                    />
                  )}
                </span>
                <span className="whitespace-nowrap text-xs sm:text-sm">
                  בחר הכל ({selectedSuppliers.length}/{filteredAndSortedSuppliers.length})
                </span>
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownloadSelectedSuppliers}
                disabled={selectedSuppliers.length === 0}
                className={`p-2 rounded-full border border-gray-200 dark:border-commonBorder transition-colors ${
                  selectedSuppliers.length === 0
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#1a1a1a]"
                    : "text-gray-600 dark:text-gray-400 hover:text-[#ff257c] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] bg-white dark:bg-[#181818]"
                }`}
                title="הורדת ספקים נבחרים"
              >
                <FiDownload className="text-sm" />
              </button>

              {/* Delete Button */}
              <button
                onClick={handleDeleteSelectedSuppliers}
                disabled={selectedSuppliers.length === 0}
                className={`p-2 rounded-full border border-gray-200 dark:border-commonBorder transition-colors ${
                  selectedSuppliers.length === 0
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-[#1a1a1a]"
                    : "text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] bg-white dark:bg-[#181818]"
                }`}
                title="מחיקת ספקים נבחרים"
              >
                <FiTrash2 className="text-sm" />
              </button>
            </div>
          )}
          </div>

        {/* Suppliers List */}
        {filteredAndSortedSuppliers.length === 0 ? (
          <div className="p-12 text-center">
              <FiPackage className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {searchQuery ? "לא נמצאו ספקים התואמים לחיפוש" : "אין ספקים עדיין"}
              </p>
              {!searchQuery && (
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  ספקים חדשים שנוצרים יופיעו כאן
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
                    שם ספק
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
              
              {visibleFields.phone && (
                <div className="w-40 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    מס נייד
                  </span>
                </div>
              )}
              
              {visibleFields.email && (
                <div className="w-48 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                  <span className="text-[14.5px] font-semibold text-gray-700 dark:text-gray-300">
                    מייל
                  </span>
                </div>
              )}
              
              <div className="w-24 flex items-center justify-start flex-shrink-0">
                <p className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                  מציג {filteredAndSortedSuppliers.length} מתוך {suppliers.length} תוצאות
                </p>
              </div>
            </div>

            {/* Supplier Rows */}
            {filteredAndSortedSuppliers.map((supplier, index) => (
              <div
                key={supplier.id}
                onClick={(e) => {
                  // Open supplier card if clicking on the row itself or non-interactive elements
                  const target = e.target;
                  const isInteractive = target.closest('button') || target.closest('input') || target.closest('select') || target.closest('textarea') || target.closest('[role="button"]');
                  
                  if (!isInteractive) {
                    setSelectedSupplierForView(supplier);
                    setShowSupplierSummary(true);
                    setSupplierViewTab("details");
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
                    handleSelectSupplier(supplier.id);
                  }}
                  className="flex-shrink-0"
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      selectedSuppliers.includes(supplier.id)
                        ? "border-[rgba(255,37,124,1)]"
                        : "border-gray-300 dark:border-gray-500"
                    }`}
                  >
                    {selectedSuppliers.includes(supplier.id) && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: BRAND_COLOR }}
                      />
                    )}
                  </span>
                </button>
                
                {/* שם ספק עם אייקון */}
                {visibleFields.name && (
                  <div className="w-32 flex items-center gap-2 flex-shrink-0" style={{ marginRight: `16px` }}>
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2b2b2b] flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 flex-shrink-0 overflow-hidden">
                      {supplier.name ? supplier.name.charAt(0).toUpperCase() : "מ"}
                    </div>
                    {editingFieldInList === `name-${supplier.id}` ? (
                      <input
                        type="text"
                        value={supplier.name || ""}
                        onChange={(e) => handleUpdateSupplierFieldInList(supplier.id, 'name', e.target.value)}
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
                          setEditingFieldInList(`name-${supplier.id}`);
                        }}
                      >
                        {supplier.name || "ללא שם"}
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
                        [supplier.id]: {
                          top: rect.bottom + window.scrollY + 8,
                          right: window.innerWidth - rect.right
                        }
                      }));
                      setOpenStatusDropdowns(prev => ({
                        ...prev,
                        [supplier.id]: !prev[supplier.id]
                      }));
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-90 transition text-white ${
                      (supplier.status || "פעיל") === "לא פעיל"
                        ? "bg-black"
                        : ""
                    }`}
                    style={
                      (supplier.status || "פעיל") === "פעיל"
                        ? { 
                            backgroundColor: BRAND_COLOR
                          }
                        : {}
                    }
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-white ${
                      (supplier.status || "פעיל") === "פעיל" ? "animate-pulse" : ""
                    }`}></span>
                    <span>{supplier.status || "פעיל"}</span>
                    <FiChevronDown className="text-[10px]" />
                  </button>
                  
                  {openStatusDropdowns[supplier.id] && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenStatusDropdowns(prev => ({
                            ...prev,
                            [supplier.id]: false
                          }));
                        }}
                      />
                      <div
                        dir="rtl"
                        className="fixed w-56 rounded-2xl border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#181818] shadow-lg z-30 text-xs sm:text-sm text-gray-800 dark:text-gray-100 text-right"
                        style={{
                          top: statusDropdownPositions[supplier.id]?.top ? `${statusDropdownPositions[supplier.id].top}px` : 'auto',
                          right: statusDropdownPositions[supplier.id]?.right ? `${statusDropdownPositions[supplier.id].right}px` : 'auto'
                        }}
                      >
                        <div className="py-2">
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateSupplierStatus(supplier.id, "פעיל");
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  (supplier.status || "פעיל") === "פעיל"
                                    ? "border-[rgba(255,37,124,1)]"
                                    : "border-gray-300 dark:border-gray-500"
                                }`}
                              >
                                {(supplier.status || "פעיל") === "פעיל" && (
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
                              handleUpdateSupplierStatus(supplier.id, "לא פעיל");
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  (supplier.status || "פעיל") === "לא פעיל"
                                    ? "border-gray-500"
                                    : "border-gray-300 dark:border-gray-500"
                                }`}
                              >
                                {(supplier.status || "פעיל") === "לא פעיל" && (
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

                {/* מס נייד */}
                {visibleFields.phone && (
                  <div className="w-40 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                    {editingFieldInList === `phone-${supplier.id}` ? (
                      <input
                        type="tel"
                        value={supplier.phone || ""}
                        onChange={(e) => handleUpdateSupplierFieldInList(supplier.id, 'phone', e.target.value)}
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
                          setEditingFieldInList(`phone-${supplier.id}`);
                        }}
                      >
                        {supplier.phone || "-"}
                      </div>
                    )}
                  </div>
                )}

                {/* מייל */}
                {visibleFields.email && (
                  <div className="w-48 flex items-center justify-start flex-shrink-0" style={{ marginRight: `16px` }}>
                    {editingFieldInList === `email-${supplier.id}` ? (
                      <input
                        type="email"
                        value={supplier.email || ""}
                        onChange={(e) => handleUpdateSupplierFieldInList(supplier.id, 'email', e.target.value)}
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
                          setEditingFieldInList(`email-${supplier.id}`);
                        }}
                      >
                        {supplier.email || "-"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>

      {/* Supplier Summary Popup */}
      {showSupplierSummary && selectedSupplierForView && (
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
            setShowSupplierSummary(false);
            setSelectedSupplierForView(null);
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
                setShowSupplierSummary(false);
                setSelectedSupplierForView(null);
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
                {/* Supplier Information */}
                <div className="space-y-4">
                  {/* Avatar and Name */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-black text-white overflow-hidden"
                      >
                        {selectedSupplierForView?.name?.charAt(0)?.toUpperCase() || "מ"}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col relative">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1.5">
                        {selectedSupplierForView?.name || "ללא שם"}
                      </div>
                    </div>
                  </div>

                  {/* קטגוריות תצוגה */}
                  <div className="border-b border-gray-200 dark:border-[#262626] mb-4 mt-4">
                    <div className="flex items-center gap-6 text-xs sm:text-sm px-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          setSupplierViewTab("details");
                          }}
                          className={`relative pb-3 pt-1 font-medium transition-colors ${
                          supplierViewTab === "details"
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                        פרטים
                        {supplierViewTab === "details" && (
                            <span
                              className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
                              style={{ backgroundColor: BRAND_COLOR }}
                            />
                          )}
                        </button>
                    </div>
                  </div>

                  {/* Supplier Details */}
                  {supplierViewTab === "details" && (
                    <div className="space-y-4 mt-6">
                      {/* שם ספק */}
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
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">שם ספק</div>
                          {editingField === "name" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editedSupplierData.name}
                                onChange={(e) => setEditedSupplierData({ ...editedSupplierData, name: e.target.value })}
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
                                {selectedSupplierForView?.name || "-"}
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

                      {/* מס נייד */}
                      <div 
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "phone") {
                            e.stopPropagation();
                            setEditingField("phone");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiPhone className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">מס נייד</div>
                          {editingField === "phone" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="tel"
                                value={editedSupplierData.phone}
                                onChange={(e) => setEditedSupplierData({ ...editedSupplierData, phone: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleSaveField("phone");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveField("phone");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                style={{ backgroundColor: BRAND_COLOR }}
                              >
                                <FiSave className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("phone");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedSupplierForView?.phone || "-"}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("phone");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* מייל */}
                      <div 
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={(e) => {
                          if (editingField !== "email") {
                            e.stopPropagation();
                            setEditingField("email");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                          <FiMail className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">מייל</div>
                          {editingField === "email" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="email"
                                value={editedSupplierData.email}
                                onChange={(e) => setEditedSupplierData({ ...editedSupplierData, email: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    handleSaveField("email");
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff257c] focus:border-[#ff257c] hover:border-[#ff257c] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveField("email");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                                style={{ backgroundColor: BRAND_COLOR }}
                              >
                                <FiSave className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditField("email");
                                }}
                                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center p-0"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedSupplierForView?.email || "-"}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField("email");
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333] transition-all"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            </div>
                          )}
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
                              setIsSupplierCardStatusDropdownOpen((prev) => !prev);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-90 transition ${
                              (selectedSupplierForView?.status || "פעיל") === "לא פעיל"
                                ? "bg-black text-white dark:bg-white dark:text-black"
                                : ""
                            }`}
                            style={
                              (selectedSupplierForView?.status || "פעיל") === "פעיל"
                                ? { 
                                    backgroundColor: BRAND_COLOR,
                                    color: "white"
                                  }
                                : {}
                            }
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              (selectedSupplierForView?.status || "פעיל") === "פעיל" 
                                ? "bg-white animate-pulse" 
                                : "bg-white dark:bg-black"
                            }`}></span>
                            <span>{selectedSupplierForView?.status || "פעיל"}</span>
                            <FiChevronDown className="text-[10px]" />
                          </button>
                          
                          {isSupplierCardStatusDropdownOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setIsSupplierCardStatusDropdownOpen(false)}
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
                                      handleUpdateSupplierStatus(selectedSupplierForView.id, "פעיל");
                                      setIsSupplierCardStatusDropdownOpen(false);
                                    }}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                          (selectedSupplierForView?.status || "פעיל") === "פעיל"
                                            ? "border-[rgba(255,37,124,1)]"
                                            : "border-gray-300 dark:border-gray-500"
                                        }`}
                                      >
                                        {(selectedSupplierForView?.status || "פעיל") === "פעיל" && (
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
                                      handleUpdateSupplierStatus(selectedSupplierForView.id, "לא פעיל");
                                      setIsSupplierCardStatusDropdownOpen(false);
                                    }}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                          (selectedSupplierForView?.status || "פעיל") === "לא פעיל"
                                            ? "border-gray-500"
                                            : "border-gray-300 dark:border-gray-500"
                                        }`}
                                      >
                                        {(selectedSupplierForView?.status || "פעיל") === "לא פעיל" && (
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

                        </div>
                            </div>
                              </div>
                            </div>
                            </div>
                          )}

      {/* New Supplier Modal */}
      <NewSupplierModal
        isOpen={isNewSupplierModalOpen}
        onClose={() => setIsNewSupplierModalOpen(false)}
        newSupplierName={newSupplierName}
        newSupplierPhone={newSupplierPhone}
        newSupplierEmail={newSupplierEmail}
        newSupplierErrors={newSupplierErrors}
        onNameChange={setNewSupplierName}
        onPhoneChange={setNewSupplierPhone}
        onEmailChange={setNewSupplierEmail}
        onSubmit={handleCreateNewSupplier}
      />
    </div>
  );
}
