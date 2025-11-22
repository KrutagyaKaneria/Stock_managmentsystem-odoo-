import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router-dom"
import { stockMovesAPI } from "@/services/api"
import { DataTable, Column } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { FiltersBar } from "@/components/FiltersBar"
import { StatusBadge } from "@/components/StatusBadge"
import { formatDateTime } from "@/lib/utils"
import type { StockMoveDetail } from "@/types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function StockHistoryPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)

  const productId = searchParams.get("product_id") || ""
  const type = searchParams.get("type") || ""
  const warehouseId = searchParams.get("warehouse_id") || ""
  const dateFrom = searchParams.get("date_from") || ""
  const dateTo = searchParams.get("date_to") || ""

  const { data, isLoading } = useQuery({
    queryKey: ["stock-moves", productId, type, warehouseId, dateFrom, dateTo, page, limit],
    queryFn: () =>
      stockMovesAPI
        .list({
          product_id: productId ? Number(productId) : undefined,
          type: type || undefined,
          warehouse_id: warehouseId ? Number(warehouseId) : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          page,
          limit,
        })
        .then((res) => res.data),
  })

  const moves = data?.moves || []
  const pagination = data?.pagination

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "receipt":
        return "bg-blue-100 text-blue-700"
      case "delivery":
        return "bg-orange-100 text-orange-700"
      case "internal":
        return "bg-purple-100 text-purple-700"
      case "adjustment":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const columns: Column<StockMoveDetail>[] = [
    {
      key: "created_at",
      header: "Date",
      render: (move) => formatDateTime(move.created_at),
    },
    {
      key: "type",
      header: "Type",
      render: (move) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getTypeBadgeClass(move.type)}`}>
          {move.type}
        </span>
      ),
    },
    { key: "product_name", header: "Product" },
    {
      key: "reference",
      header: "Reference",
      render: (move) => (
        <button
          onClick={() => {
            if (move.type === "receipt") navigate(`/receipts?search=${move.reference}`)
            else if (move.type === "delivery") navigate(`/deliveries?search=${move.reference}`)
            else if (move.type === "internal") navigate(`/transfers?search=${move.reference}`)
            else navigate(`/adjustments?search=${move.reference}`)
          }}
          className="text-primary hover:underline"
        >
          {move.reference}
        </button>
      ),
    },
    {
      key: "from_location",
      header: "From → To",
      render: (move) => (
        <span>
          {move.from_location || "External"} → {move.to_location || "External"}
        </span>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (move) => (
        <span className={move.quantity > 0 ? "text-success font-semibold" : "text-destructive font-semibold"}>
          {move.quantity > 0 ? "+" : ""}
          {move.quantity} {move.uom}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (move) => <StatusBadge status={move.status} />,
    },
  ]

  const handleExport = () => {
    // TODO: Implement CSV export
    alert("Export functionality to be implemented")
  }

  return (
    <div>
      <PageHeader
        title="Stock Movement History"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Stock History" },
        ]}
        action={{
          label: "Export CSV",
          onClick: handleExport,
        }}
      />

      <FiltersBar
        searchPlaceholder="Filter stock moves..."
        filters={[
          {
            label: "Type",
            key: "type",
            options: [
              { value: "receipt", label: "Receipt" },
              { value: "delivery", label: "Delivery" },
              { value: "internal", label: "Internal" },
              { value: "adjustment", label: "Adjustment" },
            ],
            value: type,
            onChange: (value) => {
              const params = new URLSearchParams(searchParams)
              if (value) {
                params.set("type", value)
              } else {
                params.delete("type")
              }
              setSearchParams(params)
              setPage(1)
            },
          },
        ]}
        onDateRangeChange={(from, to) => {
          const params = new URLSearchParams(searchParams)
          if (from) params.set("date_from", from)
          else params.delete("date_from")
          if (to) params.set("date_to", to)
          else params.delete("date_to")
          setSearchParams(params)
          setPage(1)
        }}
      />

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
            <span className="text-sm text-gray-600">results per page</span>
          </div>
        </div>

        <DataTable
          data={moves}
          columns={columns}
          isLoading={isLoading}
          pagination={
            pagination
              ? {
                  page: pagination.page,
                  pageSize: pagination.limit,
                  total: pagination.total,
                  onPageChange: setPage,
                }
              : undefined
          }
        />
      </div>
    </div>
  )
}
