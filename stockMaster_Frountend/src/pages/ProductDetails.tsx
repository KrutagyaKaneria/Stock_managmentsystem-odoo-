import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { productsAPI } from "@/services/api"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable, Column } from "@/components/DataTable"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/useToast"
import { Edit, Trash2, History } from "lucide-react"
import type { StockByLocation } from "@/types"

export function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsAPI.getById(Number(id!)).then((res) => res.data),
  })

  const product = data?.product
  const stockByLocation = data?.stock_by_location || []

  const stockColumns: Column<StockByLocation>[] = [
    { key: "warehouse_name", header: "Warehouse" },
    { key: "location_name", header: "Location" },
    {
      key: "quantity",
      header: "Quantity",
      render: (item) => `${item.quantity} ${item.uom}`,
    },
    { key: "uom", header: "UOM" },
  ]

  const totalStock = stockByLocation.reduce((sum, item) => sum + item.quantity, 0)

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${product?.name}?`)) {
      try {
        await productsAPI.delete(Number(id!))
        toast({
          title: "Success",
          description: "Product deleted successfully",
          variant: "success",
        })
        navigate("/products")
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete product",
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

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div>
      <PageHeader
        title={`${product.name} (${product.sku})`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: product.name },
        ]}
        action={{
          label: "Edit Product",
          onClick: () => navigate(`/products/${id}/edit`),
        }}
      />

      <div className="mt-6 space-y-6">
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate(`/products/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
          <Button variant="outline" onClick={() => navigate(`/stock-history?product_id=${id}`)}>
            <History className="mr-2 h-4 w-4" />
            View Stock History
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-base font-semibold">{product.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">SKU</label>
                <p className="text-base font-semibold">{product.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="text-base">{product.category_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Unit</label>
                <p className="text-base">{product.uom}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Reorder Level</label>
                <p className="text-base">{product.reorder_level} {product.uom}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-base">{product.created_at ? formatDate(product.created_at) : "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock by Location</CardTitle>
          </CardHeader>
          <CardContent>
            {stockByLocation.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No stock locations found</p>
            ) : (
              <>
                <DataTable data={stockByLocation} columns={stockColumns} />
                <div className="mt-4 text-right">
                  <p className="text-lg font-semibold">
                    Total Stock: {totalStock} {product.uom}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

