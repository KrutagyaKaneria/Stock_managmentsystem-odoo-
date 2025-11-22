import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { deliveriesAPI, customersAPI, warehousesAPI, locationsAPI, productsAPI } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { Modal } from "@/components/ui/modal"
import { DataTable, Column } from "@/components/DataTable"
import { useToast } from "@/hooks/useToast"
import { Plus, X } from "lucide-react"
import type { CreateDeliveryRequest, DeliveryLine } from "@/types"

interface DeliveryLineForm extends DeliveryLine {
  temp_id?: string
}

export function DeliveryForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    reference: "",
    customer_id: 0,
    warehouse_id: 0,
    location_id: 0,
    notes: "",
  })

  const [lines, setLines] = useState<DeliveryLineForm[]>([])
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [newLine, setNewLine] = useState({
    product_id: 0,
    qty_ordered: 0,
    uom: "",
  })

  const [searchProduct, setSearchProduct] = useState("")

  // Auto-generate reference
  useEffect(() => {
    const generateReference = () => {
      const year = new Date().getFullYear()
      const month = String(new Date().getMonth() + 1).padStart(2, "0")
      return `DEL-${year}-${month}-XXX`
    }
    setFormData((prev) => ({ ...prev, reference: generateReference() }))
  }, [])

  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customersAPI.list().then((res) => res.data),
  })

  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => warehousesAPI.list().then((res) => res.data),
  })

  const { data: locationsData } = useQuery({
    queryKey: ["locations", formData.warehouse_id],
    queryFn: () =>
      locationsAPI.list(formData.warehouse_id || undefined).then((res) => res.data),
    enabled: !!formData.warehouse_id,
  })

  const { data: productsData } = useQuery({
    queryKey: ["products", searchProduct],
    queryFn: () =>
      productsAPI.list({ search: searchProduct, limit: 20 }).then((res) => res.data),
    enabled: searchProduct.length > 2,
  })

  const handleAddProduct = () => {
    if (newLine.product_id && newLine.qty_ordered > 0 && newLine.uom) {
      const product = productsData?.products?.find((p) => p.id === newLine.product_id)
      setLines([
        ...lines,
        {
          temp_id: Date.now().toString(),
          product_id: newLine.product_id,
          product_name: product?.name || "",
          qty_ordered: newLine.qty_ordered,
          uom: newLine.uom,
        },
      ])
      setNewLine({ product_id: 0, qty_ordered: 0, uom: "" })
      setShowAddProductModal(false)
    }
  }

  const handleRemoveLine = (tempId: string) => {
    setLines(lines.filter((line) => line.temp_id !== tempId))
  }

  const lineColumns: Column<DeliveryLineForm>[] = [
    { key: "product_name", header: "Product" },
    {
      key: "qty_ordered",
      header: "Ordered Qty",
      render: (line) => `${line.qty_ordered} ${line.uom}`,
    },
    { key: "uom", header: "UOM" },
    {
      key: "actions",
      header: "Actions",
      render: (line) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleRemoveLine(line.temp_id!)}
        >
          <X className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const mutation = useMutation({
    mutationFn: (data: CreateDeliveryRequest) => deliveriesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] })
      toast({
        title: "Success",
        description: "Delivery created successfully",
        variant: "success",
      })
      navigate("/deliveries")
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create delivery",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent, status: "draft" | "waiting") => {
    e.preventDefault()
    if (!formData.customer_id || !formData.warehouse_id || !formData.location_id) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }
    if (lines.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product",
        variant: "destructive",
      })
      return
    }

    mutation.mutate({
      reference: formData.reference,
      customer_id: formData.customer_id,
      warehouse_id: formData.warehouse_id,
      location_id: formData.location_id,
      lines: lines.map((line) => ({
        product_id: line.product_id,
        qty_ordered: line.qty_ordered,
        uom: line.uom,
      })),
    })
  }

  return (
    <div>
      <PageHeader
        title="Create Delivery"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Deliveries", href: "/deliveries" },
          { label: "Create" },
        ]}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reference <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="DEL-2025-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Customer <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.customer_id.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_id: Number(e.target.value) })
                  }
                >
                  <option value="0">Select customer</option>
                  {customersData?.customers?.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Warehouse <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.warehouse_id.toString()}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      warehouse_id: Number(e.target.value),
                      location_id: 0,
                    })
                  }}
                >
                  <option value="0">Select warehouse</option>
                  {warehousesData?.warehouses?.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.location_id.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, location_id: Number(e.target.value) })
                  }
                  disabled={!formData.warehouse_id}
                >
                  <option value="0">Select location</option>
                  {locationsData?.locations?.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Products to Deliver</h3>
                <Button
                  type="button"
                  onClick={() => setShowAddProductModal(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>

              {lines.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No products added. Click "Add Product" to add items.
                </p>
              ) : (
                <DataTable data={lines} columns={lineColumns} />
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/deliveries")}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => handleSubmit(e, "draft")}
                disabled={mutation.isPending}
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                onClick={(e) => handleSubmit(e, "waiting")}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        title="Add Product to Delivery"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Search products..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
            />
            {searchProduct.length > 2 && productsData?.products && (
              <Select
                value={newLine.product_id.toString()}
                onChange={(e) => {
                  const productId = Number(e.target.value)
                  const product = productsData.products.find((p) => p.id === productId)
                  setNewLine({
                    ...newLine,
                    product_id: productId,
                    uom: product?.uom || "",
                  })
                }}
              >
                <option value="0">Select product</option>
                {productsData.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku}) - {product.uom}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Ordered Quantity <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={newLine.qty_ordered}
              onChange={(e) =>
                setNewLine({ ...newLine, qty_ordered: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">UOM</label>
            <Input value={newLine.uom} disabled />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddProductModal(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAddProduct}>
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

