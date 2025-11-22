import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router-dom"
import { adjustmentsAPI } from "@/services/api"
import { DataTable, Column } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { FiltersBar } from "@/components/FiltersBar"
import { StatusBadge } from "@/components/StatusBadge"
import { formatDate } from "@/lib/utils"
import type { Adjustment } from "@/types"
import { useToast } from "@/hooks/useToast"
import { useState } from "react"

export function AdjustmentsList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const limit = 20

  const status = searchParams.get("status") || ""
  const warehouseId = searchParams.get("warehouse_id") || ""

  const { data, isLoading } = useQuery({
    queryKey: ["adjustments", status, warehouseId, page],
    queryFn: () =>
      adjustmentsAPI
        .list({
          status: status || undefined,
          warehouse_id: warehouseId ? Number(warehouseId) : undefined,
          page,
          limit,
        })
        .then((res) => res.data),
  })

  const adjustments = data?.adjustments || []
  const pagination = data?.pagination

  const columns: Column<Adjustment>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (adjustment) => (
        <button
          onClick={() => navigate(`/adjustments/${adjustment.id}`)}
          className="text-primary hover:underline"
        >
          {adjustment.reference}
        </button>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (adjustment) => formatDate(adjustment.created_at),
    },
    { key: "warehouse_name", header: "Warehouse" },
    {
      key: "location_name",
      header: "Location",
      render: (adjustment) => adjustment.location_name || "-",
    },
    {
      key: "total_items",
      header: "Items",
      render: (adjustment) => `${adjustment.total_items} items`,
    },
    {
      key: "status",
      header: "Status",
      render: (adjustment) => <StatusBadge status={adjustment.status} />,
    },
  ]

  const handleDelete = async (adjustment: Adjustment) => {
    if (window.confirm(`Are you sure you want to delete adjustment ${adjustment.reference}?`)) {
      try {
        await adjustmentsAPI.delete(adjustment.id)
        toast({
          title: "Success",
          description: "Adjustment deleted successfully",
          variant: "success",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete adjustment",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div>
      <PageHeader
        title="Stock Adjustments"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Adjustments", href: "/adjustments" },
        ]}
        action={{
          label: "Create Adjustment",
          href: "/adjustments/create",
        }}
      />

      <FiltersBar
        searchPlaceholder="Search adjustments..."
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
          data={adjustments}
          columns={columns}
          isLoading={isLoading}
          onView={(adjustment) => navigate(`/adjustments/${adjustment.id}`)}
          onEdit={(adjustment) => navigate(`/adjustments/${adjustment.id}/edit`)}
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
