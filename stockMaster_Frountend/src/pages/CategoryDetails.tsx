import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { categoriesAPI } from "@/services/api"
import { ArrowLeft } from "lucide-react"

export function CategoryDetails() {
  const { id } = useParams<{ id: string }>()
  
  const { data: category, isLoading } = useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesAPI.get(Number(id)),
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!category) {
    return <div>Category not found</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/inventory/categories" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600 mt-2">{category.description}</p>
              )}
            </div>
            <Button asChild>
              <Link to={`/inventory/categories/${id}/edit`}>Edit Category</Link>
            </Button>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Category Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p>{category.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p>{new Date(category.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p>{new Date(category.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
