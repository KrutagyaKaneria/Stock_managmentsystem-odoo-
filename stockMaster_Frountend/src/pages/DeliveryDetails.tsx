import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { deliveriesAPI } from "@/services/api"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable, Column } from "@/components/DataTable"
import { StatusBadge } from "@/components/StatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { Edit, Trash2, Package, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import type { DeliveryLine } from "@/types"

export function DeliveryDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ["delivery", id],
    queryFn: () => deliveriesAPI.getById(Number(id!)).then((res) => res.data),
  })

  const delivery = data?.delivery

  const lineColumns: Column<DeliveryLine>[] = [
    { key: "product_name", header: "Product" },
    {
      key: "qty_ordered",
      header: "Ordered Qty",
      render: (line) => `${line.qty_ordered} ${line.uom}`,
    },
    {
      key: "qty_picked",
      header: "Picked Qty",
      render: (line) =>
        line.qty_picked !== null && line.qty_picked !== undefined
          ? `${line.qty_picked} ${line.uom}`
          : "-",
    },
    { key: "uom", header: "UOM" },
  ]

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete delivery ${delivery?.reference}?`)) {
      try {
        await deliveriesAPI.delete(Number(id!))
        toast({
          title: "Success",
          description: "Delivery deleted successfully",
          variant: "success",
        })
        navigate("/deliveries")
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete delivery",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!delivery) {
    return <div>Delivery not found</div>
  }

  const canPick = delivery.status === "draft" || delivery.status === "waiting"
  const canValidate = delivery.status === "ready"

  return (
    <div>
      <PageHeader
        title={`Delivery ${delivery.reference}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Deliveries", href: "/deliveries" },
          { label: delivery.reference },
        ]}
      />

      <div className="mt-6 space-y-6">
        <div className="flex gap-4">
          <StatusBadge status={delivery.status} />
          {canPick && (
            <Button onClick={() => navigate(`/deliveries/${id}/pick`)}>
              <Package className="mr-2 h-4 w-4" />
              Pick Items
            </Button>
          )}
          {canValidate && (
            <Button onClick={() => navigate(`/deliveries/${id}/validate`)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Validate Delivery
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(`/deliveries/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Reference</label>
                <p className="text-base font-semibold">{delivery.reference}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Customer</label>
                <p className="text-base">{delivery.customer_name || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Warehouse</label>
                <p className="text-base">{delivery.warehouse_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-base">{delivery.location_name || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <StatusBadge status={delivery.status} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-base">{formatDate(delivery.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            {delivery.lines && delivery.lines.length > 0 ? (
              <DataTable data={delivery.lines} columns={lineColumns} />
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No products</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

