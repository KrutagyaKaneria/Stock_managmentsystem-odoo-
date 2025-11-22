import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adjustmentsAPI, warehousesAPI, locationsAPI, productsAPI } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { Modal } from "@/components/ui/modal"
import { DataTable, Column } from "@/components/DataTable"
import { useToast } from "@/hooks/useToast"
import { Plus, X } from "lucide-react"
import type { CreateAdjustmentRequest, AdjustmentLine } from "@/types"

const ADJUSTMENT_REASONS = ["Damaged", "Theft", "Recount", "Expired", "Other"]

interface AdjustmentLineForm extends AdjustmentLine {
  temp_id?: string
  system_qty?: number
  difference?: number
}

export function AdjustmentForm() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    reference: "",
    warehouse_id: 0,
    location_id: 0,
    notes: "",
  })

  const [lines, setLines] = useState<AdjustmentLineForm[]>([])
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [newLine, setNewLine] = useState({
    product_id: 0,
    qty_counted: 0,
    reason: "",
    system_qty: 0,
  })

  const [searchProduct, setSearchProduct] = useState("")

  // Auto-generate reference
  useEffect(() => {
    const generateReference = () => {
      const year = new Date().getFullYear()
      const month = String(new Date().getMonth() + 1).padStart(2, "0")
      return `ADJ-${year}-${month}-XXX`
    }
    setFormData((prev) => ({ ...prev, reference: generateReference() }))
  }, [])

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

  // Fetch product stock when product is selected
  const { data: productDetail } = useQuery({
    queryKey: ["product", newLine.product_id, formData.location_id],
    queryFn: () =>
      productsAPI.getById(newLine.product_id).then((res) => res.data),
    enabled: !!newLine.product_id && !!formData.location_id,
  })

  useEffect(() => {
    if (productDetail && formData.location_id) {
      const stockItem = productDetail.stock_by_location?.find(
        (s) => s.location_id === formData.location_id
      )
      setNewLine((prev) => ({
        ...prev,
        system_qty: stockItem?.quantity || 0,
        qty_counted: stockItem?.quantity || 0,
      }))
    }
  }, [productDetail, formData.location_id])

  const handleAddProduct = () => {
    if (newLine.product_id && newLine.qty_counted >= 0) {
      const product = productsData?.products?.find((p) => p.id === newLine.product_id)
      const difference = newLine.qty_counted - newLine.system_qty
      setLines([
        ...lines,
        {
          temp_id: Date.now().toString(),
          product_id: newLine.product_id,
          product_name: product?.name || "",
          qty_counted: newLine.qty_counted,
          reason: newLine.reason,
          system_qty: newLine.system_qty,
          difference,
          uom: product?.uom,
        },
      ])
      setNewLine({ product_id: 0, qty_counted: 0, reason: "", system_qty: 0 })
      setShowAddProductModal(false)
    }
  }

  const handleRemoveLine = (tempId: string) => {
    setLines(lines.filter((line) => line.temp_id !== tempId))
  }

  const handleCountedQtyChange = (tempId: string, qty: number) => {
    setLines(
      lines.map((line) => {
        if (line.temp_id === tempId) {
          const difference = qty - (line.system_qty || 0)
          return { ...line, qty_counted: qty, difference }
        }
        return line
      })
    )
  }

  const lineColumns: Column<AdjustmentLineForm>[] = [
    { key: "product_name", header: "Product" },
    {
      key: "system_qty",
      header: "System Qty",
      render: (line) => `${line.system_qty || 0} ${line.uom || ""}`,
    },
    {
      key: "qty_counted",
      header: "Counted Qty",
      render: (line) => (
        <Input
          type="number"
          min="0"
          value={line.qty_counted}
          onChange={(e) =>
            handleCountedQtyChange(line.temp_id!, Number(e.target.value))
          }
          className="w-32"
        />
      ),
    },
    {
      key: "difference",
      header: "Difference",
      render: (line) => {
        const diff = line.difference || 0
        return (
          <span
            className={
              diff > 0
                ? "text-success font-semibold"
                : diff < 0
                ? "text-destructive font-semibold"
                : ""
            }
          >
            {diff > 0 ? "+" : ""}
            {diff} {line.uom || ""}
          </span>
        )
      },
    },
    {
      key: "reason",
      header: "Reason",
      render: (line) => line.reason || "-",
    },
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
    mutationFn: (data: CreateAdjustmentRequest) => adjustmentsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustments"] })
      toast({
        title: "Success",
        description: "Adjustment created successfully",
        variant: "success",
      })
      navigate("/adjustments")
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create adjustment",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.warehouse_id || !formData.location_id) {
      toast({
        title: "Error",
        description: "Please select warehouse and location",
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
      warehouse_id: formData.warehouse_id,
      location_id: formData.location_id,
      lines: lines.map((line) => ({
        product_id: line.product_id,
        qty_counted: line.qty_counted,
        reason: line.reason || undefined,
      })),
    })
  }

  return (
    <div>
      <PageHeader
        title="Create Stock Adjustment"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Adjustments", href: "/adjustments" },
          { label: "Create" },
        ]}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Adjustment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reference <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="ADJ-2025-001"
                />
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
                <h3 className="text-lg font-semibold">Products to Adjust</h3>
                <Button
                  type="button"
                  onClick={() => setShowAddProductModal(true)}
                  disabled={!formData.location_id}
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
                onClick={() => navigate("/adjustments")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
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
        title="Add Product to Adjustment"
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
                  setNewLine({ ...newLine, product_id: Number(e.target.value) })
                }}
              >
                <option value="0">Select product</option>
                {productsData.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </Select>
            )}
          </div>

          {newLine.product_id && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">System Quantity</label>
                <Input value={newLine.system_qty} disabled />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Counted Quantity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  value={newLine.qty_counted}
                  onChange={(e) =>
                    setNewLine({ ...newLine, qty_counted: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <Select
                  value={newLine.reason}
                  onChange={(e) => setNewLine({ ...newLine, reason: e.target.value })}
                >
                  <option value="">Select reason</option>
                  {ADJUSTMENT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddProductModal(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAddProduct} disabled={!newLine.product_id}>
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

