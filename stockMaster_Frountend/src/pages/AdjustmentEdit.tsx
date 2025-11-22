import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adjustmentsAPI, warehousesAPI, locationsAPI, productsAPI } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { useToast } from "@/hooks/useToast"
import type { AdjustmentLine } from "@/types"

const ADJUSTMENT_REASONS = ["Damaged", "Theft", "Recount", "Expired", "Other"]

interface AdjustmentLineForm extends AdjustmentLine {
  temp_id?: string
  system_qty?: number
  difference?: number
}

export function AdjustmentEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: adjustmentData } = useQuery({
    queryKey: ["adjustment", id],
    queryFn: () => adjustmentsAPI.getById(Number(id!)).then((res) => res.data),
  })

  const adjustment = adjustmentData?.adjustment

  const [formData, setFormData] = useState({
    reference: "",
    warehouse_id: 0,
    location_id: 0,
    notes: "",
  })

  const [lines, setLines] = useState<AdjustmentLineForm[]>([])

  useEffect(() => {
    if (adjustment) {
      setFormData({
        reference: adjustment.reference,
        warehouse_id: adjustment.warehouse_id,
        location_id: adjustment.location_id || 0,
        notes: "",
      })
      if (adjustment.lines) {
        setLines(
          adjustment.lines.map((line) => ({
            ...line,
            temp_id: Date.now().toString() + Math.random(),
            system_qty: 0, // Would need to fetch from API
            difference: 0,
          }))
        )
      }
    }
  }, [adjustment])

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

  const mutation = useMutation({
    mutationFn: (data: any) => adjustmentsAPI.update(Number(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustments"] })
      toast({
        title: "Success",
        description: "Adjustment updated successfully",
        variant: "success",
      })
      navigate(`/adjustments/${id}`)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update adjustment",
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

  if (!adjustment) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <PageHeader
        title={`Edit Adjustment - ${adjustment.reference}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Adjustments", href: "/adjustments" },
          { label: adjustment.reference, href: `/adjustments/${id}` },
          { label: "Edit" },
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
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Warehouse <span className="text-red-500">*</span>
                </label>
                <Input value={adjustment.warehouse_name} disabled />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <Input value={adjustment.location_name || "-"} disabled />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Products to Adjust</h3>
              {/* Product lines table would go here - similar to AdjustmentForm */}
              <p className="text-sm text-gray-500">Edit product quantities below</p>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/adjustments/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Updating..." : "Update Adjustment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

