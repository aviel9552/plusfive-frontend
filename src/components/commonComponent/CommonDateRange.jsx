import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { addDays, startOfMonth, endOfMonth, subMonths, addMonths, isSameDay, isWithinInterval, format, isEqual } from 'date-fns';

function getDaysInMonth(year, month) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

const SIDEBAR_RANGES = [
  {
    label: 'Today',
    range: () => ({ startDate: new Date(), endDate: new Date() })
  },
  {
    label: 'Yesterday',
    range: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return { startDate: yesterday, endDate: yesterday };
    }
  },
  {
    label: 'Last 7 Days',
    range: () => ({ startDate: addDays(new Date(), -6), endDate: new Date() })
  },
  {
    label: 'Last 30 Days',
    range: () => ({ startDate: addDays(new Date(), -29), endDate: new Date() })
  },
  {
    label: 'This Month',
    range: () => {
      const now = new Date();
      return { startDate: startOfMonth(now), endDate: now };
    }
  },
  {
    label: 'Last Month',
    range: () => {
      const now = new Date();
      const prevMonth = subMonths(now, 1);
      return { startDate: startOfMonth(prevMonth), endDate: endOfMonth(prevMonth) };
    }
  },
  {
    label: 'Last Year',
    range: () => {
      const now = new Date();
      const lastYear = now.getFullYear() - 1;
      return {
        startDate: new Date(lastYear, 0, 1),
        endDate: new Date(lastYear, 11, 31)
      };
    }
  },
];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function CustomDropdown({ value, options, onChange, className, label, width = 'w-20', showLabelInsteadOfValue }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const display = showLabelInsteadOfValue
    ? (options.find(opt => opt.value === value)?.label || value)
    : (label ? label : value);

  return (
    <div className={`relative ${width}`} ref={ref}>
      <button
        type="button"
        className={`flex items-center justify-between bg-gray-800 text-white rounded px-2 py-1 text-sm border border-gray-700 focus:outline-none ${className}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        tabIndex={0}
      >
        <span>{display}</span>
        <svg className={`ml-1 w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <ul className={`absolute z-40 mt-1 left-0 right-0 max-h-56 overflow-auto bg-gray-800 border border-gray-700 rounded shadow-lg ${width}`}
            role="listbox">
          {options.map((opt, idx) => (
            <li
              key={opt.value}
              className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-pink-500/20 hover:text-pink-400 ${opt.value === value ? 'bg-pink-500/20 text-pink-400 font-semibold' : 'text-gray-300'}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              role="option"
              aria-selected={opt.value === value}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') { onChange(opt.value); setOpen(false); }}}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

CustomDropdown.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), label: PropTypes.string })).isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  label: PropTypes.string,
  width: PropTypes.string,
  showLabelInsteadOfValue: PropTypes.bool,
};

function CalendarMonth({ year, month, startDate, endDate, selecting, onSelect, minDate, maxDate, onMonthChange, onYearChange, className }) {
  const days = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array(firstDay).fill(null);
  const today = new Date();

  // Generate year options (10 years back and 10 years forward)
  const currentYear = today.getFullYear();
  const years = [];
  for (let y = currentYear - 10; y <= currentYear + 10; y++) {
    years.push(y);
  }

  return (
    <div className={`flex flex-col items-center min-w-[220px] ${className || ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <CustomDropdown
          value={month}
          options={MONTHS.map((m, idx) => ({ value: idx, label: m }))}
          onChange={onMonthChange}
          width="w-20"
          showLabelInsteadOfValue={true}
        />
        <CustomDropdown
          value={year}
          options={years.map(y => ({ value: y, label: y.toString() }))}
          onChange={onYearChange}
          width="w-24"
        />
      </div>
      <div className="grid grid-cols-7 gap-1 w-full text-xs mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-center text-gray-400">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 w-full">
        {blanks.map((_, i) => <div key={i}></div>)}
        {days.map(day => {
          const isSelected = (startDate && isSameDay(day, startDate)) || (endDate && isSameDay(day, endDate));
          const inRange = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate });
          const isDisabled = (minDate && day < minDate) || (maxDate && day > maxDate);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          return (
            <button
              key={day.toISOString()}
              className={`rounded-full w-8 h-8 text-sm text-center transition pt-1
                ${isSelected ? 'bg-pink-500 text-white font-bold' : inRange ? 'bg-pink-500/20 text-pink-400' : 'hover:bg-gray-700 text-gray-300'}
                ${isSameDay(day, today) ? 'border border-pink-500' : ''}
                ${isWeekend ? 'text-red-400' : ''}
                ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
              onClick={() => !isDisabled && onSelect(day)}
              type="button"
              disabled={isDisabled}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

CalendarMonth.propTypes = {
  year: PropTypes.number.isRequired,
  month: PropTypes.number.isRequired,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  selecting: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  onMonthChange: PropTypes.func.isRequired,
  onYearChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

function isRangeEqual(a, b) {
  if (!a || !b) return false;
  return (
    a.startDate && b.startDate && isEqual(new Date(a.startDate), new Date(b.startDate)) &&
    a.endDate && b.endDate && isEqual(new Date(a.endDate), new Date(b.endDate))
  );
}

function CommonDateRange({
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempRange, setTempRange] = useState({
    startDate: startDate || null,
    endDate: endDate || null
  });
  const [selecting, setSelecting] = useState('start');
  const [month, setMonth] = useState(() => {
    const base = tempRange.startDate || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [activeQuick, setActiveQuick] = useState(null); // index of active quick range

  React.useEffect(() => {
    setTempRange({
      startDate: startDate || null,
      endDate: endDate || null
    });
  }, [startDate, endDate]);

  // Highlight quick range if matches tempRange
  React.useEffect(() => {
    const idx = SIDEBAR_RANGES.findIndex(r => isRangeEqual(r.range(), tempRange));
    setActiveQuick(idx >= 0 ? idx : null);
  }, [tempRange]);

  const handleSidebarClick = (rangeObj, idx) => {
    setTempRange(rangeObj);
    setActiveQuick(idx);
    setMonth(new Date(rangeObj.startDate.getFullYear(), rangeObj.startDate.getMonth(), 1));
  };

  const handleCalendarSelect = (date) => {
    if (!tempRange.startDate || (tempRange.startDate && tempRange.endDate)) {
      setTempRange({ startDate: date, endDate: null });
      setSelecting('end');
      setActiveQuick(null);
    } else if (selecting === 'end') {
      if (date < tempRange.startDate) {
        setTempRange({ startDate: date, endDate: tempRange.startDate });
      } else {
        setTempRange({ startDate: tempRange.startDate, endDate: date });
      }
      setSelecting('start');
      setActiveQuick(null);
    }
  };

  const handleApply = () => {
    if (tempRange.startDate && tempRange.endDate) {
      onChange({ ...tempRange, key: 'selection' });
      setShowPicker(false);
    }
  };

  const handleCancel = () => {
    setTempRange({ startDate, endDate });
    setShowPicker(false);
  };

  const handleClear = () => {
    setTempRange({ startDate: null, endDate: null });
    onChange({ startDate: null, endDate: null, key: 'selection' });
    setShowPicker(false);
  };

  const handlePrevMonth = () => setMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setMonth(prev => addMonths(prev, 1));
  const handleMonthChange = (m) => setMonth(prev => new Date(prev.getFullYear(), m, 1));
  const handleYearChange = (y) => setMonth(prev => new Date(y, prev.getMonth(), 1));

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="relative flex items-center px-4 py-2.5 bg-transparent border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 md:w-56 w-full hover:border-pink-500 transition-all duration-200"
        onClick={() => setShowPicker(v => !v)}
      >
        <span className="truncate w-full text-left">
          {tempRange.startDate && tempRange.endDate
            ? `${format(tempRange.startDate, 'MMM d, yyyy')} - ${format(tempRange.endDate, 'MMM d, yyyy')}`
            : 'Select date range'}
        </span>
        <svg
          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${showPicker ? 'rotate-180' : ''}`}
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {showPicker && (
        <div
          className={`
            absolute z-30 mt-2
            left-1/2 -translate-x-1/2
            bg-gray-800 dark:bg-gray-900
            border border-gray-700 dark:border-gray-600
            rounded-lg shadow-xl p-4 animate-fadeIn
            w-[95vw] max-w-xs sm:min-w-[500px] sm:max-w-none
            flex flex-col sm:flex-row
          `}
          style={{ top: '100%' }}
        >
          {/* Main label */}
          <div className="w-full text-center font-semibold text-lg mb-4 text-white">Select Date Range</div>
          <div className="flex flex-col sm:flex-row flex-1">
            {/* Sidebar */}
            <div className="flex flex-col w-full sm:w-48 border-r border-gray-700 pr-0 sm:pr-4 mb-4 sm:mb-0">
              {SIDEBAR_RANGES.map((r, idx) => (
                <button
                  key={r.label}
                  className={`text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors font-normal text-gray-300 ${activeQuick === idx ? 'bg-pink-500/20 text-pink-400' : 'hover:bg-pink-500/10 hover:text-pink-400'}`}
                  onClick={() => handleSidebarClick(r.range(), idx)}
                  type="button"
                >
                  {r.label}
                </button>
              ))}
              <button
                className={`text-left px-3 py-2 rounded-lg text-sm mt-2 ${activeQuick === null ? 'bg-pink-500/20 text-pink-400' : 'hover:bg-pink-500/10 hover:text-pink-400'}`}
                disabled
              >
                Custom
              </button>
            </div>
            {/* Calendar */}
            <div className="flex flex-col flex-1 pl-0 sm:pl-4">
              <div className="flex gap-4 justify-center items-start">
                {/* Month navigation */}
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-600 text-gray-400 hover:bg-gray-700 mr-2 mt-8 bg-gray-800"
                  onClick={handlePrevMonth}
                  type="button"
                  aria-label="Previous month"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                </button>
                <CalendarMonth
                  year={month.getFullYear()}
                  month={month.getMonth()}
                  startDate={tempRange.startDate}
                  endDate={tempRange.endDate}
                  selecting={selecting}
                  onSelect={handleCalendarSelect}
                  minDate={minDate}
                  maxDate={maxDate}
                  onMonthChange={handleMonthChange}
                  onYearChange={handleYearChange}
                  className="text-white"
                />
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-600 text-gray-400 hover:bg-gray-700 ml-2 mt-8 bg-gray-800"
                  onClick={handleNextMonth}
                  type="button"
                  aria-label="Next month"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
                  onClick={handleCancel}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
                  onClick={handleClear}
                  type="button"
                >
                  Clear Filter
                </button>
                <button
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600"
                  onClick={handleApply}
                  type="button"
                  disabled={!(tempRange.startDate && tempRange.endDate)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

CommonDateRange.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  showPredefinedRanges: PropTypes.bool,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date)
};

export default CommonDateRange;