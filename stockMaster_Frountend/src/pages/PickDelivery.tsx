import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { deliveriesAPI } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { DataTable, Column } from "@/components/DataTable"
import { useToast } from "@/hooks/useToast"
import { Skeleton } from "@/components/ui/skeleton"
import type { DeliveryLine } from "@/types"

interface DeliveryLineWithInput extends DeliveryLine {
  qty_picked_input: number
}

export function PickDelivery() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["delivery", id],
    queryFn: () => deliveriesAPI.getById(Number(id!)).then((res) => res.data),
  })

  const delivery = data?.delivery

  const [lines, setLines] = useState<DeliveryLineWithInput[]>([])

  useEffect(() => {
    if (delivery?.lines) {
      setLines(
        delivery.lines.map((line) => ({
          ...line,
          qty_picked_input: line.qty_picked || line.qty_ordered,
        }))
      )
    }
  }, [delivery])

  const handleQtyChange = (productId: number, qty: number) => {
    setLines(
      lines.map((line) => {
        if (line.product_id === productId) {
          return { ...line, qty_picked_input: qty }
        }
        return line
      })
    )
  }

  const mutation = useMutation({
    mutationFn: (data: { lines: Array<{ product_id: number; qty_picked: number }> }) =>
      deliveriesAPI.pick(Number(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] })
      toast({
        title: "Success",
        description: "Items picked successfully",
        variant: "success",
      })
      navigate(`/deliveries/${id}`)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to pick items",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = () => {
    const hasEmpty = lines.some((line) => !line.qty_picked_input || line.qty_picked_input <= 0)
    if (hasEmpty) {
      toast({
        title: "Error",
        description: "Please fill all picked quantities",
        variant: "destructive",
      })
      return
    }

    mutation.mutate({
      lines: lines.map((line) => ({
        product_id: line.product_id,
        qty_picked: line.qty_picked_input,
      })),
    })
  }

  const columns: Column<DeliveryLineWithInput>[] = [
    { key: "product_name", header: "Product" },
    {
      key: "qty_ordered",
      header: "Ordered Qty",
      render: (line) => `${line.qty_ordered} ${line.uom}`,
    },
    {
      key: "qty_picked_input",
      header: "Picked Qty",
      render: (line) => (
        <Input
          type="number"
          min="0"
          max={line.qty_ordered}
          value={line.qty_picked_input}
          onChange={(e) => handleQtyChange(line.product_id, Number(e.target.value))}
          className="w-32"
        />
      ),
    },
    { key: "uom", header: "UOM" },
  ]

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!delivery) {
    return <div>Delivery not found</div>
  }

  return (
    <div>
      <PageHeader
        title={`Pick Items - ${delivery.reference}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Deliveries", href: "/deliveries" },
          { label: delivery.reference, href: `/deliveries/${id}` },
          { label: "Pick" },
        ]}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            Picking from: {delivery.warehouse_name}
            {delivery.location_name && ` > ${delivery.location_name}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={lines} columns={columns} />
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => navigate(`/deliveries/${id}`)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? "Picking..." : "Mark as Picked"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

