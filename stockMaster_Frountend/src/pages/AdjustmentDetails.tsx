import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { adjustmentsAPI } from "@/services/api"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable, Column } from "@/components/DataTable"
import { StatusBadge } from "@/components/StatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import type { AdjustmentLine } from "@/types"

export function AdjustmentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ["adjustment", id],
    queryFn: () => adjustmentsAPI.getById(Number(id!)).then((res) => res.data),
  })

  const adjustment = data?.adjustment

  const lineColumns: Column<AdjustmentLine>[] = [
    { key: "product_name", header: "Product" },
    {
      key: "qty_counted",
      header: "Counted Qty",
      render: (line) => `${line.qty_counted} ${line.uom || ""}`,
    },
    {
      key: "reason",
      header: "Reason",
      render: (line) => line.reason || "-",
    },
    { key: "uom", header: "UOM", render: (line) => line.uom || "-" },
  ]

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete adjustment ${adjustment?.reference}?`)) {
      try {
        await adjustmentsAPI.delete(Number(id!))
        toast({
          title: "Success",
          description: "Adjustment deleted successfully",
          variant: "success",
        })
        navigate("/adjustments")
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete adjustment",
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

  if (!adjustment) {
    return <div>Adjustment not found</div>
  }

  return (
    <div>
      <PageHeader
        title={`Adjustment ${adjustment.reference}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Adjustments", href: "/adjustments" },
          { label: adjustment.reference },
        ]}
      />

      <div className="mt-6 space-y-6">
        <div className="flex gap-4">
          <StatusBadge status={adjustment.status} />
          <Button variant="outline" onClick={() => navigate(`/adjustments/${id}/edit`)}>
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
            <CardTitle>Adjustment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Reference</label>
                <p className="text-base font-semibold">{adjustment.reference}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Warehouse</label>
                <p className="text-base">{adjustment.warehouse_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-base">{adjustment.location_name || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <StatusBadge status={adjustment.status} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-base">{formatDate(adjustment.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            {adjustment.lines && adjustment.lines.length > 0 ? (
              <DataTable data={adjustment.lines} columns={lineColumns} />
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No products</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

