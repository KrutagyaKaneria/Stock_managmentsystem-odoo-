import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { transfersAPI } from "@/services/api"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable, Column } from "@/components/DataTable"
import { StatusBadge } from "@/components/StatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { Edit, Trash2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import type { TransferLine } from "@/types"

export function TransferDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ["transfer", id],
    queryFn: () => transfersAPI.getById(Number(id!)).then((res) => res.data),
  })

  const transfer = data?.transfer

  const lineColumns: Column<TransferLine>[] = [
    { key: "product_name", header: "Product" },
    {
      key: "qty",
      header: "Quantity",
      render: (line) => `${line.qty} ${line.uom}`,
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
    if (window.confirm(`Are you sure you want to delete transfer ${transfer?.reference}?`)) {
      try {
        await transfersAPI.delete(Number(id!))
        toast({
          title: "Success",
          description: "Transfer deleted successfully",
          variant: "success",
        })
        navigate("/transfers")
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete transfer",
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

  if (!transfer) {
    return <div>Transfer not found</div>
  }

  const canValidate = transfer.status === "ready" || transfer.status === "waiting"

  return (
    <div>
      <PageHeader
        title={`Transfer ${transfer.reference}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Transfers", href: "/transfers" },
          { label: transfer.reference },
        ]}
      />

      <div className="mt-6 space-y-6">
        <div className="flex gap-4">
          <StatusBadge status={transfer.status} />
          {canValidate && (
            <Button onClick={() => navigate(`/transfers/${id}/validate`)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Validate Transfer
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(`/transfers/${id}/edit`)}>
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
            <CardTitle>Transfer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Reference</label>
                <p className="text-base font-semibold">{transfer.reference}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">From</label>
                <p className="text-base">
                  {transfer.from_warehouse_name || ""} {transfer.from_location_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">To</label>
                <p className="text-base">
                  {transfer.to_warehouse_name || ""} {transfer.to_location_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <StatusBadge status={transfer.status} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-base">{formatDate(transfer.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            {transfer.lines && transfer.lines.length > 0 ? (
              <DataTable data={transfer.lines} columns={lineColumns} />
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No products</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

