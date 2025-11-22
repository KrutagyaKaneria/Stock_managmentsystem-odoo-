import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router-dom"
import { transfersAPI } from "@/services/api"
import { DataTable, Column } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { FiltersBar } from "@/components/FiltersBar"
import { StatusBadge } from "@/components/StatusBadge"
import { formatDate } from "@/lib/utils"
import type { Transfer } from "@/types"
import { useToast } from "@/hooks/useToast"
import { useState } from "react"

export function TransfersList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const limit = 20

  const status = searchParams.get("status") || ""
  const warehouseId = searchParams.get("warehouse_id") || ""

  const { data, isLoading } = useQuery({
    queryKey: ["transfers", status, warehouseId, page],
    queryFn: () =>
      transfersAPI
        .list({
          status: status || undefined,
          warehouse_id: warehouseId ? Number(warehouseId) : undefined,
          page,
          limit,
        })
        .then((res) => res.data),
  })

  const transfers = data?.transfers || []
  const pagination = data?.pagination

  const columns: Column<Transfer>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (transfer) => (
        <button
          onClick={() => navigate(`/transfers/${transfer.id}`)}
          className="text-primary hover:underline"
        >
          {transfer.reference}
        </button>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (transfer) => formatDate(transfer.created_at),
    },
    {
      key: "from_location_name",
      header: "From → To",
      render: (transfer) => (
        <span>
          {transfer.from_warehouse_name || transfer.from_location_name} →{" "}
          {transfer.to_warehouse_name || transfer.to_location_name}
        </span>
      ),
    },
    {
      key: "total_items",
      header: "Items",
      render: (transfer) => `${transfer.total_items} items`,
    },
    {
      key: "status",
      header: "Status",
      render: (transfer) => <StatusBadge status={transfer.status} />,
    },
  ]

  const handleDelete = async (transfer: Transfer) => {
    if (window.confirm(`Are you sure you want to delete transfer ${transfer.reference}?`)) {
      try {
        await transfersAPI.delete(transfer.id)
        toast({
          title: "Success",
          description: "Transfer deleted successfully",
          variant: "success",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete transfer",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div>
      <PageHeader
        title="Internal Transfers"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Transfers", href: "/transfers" },
        ]}
        action={{
          label: "Create Transfer",
          href: "/transfers/create",
        }}
      />

      <FiltersBar
        searchPlaceholder="Search transfers..."
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
          data={transfers}
          columns={columns}
          isLoading={isLoading}
          onView={(transfer) => navigate(`/transfers/${transfer.id}`)}
          onEdit={(transfer) => navigate(`/transfers/${transfer.id}/edit`)}
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
