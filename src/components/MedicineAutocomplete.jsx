import { useEffect, useRef, useState } from 'react'
import { DRUG_DATABASE } from '../lib/drugDatabase'

const MAX_SUGGESTIONS = 8

function matches(query, drug) {
  const q = query.trim().toLowerCase()
  if (!q) return false
  if (drug.name.toLowerCase().includes(q)) return true
  return drug.aliases.some((a) => a.toLowerCase().includes(q))
}

// Real-time medicine-name autocomplete backed by the full DRUG_DATABASE
// reference list (not just a handful of quick-select shortcuts). Used
// anywhere a patient or clinician types a medication name, so suggestions
// stay consistent across the app.
export default function MedicineAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search or enter medication name…',
  className = '',
  inputClassName = '',
  required = false,
}) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const wrapRef = useRef(null)

  const suggestions = open ? DRUG_DATABASE.filter((d) => matches(value, d)).slice(0, MAX_SUGGESTIONS) : []

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const choose = (name) => {
    onChange(name)
    setOpen(false)
    setHighlight(-1)
    onSelect?.(name)
  }

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => (h + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1))
    } else if (e.key === 'Enter') {
      if (highlight >= 0) {
        e.preventDefault()
        choose(suggestions[highlight].name)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        required={required}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setHighlight(-1)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClassName}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1">
          {suggestions.map((d, i) => (
            <li key={d.name}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(d.name)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-2 ${
                  i === highlight ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50 text-ink-900'
                }`}
              >
                <span className="font-medium">{d.name}</span>
                <span className="text-xs text-slate-400 shrink-0">{d.drugClass}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
