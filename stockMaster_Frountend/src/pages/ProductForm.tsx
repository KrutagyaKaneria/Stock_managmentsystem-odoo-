import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { productsAPI, categoriesAPI } from "@/services/api"
import { Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { useToast } from "@/hooks/useToast"
import type { CreateProductRequest } from "@/types"

const UOM_OPTIONS = ["pcs", "kg", "l", "m", "box", "unit"]

export function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const [formData, setFormData] = useState<CreateProductRequest>({
    name: "",
    sku: "",
    category_id: 0,
    uom: "pcs",
    initial_stock: 0,
    reorder_level: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: productData } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsAPI.getById(Number(id!)).then((res) => res.data),
    enabled: isEdit,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.list().then((res) => res.data),
  })

  useEffect(() => {
    if (productData?.product) {
      const product = productData.product
      setFormData({
        name: product.name,
        sku: product.sku,
        category_id: product.category_id,
        uom: product.uom,
        initial_stock: product.initial_stock,
        reorder_level: product.reorder_level,
      })
    }
  }, [productData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters"
    }
    if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters"
    }

    if (!formData.sku || !/^[A-Z0-9-]+$/.test(formData.sku)) {
      newErrors.sku = "SKU must be alphanumeric (A-Z, 0-9, -)"
    }

    if (!formData.category_id || formData.category_id < 1) {
      newErrors.category_id = "Category is required"
    }

    if (!formData.uom) {
      newErrors.uom = "Unit of measure is required"
    }

    if (formData.initial_stock !== undefined && formData.initial_stock < 0) {
      newErrors.initial_stock = "Initial stock must be 0 or greater"
    }

    if (formData.reorder_level < 0) {
      newErrors.reorder_level = "Reorder level must be 0 or greater"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const mutation = useMutation({
    mutationFn: (data: CreateProductRequest) =>
      isEdit
        ? productsAPI.update(Number(id!), data)
        : productsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast({
        title: "Success",
        description: isEdit ? "Product updated successfully" : "Product created successfully",
        variant: "success",
      })
      navigate("/products")
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEdit ? "update" : "create"} product`,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      mutation.mutate(formData)
    }
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Product" : "Create Product"}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: isEdit ? "Edit" : "Create" },
        ]}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onBlur={() => validate()}
                  required
                  minLength={3}
                  maxLength={100}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium mb-2">
                  SKU <span className="text-red-500">*</span>
                </label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  onBlur={() => validate()}
                  required
                  pattern="[A-Z0-9-]+"
                />
                {errors.sku && <p className="text-sm text-red-500 mt-1">{errors.sku}</p>}
              </div>

              <div>
                <label htmlFor="category_id" className="block text-sm font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  id="category_id"
                  value={formData.category_id.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: Number(e.target.value) })
                  }
                  required
                >
                  <option value="0">Select category</option>
                  {categoriesData?.categories?.map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
                {errors.category_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>
                )}
              </div>

              <div>
                <label htmlFor="uom" className="block text-sm font-medium mb-2">
                  Unit of Measure <span className="text-red-500">*</span>
                </label>
                <Select
                  id="uom"
                  value={formData.uom}
                  onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                  required
                >
                  {UOM_OPTIONS.map((uom => (
                    <option key={uom} value={uom}>
                      {uom}
                    </option>
                  )))}
                </Select>
                {errors.uom && <p className="text-sm text-red-500 mt-1">{errors.uom}</p>}
              </div>

              <div>
                <label htmlFor="initial_stock" className="block text-sm font-medium mb-2">
                  Initial Stock
                </label>
                <Input
                  id="initial_stock"
                  type="number"
                  min="0"
                  value={formData.initial_stock}
                  onChange={(e) =>
                    setFormData({ ...formData, initial_stock: Number(e.target.value) })
                  }
                />
                {errors.initial_stock && (
                  <p className="text-sm text-red-500 mt-1">{errors.initial_stock}</p>
                )}
              </div>

              <div>
                <label htmlFor="reorder_level" className="block text-sm font-medium mb-2">
                  Reorder Level <span className="text-red-500">*</span>
                </label>
                <Input
                  id="reorder_level"
                  type="number"
                  min="0"
                  value={formData.reorder_level}
                  onChange={(e) =>
                    setFormData({ ...formData, reorder_level: Number(e.target.value) })
                  }
                  required
                />
                {errors.reorder_level && (
                  <p className="text-sm text-red-500 mt-1">{errors.reorder_level}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/products")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending || !validate()}>
                {mutation.isPending ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
