import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  AlertTriangle, 
  Plus,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { dashboardAPI } from '@/services/api';
import type { DashboardResponse, StockMove, LowStockItem } from '@/types';
import { useToast } from '@/hooks/useToast';

type ActivityType = 'receipt' | 'delivery' | 'transfer' | 'adjustment';
type ActivityStatus = 'done' | 'in_progress' | 'pending';

interface Activity {
  id: number;
  type: ActivityType;
  reference: string;
  product: string;
  quantity: number;
  date: Date;
  status: ActivityStatus;
}

interface LowStockProduct {
  id: number;
  name: string;
  currentStock: number;
  minimumRequired: number;
  location: string;
}

type KPICardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconColor?: string;
  className?: string;
  onClick?: () => void;
};

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'receipt':
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
    case 'delivery':
      return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
    case 'transfer':
      return <RefreshCw className="h-4 w-4 text-purple-500" />;
    case 'adjustment':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
  }
};

const getActivityBadgeVariant = (type: Activity['type']) => {
  switch (type) {
    case 'receipt':
      return 'bg-green-100 text-green-700';
    case 'delivery':
      return 'bg-blue-100 text-blue-700';
    case 'transfer':
      return 'bg-purple-100 text-purple-700';
    case 'adjustment':
      return 'bg-orange-100 text-orange-700';
  }
};

const KPICard = ({ title, value, subtitle, icon, className, onClick }: KPICardProps) => {
  return (
    <Card className={cn('cursor-pointer hover:shadow-lg transition-shadow', className)} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
};

const RecentActivities = ({ activities }: { activities: Activity[] }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activities</CardTitle>
          <Button variant="ghost" size="sm" className="text-odoo-primary">
            View All
          </Button>
        </div>
        <CardDescription>Latest stock movements and transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="p-2 rounded-full bg-gray-100">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    {activity.product}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {format(activity.date, 'MMM d, h:mm a')}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className={cn("text-xs", getActivityBadgeVariant(activity.type))}>
                    {activity.type}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {activity.quantity > 0 ? `+${activity.quantity}` : activity.quantity} units
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const LowStockAlerts = ({ products }: { products: LowStockProduct[] }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Low Stock Alerts</CardTitle>
          <Button variant="outline" size="sm" className="text-odoo-primary border-odoo-primary">
            <Plus className="h-4 w-4 mr-2" />
            Reorder
          </Button>
        </div>
        <CardDescription>Items that need restocking</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  <div className="text-sm">{product.name}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-16 bg-red-100 rounded-full">
                      <div 
                        className="h-full bg-red-500 rounded-full" 
                        style={{ width: `${Math.min(100, (product.currentStock / product.minimumRequired) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm">{product.currentStock}/{product.minimumRequired}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {product.location}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch dashboard data from backend API
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await dashboardAPI.getKPIs();
      return response.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Transform backend data to match component expectations
  const kpis = dashboardData ? {
    totalItems: dashboardData.kpis?.total_products_in_stock || 0,
    lowStockItems: dashboardData.kpis?.low_stock_items_count || 0,
    pendingReceipts: dashboardData.kpis?.pending_receipts_count || 0,
    pendingDeliveries: dashboardData.kpis?.pending_deliveries_count || 0,
    recentActivities: (dashboardData.recent_stock_moves || []).slice(0, 10).map((move: StockMove) => ({
      id: move.id,
      type: move.type as ActivityType,
      reference: move.reference,
      product: move.product_name,
      quantity: move.quantity,
      date: new Date(move.created_at),
      status: move.status as ActivityStatus,
    })),
    lowStockProducts: (dashboardData.low_stock_items || []).map((item: LowStockItem) => ({
      id: item.product_id,
      name: item.product_name,
      currentStock: item.quantity,
      minimumRequired: item.reorder_level,
      location: `WH-${item.warehouse_id}-L${item.location_id}`,
    })),
  } : null;

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
              <p className="text-sm text-gray-500 mb-4">
                {(error as any)?.message || 'Unable to connect to the backend server'}
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !kpis) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-2"></div>
                <div className="h-4 w-32 bg-gray-100 rounded mt-2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="Total Products" 
          value={kpis.totalItems.toLocaleString()} 
          subtitle="Products in stock" 
          icon={<Package className="h-4 w-4 text-odoo-primary" />} 
          iconColor="text-odoo-primary" 
          className="cursor-pointer" 
          onClick={() => navigate("/inventory/products")} 
        />
        <KPICard 
          title="Low Stock Items" 
          value={kpis.lowStockItems} 
          subtitle="Needs attention" 
          icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />} 
          iconColor="text-yellow-500" 
          className="cursor-pointer" 
          onClick={() => navigate("/inventory/products?filter=low_stock")} 
        />
        <KPICard 
          title="Pending Receipts" 
          value={kpis.pendingReceipts} 
          subtitle="Waiting to be received" 
          icon={<ArrowDownLeft className="h-4 w-4 text-green-500" />} 
          iconColor="text-green-500" 
          className="cursor-pointer" 
          onClick={() => navigate("/inventory/receipts")} 
        />
        <KPICard 
          title="Pending Deliveries" 
          value={kpis.pendingDeliveries} 
          subtitle="Ready to ship" 
          icon={<ArrowUpRight className="h-4 w-4 text-blue-500" />} 
          iconColor="text-blue-500" 
          className="cursor-pointer" 
          onClick={() => navigate("/inventory/deliveries")} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <RecentActivities activities={kpis.recentActivities} />
        
        {/* Low Stock Alerts */}
        <LowStockAlerts products={kpis.lowStockProducts} />
      </div>
    </div>
  );
};

export default Dashboard;