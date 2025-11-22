import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { receiptsAPI } from "@/services/api"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable, Column } from "@/components/DataTable"
import { StatusBadge } from "@/components/StatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { Edit, Trash2, Package } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import type { ReceiptLine } from "@/types"

export function ReceiptDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ["receipt", id],
    queryFn: () => receiptsAPI.getById(Number(id!)).then((res) => res.data),
  })

  const receipt = data?.receipt

  const lineColumns: Column<ReceiptLine>[] = [
    { key: "product_name", header: "Product" },
    {
      key: "qty_expected",
      header: "Expected Qty",
      render: (line) => `${line.qty_expected} ${line.uom}`,
    },
    {
      key: "qty_received",
      header: "Received Qty",
      render: (line) =>
        line.qty_received !== null && line.qty_received !== undefined
          ? `${line.qty_received} ${line.uom}`
          : "-",
    },
    { key: "uom", header: "UOM" },
  ]

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete receipt ${receipt?.reference}?`)) {
      try {
        await receiptsAPI.delete(Number(id!))
        toast({
          title: "Success",
          description: "Receipt deleted successfully",
          variant: "success",
        })
        navigate("/receipts")
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete receipt",
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

  if (!receipt) {
    return <div>Receipt not found</div>
  }

  const canReceive = receipt.status === "ready" || receipt.status === "waiting"

  return (
    <div>
      <PageHeader
        title={`Receipt ${receipt.reference}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Receipts", href: "/receipts" },
          { label: receipt.reference },
        ]}
      />

      <div className="mt-6 space-y-6">
        <div className="flex gap-4">
          <StatusBadge status={receipt.status} />
          {canReceive && (
            <Button onClick={() => navigate(`/receipts/${id}/receive`)}>
              <Package className="mr-2 h-4 w-4" />
              Receive Stock
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(`/receipts/${id}/edit`)}>
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
            <CardTitle>Receipt Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Reference</label>
                <p className="text-base font-semibold">{receipt.reference}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Supplier</label>
                <p className="text-base">{receipt.supplier_name || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Warehouse</label>
                <p className="text-base">{receipt.warehouse_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-base">{receipt.location_name || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <StatusBadge status={receipt.status} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-base">{formatDate(receipt.created_at)}</p>
              </div>
              {receipt.notes && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-base">{receipt.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            {receipt.lines && receipt.lines.length > 0 ? (
              <DataTable data={receipt.lines} columns={lineColumns} />
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No products</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

