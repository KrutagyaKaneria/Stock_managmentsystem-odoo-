import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { deliveriesAPI } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { useToast } from "@/hooks/useToast"
import { Skeleton } from "@/components/ui/skeleton"

export function ValidateDelivery() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [trackingNumber, setTrackingNumber] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["delivery", id],
    queryFn: () => deliveriesAPI.getById(Number(id!)).then((res) => res.data),
  })

  const delivery = data?.delivery

  const mutation = useMutation({
    mutationFn: (data?: { tracking_number?: string }) =>
      deliveriesAPI.validate(Number(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] })
      toast({
        title: "Success",
        description: "Delivery validated successfully",
        variant: "success",
      })
      navigate(`/deliveries/${id}`)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to validate delivery",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = () => {
    mutation.mutate(trackingNumber ? { tracking_number: trackingNumber } : undefined)
  }

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
        title={`Validate Delivery - ${delivery.reference}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Deliveries", href: "/deliveries" },
          { label: delivery.reference, href: `/deliveries/${id}` },
          { label: "Validate" },
        ]}
      />

      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Confirm Delivery Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              This will mark the delivery as completed. All stock quantities will be updated.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tracking Number (Optional)
            </label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate(`/deliveries/${id}`)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? "Validating..." : "Validate Delivery"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

