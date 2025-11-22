import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { receiptsAPI } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { DataTable, Column } from "@/components/DataTable"
import { useToast } from "@/hooks/useToast"
import { Skeleton } from "@/components/ui/skeleton"
import type { ReceiptLine } from "@/types"

interface ReceiptLineWithInput extends ReceiptLine {
  qty_received_input: number
  variance: number
}

export function ReceiveStock() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["receipt", id],
    queryFn: () => receiptsAPI.getById(Number(id!)).then((res) => res.data),
  })

  const receipt = data?.receipt

  const [lines, setLines] = useState<ReceiptLineWithInput[]>([])

  useEffect(() => {
    if (receipt?.lines) {
      setLines(
        receipt.lines.map((line) => ({
          ...line,
          qty_received_input: line.qty_received || line.qty_expected,
          variance: (line.qty_received || line.qty_expected) - line.qty_expected,
        }))
      )
    }
  }, [receipt])

  const handleQtyChange = (productId: number, qty: number) => {
    setLines(
      lines.map((line) => {
        if (line.product_id === productId) {
          const variance = qty - line.qty_expected
          return { ...line, qty_received_input: qty, variance }
        }
        return line
      })
    )
  }

  const mutation = useMutation({
    mutationFn: (data: { lines: Array<{ product_id: number; qty_received: number }> }) =>
      receiptsAPI.receive(Number(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] })
      toast({
        title: "Success",
        description: "Receipt validated successfully",
        variant: "success",
      })
      navigate(`/receipts/${id}`)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to validate receipt",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = () => {
    const hasEmpty = lines.some((line) => !line.qty_received_input || line.qty_received_input <= 0)
    if (hasEmpty) {
      toast({
        title: "Error",
        description: "Please fill all received quantities",
        variant: "destructive",
      })
      return
    }

    const hasVariance = lines.some((line) => line.variance !== 0)
    if (hasVariance && !window.confirm("There are variances. Do you want to proceed?")) {
      return
    }

    mutation.mutate({
      lines: lines.map((line) => ({
        product_id: line.product_id,
        qty_received: line.qty_received_input,
      })),
    })
  }

  const columns: Column<ReceiptLineWithInput>[] = [
    { key: "product_name", header: "Product" },
    {
      key: "qty_expected",
      header: "Expected Qty",
      render: (line) => `${line.qty_expected} ${line.uom}`,
    },
    {
      key: "qty_received_input",
      header: "Received Qty",
      render: (line) => (
        <Input
          type="number"
          min="0"
          value={line.qty_received_input}
          onChange={(e) =>
            handleQtyChange(line.product_id, Number(e.target.value))
          }
          className="w-32"
        />
      ),
    },
    { key: "uom", header: "UOM" },
    {
      key: "variance",
      header: "Variance",
      render: (line) => {
        const variance = line.variance
        return (
          <span
            className={
              variance > 0
                ? "text-success font-semibold"
                : variance < 0
                ? "text-destructive font-semibold"
                : ""
            }
          >
            {variance > 0 ? "+" : ""}
            {variance} {line.uom}
          </span>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!receipt) {
    return <div>Receipt not found</div>
  }

  return (
    <div>
      <PageHeader
        title={`Receive Stock - ${receipt.reference}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Receipts", href: "/receipts" },
          { label: receipt.reference, href: `/receipts/${id}` },
          { label: "Receive" },
        ]}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            Receiving goods at: {receipt.warehouse_name}
            {receipt.location_name && ` > ${receipt.location_name}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={lines} columns={columns} />
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => navigate(`/receipts/${id}`)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? "Validating..." : "Validate Receipt"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

