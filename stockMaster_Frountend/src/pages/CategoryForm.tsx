import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { categoriesAPI } from "@/services/api"
import { useToast } from "@/hooks/useToast"

type CategoryFormData = {
  name: string
  description: string
}

export function CategoryForm() {
  const { id } = useParams<{ id?: string }>()
  const isEditMode = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: category, isLoading } = useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesAPI.get(Number(id)),
    enabled: isEditMode,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<CategoryFormData>({
    defaultValues: {
      name: category?.name || '',
      description: category?.description || ''
    }
  })

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => categoriesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: 'Success',
        description: 'Category created successfully',
      })
      navigate('/inventory/categories')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: CategoryFormData) => categoriesAPI.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', id] })
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      })
      navigate('/inventory/categories')
    },
  })

  const onSubmit = (data: CategoryFormData) => {
    if (isEditMode) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  if (isEditMode && isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Edit Category' : 'Create New Category'}
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              className="w-full"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              {...register('description')}
              className="w-full min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/inventory/categories')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {isEditMode ? 'Update' : 'Create'} Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
