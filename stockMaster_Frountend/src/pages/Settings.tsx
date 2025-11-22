import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { warehousesAPI, locationsAPI } from "@/services/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { Modal } from "@/components/ui/modal"
import { DataTable, Column } from "@/components/DataTable"
import { useToast } from "@/hooks/useToast"
import type { Warehouse, Location } from "@/types"
import { Warehouse as WarehouseIcon, MapPin } from "lucide-react"

export function SettingsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"warehouses" | "locations">("warehouses")
  const [showWarehouseModal, setShowWarehouseModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<number>(0)

  useEffect(() => {
    if (location.pathname.includes("locations")) {
      setActiveTab("locations")
    } else {
      setActiveTab("warehouses")
    }
  }, [location.pathname])

  return (
    <div>
      <PageHeader title="Settings" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Settings" }]} />

      <div className="mt-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-4">
            <button
              onClick={() => navigate("/settings/warehouses")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "warehouses"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Warehouses
            </button>
            <button
              onClick={() => navigate("/settings/locations")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "locations"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Locations
            </button>
          </nav>
        </div>

        {activeTab === "warehouses" && (
          <WarehousesTab
            onAdd={() => setShowWarehouseModal(true)}
            showModal={showWarehouseModal}
            onClose={() => setShowWarehouseModal(false)}
          />
        )}

        {activeTab === "locations" && (
          <LocationsTab
            onAdd={() => setShowLocationModal(true)}
            showModal={showLocationModal}
            onClose={() => setShowLocationModal(false)}
            selectedWarehouse={selectedWarehouse}
            onWarehouseChange={setSelectedWarehouse}
          />
        )}
      </div>
    </div>
  )
}

function WarehousesTab({
  onAdd,
  showModal,
  onClose,
}: {
  onAdd: () => void
  showModal: boolean
  onClose: () => void
}) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({ name: "", address: "" })

  const { data: warehousesData, isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => warehousesAPI.list().then((res) => res.data),
  })

  const mutation = useMutation({
    mutationFn: (data: { name: string; address?: string }) =>
      warehousesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
      toast({ title: "Success", description: "Warehouse created successfully", variant: "success" })
      setFormData({ name: "", address: "" })
      onClose()
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create warehouse", variant: "destructive" })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const columns: Column<Warehouse>[] = [
    { key: "name", header: "Name" },
    { key: "address", header: "Address", render: (w) => w.address || "-" },
    {
      key: "location_count",
      header: "Locations",
      render: (w) => w.location_count || 0,
    },
    {
      key: "created_at",
      header: "Created",
      render: (w) => new Date(w.created_at).toLocaleDateString(),
    },
  ]

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={onAdd}>
          <WarehouseIcon className="mr-2 h-4 w-4" />
          Add Warehouse
        </Button>
      </div>

      <DataTable data={warehousesData?.warehouses || []} columns={columns} isLoading={isLoading} />

      <Modal isOpen={showModal} onClose={onClose} title="Create Warehouse">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

function LocationsTab({
  onAdd,
  showModal,
  onClose,
  selectedWarehouse,
  onWarehouseChange,
}: {
  onAdd: () => void
  showModal: boolean
  onClose: () => void
  selectedWarehouse: number
  onWarehouseChange: (id: number) => void
}) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: "",
    warehouse_id: 0,
    type: "",
    capacity: "",
    uom: "",
  })

  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => warehousesAPI.list().then((res) => res.data),
  })

  const { data: locationsData, isLoading } = useQuery({
    queryKey: ["locations", selectedWarehouse],
    queryFn: () =>
      locationsAPI.list(selectedWarehouse || undefined).then((res) => res.data),
  })

  const mutation = useMutation({
    mutationFn: (data: { name: string; type?: string; capacity?: number; uom?: string }) =>
      locationsAPI.create(formData.warehouse_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] })
      toast({ title: "Success", description: "Location created successfully", variant: "success" })
      setFormData({ name: "", warehouse_id: 0, type: "", capacity: "", uom: "" })
      onClose()
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create location", variant: "destructive" })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.warehouse_id) {
      toast({
        title: "Error",
        description: "Please select a warehouse",
        variant: "destructive",
      })
      return
    }
    mutation.mutate({
      name: formData.name,
      type: formData.type || undefined,
      capacity: formData.capacity ? Number(formData.capacity) : undefined,
      uom: formData.uom || undefined,
    })
  }

  const columns: Column<Location>[] = [
    { key: "name", header: "Name" },
    { key: "warehouse_name", header: "Warehouse" },
    { key: "type", header: "Type", render: (l) => l.type || "-" },
    {
      key: "capacity",
      header: "Capacity",
      render: (l) => (l.capacity ? `${l.capacity} ${l.uom || ""}` : "-"),
    },
    {
      key: "current_stock",
      header: "Current Stock",
      render: (l) => (l.current_stock ? `${l.current_stock} ${l.uom || ""}` : "-"),
    },
  ]

  return (
    <>
      <div className="mb-4 space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Warehouse:</label>
          <Select
            value={selectedWarehouse.toString()}
            onChange={(e) => onWarehouseChange(Number(e.target.value))}
            className="w-64"
          >
            <option value="0">All Warehouses</option>
            {warehousesData?.warehouses?.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end">
          <Button onClick={onAdd}>
            <MapPin className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </div>
      </div>

      <DataTable data={locationsData?.locations || []} columns={columns} isLoading={isLoading} />

      <Modal isOpen={showModal} onClose={onClose} title="Create Location">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Warehouse <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.warehouse_id.toString()}
              onChange={(e) => setFormData({ ...formData, warehouse_id: Number(e.target.value) })}
              required
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
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <Input
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="e.g., shelf, rack"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Capacity</label>
            <Input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">UOM</label>
            <Input
              value={formData.uom}
              onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
              placeholder="e.g., kg, pcs"
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
