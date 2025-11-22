import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { transfersAPI, warehousesAPI, locationsAPI, productsAPI } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { Modal } from "@/components/ui/modal"
import { DataTable, Column } from "@/components/DataTable"
import { useToast } from "@/hooks/useToast"
import { Plus, X } from "lucide-react"
import type { TransferLine } from "@/types"

interface TransferLineForm extends TransferLine {
  temp_id?: string
}

export function TransferEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: transferData } = useQuery({
    queryKey: ["transfer", id],
    queryFn: () => transfersAPI.getById(Number(id!)).then((res) => res.data),
  })

  const transfer = transferData?.transfer

  const [formData, setFormData] = useState({
    reference: "",
    from_location_id: 0,
    to_location_id: 0,
    notes: "",
  })

  const [lines, setLines] = useState<TransferLineForm[]>([])
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [newLine, setNewLine] = useState({
    product_id: 0,
    qty: 0,
    uom: "",
  })

  const [searchProduct, setSearchProduct] = useState("")

  useEffect(() => {
    if (transfer) {
      setFormData({
        reference: transfer.reference,
        from_location_id: transfer.from_location_id,
        to_location_id: transfer.to_location_id,
        notes: "",
      })
      if (transfer.lines) {
        setLines(
          transfer.lines.map((line) => ({
            ...line,
            temp_id: Date.now().toString() + Math.random(),
          }))
        )
      }
    }
  }, [transfer])

  const { data: locationsData } = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsAPI.list().then((res) => res.data),
  })

  const { data: productsData } = useQuery({
    queryKey: ["products", searchProduct],
    queryFn: () =>
      productsAPI.list({ search: searchProduct, limit: 20 }).then((res) => res.data),
    enabled: searchProduct.length > 2,
  })

  const handleAddProduct = () => {
    if (newLine.product_id && newLine.qty > 0 && newLine.uom) {
      const product = productsData?.products?.find((p) => p.id === newLine.product_id)
      setLines([
        ...lines,
        {
          temp_id: Date.now().toString(),
          product_id: newLine.product_id,
          product_name: product?.name || "",
          qty: newLine.qty,
          uom: newLine.uom,
        },
      ])
      setNewLine({ product_id: 0, qty: 0, uom: "" })
      setShowAddProductModal(false)
    }
  }

  const handleRemoveLine = (tempId: string) => {
    setLines(lines.filter((line) => line.temp_id !== tempId))
  }

  const lineColumns: Column<TransferLineForm>[] = [
    { key: "product_name", header: "Product" },
    {
      key: "qty",
      header: "Quantity",
      render: (line) => `${line.qty} ${line.uom}`,
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
    mutationFn: (data: any) => transfersAPI.update(Number(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] })
      toast({
        title: "Success",
        description: "Transfer updated successfully",
        variant: "success",
      })
      navigate(`/transfers/${id}`)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update transfer",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.from_location_id || !formData.to_location_id) {
      toast({
        title: "Error",
        description: "Please select from and to locations",
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
      from_location_id: formData.from_location_id,
      to_location_id: formData.to_location_id,
      lines: lines.map((line) => ({
        product_id: line.product_id,
        qty: line.qty,
        uom: line.uom,
      })),
    })
  }

  if (!transfer) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <PageHeader
        title={`Edit Transfer - ${transfer.reference}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Transfers", href: "/transfers" },
          { label: transfer.reference, href: `/transfers/${id}` },
          { label: "Edit" },
        ]}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Transfer Details</CardTitle>
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
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  From Location <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.from_location_id.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, from_location_id: Number(e.target.value) })
                  }
                >
                  <option value="0">Select location</option>
                  {locationsData?.locations?.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.warehouse_name} - {loc.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  To Location <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.to_location_id.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, to_location_id: Number(e.target.value) })
                  }
                >
                  <option value="0">Select location</option>
                  {locationsData?.locations?.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.warehouse_name} - {loc.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Products to Transfer</h3>
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
                onClick={() => navigate(`/transfers/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Updating..." : "Update Transfer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        title="Add Product to Transfer"
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
              Quantity <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={newLine.qty}
              onChange={(e) => setNewLine({ ...newLine, qty: Number(e.target.value) })}
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

