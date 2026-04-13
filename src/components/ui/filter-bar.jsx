import { ChevronDown, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

/**
 * Compact month/year dropdown select.
 */
function MonthSelect({ options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedLabel = value
    ? options.find((o) => o.key === value)?.label ?? value
    : 'Todos os períodos'

  return (
    <div className="filter-bar__month" ref={ref}>
      <button
        type="button"
        className="filter-bar__month-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={`filter-bar__month-chevron ${open ? 'filter-bar__month-chevron--open' : ''}`}
        />
      </button>

      {open && (
        <ul className="filter-bar__month-list" role="listbox">
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              className={`filter-bar__month-option ${value === null ? 'filter-bar__month-option--active' : ''}`}
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              Todos os períodos
            </button>
          </li>
          {options.map((opt) => (
            <li key={opt.key}>
              <button
                type="button"
                role="option"
                aria-selected={value === opt.key}
                className={`filter-bar__month-option ${value === opt.key ? 'filter-bar__month-option--active' : ''}`}
                onClick={() => {
                  onChange(opt.key)
                  setOpen(false)
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Category chip toggles.
 */
function CategoryChips({ options, active, onToggle }) {
  return (
    <div className="filter-bar__chips" role="group" aria-label="Filtrar por categoria">
      {options.map((opt) => {
        const isActive = active.has(opt.normalized)
        return (
          <button
            key={opt.normalized}
            type="button"
            role="checkbox"
            aria-checked={isActive}
            className={`filter-bar__chip ${isActive ? 'filter-bar__chip--active' : ''}`}
            onClick={() => onToggle(opt.normalized)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Reactive filter bar. Sits between the featured hero and the grid feed.
 *
 * Props:
 *  - monthOptions: derived month options
 *  - categoryOptions: derived category options
 *  - activeMonth: string | null
 *  - activeCategories: Set<string>
 *  - onMonthChange: (key | null) => void
 *  - onCategoryToggle: (normalized) => void
 *  - onClearFilters: () => void
 */
export function FilterBar({
  monthOptions,
  categoryOptions,
  activeMonth,
  activeCategories,
  onMonthChange,
  onCategoryToggle,
  onClearFilters,
}) {
  const hasFilters = activeMonth !== null || activeCategories.size > 0

  return (
    <div className="filter-bar">
      <div className="filter-bar__controls">
        <MonthSelect
          options={monthOptions}
          value={activeMonth}
          onChange={onMonthChange}
        />

        {categoryOptions.length > 0 && (
          <CategoryChips
            options={categoryOptions}
            active={activeCategories}
            onToggle={onCategoryToggle}
          />
        )}
      </div>

      {hasFilters && (
        <button
          type="button"
          className="filter-bar__clear"
          onClick={onClearFilters}
        >
          <X size={14} />
          Limpar filtros
        </button>
      )}
    </div>
  )
}
