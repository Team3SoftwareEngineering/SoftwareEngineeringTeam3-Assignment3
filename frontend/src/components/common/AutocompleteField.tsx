import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface AutocompleteFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  emptyText?: string
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function scoreOption(option: string, query: string) {
  const normalizedOption = normalize(option)

  if (!query) return 2
  if (normalizedOption === query) return 0
  if (normalizedOption.startsWith(query)) return 1
  if (normalizedOption.includes(query)) return 2
  return 3
}

export function AutocompleteField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  emptyText = 'No matches found',
}: AutocompleteFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const listboxId = `${id}-listbox`

  const filteredOptions = useMemo(() => {
    const query = normalize(value)
    const seen = new Set<string>()

    return options
      .map((option) => option.trim())
      .filter(Boolean)
      .filter((option) => {
        const key = option.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return !query || key.includes(query)
      })
      .sort((a, b) => {
        const scoreDiff = scoreOption(a, query) - scoreOption(b, query)
        return scoreDiff !== 0 ? scoreDiff : a.localeCompare(b)
      })
      .slice(0, 8)
  }, [options, value])

  const clampedActiveIndex =
    filteredOptions.length > 0
      ? Math.min(activeIndex, filteredOptions.length - 1)
      : -1

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectOption(option: string) {
    onChange(option)
    setIsOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!filteredOptions.length) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setActiveIndex(-1)
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((current) => {
        const normalizedCurrent =
          filteredOptions.length > 0
            ? Math.min(current, filteredOptions.length - 1)
            : -1
        return normalizedCurrent < filteredOptions.length - 1
          ? normalizedCurrent + 1
          : 0
      })
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((current) => {
        const normalizedCurrent =
          filteredOptions.length > 0
            ? Math.min(current, filteredOptions.length - 1)
            : -1
        return normalizedCurrent > 0
          ? normalizedCurrent - 1
          : filteredOptions.length - 1
      })
    }

    if (event.key === 'Enter' && isOpen) {
      event.preventDefault()
      if (clampedActiveIndex >= 0) {
        selectOption(filteredOptions[clampedActiveIndex])
      } else if (filteredOptions.length === 1) {
        selectOption(filteredOptions[0])
      }
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className="block space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-text-primary">
        {label}
      </label>

      <div className="relative">
        <div className="flex items-center rounded-control border border-slate-300 bg-white shadow-panelSm transition focus-within:border-accent-navy/60 focus-within:ring-2 focus-within:ring-accent-navy/10">
          <input
            id={id}
            value={value}
            autoComplete="off"
            placeholder={placeholder}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            onFocus={() => setIsOpen(true)}
            onChange={(event) => {
              onChange(event.target.value)
              setIsOpen(true)
              setActiveIndex(-1)
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              requestAnimationFrame(() => {
                if (!containerRef.current?.contains(document.activeElement)) {
                  setIsOpen(false)
                  setActiveIndex(-1)
                }
              })
            }}
            className="w-full rounded-control border-0 bg-transparent px-3 py-2.5 pr-10 text-sm outline-none placeholder:text-slate-400"
          />

          <ChevronDown
            className={`pointer-events-none absolute right-3 h-4 w-4 text-slate-400 transition ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>

        {isOpen ? (
          <div
            id={listboxId}
            role="listbox"
            className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-2xl ring-1 ring-black/5"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isActive = index === clampedActiveIndex
                const isSelected = option === value

                return (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      selectOption(option)
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      isActive
                        ? 'bg-accent-navy text-white'
                        : 'text-text-primary hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{option}</span>
                    {isSelected ? (
                      <Check className="ml-3 h-4 w-4 shrink-0" />
                    ) : null}
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-2.5 text-sm text-text-secondary">
                {emptyText}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
