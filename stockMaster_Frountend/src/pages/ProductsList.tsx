import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router-dom"
import { productsAPI } from "@/services/api"
import { DataTable, Column } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { FiltersBar } from "@/components/FiltersBar"
import { formatDate } from "@/lib/utils"
import type { Product } from "@/types"
import { useToast } from "@/hooks/useToast"
import { useState } from "react"

export function ProductsList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const limit = 20

  const search = searchParams.get("search") || ""
  const categoryId = searchParams.get("category_id") || ""
  const warehouseId = searchParams.get("warehouse_id") || ""

  const { data, isLoading } = useQuery({
    queryKey: ["products", search, categoryId, warehouseId, page],
    queryFn: () =>
      productsAPI
        .list({
          search: search || undefined,
          category_id: categoryId ? Number(categoryId) : undefined,
          warehouse_id: warehouseId ? Number(warehouseId) : undefined,
          page,
          limit,
        })
        .then((res) => res.data),
  })

  const products = data?.products || []
  const pagination = data?.pagination

  const columns: Column<Product>[] = [
    {
      key: "id",
      header: "ID",
      render: (product) => `#${product.id}`,
    },
    { key: "sku", header: "SKU" },
    { key: "name", header: "Name" },
    { key: "category_name", header: "Category" },
    { key: "uom", header: "UOM" },
    {
      key: "initial_stock",
      header: "Initial Stock",
      render: (product) => `${product.initial_stock} ${product.uom}`,
    },
    {
      key: "reorder_level",
      header: "Reorder Level",
      render: (product) => `${product.reorder_level} ${product.uom}`,
    },
  ]

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await productsAPI.delete(product.id)
        toast({
          title: "Success",
          description: "Product deleted successfully",
          variant: "success",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete product",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div>
      <PageHeader
        title="Products"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
        ]}
        action={{
          label: "Create Product",
          href: "/products/create",
        }}
      />

      <FiltersBar
        searchPlaceholder="Search by name or SKU..."
        onSearchChange={(value) => {
          const params = new URLSearchParams(searchParams)
          if (value) {
            params.set("search", value)
          } else {
            params.delete("search")
          }
          setSearchParams(params)
          setPage(1)
        }}
      />

      <div className="mt-6">
        <DataTable
          data={products}
          columns={columns}
          isLoading={isLoading}
          onView={(product) => navigate(`/products/${product.id}`)}
          onEdit={(product) => navigate(`/products/${product.id}/edit`)}
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
