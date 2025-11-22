import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useState } from "react"

interface FilterOption {
  value: string
  label: string
}

interface FiltersBarProps {
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  filters?: {
    label: string
    key: string
    options: FilterOption[]
    value?: string
    onChange?: (value: string) => void
  }[]
  onDateRangeChange?: (from: string, to: string) => void
  className?: string
}

export function FiltersBar({
  searchPlaceholder = "Search...",
  onSearchChange,
  filters,
  onDateRangeChange,
  className,
}: FiltersBarProps) {
  const [searchValue, setSearchValue] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearchChange?.(value)
  }

  const handleDateChange = () => {
    if (dateFrom && dateTo) {
      onDateRangeChange?.(dateFrom, dateTo)
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border ${className}`}>
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      {filters?.map((filter) => (
        <div key={filter.key} className="min-w-[150px]">
          <Select
            value={filter.value || ""}
            onChange={(e) => filter.onChange?.(e.target.value)}
          >
            <option value="">All {filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      ))}

      {/* Date Range */}
      {onDateRangeChange && (
        <>
          <div className="min-w-[150px]">
            <Input
              type="date"
              placeholder="From"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                handleDateChange()
              }}
            />
          </div>
          <div className="min-w-[150px]">
            <Input
              type="date"
              placeholder="To"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                handleDateChange()
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}

