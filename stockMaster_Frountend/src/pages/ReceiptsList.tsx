import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router-dom"
import { receiptsAPI } from "@/services/api"
import { DataTable, Column } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { FiltersBar } from "@/components/FiltersBar"
import { StatusBadge } from "@/components/StatusBadge"
import { formatDate } from "@/lib/utils"
import type { Receipt } from "@/types"
import { useToast } from "@/hooks/useToast"
import { useState } from "react"

export function ReceiptsList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const limit = 20

  const status = searchParams.get("status") || ""
  const warehouseId = searchParams.get("warehouse_id") || ""

  const { data, isLoading } = useQuery({
    queryKey: ["receipts", status, warehouseId, page],
    queryFn: () =>
      receiptsAPI
        .list({
          status: status || undefined,
          warehouse_id: warehouseId ? Number(warehouseId) : undefined,
          page,
          limit,
        })
        .then((res) => res.data),
  })

  const receipts = data?.receipts || []
  const pagination = data?.pagination

  const columns: Column<Receipt>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (receipt) => (
        <button
          onClick={() => navigate(`/receipts/${receipt.id}`)}
          className="text-primary hover:underline"
        >
          {receipt.reference}
        </button>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (receipt) => formatDate(receipt.created_at),
    },
    {
      key: "supplier_name",
      header: "Supplier",
      render: (receipt) => receipt.supplier_name || "-",
    },
    { key: "warehouse_name", header: "Warehouse" },
    {
      key: "total_items",
      header: "Items",
      render: (receipt) => `${receipt.total_items} items`,
    },
    {
      key: "status",
      header: "Status",
      render: (receipt) => <StatusBadge status={receipt.status} />,
    },
  ]

  const handleDelete = async (receipt: Receipt) => {
    if (window.confirm(`Are you sure you want to delete receipt ${receipt.reference}?`)) {
      try {
        await receiptsAPI.delete(receipt.id)
        toast({
          title: "Success",
          description: "Receipt deleted successfully",
          variant: "success",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete receipt",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div>
      <PageHeader
        title="Receipts (Incoming Stock)"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Receipts", href: "/receipts" },
        ]}
        action={{
          label: "Create Receipt",
          href: "/receipts/create",
        }}
      />

      <FiltersBar
        searchPlaceholder="Search receipts..."
        filters={[
          {
            label: "Status",
            key: "status",
            options: [
              { value: "draft", label: "Draft" },
              { value: "waiting", label: "Waiting" },
              { value: "ready", label: "Ready" },
              { value: "done", label: "Done" },
              { value: "canceled", label: "Canceled" },
            ],
            value: status,
            onChange: (value) => {
              const params = new URLSearchParams(searchParams)
              if (value) {
                params.set("status", value)
              } else {
                params.delete("status")
              }
              setSearchParams(params)
              setPage(1)
            },
          },
        ]}
      />

      <div className="mt-6">
        <DataTable
          data={receipts}
          columns={columns}
          isLoading={isLoading}
          onView={(receipt) => navigate(`/receipts/${receipt.id}`)}
          onEdit={(receipt) => navigate(`/receipts/${receipt.id}/edit`)}
          onDelete={handleDelete}
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
