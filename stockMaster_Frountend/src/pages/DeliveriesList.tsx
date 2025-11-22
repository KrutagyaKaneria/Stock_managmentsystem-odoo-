import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router-dom"
import { deliveriesAPI } from "@/services/api"
import { DataTable, Column } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { FiltersBar } from "@/components/FiltersBar"
import { StatusBadge } from "@/components/StatusBadge"
import { formatDate } from "@/lib/utils"
import type { Delivery } from "@/types"
import { useToast } from "@/hooks/useToast"
import { useState } from "react"

export function DeliveriesList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const limit = 20

  const status = searchParams.get("status") || ""
  const warehouseId = searchParams.get("warehouse_id") || ""

  const { data, isLoading } = useQuery({
    queryKey: ["deliveries", status, warehouseId, page],
    queryFn: () =>
      deliveriesAPI
        .list({
          status: status || undefined,
          warehouse_id: warehouseId ? Number(warehouseId) : undefined,
          page,
          limit,
        })
        .then((res) => res.data),
  })

  const deliveries = data?.deliveries || []
  const pagination = data?.pagination

  const columns: Column<Delivery>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (delivery) => (
        <button
          onClick={() => navigate(`/deliveries/${delivery.id}`)}
          className="text-primary hover:underline"
        >
          {delivery.reference}
        </button>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (delivery) => formatDate(delivery.created_at),
    },
    {
      key: "customer_name",
      header: "Customer",
      render: (delivery) => delivery.customer_name || "-",
    },
    { key: "warehouse_name", header: "Warehouse" },
    {
      key: "total_items",
      header: "Items",
      render: (delivery) => `${delivery.total_items} items`,
    },
    {
      key: "status",
      header: "Status",
      render: (delivery) => <StatusBadge status={delivery.status} />,
    },
  ]

  const handleDelete = async (delivery: Delivery) => {
    if (window.confirm(`Are you sure you want to delete delivery ${delivery.reference}?`)) {
      try {
        await deliveriesAPI.delete(delivery.id)
        toast({
          title: "Success",
          description: "Delivery deleted successfully",
          variant: "success",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete delivery",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div>
      <PageHeader
        title="Deliveries (Outgoing Stock)"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Deliveries", href: "/deliveries" },
        ]}
        action={{
          label: "Create Delivery",
          href: "/deliveries/create",
        }}
      />

      <FiltersBar
        searchPlaceholder="Search deliveries..."
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
          data={deliveries}
          columns={columns}
          isLoading={isLoading}
          onView={(delivery) => navigate(`/deliveries/${delivery.id}`)}
          onEdit={(delivery) => navigate(`/deliveries/${delivery.id}/edit`)}
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
