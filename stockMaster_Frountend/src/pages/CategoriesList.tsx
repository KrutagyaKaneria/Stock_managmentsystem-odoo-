import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/DataTable"
import { categoriesAPI } from "@/services/api"

export function CategoriesList() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.list()
  })

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/inventory/categories/${row.original.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/inventory/categories/${row.original.id}`}>View</Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button asChild>
          <Link to="/inventory/categories/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>
      
      <div className="bg-white rounded-lg border">
        <DataTable
          columns={columns}
          data={categories?.categories || []}
          isLoading={isLoading}
          searchKey="name"
        />
      </div>
    </div>
  )
}
