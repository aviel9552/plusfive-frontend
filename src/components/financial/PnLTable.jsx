import React, { useState, useMemo } from 'react';
import { BRAND_COLOR } from '../../utils/calendar/constants';

// Helper function to create cell data structure
const createCellData = (value = 0, vatIncluded = true) => ({
  value,
  vatIncluded
});

// Helper function to seed default P&L data
const seedPnLState = () => ({
  sections: [
    {
      id: 'revenue',
      name: 'הכנסות',
      rows: [
        { id: 'rev-1', name: 'שירותים', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
        { id: 'rev-2', name: 'מוצרים', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
        { id: 'rev-3', name: 'אחר', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
      ],
    },
    {
      id: 'vat',
      name: 'מע״מ',
      rows: [
        { id: 'vat-1', name: 'סך המע״מ ברוטו', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
        { id: 'vat-2', name: 'החזרי מע״מ', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
      ],
    },
    {
      id: 'cogs',
      name: 'עלות מכר',
      rows: [
        { id: 'cogs-1', name: 'עלויות מוצרים', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
        { id: 'cogs-2', name: 'עלויות עבודה', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
        { id: 'cogs-3', name: 'עמלות תשלום', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
      ],
    },
    {
      id: 'opex',
      name: 'הוצאות תפעול',
      rows: [
        { id: 'opex-1', name: 'שכירות', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
        { id: 'opex-2', name: 'משכורות', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
        { id: 'opex-3', name: 'שיווק', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
        { id: 'opex-4', name: 'תוכנה', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
        { id: 'opex-5', name: 'שירותים', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
        { id: 'opex-6', name: 'ביטוח', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
        { id: 'opex-7', name: 'אחר', values: { jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) } },
      ],
    },
  ],
});

const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const monthLabels = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];

// Format number for display
const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};

// Format percentage
const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0.0%';
  const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
  return `${num.toFixed(1)}%`;
};

// Parse input value
const parseValue = (value) => {
  if (!value || value === '') return 0;
  const cleaned = value.toString().replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const PnLTable = () => {
  const [data, setData] = useState(() => {
    // Initialize with correct names
    const initialState = seedPnLState();
    return {
      ...initialState,
      sections: initialState.sections
        .filter(section => section.id !== 'other') // Remove other section
        .map(section => {
          if (section.id === 'cogs') {
            return { ...section, name: 'עלות מכר' };
          }
          if (section.id === 'vat') {
            // Remove vat-3 from initial state
            return {
              ...section,
              rows: section.rows.filter(row => row.id !== 'vat-3')
            };
          }
          return section;
        })
    };
  });
  const [draggedRow, setDraggedRow] = useState(null);
  const [draggedSection, setDraggedSection] = useState(null);
  const [dragOverRow, setDragOverRow] = useState(null);

  // Helper to get cell value (handles both old number format and new object format)
  const getCellValue = (cell) => {
    if (typeof cell === 'object' && cell !== null && 'value' in cell) {
      return cell.value || 0;
    }
    return cell || 0;
  };

  // Helper to get cell VAT status (handles both old number format and new object format)
  const getCellVatStatus = (cell) => {
    if (typeof cell === 'object' && cell !== null && 'vatIncluded' in cell) {
      return cell.vatIncluded;
    }
    return true; // Default to included for backward compatibility
  };

  // Calculate row total
  const calculateRowTotal = (row) => {
    return months.reduce((sum, month) => sum + getCellValue(row.values[month] || 0), 0);
  };

  // Calculate section totals per month and yearly
  const calculateSectionTotals = (section) => {
    if (!section || !section.rows || !Array.isArray(section.rows)) {
      return { monthlyTotals: {}, yearlyTotal: 0 };
    }
    const monthlyTotals = {};
    months.forEach(month => {
      monthlyTotals[month] = section.rows.reduce((sum, row) => sum + getCellValue(row.values[month] || 0), 0);
    });
    const yearlyTotal = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0);
    return { monthlyTotals, yearlyTotal };
  };

  // Get revenue totals
  const revenueTotals = useMemo(() => {
    const revenueSection = data.sections.find(s => s.id === 'revenue');
    return revenueSection ? calculateSectionTotals(revenueSection) : { monthlyTotals: {}, yearlyTotal: 0 };
  }, [data]);

  // Get VAT totals
  const vatTotals = useMemo(() => {
    const vatSection = data.sections.find(s => s.id === 'vat');
    return vatSection ? calculateSectionTotals(vatSection) : { monthlyTotals: {}, yearlyTotal: 0 };
  }, [data]);

  // Get COGS totals
  const cogsTotals = useMemo(() => {
    const cogsSection = data.sections.find(s => s.id === 'cogs');
    return cogsSection ? calculateSectionTotals(cogsSection) : { monthlyTotals: {}, yearlyTotal: 0 };
  }, [data]);

  // Get OPEX totals
  const opexTotals = useMemo(() => {
    const opexSection = data.sections.find(s => s.id === 'opex');
    return opexSection ? calculateSectionTotals(opexSection) : { monthlyTotals: {}, yearlyTotal: 0 };
  }, [data]);


  // Calculate Gross Profit: Revenue after VAT deduction - COGS excluding VAT
  const grossProfit = useMemo(() => {
    // Helper function to calculate COGS excluding VAT for a specific month
    const calculateCogsExcludingVAT = (month) => {
      const cogsSection = data.sections.find(s => s.id === 'cogs');
      if (!cogsSection) return 0;
      
      return cogsSection.rows.reduce((sum, row) => {
        const cellValue = getCellValue(row.values[month] || 0);
        const vatIncluded = getCellVatStatus(row.values[month] || 0);
        
        // If VAT is excluded (red button), subtract VAT: value * (100/118)
        // If VAT is included, use value as is
        if (!vatIncluded) {
          return sum + (cellValue * (100 / 118));
        }
        return sum + cellValue;
      }, 0);
    };

    const monthly = {};
    months.forEach(month => {
      // Revenue after VAT deduction: Revenue / 1.18
      const revenue = revenueTotals.monthlyTotals[month] || 0;
      const revenueAfterVAT = revenue / 1.18;
      
      // COGS excluding VAT (considering VAT excluded buttons)
      const cogsExcludingVAT = calculateCogsExcludingVAT(month);
      monthly[month] = revenueAfterVAT - cogsExcludingVAT;
    });
    
    // Yearly total
    const revenueYearlyAfterVAT = revenueTotals.yearlyTotal / 1.18;
    
    const cogsYearlyExcludingVAT = months.reduce((sum, month) => {
      const cogsSection = data.sections.find(s => s.id === 'cogs');
      if (!cogsSection) return sum;
      
      return sum + cogsSection.rows.reduce((rowSum, row) => {
        const cellValue = getCellValue(row.values[month] || 0);
        const vatIncluded = getCellVatStatus(row.values[month] || 0);
        if (!vatIncluded) {
          return rowSum + (cellValue * (100 / 118));
        }
        return rowSum + cellValue;
      }, 0);
    }, 0);
    const yearly = revenueYearlyAfterVAT - cogsYearlyExcludingVAT;
    
    return { monthly, yearly };
  }, [revenueTotals, data]);

  // Calculate Gross Margin %: 100% - COGS %
  const grossMarginPercent = useMemo(() => {
    // Calculate yearly revenue after VAT deduction: Revenue / 1.18
    const revenueAfterVAT = revenueTotals.yearlyTotal / 1.18;
    
    if (revenueAfterVAT === 0) return 0;
    
    // Calculate yearly COGS excluding VAT
    const cogsYearlyExcludingVAT = months.reduce((sum, month) => {
      const cogsSection = data.sections.find(s => s.id === 'cogs');
      if (!cogsSection) return sum;
      
      return sum + cogsSection.rows.reduce((rowSum, row) => {
        const cellValue = getCellValue(row.values[month] || 0);
        const vatIncluded = getCellVatStatus(row.values[month] || 0);
        if (!vatIncluded) {
          return rowSum + (cellValue * (100 / 118));
        }
        return rowSum + cellValue;
      }, 0);
    }, 0);
    
    const cogsPercent = (cogsYearlyExcludingVAT / revenueAfterVAT) * 100;
    return 100 - cogsPercent;
  }, [revenueTotals.yearlyTotal, data]);

  // Calculate EBITDA / Net Operating Profit
  const ebitda = useMemo(() => {
    const monthly = {};
    months.forEach(month => {
      monthly[month] = (grossProfit.monthly[month] || 0) - (opexTotals.monthlyTotals[month] || 0);
    });
    const yearly = grossProfit.yearly - opexTotals.yearlyTotal;
    return { monthly, yearly };
  }, [grossProfit, opexTotals]);

  // Calculate Net Profit
  const netProfit = useMemo(() => {
    const monthly = {};
    months.forEach(month => {
      monthly[month] = ebitda.monthly[month] || 0;
    });
    const yearly = ebitda.yearly;
    return { monthly, yearly };
  }, [ebitda]);

  // Calculate Net Margin %
  const netMarginPercent = useMemo(() => {
    if (revenueTotals.yearlyTotal === 0) return 0;
    return (netProfit.yearly / revenueTotals.yearlyTotal) * 100;
  }, [netProfit.yearly, revenueTotals.yearlyTotal]);

  // Calculate COGS %: (COGS excluding VAT / Revenue after VAT deduction) * 100
  const cogsPercent = useMemo(() => {
    // Calculate yearly revenue after VAT deduction: Revenue / 1.18
    const revenueAfterVAT = revenueTotals.yearlyTotal / 1.18;
    
    if (revenueAfterVAT === 0) return 0;
    
    // Calculate yearly COGS excluding VAT
    const cogsYearlyExcludingVAT = months.reduce((sum, month) => {
      const cogsSection = data.sections.find(s => s.id === 'cogs');
      if (!cogsSection) return sum;
      
      return sum + cogsSection.rows.reduce((rowSum, row) => {
        const cellValue = getCellValue(row.values[month] || 0);
        const vatIncluded = getCellVatStatus(row.values[month] || 0);
        if (!vatIncluded) {
          return rowSum + (cellValue * (100 / 118));
        }
        return rowSum + cellValue;
      }, 0);
    }, 0);
    
    return (cogsYearlyExcludingVAT / revenueAfterVAT) * 100;
  }, [revenueTotals.yearlyTotal, data]);

  // Calculate OPEX %
  const opexPercent = useMemo(() => {
    if (revenueTotals.yearlyTotal === 0) return 0;
    return (opexTotals.yearlyTotal / revenueTotals.yearlyTotal) * 100;
  }, [opexTotals.yearlyTotal, revenueTotals.yearlyTotal]);

  // Update cell value
  const updateCell = (sectionId, rowId, month, value) => {
    setData(prev => {
      // Get previous cell value and VAT status
      const currentSection = prev.sections.find(s => s.id === sectionId);
      const currentRow = currentSection?.rows.find(r => r.id === rowId);
      const previousCellValue = currentRow ? getCellValue(currentRow.values[month] || 0) : 0;
      const vatIncluded = currentRow ? getCellVatStatus(currentRow.values[month] || 0) : true;
      const newValue = parseValue(value);
      
      // Calculate VAT amounts
      const previousVatAmount = (18 / 118) * previousCellValue;
      const newVatAmount = (18 / 118) * newValue;
      const vatDifference = newVatAmount - previousVatAmount;
      
      // Find VAT section and vat-2 row
      const vatSection = prev.sections.find(s => s.id === 'vat');
      const vat2Row = vatSection?.rows.find(r => r.id === 'vat-2');
      
      return {
        ...prev,
        sections: prev.sections.map(section => {
          // Update the cell value
          if (section.id === sectionId) {
            return {
              ...section,
              rows: section.rows.map(row =>
                row.id === rowId
                  ? {
                      ...row,
                      values: {
                        ...row.values,
                        [month]: {
                          ...(typeof row.values[month] === 'object' && row.values[month] !== null ? row.values[month] : { value: getCellValue(row.values[month] || 0), vatIncluded: getCellVatStatus(row.values[month] || 0) }),
                          value: newValue,
                        },
                      },
                    }
                  : row
              ),
            };
          }
          
          // Update vat-2 (החזרי מע״מ) when value changes and VAT is excluded
          if (section.id === 'vat' && vat2Row && !vatIncluded && sectionId !== 'revenue' && sectionId !== 'vat') {
            return {
              ...section,
              rows: section.rows.map(row => {
                if (row.id === 'vat-2') {
                  const currentVat2Value = getCellValue(row.values[month] || 0);
                  const newVat2Value = Math.max(0, currentVat2Value + vatDifference);
                  
                  return {
                    ...row,
                    values: {
                      ...row.values,
                      [month]: createCellData(newVat2Value, true),
                    },
                  };
                }
                return row;
              }),
            };
          }
          
          return section;
        }),
      };
    });
  };

  // Update cell VAT status
  const updateCellVatStatus = (sectionId, rowId, month, vatIncluded) => {
    setData(prev => {
      // Get the cell value and previous VAT status before updating
      const currentSection = prev.sections.find(s => s.id === sectionId);
      const currentRow = currentSection?.rows.find(r => r.id === rowId);
      const currentCellValue = currentRow ? getCellValue(currentRow.values[month] || 0) : 0;
      const previousVatIncluded = currentRow ? getCellVatStatus(currentRow.values[month] || 0) : true;
      
      // Only process if value is greater than 0
      if (currentCellValue <= 0) {
        // Just update the VAT status without affecting vat-2
        return {
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              rows: section.rows.map(row =>
                row.id === rowId
                  ? {
                      ...row,
                      values: {
                        ...row.values,
                            [month]: {
                              ...(typeof row.values[month] === 'object' && row.values[month] !== null ? row.values[month] : { value: getCellValue(row.values[month] || 0), vatIncluded: getCellVatStatus(row.values[month] || 0) }),
                              vatIncluded,
                            },
                      },
                    }
                  : row
              ),
            }
          : section
      ),
        };
      }
      
      // Calculate VAT amount: 18/118 * value
      const vatAmount = (18 / 118) * currentCellValue;
      
      // Find VAT section and vat-2 row
      const vatSection = prev.sections.find(s => s.id === 'vat');
      const vat2Row = vatSection?.rows.find(r => r.id === 'vat-2');
      
      return {
        ...prev,
        sections: prev.sections.map(section => {
          // Update the cell VAT status
          if (section.id === sectionId) {
            return {
              ...section,
              rows: section.rows.map(row =>
                row.id === rowId
                  ? {
                      ...row,
                      values: {
                        ...row.values,
                        [month]: {
                          ...(typeof row.values[month] === 'object' && row.values[month] !== null ? row.values[month] : { value: getCellValue(row.values[month] || 0), vatIncluded: getCellVatStatus(row.values[month] || 0) }),
                          vatIncluded,
                        },
                      },
                    }
                  : row
              ),
            };
          }
          
          // Update vat-2 (החזרי מע״מ) when VAT status changes
          if (section.id === 'vat' && vat2Row && sectionId !== 'revenue' && sectionId !== 'vat') {
            return {
              ...section,
              rows: section.rows.map(row => {
                if (row.id === 'vat-2') {
                  const currentVat2Value = getCellValue(row.values[month] || 0);
                  let newVat2Value = currentVat2Value;
                  
                  // If changing from included to excluded, add VAT amount
                  if (previousVatIncluded && !vatIncluded) {
                    newVat2Value = currentVat2Value + vatAmount;
                  }
                  // If changing from excluded to included, subtract VAT amount
                  else if (!previousVatIncluded && vatIncluded) {
                    newVat2Value = Math.max(0, currentVat2Value - vatAmount);
                  }
                  
                  return {
                    ...row,
                    values: {
                      ...row.values,
                      [month]: createCellData(newVat2Value, true),
                    },
                  };
                }
                return row;
              }),
            };
          }
          
          return section;
        }),
      };
    });
  };

  // Update row name
  const updateRowName = (sectionId, rowId, name) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              rows: section.rows.map(row =>
                row.id === rowId ? { ...row, name } : row
              ),
            }
          : section
      ),
    }));
  };

  // Add row to section
  const addRow = (sectionId) => {
    const newRow = {
      id: `${sectionId}-${Date.now()}`,
      name: 'פריט חדש',
      values: { 
        jan: createCellData(0, true), feb: createCellData(0, true), mar: createCellData(0, true), 
        apr: createCellData(0, true), may: createCellData(0, true), jun: createCellData(0, true), 
        jul: createCellData(0, true), aug: createCellData(0, true), sep: createCellData(0, true), 
        oct: createCellData(0, true), nov: createCellData(0, true), dec: createCellData(0, true) 
      },
    };
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, rows: [...section.rows, newRow] }
          : section
      ),
    }));
  };

  // Remove row from section
  const removeRow = (sectionId, rowId) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, rows: section.rows.filter(row => row.id !== rowId) }
          : section
      ),
    }));
  };

  // Handle drag start
  const handleDragStart = (sectionId, rowId) => {
    setDraggedRow(rowId);
    setDraggedSection(sectionId);
  };

  // Handle drag over - reorder rows in real-time
  const handleDragOver = (e, sectionId, rowId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedSection === sectionId && draggedRow !== rowId && draggedRow) {
      setDragOverRow(rowId);
      
      // Reorder rows in real-time
      setData(prev => {
        const section = prev.sections.find(s => s.id === sectionId);
        if (!section) return prev;
        
        const rows = [...section.rows];
        const draggedIndex = rows.findIndex(r => r.id === draggedRow);
        const targetIndex = rows.findIndex(r => r.id === rowId);

        if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
          return prev;
        }

        // Remove dragged row
        const [draggedItem] = rows.splice(draggedIndex, 1);
        // Insert at target position
        rows.splice(targetIndex, 0, draggedItem);

        return {
          ...prev,
          sections: prev.sections.map(s =>
            s.id === sectionId ? { ...s, rows } : s
          ),
        };
      });
    }
  };

  // Handle drag leave
  const handleDragLeave = () => {
    // Don't reset dragOverRow here to maintain the reordered state
  };

  // Handle drop - finalize the reorder (data is already reordered during drag)
  const handleDrop = (sectionId, targetRowId) => {
    if (!draggedRow || !draggedSection || draggedSection !== sectionId) {
      setDraggedRow(null);
      setDraggedSection(null);
      setDragOverRow(null);
      return;
    }

    // Data is already reordered during drag, just clean up
    setDraggedRow(null);
    setDraggedSection(null);
    setDragOverRow(null);
  };

  // Handle drag end - cleanup if drag was cancelled
  const handleDragEnd = () => {
    setDraggedRow(null);
    setDraggedSection(null);
    setDragOverRow(null);
  };

  // Calculate VAT Gross (18/118 * revenue) for a specific month
  const calculateVATGross = (month) => {
    const revenue = revenueTotals.monthlyTotals[month] || 0;
    return (18 / 118) * revenue;
  };

  // Calculate VAT formulas for all VAT rows
  const calculateVATValue = (rowId, month) => {
    const revenue = revenueTotals.monthlyTotals[month] || 0;
    
    switch (rowId) {
      case 'vat-1': // סך המע״מ ברוטו
        return (18 / 118) * revenue;
      case 'vat-2': // החזרי מע״מ
        // TODO: Add formula when provided
        return 0;
      default:
        return 0;
    }
  };

  // Update COGS section name to "עלות מכר", remove vat-3, and remove other section
  React.useEffect(() => {
    setData(prev => {
      // Check if cleanup is needed
      const hasOtherSection = prev.sections.some(s => s.id === 'other');
      const hasWrongCogsName = prev.sections.some(s => s.id === 'cogs' && s.name !== 'עלות מכר');
      const hasVat3 = prev.sections.some(s => 
        s.id === 'vat' && s.rows && s.rows.some(row => row.id === 'vat-3' || row.name === 'פריט חדש')
      );
      
      if (!hasOtherSection && !hasWrongCogsName && !hasVat3) {
        return prev; // No changes needed
      }
      
      let hasChanges = false;
      const updatedSections = prev.sections
        .filter(section => {
          if (section.id === 'other') {
            hasChanges = true;
            return false; // Remove other section
          }
          return true;
        })
        .map(section => {
          // Update COGS section name
          if (section.id === 'cogs' && section.name !== 'עלות מכר') {
            hasChanges = true;
            return { ...section, name: 'עלות מכר' };
          }
          
          // Remove vat-3 from VAT section
          if (section.id === 'vat' && section.rows && Array.isArray(section.rows)) {
            const allowedRowIds = ['vat-1', 'vat-2'];
            const hasVat3 = section.rows.some(row => row.id === 'vat-3');
            const hasUnwantedRows = section.rows.some(row => 
              !allowedRowIds.includes(row.id) || row.name === 'פריט חדש'
            );
            
            if (hasVat3 || hasUnwantedRows) {
              hasChanges = true;
              const filteredRows = section.rows.filter(row => 
                allowedRowIds.includes(row.id) && row.name !== 'פריט חדש' && row.id !== 'vat-3'
              );
              return { ...section, rows: filteredRows };
            }
          }
          
          return section;
        });
      
      if (!hasChanges) return prev;
      
      return {
        ...prev,
        sections: updatedSections,
      };
    });
  }, []); // Run only once on mount

  // Update all VAT rows automatically when revenue changes
  React.useEffect(() => {
    setData(prev => {
      const vatSection = prev.sections.find(s => s.id === 'vat');
      if (!vatSection) return prev;
      
      let hasAnyChange = false;
      const updatedRows = vatSection.rows.map(row => {
        // Skip rows that are not the standard VAT rows
        if (!['vat-1', 'vat-2'].includes(row.id)) {
          return row;
        }
        
        // Skip vat-2 (החזרי מע״מ) - it's updated manually by user actions, not calculated
        if (row.id === 'vat-2') {
          return row;
        }
        
        const newValues = {};
        let rowHasChanged = false;
        
        months.forEach(month => {
          const calculatedValue = calculateVATValue(row.id, month);
          const currentValue = getCellValue(row.values[month] || 0);
          newValues[month] = createCellData(calculatedValue, true);
          
          if (Math.abs(currentValue - calculatedValue) > 0.01) {
            rowHasChanged = true;
            hasAnyChange = true;
          }
        });
        
        if (rowHasChanged) {
          return { ...row, values: newValues };
        }
        return row;
      });
      
      if (!hasAnyChange) return prev;
      
      return {
        ...prev,
        sections: prev.sections.map(section =>
          section.id === 'vat'
            ? { ...section, rows: updatedRows }
            : section
        ),
      };
    });
  }, [revenueTotals.monthlyTotals]);

  // Export to CSV
  const exportToCSV = () => {
    const csvRows = [];
    
    // Header
    csvRows.push(['קטגוריה', ...monthLabels, 'סה"כ'].join(','));
    
    // Sections and rows
    data.sections.forEach(section => {
      // Section header
      csvRows.push([section.name, ...monthLabels.map(() => ''), ''].join(','));
      
      // Rows in section
      section.rows.forEach(row => {
        const rowTotal = calculateRowTotal(row);
        csvRows.push([
          row.name,
          ...months.map(m => getCellValue(row.values[m] || 0)),
          rowTotal,
        ].join(','));
      });
      
      // Section total
      const sectionTotals = calculateSectionTotals(section);
      csvRows.push([
        `סה"כ ${section.name}`,
        ...months.map(m => sectionTotals.monthlyTotals[m] || 0),
        sectionTotals.yearlyTotal,
      ].join(','));
      
      // Add computed rows after specific sections
      if (section.id === 'cogs') {
        // Gross Profit
        csvRows.push([
          'רווח גולמי',
          ...months.map(m => grossProfit.monthly[m] || 0),
          grossProfit.yearly,
        ].join(','));
        // Gross Margin %: 100% - COGS %
        csvRows.push([
          'שולי רווח גולמי %',
          ...months.map(m => {
            const revenue = revenueTotals.monthlyTotals[m] || 0;
            const revenueAfterVAT = revenue / 1.18;
            
            const cogsSection = data.sections.find(s => s.id === 'cogs');
            const cogsExcludingVAT = cogsSection ? cogsSection.rows.reduce((sum, row) => {
              const cellValue = getCellValue(row.values[m] || 0);
              const vatIncluded = getCellVatStatus(row.values[m] || 0);
              if (!vatIncluded) {
                return sum + (cellValue * (100 / 118));
              }
              return sum + cellValue;
            }, 0) : 0;
            
            const cogsPercent = revenueAfterVAT !== 0
              ? (cogsExcludingVAT / revenueAfterVAT) * 100
              : 0;
            const percent = 100 - cogsPercent;
            return formatPercent(percent);
          }),
          formatPercent(grossMarginPercent),
        ].join(','));
        // COGS %: (COGS excluding VAT / Revenue excluding VAT) * 100
        csvRows.push([
          'עלות מכר %',
          ...months.map(m => {
            const revenue = revenueTotals.monthlyTotals[m] || 0;
            const revenueAfterVAT = revenue / 1.18;
            
            const cogsSection = data.sections.find(s => s.id === 'cogs');
            const cogsExcludingVAT = cogsSection ? cogsSection.rows.reduce((sum, row) => {
              const cellValue = getCellValue(row.values[m] || 0);
              const vatIncluded = getCellVatStatus(row.values[m] || 0);
              if (!vatIncluded) {
                return sum + (cellValue * (100 / 118));
              }
              return sum + cellValue;
            }, 0) : 0;
            
            const percent = revenueAfterVAT !== 0
              ? (cogsExcludingVAT / revenueAfterVAT) * 100
              : 0;
            return formatPercent(percent);
          }),
          formatPercent(cogsPercent),
        ].join(','));
      }
      
      if (section.id === 'opex') {
        // EBITDA
        csvRows.push([
          'EBITDA / רווח תפעולי נקי',
          ...months.map(m => ebitda.monthly[m] || 0),
          ebitda.yearly,
        ].join(','));
        // OPEX %
        csvRows.push([
          'הוצאות תפעול %',
          ...months.map(m => revenueTotals.monthlyTotals[m] ? formatPercent(((opexTotals.monthlyTotals[m] || 0) / revenueTotals.monthlyTotals[m]) * 100) : '0.0%'),
          formatPercent(opexPercent),
        ].join(','));
        // Net Profit
        csvRows.push([
          'רווח נקי',
          ...months.map(m => netProfit.monthly[m] || 0),
          netProfit.yearly,
        ].join(','));
        // Net Margin %
        csvRows.push([
          'שולי רווח נקי %',
          ...months.map(m => revenueTotals.monthlyTotals[m] ? formatPercent(((netProfit.monthly[m] || 0) / revenueTotals.monthlyTotals[m]) * 100) : '0.0%'),
          formatPercent(netMarginPercent),
        ].join(','));
      }
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `P&L_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="w-full space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-xl hover:scale-[1.02]">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">סך הכנסות</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(revenueTotals.yearlyTotal)}
          </div>
        </div>
        <div className="bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-xl hover:scale-[1.02]">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">רווח גולמי</div>
          <div className={`text-2xl font-bold ${grossProfit.yearly < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {formatNumber(grossProfit.yearly)}
          </div>
        </div>
        <div className="bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-xl hover:scale-[1.02]">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">EBITDA</div>
          <div className={`text-2xl font-bold ${ebitda.yearly < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {formatNumber(ebitda.yearly)}
          </div>
        </div>
        <div className="bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-xl hover:scale-[1.02]">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">רווח נקי</div>
          <div className={`text-2xl font-bold ${netProfit.yearly < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {formatNumber(netProfit.yearly)}
          </div>
        </div>
        <div className="bg-white dark:bg-customGray rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-xl hover:scale-[1.02]">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">שולי רווח נקי %</div>
          <div className={`text-2xl font-bold ${netMarginPercent < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {formatPercent(netMarginPercent)}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-customGray rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="bg-white dark:bg-customGray border-b border-gray-200/50 dark:border-gray-700/50" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
                <th className="sticky right-0 z-30 bg-white dark:bg-customGray px-4 py-4 text-right text-sm font-bold text-gray-900 dark:text-white border-b-2 border-l-2 border-gray-200/50 dark:border-gray-700/50 min-w-[200px] rounded-tr-2xl">
                  קטגוריה
                </th>
                {monthLabels.map((month, index) => (
                  <th
                    key={month}
                    className="px-3 py-4 text-center text-sm font-bold text-gray-900 dark:text-white border-b-2 border-l border-gray-200/50 dark:border-gray-700/50 min-w-[100px]"
                  >
                    {month}
                  </th>
                ))}
                <th className="px-4 py-4 text-center text-sm font-bold text-gray-900 dark:text-white border-b-2 border-gray-200/50 dark:border-gray-700/50 min-w-[120px] rounded-tl-2xl">
                  סה"כ
                </th>
              </tr>
            </thead>
            <tbody>
              {data.sections.map((section, sectionIndex) => {
                const sectionTotals = calculateSectionTotals(section);
                const isRevenue = section.id === 'revenue';
                const isCogs = section.id === 'cogs';
                const isOpex = section.id === 'opex';

                return (
                  <React.Fragment key={section.id}>
                    {/* Section Header */}
                    <tr className="bg-white dark:bg-customGray">
                      <td
                        className="sticky right-0 z-20 bg-white dark:bg-customGray px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border-b-2 border-l-2 border-gray-200/50 dark:border-gray-700/50"
                      >
                        <div className="flex items-center gap-2">
                          {section.id !== 'vat' && (
                            <button
                              onClick={() => addRow(section.id)}
                              className="w-6 h-6 flex items-center justify-center rounded-full transition-all hover:scale-110"
                              style={{ 
                                color: BRAND_COLOR,
                                border: `1.5px solid ${BRAND_COLOR}`
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = `${BRAND_COLOR}20`;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                              }}
                              title="הוסף שורה"
                            >
                              +
                            </button>
                          )}
                          <span>{section.name}</span>
                        </div>
                      </td>
                      {months.map((month) => (
                        <td
                          key={month}
                          className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border-b-2 border-l border-gray-200/50 dark:border-gray-700/50"
                        >
                        </td>
                      ))}
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border-b-2 border-gray-200/50 dark:border-gray-700/50">
                      </td>
                    </tr>

                    {/* Section Rows */}
                    {section.rows && Array.isArray(section.rows) && section.rows.map((row) => {
                      const rowTotal = calculateRowTotal(row);
                      const isDragging = draggedRow === row.id && draggedSection === section.id;
                      const isDragOver = dragOverRow === row.id && draggedSection === section.id;
                      return (
                        <tr 
                          key={row.id} 
                          draggable
                          onDragStart={() => handleDragStart(section.id, row.id)}
                          onDragOver={(e) => handleDragOver(e, section.id, row.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={() => handleDrop(section.id, row.id)}
                          onDragEnd={handleDragEnd}
                          className={`transition-all duration-200 ease-in-out cursor-move ${
                            isDragging 
                              ? 'opacity-30 scale-95' 
                              : isDragOver 
                                ? 'scale-[1.01]'
                                : ''
                          }`}
                          style={isDragOver ? { backgroundColor: `${BRAND_COLOR}20` } : {}}
                        >
                          <td className="sticky right-0 z-10 bg-white dark:bg-customGray px-4 py-3 border-b border-l border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={row.name}
                                onChange={(e) => updateRowName(section.id, row.id, e.target.value)}
                                className="flex-1 bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 rounded-lg px-3 py-1.5 transition-all selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black"
                                style={{
                                  caretColor: 'black'
                                }}
                                onFocus={(e) => {
                                  e.target.style.boxShadow = `0 0 0 2px ${BRAND_COLOR}`;
                                }}
                                onBlur={(e) => {
                                  e.target.style.boxShadow = '';
                                }}
                              />
                              {section.rows.length > 1 && section.id !== 'vat' && (
                                <button
                                  onClick={() => removeRow(section.id, row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-lg px-2 py-1 rounded-lg transition-all"
                                  title="מחק שורה"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </td>
                          {months.map((month) => {
                            // Check if this is a VAT section row - vat-1 is calculated, vat-2 is manual
                            const isVATRow = section.id === 'vat';
                            const isVat2 = row.id === 'vat-2';
                            const calculatedVATValue = (isVATRow && !isVat2) ? calculateVATValue(row.id, month) : null;
                            const cellValue = (isVATRow && !isVat2) ? calculatedVATValue : getCellValue(row.values[month] || 0);
                            const vatIncluded = getCellVatStatus(row.values[month] || 0);
                            const isVatExcluded = !vatIncluded;
                            const showVatButton = section.id !== 'revenue' && section.id !== 'vat';
                            return (
                            <td
                              key={month}
                                className="px-3 py-3 text-sm border-b border-l border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-customGray relative"
                              >
                                {/* VAT Status Checkbox */}
                                {showVatButton && (
                                  <div className="absolute top-1 left-1 z-10">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateCellVatStatus(section.id, row.id, month, !vatIncluded);
                                      }}
                                      className={`w-4 h-4 rounded-full border-2 bg-transparent transition-all focus:outline-none focus:ring-0 active:outline-none flex items-center justify-center cursor-pointer ${
                                        isVatExcluded
                                          ? 'border-red-500'
                                          : 'border-gray-400'
                                      }`}
                                      title={vatIncluded ? 'כולל מע״מ - לחץ כדי לסמן כלא כולל' : 'לא כולל מע״מ - לחץ כדי לסמן ככולל'}
                                    >
                                      {isVatExcluded && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                      )}
                                    </button>
                                  </div>
                                )}
                              <input
                                type="text"
                                  value={cellValue === 0 ? '' : formatNumber(cellValue)}
                                onChange={(e) => {
                                  if (isVATRow) return; // Prevent editing for all VAT rows
                                  const newValue = e.target.value;
                                  if (newValue === '' || /^-?\d*\.?\d*$/.test(newValue.replace(/,/g, ''))) {
                                    updateCell(section.id, row.id, month, newValue);
                                  }
                                }}
                                  onKeyDown={(e) => {
                                    if (isVATRow) {
                                      // Skip to next input for VAT rows
                                      e.preventDefault();
                                      const currentSectionIndex = data.sections.findIndex(s => s.id === section.id);
                                      const currentRowIndex = section.rows.findIndex(r => r.id === row.id);
                                      
                                      let nextInput = null;
                                      
                                      if (currentRowIndex < section.rows.length - 1) {
                                        const nextRowId = section.rows[currentRowIndex + 1].id;
                                        nextInput = document.querySelector(`input[data-section="${section.id}"][data-row="${nextRowId}"][data-month="${month}"]`);
                                      } else {
                                        if (currentSectionIndex < data.sections.length - 1) {
                                          const nextSection = data.sections[currentSectionIndex + 1];
                                          if (nextSection.rows.length > 0) {
                                            const nextRowId = nextSection.rows[0].id;
                                            nextInput = document.querySelector(`input[data-section="${nextSection.id}"][data-row="${nextRowId}"][data-month="${month}"]`);
                                          }
                                        }
                                      }
                                      
                                      if (nextInput) {
                                        setTimeout(() => {
                                          nextInput.focus();
                                          nextInput.select();
                                        }, 0);
                                      }
                                      return;
                                    }
                                    
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const currentValue = e.target.value;
                                      if (currentValue === '' || /^-?\d*\.?\d*$/.test(currentValue.replace(/,/g, ''))) {
                                        updateCell(section.id, row.id, month, currentValue);
                                      }
                                      
                                      const currentSectionIndex = data.sections.findIndex(s => s.id === section.id);
                                      const currentRowIndex = section.rows.findIndex(r => r.id === row.id);
                                      
                                      let nextInput = null;
                                      
                                      if (currentRowIndex < section.rows.length - 1) {
                                        const nextRowId = section.rows[currentRowIndex + 1].id;
                                        nextInput = document.querySelector(`input[data-section="${section.id}"][data-row="${nextRowId}"][data-month="${month}"]`);
                                      } else {
                                        if (currentSectionIndex < data.sections.length - 1) {
                                          const nextSection = data.sections[currentSectionIndex + 1];
                                          if (nextSection.rows.length > 0) {
                                            const nextRowId = nextSection.rows[0].id;
                                            nextInput = document.querySelector(`input[data-section="${nextSection.id}"][data-row="${nextRowId}"][data-month="${month}"]`);
                                          }
                                        }
                                      }
                                      
                                      if (nextInput) {
                                        setTimeout(() => {
                                          nextInput.focus();
                                          nextInput.select();
                                        }, 0);
                                      }
                                    }
                                  }}
                                  data-section={section.id}
                                  data-row={row.id}
                                  data-month={month}
                                  readOnly={isVATRow && !isVat2}
                                  className={`w-full border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 text-center text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black shadow-sm ${
                                    (isVATRow && !isVat2)
                                      ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
                                      : 'bg-white dark:bg-[#181818] hover:shadow-md'
                                  }`}
                                placeholder="0"
                                  style={{
                                    caretColor: 'black'
                                  }}
                                  onFocus={(e) => {
                                    if (!isVATRow) {
                                      e.target.style.boxShadow = `0 0 0 2px ${BRAND_COLOR}`;
                                    }
                                  }}
                                  onBlur={(e) => {
                                    e.target.style.boxShadow = '';
                                  }}
                              />
                            </td>
                            );
                          })}
                          <td className="px-4 py-3 text-sm font-semibold text-center text-gray-900 dark:text-white border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                            {formatNumber(rowTotal)}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Section Total */}
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 font-bold">
                      <td className="sticky right-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-4 py-3 border-b-2 border-l-2 border-gray-300 dark:border-gray-600">
                        סה"כ {section.name}
                      </td>
                      {months.map((month) => {
                        // For VAT section, calculate as: vat-1 (ברוטו) - vat-2 (החזרי)
                        let displayValue = sectionTotals.monthlyTotals[month] || 0;
                        if (section.id === 'vat') {
                          const vat1Row = section.rows.find(r => r.id === 'vat-1');
                          const vat2Row = section.rows.find(r => r.id === 'vat-2');
                          const vat1Value = vat1Row ? getCellValue(vat1Row.values[month] || 0) : 0;
                          const vat2Value = vat2Row ? getCellValue(vat2Row.values[month] || 0) : 0;
                          displayValue = vat1Value - vat2Value;
                        }
                        return (
                        <td
                          key={month}
                          className="px-3 py-3 text-sm text-center text-gray-900 dark:text-white border-b-2 border-l border-gray-300 dark:border-gray-600"
                        >
                            {formatNumber(displayValue)}
                        </td>
                        );
                      })}
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-600">
                        {(() => {
                          // For VAT section, calculate yearly total as sum of monthly calculations
                          if (section.id === 'vat') {
                            const yearlyTotal = months.reduce((sum, month) => {
                              const vat1Row = section.rows.find(r => r.id === 'vat-1');
                              const vat2Row = section.rows.find(r => r.id === 'vat-2');
                              const vat1Value = vat1Row ? getCellValue(vat1Row.values[month] || 0) : 0;
                              const vat2Value = vat2Row ? getCellValue(vat2Row.values[month] || 0) : 0;
                              return sum + (vat1Value - vat2Value);
                            }, 0);
                            return formatNumber(yearlyTotal);
                          }
                          return formatNumber(sectionTotals.yearlyTotal);
                        })()}
                      </td>
                    </tr>

                    {/* Revenue after VAT deduction - only for revenue section */}
                    {isRevenue && (
                      <tr className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-900/20 font-semibold">
                        <td className="sticky right-0 z-10 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-900/20 px-4 py-3 border-b-2 border-l-2 border-purple-200 dark:border-purple-800">
                          סה״כ ההכנסות לאחר קיזוז מע״מ
                        </td>
                        {months.map((month) => {
                          // Calculate: Revenue / 1.18
                          const revenue = sectionTotals.monthlyTotals[month] || 0;
                          const revenueAfterVAT = revenue / 1.18;
                          return (
                            <td
                              key={month}
                              className="px-3 py-3 text-sm text-center text-gray-900 dark:text-white border-b-2 border-l border-purple-200 dark:border-purple-800"
                            >
                              {formatNumber(revenueAfterVAT)}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white border-b-2 border-purple-200 dark:border-purple-800">
                          {formatNumber(revenueTotals.yearlyTotal / 1.18)}
                        </td>
                      </tr>
                    )}

                    {/* Revenue after VAT refunds - only for revenue section */}
                    {isRevenue && (
                      <tr className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-900/20 font-semibold">
                        <td className="sticky right-0 z-10 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-900/20 px-4 py-3 border-b-2 border-l-2 border-blue-200 dark:border-blue-800">
                          סך ההכנסות לאחר החזרי מע״מ
                        </td>
                        {months.map((month) => {
                          // Calculate: Revenue - Total VAT (vat-1 - vat-2)
                          const revenue = sectionTotals.monthlyTotals[month] || 0;
                          const vatSection = data.sections.find(s => s.id === 'vat');
                          const vat1Row = vatSection?.rows.find(r => r.id === 'vat-1');
                          const vat2Row = vatSection?.rows.find(r => r.id === 'vat-2');
                          const vat1Value = vat1Row ? getCellValue(vat1Row.values[month] || 0) : 0;
                          const vat2Value = vat2Row ? getCellValue(vat2Row.values[month] || 0) : 0;
                          const totalVAT = vat1Value - vat2Value;
                          const revenueExcludingVAT = revenue - totalVAT;
                          return (
                            <td
                              key={month}
                              className="px-3 py-3 text-sm text-center text-gray-900 dark:text-white border-b-2 border-l border-blue-200 dark:border-blue-800"
                            >
                              {formatNumber(revenueExcludingVAT)}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white border-b-2 border-blue-200 dark:border-blue-800">
                          {(() => {
                            const vatSection = data.sections.find(s => s.id === 'vat');
                            const vat1Row = vatSection?.rows.find(r => r.id === 'vat-1');
                            const vat2Row = vatSection?.rows.find(r => r.id === 'vat-2');
                            const yearlyVAT = months.reduce((sum, month) => {
                              const vat1Value = vat1Row ? getCellValue(vat1Row.values[month] || 0) : 0;
                              const vat2Value = vat2Row ? getCellValue(vat2Row.values[month] || 0) : 0;
                              return sum + (vat1Value - vat2Value);
                            }, 0);
                            return formatNumber(revenueTotals.yearlyTotal - yearlyVAT);
                          })()}
                        </td>
                      </tr>
                    )}

                    {/* COGS excluding VAT - only for cogs section */}
                    {isCogs && (
                      <tr className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-900/20 font-semibold">
                        <td className="sticky right-0 z-10 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-900/20 px-4 py-3 border-b-2 border-l-2 border-green-200 dark:border-green-800">
                          סה״כ עלות מכר לא כולל מע״מ
                        </td>
                        {months.map((month) => {
                          // Calculate COGS excluding VAT (considering VAT excluded buttons)
                          const cogsExcludingVAT = section.rows.reduce((sum, row) => {
                            const cellValue = getCellValue(row.values[month] || 0);
                            const vatIncluded = getCellVatStatus(row.values[month] || 0);
                            
                            // If VAT is excluded (red button), subtract VAT: value * (100/118)
                            // If VAT is included, use value as is
                            if (!vatIncluded) {
                              return sum + (cellValue * (100 / 118));
                            }
                            return sum + cellValue;
                          }, 0);
                          
                          return (
                            <td
                              key={month}
                              className="px-3 py-3 text-sm text-center text-gray-900 dark:text-white border-b-2 border-l border-green-200 dark:border-green-800"
                            >
                              {formatNumber(cogsExcludingVAT)}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white border-b-2 border-green-200 dark:border-green-800">
                          {formatNumber(months.reduce((sum, month) => {
                            return sum + section.rows.reduce((rowSum, row) => {
                              const cellValue = getCellValue(row.values[month] || 0);
                              const vatIncluded = getCellVatStatus(row.values[month] || 0);
                              if (!vatIncluded) {
                                return rowSum + (cellValue * (100 / 118));
                              }
                              return rowSum + cellValue;
                            }, 0);
                          }, 0))}
                        </td>
                      </tr>
                    )}

                    {/* Computed Rows */}
                    {isCogs && (
                      <>
                        {/* Gross Profit */}
                        <tr style={{ background: `linear-gradient(to right, ${BRAND_COLOR}20, ${BRAND_COLOR}30)` }}>
                          <td className="sticky right-0 z-10 px-4 py-3 border-b-2 border-l-2 font-bold text-gray-900 dark:text-white rounded-br-xl" style={{ background: `linear-gradient(to right, ${BRAND_COLOR}20, ${BRAND_COLOR}30)`, borderColor: `${BRAND_COLOR}80` }}>
                            רווח גולמי
                          </td>
                          {months.map((month) => (
                            <td
                              key={month}
                              className={`px-3 py-3 text-sm text-center font-bold border-b-2 border-l ${
                                grossProfit.monthly[month] < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                              style={{ borderColor: `${BRAND_COLOR}80` }}
                            >
                              {formatNumber(grossProfit.monthly[month] || 0)}
                            </td>
                          ))}
                          <td
                            className={`px-4 py-3 text-sm text-center font-bold border-b-2 ${
                              grossProfit.yearly < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-900 dark:text-white'
                            }`}
                            style={{ borderColor: `${BRAND_COLOR}80` }}
                          >
                            {formatNumber(grossProfit.yearly)}
                          </td>
                        </tr>
                        {/* Gross Margin %: 100% - COGS % */}
                        <tr style={{ backgroundColor: `${BRAND_COLOR}20` }}>
                          <td className="sticky right-0 z-10 px-4 py-2 border-b border-l text-sm text-gray-700 dark:text-gray-300" style={{ backgroundColor: `${BRAND_COLOR}20`, borderColor: `${BRAND_COLOR}40` }}>
                            שולי רווח גולמי %
                          </td>
                          {months.map((month) => {
                            // Calculate: 100% - COGS %
                            const revenue = revenueTotals.monthlyTotals[month] || 0;
                            const revenueAfterVAT = revenue / 1.18;
                            
                            // Calculate COGS excluding VAT
                            const cogsSection = data.sections.find(s => s.id === 'cogs');
                            const cogsExcludingVAT = cogsSection ? cogsSection.rows.reduce((sum, row) => {
                              const cellValue = getCellValue(row.values[month] || 0);
                              const vatIncluded = getCellVatStatus(row.values[month] || 0);
                              if (!vatIncluded) {
                                return sum + (cellValue * (100 / 118));
                              }
                              return sum + cellValue;
                            }, 0) : 0;
                            
                            const cogsPercent = revenueAfterVAT !== 0
                              ? (cogsExcludingVAT / revenueAfterVAT) * 100
                              : 0;
                            const percent = 100 - cogsPercent;
                            
                            return (
                              <td
                                key={month}
                                className="px-3 py-2 text-sm text-center text-gray-700 dark:text-gray-300 border-b border-l"
                                style={{ borderColor: `${BRAND_COLOR}40` }}
                              >
                                {formatPercent(percent)}
                              </td>
                            );
                          })}
                          <td className="px-4 py-2 text-sm text-center text-gray-700 dark:text-gray-300 border-b" style={{ borderColor: `${BRAND_COLOR}40` }}>
                            {formatPercent(grossMarginPercent)}
                          </td>
                        </tr>
                        {/* COGS % */}
                        <tr style={{ backgroundColor: `${BRAND_COLOR}20` }}>
                          <td className="sticky right-0 z-10 px-4 py-2 border-b border-l text-sm text-gray-700 dark:text-gray-300" style={{ backgroundColor: `${BRAND_COLOR}20`, borderColor: `${BRAND_COLOR}40` }}>
                            עלות מכר %
                          </td>
                          {months.map((month) => {
                            // Calculate: (COGS excluding VAT / Revenue after VAT deduction) * 100
                            const revenue = revenueTotals.monthlyTotals[month] || 0;
                            const revenueAfterVAT = revenue / 1.18;
                            
                            // Calculate COGS excluding VAT
                            const cogsSection = data.sections.find(s => s.id === 'cogs');
                            const cogsExcludingVAT = cogsSection ? cogsSection.rows.reduce((sum, row) => {
                              const cellValue = getCellValue(row.values[month] || 0);
                              const vatIncluded = getCellVatStatus(row.values[month] || 0);
                              if (!vatIncluded) {
                                return sum + (cellValue * (100 / 118));
                              }
                              return sum + cellValue;
                            }, 0) : 0;
                            
                            const percent = revenueAfterVAT !== 0
                              ? (cogsExcludingVAT / revenueAfterVAT) * 100
                              : 0;
                            
                            return (
                              <td
                                key={month}
                                className="px-3 py-2 text-sm text-center text-gray-700 dark:text-gray-300 border-b border-l"
                                style={{ borderColor: `${BRAND_COLOR}40` }}
                              >
                                {formatPercent(percent)}
                              </td>
                            );
                          })}
                          <td className="px-4 py-2 text-sm text-center text-gray-700 dark:text-gray-300 border-b" style={{ borderColor: `${BRAND_COLOR}40` }}>
                            {formatPercent(cogsPercent)}
                          </td>
                        </tr>
                      </>
                    )}

                    {isOpex && (
                      <>
                        {/* EBITDA */}
                        <tr className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-900/20">
                          <td className="sticky right-0 z-10 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-900/20 px-4 py-3 border-b-2 border-l-2 border-green-200 dark:border-green-800 font-bold text-gray-900 dark:text-white rounded-br-xl">
                            EBITDA / רווח תפעולי נקי
                          </td>
                          {months.map((month) => (
                            <td
                              key={month}
                              className={`px-3 py-3 text-sm text-center font-bold border-b-2 border-l border-green-200 dark:border-green-800 ${
                                ebitda.monthly[month] < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {formatNumber(ebitda.monthly[month] || 0)}
                            </td>
                          ))}
                          <td
                            className={`px-4 py-3 text-sm text-center font-bold border-b-2 border-green-200 dark:border-green-800 ${
                              ebitda.yearly < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {formatNumber(ebitda.yearly)}
                          </td>
                        </tr>
                        {/* OPEX % */}
                        <tr className="bg-green-50/50 dark:bg-green-900/20">
                          <td className="sticky right-0 z-10 bg-green-50/50 dark:bg-green-900/20 px-4 py-2 border-b border-l border-green-200/50 dark:border-green-800/50 text-sm text-gray-700 dark:text-gray-300">
                            הוצאות תפעול %
                          </td>
                          {months.map((month) => {
                            const percent =
                              revenueTotals.monthlyTotals[month] && revenueTotals.monthlyTotals[month] !== 0
                                ? ((opexTotals.monthlyTotals[month] || 0) / revenueTotals.monthlyTotals[month]) * 100
                                : 0;
                            return (
                              <td
                                key={month}
                                className="px-3 py-2 text-sm text-center text-gray-700 dark:text-gray-300 border-b border-l border-green-200/50 dark:border-green-800/50"
                              >
                                {formatPercent(percent)}
                              </td>
                            );
                          })}
                          <td className="px-4 py-2 text-sm text-center text-gray-700 dark:text-gray-300 border-b border-green-200/50 dark:border-green-800/50">
                            {formatPercent(opexPercent)}
                          </td>
                        </tr>
                      </>
                    )}

                    {/* Spacing between sections */}
                    <tr>
                      <td colSpan={14} className="h-3 bg-transparent border-0"></td>
                    </tr>

                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Export Button */}
        <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-800/50">
          <button
            onClick={exportToCSV}
            className="px-6 py-3 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(to right, ${BRAND_COLOR}, ${BRAND_COLOR}DD)`
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `linear-gradient(to right, ${BRAND_COLOR}DD, ${BRAND_COLOR}BB)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = `linear-gradient(to right, ${BRAND_COLOR}, ${BRAND_COLOR}DD)`;
            }}
          >
            ייצא ל-CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default PnLTable;
