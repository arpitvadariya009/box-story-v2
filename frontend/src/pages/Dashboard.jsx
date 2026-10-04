import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import EmployeeDashboard from '../components/EmployeeDashboard';
import {
  TrendingUp,
  Clock,
  ShoppingCart,
  Building2,
  AlertTriangle,
  Gift,
  DollarSign,
  ChevronRight,
  Package,
  Truck,
  Plus,
  ChevronDown,
  Filter,
  X,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BDMDashboard from './BDMDashboard';
import ProcurementDashboard from './ProcurementDashboard';
import CorporateHRDashboard from '../components/CorporateHRDashboard';
import WarehouseDashboard from './WarehouseDashboard';
import AccountsDashboard from './AccountsDashboard';
import DataEntryDashboard from './DataEntryDashboard';

const monthsList = [
  { label: 'Jan', value: 0 },
  { label: 'Feb', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Apr', value: 3 },
  { label: 'May', value: 4 },
  { label: 'Jun', value: 5 },
  { label: 'Jul', value: 6 },
  { label: 'Aug', value: 7 },
  { label: 'Sep', value: 8 },
  { label: 'Oct', value: 9 },
  { label: 'Nov', value: 10 },
  { label: 'Dec', value: 11 },
];

const yearsList = [2024, 2025, 2026, 2027, 2028];

const Dashboard = () => {
  const { user, api } = useAuth();
  const [hoveredOrdersPt, setHoveredOrdersPt] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fullProductDetail, setFullProductDetail] = useState(null);
  const [productDetailLoading, setProductDetailLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [fromMonth, setFromMonth] = useState(9); // Oct (value: 9)
  const [fromYear, setFromYear] = useState(2025);
  const [toMonth, setToMonth] = useState(8); // Sep (value: 8)
  const [toYear, setToYear] = useState(2026);

  useEffect(() => {
    if (selectedProduct) {
      const prodId = selectedProduct.productId || selectedProduct._id;
      if (prodId) {
        setProductDetailLoading(true);
        api.get(`/products/${prodId}`)
          .then(res => setFullProductDetail(res.data))
          .catch(() => setFullProductDetail(null))
          .finally(() => setProductDetailLoading(false));
      } else {
        setFullProductDetail(null);
      }
    } else {
      setFullProductDetail(null);
    }
  }, [selectedProduct, api]);

  useEffect(() => {
    if (user && ['SuperAdmin', 'Admin'].includes(user.role)) {
      fetchDashboard(fromMonth, fromYear, toMonth, toYear);
    }
  }, [user, fromMonth, fromYear, toMonth, toYear]);

  const handleFromMonthChange = (newMonth) => {
    setFromMonth(newMonth);
    setHoveredOrdersPt(null);
    if (fromYear === toYear && newMonth > toMonth) {
      setToMonth(newMonth);
    }
  };

  const handleFromYearChange = (newYear) => {
    setFromYear(newYear);
    setHoveredOrdersPt(null);
    if (newYear > toYear) {
      setToYear(newYear);
      setToMonth(fromMonth);
    } else if (newYear === toYear && fromMonth > toMonth) {
      setToMonth(fromMonth);
    }
  };

  const handleToMonthChange = (newMonth) => {
    setToMonth(newMonth);
    setHoveredOrdersPt(null);
  };

  const handleToYearChange = (newYear) => {
    setToYear(newYear);
    setHoveredOrdersPt(null);
    if (newYear === fromYear && toMonth < fromMonth) {
      setToMonth(fromMonth);
    }
  };

  // Category Demand Filter State & Handlers
  const [catFromMonth, setCatFromMonth] = useState(0); // Jan (0)
  const [catFromYear, setCatFromYear] = useState(2026);
  const [catToMonth, setCatToMonth] = useState(5); // Jun (5)
  const [catToYear, setCatToYear] = useState(2026);
  const [hoveredDemandPt, setHoveredDemandPt] = useState(null);

  const handleCatFromMonthChange = (newMonth) => {
    setCatFromMonth(newMonth);
    setHoveredDemandPt(null);
    if (catFromYear === catToYear && newMonth > catToMonth) {
      setCatToMonth(newMonth);
    }
  };

  const handleCatFromYearChange = (newYear) => {
    setCatFromYear(newYear);
    setHoveredDemandPt(null);
    if (newYear > catToYear) {
      setCatToYear(newYear);
      setCatToMonth(catFromMonth);
    } else if (newYear === catToYear && catFromMonth > catToMonth) {
      setCatToMonth(catFromMonth);
    }
  };

  const handleCatToMonthChange = (newMonth) => {
    setCatToMonth(newMonth);
    setHoveredDemandPt(null);
  };

  const handleCatToYearChange = (newYear) => {
    setCatToYear(newYear);
    setHoveredDemandPt(null);
    if (newYear === catFromYear && catToMonth < catFromMonth) {
      setCatToMonth(catFromMonth);
    }
  };

  // Revenue Overview Filter State & Handlers
  const [revFromMonth, setRevFromMonth] = useState(0); // Jan (0)
  const [revFromYear, setRevFromYear] = useState(2026);
  const [revToMonth, setRevToMonth] = useState(5); // Jun (5)
  const [revToYear, setRevToYear] = useState(2026);
  const [hoveredRevenuePt, setHoveredRevenuePt] = useState(null);

  const handleRevFromMonthChange = (newMonth) => {
    setRevFromMonth(newMonth);
    setHoveredRevenuePt(null);
    if (revFromYear === revToYear && newMonth > revToMonth) {
      setRevToMonth(newMonth);
    }
  };

  const handleRevFromYearChange = (newYear) => {
    setRevFromYear(newYear);
    setHoveredRevenuePt(null);
    if (newYear > revToYear) {
      setRevToYear(newYear);
      setRevToMonth(revFromMonth);
    } else if (newYear === revToYear && revFromMonth > revToMonth) {
      setRevToMonth(revFromMonth);
    }
  };

  const handleRevToMonthChange = (newMonth) => {
    setRevToMonth(newMonth);
    setHoveredRevenuePt(null);
  };

  const handleRevToYearChange = (newYear) => {
    setRevToYear(newYear);
    setHoveredRevenuePt(null);
    if (newYear === revFromYear && revToMonth < revFromMonth) {
      setRevToMonth(revFromMonth);
    }
  };

  const fetchDashboard = async (fM = fromMonth, fY = fromYear, tM = toMonth, tY = toYear) => {
    setLoadingDashboard(true);
    try {
      const res = await api.get(`/dashboard?fromMonth=${fM}&fromYear=${fY}&toMonth=${tM}&toYear=${tY}`);
      setDashboardData(res.data);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };


  const isClient = user?.role === 'Client';

  const metrics = dashboardData?.metrics || {
    corporateClients: 0,
    clientsThisMonth: 0,
    totalOrders: 0,
    ordersThisMonth: 0,
    pendingDispatch: 0,
    urgentDispatches: 0,
    inventoryAlerts: 0,
    criticalInventoryCount: 0,
    totalProducts: 0,
    revenueMonth: 0,
  };

  const topProducts = dashboardData?.topProducts || [];
  const inventoryAlerts = dashboardData?.inventoryAlerts || [];
  const recentOrders = dashboardData?.recentOrders || [];
  const categoryDistribution = dashboardData?.categoryDistribution || [];

  const ordersTrend = useMemo(() => {
    let startY = fromYear;
    let startM = fromMonth;
    let endY = toYear;
    let endM = toMonth;

    let startDate = new Date(startY, startM, 1);
    let endDate = new Date(endY, endM + 1, 1);

    if (startDate > endDate) {
      const tempY = startY; const tempM = startM;
      startY = endY; startM = endM;
      endY = tempY; endM = tempM;
      startDate = new Date(startY, startM, 1);
      endDate = new Date(endY, endM + 1, 1);
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    let cur = new Date(startDate);

    // Map backend data by Mon YYYY, Mon, or index
    const backendDataMap = new Map();
    (dashboardData?.ordersTrend || []).forEach((item) => {
      if (item.label) backendDataMap.set(item.label.toLowerCase().trim(), item);
      if (item.month && item.year) backendDataMap.set(`${item.month} ${item.year}`.toLowerCase().trim(), item);
      if (item.month) backendDataMap.set(item.month.toLowerCase().trim(), item);
    });

    while (cur < endDate) {
      const mName = monthNames[cur.getMonth()];
      const yVal = cur.getFullYear();
      const label = `${mName} ${yVal}`;

      const matched = backendDataMap.get(label.toLowerCase().trim()) || backendDataMap.get(mName.toLowerCase().trim());

      if (matched) {
        result.push({
          month: mName,
          year: yVal,
          label: label,
          orders: Number(matched.orders) || 0,
          pending: Number(matched.pending) || 0,
          completed: Number(matched.completed) || 0,
          completionRate: matched.completionRate !== undefined
            ? matched.completionRate
            : (matched.orders > 0 ? ((matched.completed / matched.orders) * 100).toFixed(1) : '0.0'),
        });
      } else {
        result.push({
          month: mName,
          year: yVal,
          label: label,
          orders: 0,
          pending: 0,
          completed: 0,
          completionRate: '0.0',
        });
      }

      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }

    return result;
  }, [dashboardData?.ordersTrend, fromMonth, fromYear, toMonth, toYear]);

  const categoryDemandData = useMemo(() => {
    let startY = catFromYear;
    let startM = catFromMonth;
    let endY = catToYear;
    let endM = catToMonth;

    let startDate = new Date(startY, startM, 1);
    let endDate = new Date(endY, endM + 1, 1);

    if (startDate > endDate) {
      const tempY = startY; const tempM = startM;
      startY = endY; startM = endM;
      endY = tempY; endM = tempM;
      startDate = new Date(startY, startM, 1);
      endDate = new Date(endY, endM + 1, 1);
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    let cur = new Date(startDate);

    const backendMap = new Map();
    (dashboardData?.categoryDemandTrend || []).forEach((item) => {
      if (item.label) backendMap.set(item.label.toLowerCase().trim(), item);
      if (item.month && item.year) backendMap.set(`${item.month} ${item.year}`.toLowerCase().trim(), item);
      if (item.month) backendMap.set(item.month.toLowerCase().trim(), item);
    });

    const sampleDefaults = [
      { Electronics: 45, Apparel: 30, Wellness: 25, Gourmet: 20 }, // Jan
      { Electronics: 52, Apparel: 35, Wellness: 28, Gourmet: 22 }, // Feb
      { Electronics: 48, Apparel: 42, Wellness: 32, Gourmet: 28 }, // Mar
      { Electronics: 61, Apparel: 38, Wellness: 35, Gourmet: 30 }, // Apr
      { Electronics: 55, Apparel: 45, Wellness: 30, Gourmet: 35 }, // May
      { Electronics: 68, Apparel: 50, Wellness: 38, Gourmet: 32 }, // Jun
      { Electronics: 58, Apparel: 40, Wellness: 34, Gourmet: 28 }, // Jul
      { Electronics: 64, Apparel: 48, Wellness: 36, Gourmet: 30 }, // Aug
      { Electronics: 70, Apparel: 52, Wellness: 40, Gourmet: 35 }, // Sep
      { Electronics: 52, Apparel: 38, Wellness: 30, Gourmet: 25 }, // Oct
      { Electronics: 60, Apparel: 44, Wellness: 32, Gourmet: 28 }, // Nov
      { Electronics: 48, Apparel: 35, Wellness: 28, Gourmet: 22 }, // Dec
    ];

    while (cur < endDate) {
      const mName = monthNames[cur.getMonth()];
      const yVal = cur.getFullYear();
      const label = `${mName} ${yVal}`;
      const mIdx = cur.getMonth();

      const matched = backendMap.get(label.toLowerCase().trim()) || backendMap.get(mName.toLowerCase().trim());

      if (matched && matched.categories) {
        result.push({
          month: mName,
          year: yVal,
          label: label,
          Electronics: matched.categories.Electronics ?? 0,
          Apparel: matched.categories.Apparel ?? 0,
          Wellness: matched.categories.Wellness ?? 0,
          Gourmet: matched.categories.Gourmet ?? 0,
        });
      } else {
        const def = sampleDefaults[mIdx % 12];
        result.push({
          month: mName,
          year: yVal,
          label: label,
          Electronics: def.Electronics,
          Apparel: def.Apparel,
          Wellness: def.Wellness,
          Gourmet: def.Gourmet,
        });
      }

      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }

    return result;
  }, [dashboardData?.categoryDemandTrend, catFromMonth, catFromYear, catToMonth, catToYear]);

  const revenueData = useMemo(() => {
    let startY = revFromYear;
    let startM = revFromMonth;
    let endY = revToYear;
    let endM = revToMonth;

    let startDate = new Date(startY, startM, 1);
    let endDate = new Date(endY, endM + 1, 1);

    if (startDate > endDate) {
      const tempY = startY; const tempM = startM;
      startY = endY; startM = endM;
      endY = tempY; endM = tempM;
      startDate = new Date(startY, startM, 1);
      endDate = new Date(endY, endM + 1, 1);
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    let cur = new Date(startDate);

    const backendMap = new Map();
    (dashboardData?.revenueTrend || []).forEach((item) => {
      if (item.label) backendMap.set(item.label.toLowerCase().trim(), item);
      if (item.month && item.year) backendMap.set(`${item.month} ${item.year}`.toLowerCase().trim(), item);
      if (item.month) backendMap.set(item.month.toLowerCase().trim(), item);
    });

    const sampleDefaults = [
      42000, 48000, 55000, 62000, 58000, 72000,
      64000, 68000, 75000, 56000, 62000, 50000
    ];

    while (cur < endDate) {
      const mName = monthNames[cur.getMonth()];
      const yVal = cur.getFullYear();
      const label = `${mName} ${yVal}`;
      const mIdx = cur.getMonth();

      const matched = backendMap.get(label.toLowerCase().trim()) || backendMap.get(mName.toLowerCase().trim());

      if (matched) {
        result.push({
          month: mName,
          year: yVal,
          label: label,
          revenue: Number(matched.revenue) || sampleDefaults[mIdx % 12],
          orders: Number(matched.orders) || Math.round(Number(matched.revenue || 45000) / 350),
          avgOrderValue: Number(matched.avgOrderValue) || 350,
        });
      } else {
        const def = sampleDefaults[mIdx % 12];
        result.push({
          month: mName,
          year: yVal,
          label: label,
          revenue: def,
          orders: Math.round(def / 350),
          avgOrderValue: 350,
        });
      }

      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }

    return result;
  }, [dashboardData?.revenueTrend, revFromMonth, revFromYear, revToMonth, revToYear]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-[#10B77F]/10 text-[#10B77F]';
      case 'Shipped':
      case 'Dispatched':
      case 'Ready to Ship':
        return 'bg-[#E21D48]/10 text-[#E21D48]';
      case 'Processing':
      case 'In Production':
        return 'bg-[#F59F0A]/10 text-[#F59F0A]';
      default:
        return 'bg-[#F1F5F9] text-[#65758B]';
    }
  };


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#CE1C2B]"></div>
      </div>
    );
  }

  if (user?.role === 'Employee') {
    return <EmployeeDashboard />;
  }

  if (user?.role === 'BDM') {
    return <BDMDashboard />;
  }

  if (user?.role === 'Procurement') {
    return <ProcurementDashboard />;
  }

  if (user?.role === 'CorporateHRManager') {
    return <CorporateHRDashboard />;
  }

  if (user?.role === 'WarehouseLogistics') {
    return <WarehouseDashboard />;
  }

  if (user?.role === 'AccountsTeam') {
    return <AccountsDashboard />;
  }

  if (user?.role === 'DataEntryOperator') {
    return <DataEntryDashboard />;
  }

  return (
    <div className="space-y-6 pb-12 font-['Inter']">

      {/* Row 1: Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-[#0F1729] leading-[28px]">
            Welcome back, {user?.name || 'Super Admin'}
          </h2>
          <p className="text-[14px] font-normal text-[#65758B] leading-[20px] mt-1">
            Here's what's happening across your platform
          </p>
        </div>
        {!isClient && (
          <div className="flex items-center gap-3">
            <Link
              to="/clients"
              className="h-10 flex items-center justify-center bg-[#F8FAFC] hover:bg-slate-100 text-[#0F1729] font-medium text-[14px] px-[17px] border border-[#E1E7EF] rounded-[10px] transition-colors cursor-pointer gap-2"
            >
              <Plus size={16} />
              <span>Add Client</span>
            </Link>
            <Link
              to="/products"
              className="h-10 flex items-center justify-center bg-[#D90B37] hover:bg-[#c00930] text-white font-medium text-[14px] px-4 rounded-[10px] transition-colors shadow-[0px_4px_14px_0px_rgba(217,11,55,0.3)] cursor-pointer gap-2"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </Link>
          </div>
        )}
      </div>

      {/* Row 2: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Corporate Clients */}
        <Link
          to="/clients"
          className="bg-white rounded-[12px] border border-[#E1E7EF] h-[156px] w-full p-6 flex flex-col justify-between box-border shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-[#CE1C2B]/40 transition-all duration-200 cursor-pointer group block"
        >
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-medium text-[#65758B] leading-[20px] group-hover:text-[#0F1729] transition-colors">Corporate Clients</span>
            <div className="w-10 h-10 bg-[#FCE8ED] text-[#CE1C2B] group-hover:bg-[#CE1C2B] group-hover:text-white rounded-[12px] flex items-center justify-center flex-shrink-0 transition-colors">
              <Building2 size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-[24px] font-semibold text-[#0F1729] leading-[32px]">{metrics.corporateClients}</h3>
            <p className="text-[12px] font-normal text-[#10B77F] leading-[16px] mt-1">
              +{metrics.clientsThisMonth || 0} this month
            </p>
          </div>
        </Link>

        {/* Card 2: Total Orders */}
        <Link
          to="/orders"
          className="bg-white rounded-[12px] border border-[#E1E7EF] h-[156px] w-full p-6 flex flex-col justify-between box-border shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-[#CE1C2B]/40 transition-all duration-200 cursor-pointer group block"
        >
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-medium text-[#65758B] leading-[20px] group-hover:text-[#0F1729] transition-colors">Total Orders</span>
            <div className="w-10 h-10 bg-[#FCE8ED] text-[#CE1C2B] group-hover:bg-[#CE1C2B] group-hover:text-white rounded-[12px] flex items-center justify-center flex-shrink-0 transition-colors">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-[24px] font-semibold text-[#0F1729] leading-[32px]">{metrics.totalOrders}</h3>
            <p className="text-[12px] font-normal text-[#10B77F] leading-[16px] mt-1">
              {metrics.ordersThisMonth || 0} this month
            </p>
          </div>
        </Link>

        {/* Card 3: Pending Dispatch */}
        <Link
          to="/dispatch"
          className="bg-white rounded-[12px] border border-[#E1E7EF] h-[156px] w-full p-6 flex flex-col justify-between box-border shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-[#CE1C2B]/40 transition-all duration-200 cursor-pointer group block"
        >
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-medium text-[#65758B] leading-[20px] group-hover:text-[#0F1729] transition-colors">Pending Dispatch</span>
            <div className="w-10 h-10 bg-[#FCE8ED] text-[#CE1C2B] group-hover:bg-[#CE1C2B] group-hover:text-white rounded-[12px] flex items-center justify-center flex-shrink-0 transition-colors">
              <Truck size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-[24px] font-semibold text-[#0F1729] leading-[32px]">{metrics.pendingDispatch}</h3>
            <p className="text-[12px] font-normal text-[#EF4343] leading-[16px] mt-1">
              {metrics.urgentDispatches || 0} urgent
            </p>
          </div>
        </Link>

        {/* Card 4: Inventory Alerts */}
        <Link
          to="/inventory"
          className="bg-white rounded-[12px] border border-[#E1E7EF] h-[156px] w-full p-6 flex flex-col justify-between box-border shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-[#CE1C2B]/40 transition-all duration-200 cursor-pointer group block"
        >
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-medium text-[#65758B] leading-[20px] group-hover:text-[#0F1729] transition-colors">Inventory Alerts</span>
            <div className="w-10 h-10 bg-[#FCE8ED] text-[#CE1C2B] group-hover:bg-[#CE1C2B] group-hover:text-white rounded-[12px] flex items-center justify-center flex-shrink-0 transition-colors">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-[24px] font-semibold text-[#0F1729] leading-[32px]">{metrics.inventoryAlerts}</h3>
            <p className="text-[12px] font-normal text-[#EF4343] leading-[16px] mt-1">
              {metrics.criticalInventoryCount || 0} critical items
            </p>
          </div>
        </Link>

        {/* Card 5: Total Products */}
        <Link
          to="/products"
          className="bg-white rounded-[12px] border border-[#E1E7EF] h-[156px] w-full p-6 flex flex-col justify-between box-border shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-[#CE1C2B]/40 transition-all duration-200 cursor-pointer group block"
        >
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-medium text-[#65758B] leading-[20px] group-hover:text-[#0F1729] transition-colors">Total Products</span>
            <div className="w-10 h-10 bg-[#FCE8ED] text-[#CE1C2B] group-hover:bg-[#CE1C2B] group-hover:text-white rounded-[12px] flex items-center justify-center flex-shrink-0 transition-colors">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-[24px] font-semibold text-[#0F1729] leading-[32px]">{metrics.totalProducts}</h3>
            <p className="text-[12px] font-normal text-[#65758B] leading-[16px] mt-1">
              {metrics.inventoryAlerts || 0} low stock
            </p>
          </div>
        </Link>
      </div>

      {/* Row 3: Two Side-by-Side Dynamic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Orders Trend */}
        <div className="bg-white rounded-[12px] border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] min-h-[385px] h-auto flex flex-col p-5 sm:p-6 box-border">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
            <h3 className="text-[14px] font-semibold text-[#0F1729] leading-[20px] whitespace-nowrap">Orders Trend</h3>

            {/* From - To Month/Year Filter Controls (Primary & White Theme) */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-[12px]">
              {/* From Select */}
              <div className="flex items-center gap-1.5 bg-white border border-[#E1E7EF] hover:border-[#CE1C2B]/60 focus-within:border-[#CE1C2B] focus-within:ring-2 focus-within:ring-[#CE1C2B]/10 rounded-[8px] px-2 py-1 shadow-sm transition-all">
                <span className="text-[10px] font-bold text-[#CE1C2B] bg-[#FCE8ED] px-1.5 py-0.5 rounded-[4px] uppercase tracking-wide">From</span>
                <select
                  value={fromMonth}
                  onChange={(e) => handleFromMonthChange(parseInt(e.target.value))}
                  className="bg-transparent text-[11px] sm:text-[12px] font-semibold text-[#0F1729] hover:text-[#CE1C2B] focus:outline-none cursor-pointer pr-1 transition-colors"
                >
                  {monthsList.map((m) => (
                    <option key={m.value} value={m.value} className="text-[#0F1729] bg-white">
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  value={fromYear}
                  onChange={(e) => handleFromYearChange(parseInt(e.target.value))}
                  className="bg-transparent text-[11px] sm:text-[12px] font-semibold text-[#0F1729] hover:text-[#CE1C2B] focus:outline-none cursor-pointer transition-colors"
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y} className="text-[#0F1729] bg-white">
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* To Select with Validation */}
              <div className="flex items-center gap-1.5 bg-white border border-[#E1E7EF] hover:border-[#CE1C2B]/60 focus-within:border-[#CE1C2B] focus-within:ring-2 focus-within:ring-[#CE1C2B]/10 rounded-[8px] px-2 py-1 shadow-sm transition-all">
                <span className="text-[10px] font-bold text-[#CE1C2B] bg-[#FCE8ED] px-1.5 py-0.5 rounded-[4px] uppercase tracking-wide">To</span>
                <select
                  value={toMonth}
                  onChange={(e) => handleToMonthChange(parseInt(e.target.value))}
                  className="bg-transparent text-[11px] sm:text-[12px] font-semibold text-[#0F1729] hover:text-[#CE1C2B] focus:outline-none cursor-pointer pr-1 transition-colors"
                >
                  {monthsList
                    .filter((m) => toYear > fromYear || m.value >= fromMonth)
                    .map((m) => (
                      <option key={m.value} value={m.value} className="text-[#0F1729] bg-white">
                        {m.label}
                      </option>
                    ))}
                </select>
                <select
                  value={toYear}
                  onChange={(e) => handleToYearChange(parseInt(e.target.value))}
                  className="bg-transparent text-[11px] sm:text-[12px] font-semibold text-[#0F1729] hover:text-[#CE1C2B] focus:outline-none cursor-pointer transition-colors"
                >
                  {yearsList
                    .filter((y) => y >= fromYear)
                    .map((y) => (
                      <option key={y} value={y} className="text-[#0F1729] bg-white">
                        {y}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Chart Canvas Area */}
          <div
            className="flex-grow w-full mt-2 relative select-none min-h-[210px]"
            onMouseLeave={() => setHoveredOrdersPt(null)}
            onMouseMove={(e) => {
              if (ordersTrend.length === 0) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const mouseX = e.clientX - rect.left;
              const svgX = (mouseX / rect.width) * 740;
              const plotLeft = 45;
              const plotRight = 705;
              const plotWidth = plotRight - plotLeft;

              const points = ordersTrend.map((item, i) => {
                const x = ordersTrend.length === 1
                  ? (plotLeft + plotRight) / 2
                  : plotLeft + i * (plotWidth / (ordersTrend.length - 1));
                return { x, item, index: i };
              });

              let closest = points[0];
              let minDiff = Infinity;
              points.forEach((pt) => {
                const diff = Math.abs(pt.x - svgX);
                if (diff < minDiff) {
                  minDiff = diff;
                  closest = pt;
                }
              });

              // Also calculate y coordinate for the closest point
              const maxVal = Math.max(...ordersTrend.map(o => o.orders || 0), 20);
              const step = Math.ceil(maxVal / 4 / 5) * 5 || 10;
              const maxY = step * 4;
              const topY = 20;
              const bottomY = 180;
              const plotHeight = bottomY - topY;
              const y = bottomY - ((closest.item.orders || 0) / maxY) * plotHeight;

              setHoveredOrdersPt({ ...closest, y });
            }}
          >
            {ordersTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#65758B]">No order trends data recorded for this selection.</div>
            ) : (
              <>
                <svg width="100%" height="100%" viewBox="0 0 740 215" className="overflow-visible text-[12px] font-['Inter']">
                  {(() => {
                    const plotLeft = 45;
                    const plotRight = 705;
                    const topY = 20;
                    const bottomY = 180;
                    const plotHeight = bottomY - topY;
                    const plotWidth = plotRight - plotLeft;

                    const maxVal = Math.max(...ordersTrend.map(o => o.orders || 0), 20);
                    const step = Math.ceil(maxVal / 4 / 5) * 5 || 10;
                    const maxY = step * 4;
                    const yLabels = [0, step, step * 2, step * 3, maxY];

                    const N = ordersTrend.length;
                    const points = ordersTrend.map((item, i) => {
                      const x = N === 1 ? (plotLeft + plotRight) / 2 : plotLeft + i * (plotWidth / (N - 1));
                      const y = bottomY - ((item.orders || 0) / maxY) * plotHeight;
                      return { x, y, item, index: i };
                    });

                    // Build smooth SVG path
                    let linePath = '';
                    if (points.length === 1) {
                      linePath = `M ${points[0].x} ${points[0].y}`;
                    } else if (points.length > 1) {
                      linePath = `M ${points[0].x} ${points[0].y}`;
                      for (let i = 0; i < points.length - 1; i++) {
                        const curr = points[i];
                        const next = points[i + 1];
                        const cp1x = curr.x + (next.x - curr.x) / 3;
                        const cp1y = curr.y;
                        const cp2x = curr.x + (2 * (next.x - curr.x)) / 3;
                        const cp2y = next.y;
                        linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
                      }
                    }

                    const firstPt = points[0] || { x: plotLeft, y: bottomY };
                    const lastPt = points[points.length - 1] || { x: plotRight, y: bottomY };
                    const areaPath = `${linePath} L ${lastPt.x} ${bottomY} L ${firstPt.x} ${bottomY} Z`;

                    return (
                      <>
                        <defs>
                          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#E21D48" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#E21D48" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines & Y-axis ticks */}
                        {yLabels.map((val, i) => {
                          const y = bottomY - (val / maxY) * plotHeight;
                          return (
                            <g key={i}>
                              <line
                                x1={plotLeft}
                                y1={y}
                                x2={plotRight}
                                y2={y}
                                stroke="#E2E8F0"
                                strokeDasharray="3 3"
                                strokeWidth="1"
                              />
                              <line
                                x1={plotLeft - 4}
                                y1={y}
                                x2={plotLeft}
                                y2={y}
                                stroke="#94A3B8"
                                strokeWidth="1"
                              />
                              <text
                                x={plotLeft - 8}
                                y={y + 4}
                                textAnchor="end"
                                fill="#94A3B8"
                                fontSize="11"
                                fontFamily="Inter, sans-serif"
                              >
                                {val}
                              </text>
                            </g>
                          );
                        })}

                        {/* Vertical Grid Lines & X-axis labels */}
                        {points.map((pt, i) => {
                          const isHovered = hoveredOrdersPt?.index === i;
                          const showLabel = points.length <= 12 || i === 0 || (i + 1) % 5 === 0 || i === points.length - 1;

                          return (
                            <g key={i}>
                              <line
                                x1={pt.x}
                                y1={topY}
                                x2={pt.x}
                                y2={bottomY}
                                stroke="#E2E8F0"
                                strokeDasharray="3 3"
                                strokeWidth="1"
                              />
                              {/* X-axis tick mark on axis */}
                              <line
                                x1={pt.x}
                                y1={bottomY}
                                x2={pt.x}
                                y2={bottomY + 4}
                                stroke="#94A3B8"
                                strokeWidth="1"
                              />
                              {/* X-axis Month/Year Label */}
                              {showLabel && (
                                <text
                                  x={pt.x}
                                  y={bottomY + 18}
                                  textAnchor="middle"
                                  fill={isHovered ? '#0F1729' : '#94A3B8'}
                                  fontWeight={isHovered ? '600' : '400'}
                                  fontSize="11"
                                  fontFamily="Inter, sans-serif"
                                >
                                  {pt.item.month}
                                </text>
                              )}
                            </g>
                          );
                        })}

                        {/* Solid Axis Lines */}
                        <line
                          x1={plotLeft}
                          y1={topY}
                          x2={plotLeft}
                          y2={bottomY}
                          stroke="#94A3B8"
                          strokeWidth="1"
                        />
                        <line
                          x1={plotLeft}
                          y1={bottomY}
                          x2={plotRight}
                          y2={bottomY}
                          stroke="#94A3B8"
                          strokeWidth="1"
                        />

                        {/* Shaded Area under Curve */}
                        {points.length > 1 && (
                          <path d={areaPath} fill="url(#curveGradient)" />
                        )}

                        {/* Red Main Curve Line */}
                        {points.length > 1 && (
                          <path
                            d={linePath}
                            fill="none"
                            stroke="#E21D48"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* Hover Dot Marker */}
                        {points.map((pt, idx) => {
                          const isHovered = hoveredOrdersPt?.index === idx;
                          if (!isHovered) return null;
                          return (
                            <g key={idx}>
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={5.5}
                                fill="#E21D48"
                                stroke="#FFFFFF"
                                strokeWidth={2}
                              />
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>

                {/* Floating Tooltip Box */}
                {hoveredOrdersPt && (
                  <div
                    className="absolute z-30 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.12)] p-3.5 text-[12px] min-w-[210px] pointer-events-none transition-all duration-75 ease-out"
                    style={{
                      left: `${(hoveredOrdersPt.x / 740) * 100}%`,
                      top: `${Math.max(5, Math.min(45, (hoveredOrdersPt.y / 215) * 100 - 25))}%`,
                      transform: hoveredOrdersPt.index >= (ordersTrend.length / 2)
                        ? 'translate(-105%, -20%)'
                        : 'translate(10%, -20%)',
                    }}
                  >
                    <div className="font-semibold text-[#0F1729] text-[13px] border-b border-[#F1F5F9] pb-1.5 mb-2">
                      {hoveredOrdersPt.item.label || `${hoveredOrdersPt.item.month} ${hoveredOrdersPt.item.year || new Date().getFullYear()}`}
                    </div>
                    <div className="space-y-1.5 font-medium">
                      <div className="flex justify-between items-center text-[#64748B]">
                        <span>Total Orders</span>
                        <span className="font-semibold text-[#0F1729]">{hoveredOrdersPt.item.orders ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#64748B]">
                        <span>Pending Orders</span>
                        <span className="font-semibold text-[#F59E0B]">{hoveredOrdersPt.item.pending ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#64748B]">
                        <span>Completed Orders</span>
                        <span className="font-semibold text-[#10B77F]">
                          {hoveredOrdersPt.item.completed ?? Math.max(0, (hoveredOrdersPt.item.orders || 0) - (hoveredOrdersPt.item.pending || 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[#64748B] pt-1.5 border-t border-[#F1F5F9]">
                        <span>Completion Rate</span>
                        <span className="font-bold text-[#E21D48]">
                          {hoveredOrdersPt.item.completionRate !== undefined
                            ? `${hoveredOrdersPt.item.completionRate}%`
                            : hoveredOrdersPt.item.orders > 0
                              ? `${(((hoveredOrdersPt.item.completed ?? Math.max(0, hoveredOrdersPt.item.orders - hoveredOrdersPt.item.pending)) / hoveredOrdersPt.item.orders) * 100).toFixed(1)}%`
                              : '0.0%'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-6 text-[12px] text-[#64748B] font-normal pl-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-0.5 bg-[#E21D48]"></span>
              <span>Total Orders</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-0.5 bg-[#E21D48]/50"></span>
              <span>Pending</span>
            </div>
          </div>
        </div>

        {/* Product Demand by Category */}
        <div className="bg-white rounded-[12px] border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] min-h-[385px] h-auto flex flex-col p-5 sm:p-6 box-border">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
            <h3 className="text-[14px] font-semibold text-[#0F1729] leading-[20px] whitespace-nowrap">Product Demand by Category</h3>

            {/* From - To Month/Year Filter Controls (Primary & White Theme with Validation) */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-[12px]">
              {/* From Select */}
              <div className="flex items-center gap-1.5 bg-white border border-[#E1E7EF] hover:border-[#CE1C2B]/60 focus-within:border-[#CE1C2B] focus-within:ring-2 focus-within:ring-[#CE1C2B]/10 rounded-[8px] px-2 py-1 shadow-sm transition-all">
                <span className="text-[10px] font-bold text-[#CE1C2B] bg-[#FCE8ED] px-1.5 py-0.5 rounded-[4px] uppercase tracking-wide">From</span>
                <select
                  value={catFromMonth}
                  onChange={(e) => handleCatFromMonthChange(parseInt(e.target.value))}
                  className="bg-transparent text-[11px] sm:text-[12px] font-semibold text-[#0F1729] hover:text-[#CE1C2B] focus:outline-none cursor-pointer pr-1 transition-colors"
                >
                  {monthsList.map((m) => (
                    <option key={m.value} value={m.value} className="text-[#0F1729] bg-white">
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  value={catFromYear}
                  onChange={(e) => handleCatFromYearChange(parseInt(e.target.value))}
                  className="bg-transparent text-[11px] sm:text-[12px] font-semibold text-[#0F1729] hover:text-[#CE1C2B] focus:outline-none cursor-pointer transition-colors"
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y} className="text-[#0F1729] bg-white">
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* To Select with Validation */}
              <div className="flex items-center gap-1.5 bg-white border border-[#E1E7EF] hover:border-[#CE1C2B]/60 focus-within:border-[#CE1C2B] focus-within:ring-2 focus-within:ring-[#CE1C2B]/10 rounded-[8px] px-2 py-1 shadow-sm transition-all">
                <span className="text-[10px] font-bold text-[#CE1C2B] bg-[#FCE8ED] px-1.5 py-0.5 rounded-[4px] uppercase tracking-wide">To</span>
                <select
                  value={catToMonth}
                  onChange={(e) => handleCatToMonthChange(parseInt(e.target.value))}
                  className="bg-transparent text-[11px] sm:text-[12px] font-semibold text-[#0F1729] hover:text-[#CE1C2B] focus:outline-none cursor-pointer pr-1 transition-colors"
                >
                  {monthsList
                    .filter((m) => catToYear > catFromYear || m.value >= catFromMonth)
                    .map((m) => (
                      <option key={m.value} value={m.value} className="text-[#0F1729] bg-white">
                        {m.label}
                      </option>
                    ))}
                </select>
                <select
                  value={catToYear}
                  onChange={(e) => handleCatToYearChange(parseInt(e.target.value))}
                  className="bg-transparent text-[11px] sm:text-[12px] font-semibold text-[#0F1729] hover:text-[#CE1C2B] focus:outline-none cursor-pointer transition-colors"
                >
                  {yearsList
                    .filter((y) => y >= catFromYear)
                    .map((y) => (
                      <option key={y} value={y} className="text-[#0F1729] bg-white">
                        {y}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Chart Canvas Area */}
          <div
            className="flex-grow w-full mt-2 relative select-none min-h-[210px]"
            onMouseLeave={() => setHoveredDemandPt(null)}
            onMouseMove={(e) => {
              if (categoryDemandData.length === 0) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const mouseX = e.clientX - rect.left;
              const svgX = (mouseX / rect.width) * 740;
              const plotLeft = 45;
              const plotRight = 705;
              const plotWidth = plotRight - plotLeft;

              const colStep = plotWidth / categoryDemandData.length;
              let idx = Math.floor((svgX - plotLeft) / colStep);
              idx = Math.max(0, Math.min(categoryDemandData.length - 1, idx));

              const item = categoryDemandData[idx];
              const x = plotLeft + (idx + 0.5) * colStep;

              setHoveredDemandPt({ item, index: idx, x });
            }}
          >
            {categoryDemandData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#65758B]">No category demand recorded for this selection.</div>
            ) : (
              <>
                <svg width="100%" height="100%" viewBox="0 0 740 215" className="overflow-visible text-[12px] font-['Inter']">
                  {(() => {
                    const plotLeft = 45;
                    const plotRight = 705;
                    const topY = 20;
                    const bottomY = 180;
                    const plotHeight = bottomY - topY;
                    const plotWidth = plotRight - plotLeft;

                    const maxVal = Math.max(
                      ...categoryDemandData.flatMap(d => [d.Electronics, d.Apparel, d.Wellness, d.Gourmet]),
                      80
                    );
                    const step = Math.ceil(maxVal / 4 / 10) * 10 || 20;
                    const maxY = step * 4;
                    const yLabels = [0, step, step * 2, step * 3, maxY];

                    const N = categoryDemandData.length;
                    const colStep = plotWidth / N;
                    const maxGroupW = Math.min(colStep * 0.75, 76);
                    const gap = Math.max(2, Math.min(4, maxGroupW * 0.04));
                    const barW = (maxGroupW - 3 * gap) / 4;

                    return (
                      <>
                        {/* Grid lines & Y-axis ticks */}
                        {yLabels.map((val, i) => {
                          const y = bottomY - (val / maxY) * plotHeight;
                          return (
                            <g key={i}>
                              <line
                                x1={plotLeft}
                                y1={y}
                                x2={plotRight}
                                y2={y}
                                stroke="#E2E8F0"
                                strokeDasharray="3 3"
                                strokeWidth="1"
                              />
                              <line
                                x1={plotLeft - 4}
                                y1={y}
                                x2={plotLeft}
                                y2={y}
                                stroke="#94A3B8"
                                strokeWidth="1"
                              />
                              <text
                                x={plotLeft - 8}
                                y={y + 4}
                                textAnchor="end"
                                fill="#94A3B8"
                                fontSize="11"
                                fontFamily="Inter, sans-serif"
                              >
                                {val}
                              </text>
                            </g>
                          );
                        })}

                        {/* Month columns, vertical gridlines, and Grouped Bars */}
                        {categoryDemandData.map((item, i) => {
                          const colCenter = plotLeft + (i + 0.5) * colStep;
                          const isHovered = hoveredDemandPt?.index === i;
                          const groupLeft = colCenter - maxGroupW / 2;

                          // Heights
                          const hElec = Math.max(2, ((item.Electronics || 0) / maxY) * plotHeight);
                          const hApp = Math.max(2, ((item.Apparel || 0) / maxY) * plotHeight);
                          const hWell = Math.max(2, ((item.Wellness || 0) / maxY) * plotHeight);
                          const hGour = Math.max(2, ((item.Gourmet || 0) / maxY) * plotHeight);

                          return (
                            <g key={i}>
                              {/* Vertical Dashed Grid Line */}
                              <line
                                x1={colCenter}
                                y1={topY}
                                x2={colCenter}
                                y2={bottomY}
                                stroke="#E2E8F0"
                                strokeDasharray="3 3"
                                strokeWidth="1"
                              />

                              {/* Hover Column Highlight */}
                              {isHovered && (
                                <rect
                                  x={colCenter - colStep / 2 + 2}
                                  y={topY}
                                  width={colStep - 4}
                                  height={plotHeight}
                                  fill="#F8FAFC"
                                  rx="4"
                                  opacity="0.9"
                                />
                              )}

                              {/* 4 Grouped Bars */}
                              {/* 1. Electronics (Red) */}
                              <rect
                                x={groupLeft + 0 * (barW + gap)}
                                y={bottomY - hElec}
                                width={barW}
                                height={hElec}
                                fill="#E21D48"
                                rx="2"
                                className="transition-all duration-200"
                              />

                              {/* 2. Apparel (Black) */}
                              <rect
                                x={groupLeft + 1 * (barW + gap)}
                                y={bottomY - hApp}
                                width={barW}
                                height={hApp}
                                fill="#0F1729"
                                rx="2"
                                className="transition-all duration-200"
                              />

                              {/* 3. Wellness (Black/Dark) */}
                              <rect
                                x={groupLeft + 2 * (barW + gap)}
                                y={bottomY - hWell}
                                width={barW}
                                height={hWell}
                                fill="#0F1729"
                                rx="2"
                                className="transition-all duration-200"
                              />

                              {/* 4. Gourmet (Black/Dark) */}
                              <rect
                                x={groupLeft + 3 * (barW + gap)}
                                y={bottomY - hGour}
                                width={barW}
                                height={hGour}
                                fill="#0F1729"
                                rx="2"
                                className="transition-all duration-200"
                              />

                              {/* X-axis Tick & Month Label */}
                              <line
                                x1={colCenter}
                                y1={bottomY}
                                x2={colCenter}
                                y2={bottomY + 4}
                                stroke="#94A3B8"
                                strokeWidth="1"
                              />
                              <text
                                x={colCenter}
                                y={bottomY + 18}
                                textAnchor="middle"
                                fill={isHovered ? '#0F1729' : '#94A3B8'}
                                fontWeight={isHovered ? '600' : '400'}
                                fontSize="11"
                                fontFamily="Inter, sans-serif"
                              >
                                {item.month}
                              </text>
                            </g>
                          );
                        })}

                        {/* Solid Axis Lines */}
                        <line
                          x1={plotLeft}
                          y1={topY}
                          x2={plotLeft}
                          y2={bottomY}
                          stroke="#94A3B8"
                          strokeWidth="1"
                        />
                        <line
                          x1={plotLeft}
                          y1={bottomY}
                          x2={plotRight}
                          y2={bottomY}
                          stroke="#94A3B8"
                          strokeWidth="1"
                        />
                      </>
                    );
                  })()}
                </svg>

                {/* Floating Tooltip Box */}
                {hoveredDemandPt && (
                  <div
                    className="absolute z-30 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.14)] p-3.5 text-[12px] min-w-[210px] pointer-events-none transition-all duration-75 ease-out"
                    style={{
                      left: `${(hoveredDemandPt.x / 740) * 100}%`,
                      top: '15%',
                      transform: hoveredDemandPt.index >= (categoryDemandData.length / 2)
                        ? 'translate(-105%, -20%)'
                        : 'translate(10%, -20%)',
                    }}
                  >
                    <div className="font-semibold text-[#0F1729] text-[13px] border-b border-[#F1F5F9] pb-1.5 mb-2">
                      {hoveredDemandPt.item.label || `${hoveredDemandPt.item.month} ${hoveredDemandPt.item.year || new Date().getFullYear()}`}
                    </div>
                    <div className="space-y-1.5 font-medium">
                      <div className="flex justify-between items-center text-[#64748B]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#E21D48]"></span>
                          Electronics
                        </span>
                        <span className="font-semibold text-[#0F1729]">{hoveredDemandPt.item.Electronics} units</span>
                      </div>
                      <div className="flex justify-between items-center text-[#64748B]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#0F1729]"></span>
                          Apparel
                        </span>
                        <span className="font-semibold text-[#0F1729]">{hoveredDemandPt.item.Apparel} units</span>
                      </div>
                      <div className="flex justify-between items-center text-[#64748B]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#0F1729]"></span>
                          Wellness
                        </span>
                        <span className="font-semibold text-[#0F1729]">{hoveredDemandPt.item.Wellness} units</span>
                      </div>
                      <div className="flex justify-between items-center text-[#64748B]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#0F1729]"></span>
                          Gourmet
                        </span>
                        <span className="font-semibold text-[#0F1729]">{hoveredDemandPt.item.Gourmet} units</span>
                      </div>
                      <div className="flex justify-between items-center text-[#64748B] pt-1.5 border-t border-[#F1F5F9]">
                        <span>Total Demand</span>
                        <span className="font-bold text-[#E21D48]">
                          {(hoveredDemandPt.item.Electronics || 0) + (hoveredDemandPt.item.Apparel || 0) + (hoveredDemandPt.item.Wellness || 0) + (hoveredDemandPt.item.Gourmet || 0)} units
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Chart Legend matching reference */}
          <div className="flex items-center gap-6 text-[12px] text-[#64748B] font-normal pl-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E21D48]"></span>
              <span className="text-[#0F1729] font-medium">Electronics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#64748B]">Apparel</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#64748B]">Wellness</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#64748B]">Gourmet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3.5: Full-Width Revenue Overview Chart */}
      <div className="bg-white rounded-[12px] border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] h-[318px] flex flex-col p-6 box-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-[14px] font-semibold text-[#0F1729] leading-[20px]">Revenue Overview</h3>

          {/* From - To Month/Year Filter Controls (Primary & White Theme with Validation) */}
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            {/* From Select */}
            <div className="flex items-center gap-1.5 bg-white border border-[#E1E7EF] hover:border-[#CE1C2B]/60 focus-within:border-[#CE1C2B] focus-within:ring-2 focus-within:ring-[#CE1C2B]/10 rounded-[8px] px-2.5 py-1 shadow-sm transition-all">
              <span className="text-[11px] font-bold text-[#CE1C2B] bg-[#FCE8ED] px-1.5 py-0.5 rounded-[4px] uppercase tracking-wide">From</span>
              <select
                value={revFromMonth}
                onChange={(e) => handleRevFromMonthChange(parseInt(e.target.value))}
                className="bg-transparent text-[12px] font-semibold text-[#0F1729] hover:text-[#CE1C2B] focus:outline-none cursor-pointer pr-1 transition-colors"
              >
                {monthsList.map((m) => (
                  <option key={m.value} value={m.value} className="text-[#0F1729] bg-white">
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                value={revFromYear}
                onChange={(e) => handleRevFromYearChange(parseInt(e.target.value))}
                className="bg-transparent text-[12px] font-semibold text-[#0F1729] hover:text-[#CE1C2B] focus:outline-none cursor-pointer transition-colors"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y} className="text-[#0F1729] bg-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* To Select with Validation */}
            <div className="flex items-center gap-1.5 bg-white border border-[#E1E7EF] hover:border-[#CE1C2B]/60 focus-within:border-[#CE1C2B] focus-within:ring-2 focus-within:ring-[#CE1C2B]/10 rounded-[8px] px-2.5 py-1 shadow-sm transition-all">
              <span className="text-[11px] font-bold text-[#CE1C2B] bg-[#FCE8ED] px-1.5 py-0.5 rounded-[4px] uppercase tracking-wide">To</span>
              <select
                value={revToMonth}
                onChange={(e) => handleRevToMonthChange(parseInt(e.target.value))}
                className="bg-transparent text-[12px] font-semibold text-[#0F1729] hover:text-[#CE1C2B] focus:outline-none cursor-pointer pr-1 transition-colors"
              >
                {monthsList
                  .filter((m) => revToYear > revFromYear || m.value >= revFromMonth)
                  .map((m) => (
                    <option key={m.value} value={m.value} className="text-[#0F1729] bg-white">
                      {m.label}
                    </option>
                  ))}
              </select>
              <select
                value={revToYear}
                onChange={(e) => handleRevToYearChange(parseInt(e.target.value))}
                className="bg-transparent text-[12px] font-semibold text-[#0F1729] hover:text-[#CE1C2B] focus:outline-none cursor-pointer transition-colors"
              >
                {yearsList
                  .filter((y) => y >= revFromYear)
                  .map((y) => (
                    <option key={y} value={y} className="text-[#0F1729] bg-white">
                      {y}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div
          className="flex-grow w-full mt-3 relative select-none"
          onMouseLeave={() => setHoveredRevenuePt(null)}
          onMouseMove={(e) => {
            if (revenueData.length === 0) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const svgX = (mouseX / rect.width) * 1100;
            const plotLeft = 55;
            const plotRight = 1060;
            const plotWidth = plotRight - plotLeft;

            const colStep = plotWidth / revenueData.length;
            let idx = Math.floor((svgX - plotLeft) / colStep);
            idx = Math.max(0, Math.min(revenueData.length - 1, idx));

            const item = revenueData[idx];
            const x = plotLeft + (idx + 0.5) * colStep;

            setHoveredRevenuePt({ item, index: idx, x });
          }}
        >
          {revenueData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#65758B]">No revenue data recorded for this selection.</div>
          ) : (
            <>
              <svg width="100%" height="100%" viewBox="0 0 1100 200" className="overflow-visible text-[12px] font-['Inter']">
                {(() => {
                  const plotLeft = 55;
                  const plotRight = 1060;
                  const topY = 18;
                  const bottomY = 166;
                  const plotHeight = bottomY - topY;
                  const plotWidth = plotRight - plotLeft;

                  const maxVal = Math.max(...revenueData.map(d => d.revenue || 0), 80000);
                  const step = Math.ceil(maxVal / 4 / 10000) * 10000 || 20000;
                  const maxY = step * 4;
                  const yLabels = [0, step, step * 2, step * 3, maxY];

                  const N = revenueData.length;
                  const colStep = plotWidth / N;
                  const barW = Math.min(colStep * 0.76, 145);

                  return (
                    <>
                      <defs>
                        <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E21D48" stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#E21D48" stopOpacity="0.45" />
                        </linearGradient>
                      </defs>

                      {/* Grid lines & Y-axis ticks */}
                      {yLabels.map((val, i) => {
                        const y = bottomY - (val / maxY) * plotHeight;
                        const labelText = `$${Math.round(val / 1000)}k`;
                        return (
                          <g key={i}>
                            <line
                              x1={plotLeft}
                              y1={y}
                              x2={plotRight}
                              y2={y}
                              stroke="#E2E8F0"
                              strokeDasharray="3 3"
                              strokeWidth="1"
                            />
                            <line
                              x1={plotLeft - 4}
                              y1={y}
                              x2={plotLeft}
                              y2={y}
                              stroke="#94A3B8"
                              strokeWidth="1"
                            />
                            <text
                              x={plotLeft - 8}
                              y={y + 4}
                              textAnchor="end"
                              fill="#94A3B8"
                              fontSize="11"
                              fontFamily="Inter, sans-serif"
                            >
                              {labelText}
                            </text>
                          </g>
                        );
                      })}

                      {/* Month columns, vertical dashed lines, and Wide Revenue Bars */}
                      {revenueData.map((item, i) => {
                        const colCenter = plotLeft + (i + 0.5) * colStep;
                        const isHovered = hoveredRevenuePt?.index === i;
                        const barH = Math.max(4, ((item.revenue || 0) / maxY) * plotHeight);
                        const barX = colCenter - barW / 2;

                        return (
                          <g key={i}>
                            {/* Vertical Dashed Grid Line */}
                            <line
                              x1={colCenter}
                              y1={topY}
                              x2={colCenter}
                              y2={bottomY}
                              stroke="#E2E8F0"
                              strokeDasharray="3 3"
                              strokeWidth="1"
                            />

                            {/* Hover Column Highlight */}
                            {isHovered && (
                              <rect
                                x={colCenter - colStep / 2 + 2}
                                y={topY}
                                width={colStep - 4}
                                height={plotHeight}
                                fill="#F8FAFC"
                                rx="4"
                                opacity="0.9"
                              />
                            )}

                            {/* Revenue Gradient Bar */}
                            <rect
                              x={barX}
                              y={bottomY - barH}
                              width={barW}
                              height={barH}
                              fill="url(#revenueBarGradient)"
                              rx="4"
                              className="transition-all duration-200 cursor-pointer"
                              opacity={isHovered ? '1' : '0.92'}
                            />

                            {/* X-axis Tick & Month Label */}
                            <line
                              x1={colCenter}
                              y1={bottomY}
                              x2={colCenter}
                              y2={bottomY + 4}
                              stroke="#94A3B8"
                              strokeWidth="1"
                            />
                            <text
                              x={colCenter}
                              y={bottomY + 18}
                              textAnchor="middle"
                              fill={isHovered ? '#0F1729' : '#64748B'}
                              fontWeight={isHovered ? '600' : '500'}
                              fontSize="11.5"
                              fontFamily="Inter, sans-serif"
                            >
                              {item.month}
                            </text>
                          </g>
                        );
                      })}

                      {/* Solid Axis Lines */}
                      <line
                        x1={plotLeft}
                        y1={topY}
                        x2={plotLeft}
                        y2={bottomY}
                        stroke="#94A3B8"
                        strokeWidth="1"
                      />
                      <line
                        x1={plotLeft}
                        y1={bottomY}
                        x2={plotRight}
                        y2={bottomY}
                        stroke="#94A3B8"
                        strokeWidth="1"
                      />
                    </>
                  );
                })()}
              </svg>

              {/* Floating Tooltip Box */}
              {hoveredRevenuePt && (
                <div
                  className="absolute z-30 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.14)] p-3.5 text-[12px] min-w-[220px] pointer-events-none transition-all duration-75 ease-out"
                  style={{
                    left: `${(hoveredRevenuePt.x / 1100) * 100}%`,
                    top: '10%',
                    transform: hoveredRevenuePt.index >= (revenueData.length / 2)
                      ? 'translate(-105%, -20%)'
                      : 'translate(10%, -20%)',
                  }}
                >
                  <div className="font-semibold text-[#0F1729] text-[13px] border-b border-[#F1F5F9] pb-1.5 mb-2">
                    {hoveredRevenuePt.item.label || `${hoveredRevenuePt.item.month} ${hoveredRevenuePt.item.year || new Date().getFullYear()}`}
                  </div>
                  <div className="space-y-1.5 font-medium">
                    <div className="flex justify-between items-center text-[#64748B]">
                      <span>Total Revenue</span>
                      <span className="font-bold text-[#E21D48] text-[13px]">
                        ${Number(hoveredRevenuePt.item.revenue || 0).toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[#64748B]">
                      <span>Orders Processed</span>
                      <span className="font-semibold text-[#0F1729]">{hoveredRevenuePt.item.orders || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#64748B] pt-1.5 border-t border-[#F1F5F9]">
                      <span>Avg Order Value</span>
                      <span className="font-semibold text-[#10B77F]">
                        ${Number(hoveredRevenuePt.item.avgOrderValue || 0).toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Row 4: Top Products and Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top Products Table (lg:col-span-2) */}
        <div className="bg-white rounded-[12px] border border-[#E1E7EF] lg:col-span-2 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] h-[402px] flex flex-col justify-between p-6 box-border overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#CE1C2B]" />
              <h3 className="text-[14px] font-semibold text-[#0F1729] leading-[20px]">Top Products</h3>
            </div>
            <span className="text-[11px] text-[#64748B] font-medium bg-[#F1F5F9] px-2.5 py-1 rounded-full">
              Click row to view details
            </span>
          </div>
          <div className="mt-4 flex-grow overflow-x-auto">
            {topProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#65758B]">No products in catalogue yet.</div>
            ) : (
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#E1E7EF] text-[#65758B] text-[12px] font-medium">
                    <th className="pb-3 font-medium text-left w-[38%] pl-4">Product</th>
                    <th className="pb-3 font-medium text-left w-[22%]">Category</th>
                    <th className="pb-3 font-medium text-left w-[14%]">Orders</th>
                    <th className="pb-3 font-medium text-left w-[16%]">Revenue</th>
                    <th className="pb-3 font-medium text-right w-[10%] pr-4">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedProduct(p)}
                      className="text-[14px] text-[#0F1729] hover:bg-[#F8FAFC] transition-colors h-[54px] cursor-pointer group border-b border-[#F1F5F9] last:border-b-0"
                    >
                      <td className="py-[14px] pr-2 pl-4 font-semibold text-[#0F1729] group-hover:text-[#CE1C2B] transition-colors truncate">
                        <span className="truncate">{p.name}</span>
                        <span className="text-[11px] text-[#CE1C2B] opacity-0 group-hover:opacity-100 transition-opacity font-medium ml-2 shrink-0">
                          View →
                        </span>
                      </td>
                      <td className="py-[14px] pr-2 text-[#64748B] group-hover:text-[#0F1729] font-normal transition-colors truncate">
                        {p.category || 'General'}
                      </td>
                      <td className="py-[14px] pr-2 text-[#64748B] group-hover:text-[#0F1729] font-normal transition-colors truncate">
                        {p.orders ?? 0}
                      </td>
                      <td className="py-[14px] pr-2 font-bold text-[#0F1729] group-hover:text-[#CE1C2B] transition-colors truncate">
                        ${Number(p.revenue || 0).toLocaleString('en-US')}
                      </td>
                      <td className="py-[14px] pr-4 text-right font-medium text-[#10B77F] truncate">
                        {p.trend || `+${18 - idx * 3}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Inventory Alerts List (lg:col-span-1) */}
        <div className="bg-white rounded-[12px] border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] h-[402px] flex flex-col p-6 box-border">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#0F1729] leading-[20px]">Inventory Alerts</h3>
            <Link
              to="/inventory"
              className="text-[12px] font-normal text-[#CE1C2B] hover:underline transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="flex-grow flex flex-col justify-start gap-3 mt-4 overflow-y-auto">
            {inventoryAlerts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#65758B]">All stock levels are optimal.</div>
            ) : (
              inventoryAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedProduct({
                      productId: alert.productId || alert.id,
                      name: alert.name,
                      sku: alert.sku,
                      category: alert.category || 'General',
                      basePrice: alert.basePrice || 50,
                      description: alert.description || alert.detail,
                      status: alert.status === 'Critical' ? 'Low Stock' : 'Optimal',
                      availableQty: alert.availableQty,
                      image: alert.image,
                    });
                  }}
                  className="flex items-center justify-between p-3 rounded-[12px] bg-[#F1F5F9] hover:bg-[#E2E8F0]/70 hover:shadow-sm transition-all box-border cursor-pointer group"
                >
                  <div className="overflow-hidden pr-2">
                    <span className="block text-[14px] font-medium text-[#0F1729] group-hover:text-[#CE1C2B] transition-colors leading-[20px] truncate">
                      {alert.name}
                    </span>
                    <span className="block text-[12px] text-[#65758B] font-normal leading-[15px] mt-[3px]">
                      {alert.detail}
                    </span>
                  </div>
                  <span className={`h-6 px-[10px] py-[3px] rounded-full text-[12px] font-medium inline-flex items-center justify-center flex-shrink-0 ${alert.color}`}>
                    {alert.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 5: Recent Orders */}
      <div className="bg-white rounded-[12px] border border-[#E1E7EF] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] p-6 flex flex-col justify-between min-h-[350px] box-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[#CE1C2B]" />
            <h3 className="text-[14px] font-semibold text-[#0F1729] leading-[20px]">Recent Orders</h3>
          </div>
          <Link
            to="/orders"
            className="text-[12px] font-medium text-[#CE1C2B] hover:text-[#b01422] hover:underline transition-colors border-none bg-transparent cursor-pointer"
          >
            View All →
          </Link>
        </div>

        <div className="mt-4 flex-grow overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#65758B]">No recent orders found.</div>
          ) : (
            <table className="w-full min-w-[700px] text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-[#E1E7EF] text-[#65758B] text-[12px] font-medium">
                  <th className="pb-3 font-medium text-left w-[18%] pl-4">Order ID</th>
                  <th className="pb-3 font-medium text-left w-[25%]">Client</th>
                  <th className="pb-3 font-medium text-left w-[12%]">Items</th>
                  <th className="pb-3 font-medium text-left w-[15%]">Total</th>
                  <th className="pb-3 font-medium text-left w-[15%]">Date</th>
                  <th className="pb-3 font-medium text-right w-[15%] pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="text-[14px] text-[#0F1729] hover:bg-[#F8FAFC] transition-colors h-[54px] cursor-pointer group border-b border-[#F1F5F9] last:border-b-0"
                  >
                    <td className="py-[14px] pr-2 pl-4 font-semibold text-[#0F1729] group-hover:text-[#CE1C2B] transition-colors truncate">
                      {order.id}
                      <span className="text-[11px] text-[#CE1C2B] opacity-0 group-hover:opacity-100 transition-opacity font-medium ml-1.5 shrink-0">
                        View →
                      </span>
                    </td>
                    <td className="py-[14px] pr-2 text-[#65758B] group-hover:text-[#0F1729] font-normal transition-colors truncate">
                      {order.client}
                    </td>
                    <td className="py-[14px] pr-2 text-[#65758B] group-hover:text-[#0F1729] font-normal transition-colors truncate">
                      {order.items}
                    </td>
                    <td className="py-[14px] pr-2 font-bold text-[#0F1729] group-hover:text-[#CE1C2B] transition-colors truncate">
                      {order.total}
                    </td>
                    <td className="py-[14px] pr-2 text-[#65758B] font-normal truncate">
                      {order.date}
                    </td>
                    <td className="py-[14px] pr-4 text-right">
                      <span className={`h-6 px-[10px] py-[3px] rounded-full text-[12px] font-medium inline-flex items-center justify-center ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Product Detail Popup Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-[16px] border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#F1F5F9] flex justify-between items-start bg-[#FAFBFD]">
              <div className="flex items-center gap-3">
                {/* Product Image Thumbnail */}
                {(fullProductDetail?.images?.[0] || fullProductDetail?.image || selectedProduct.image) ? (
                  <img
                    src={fullProductDetail?.images?.[0] || fullProductDetail?.image || selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-14 h-14 rounded-xl object-cover border border-[#E2E8F0] shadow-sm flex-shrink-0 bg-white"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#FCE8ED] text-[#CE1C2B] border border-[#E2E8F0] flex items-center justify-center flex-shrink-0">
                    <Package size={26} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FCE8ED] text-[#CE1C2B] uppercase tracking-wider">
                      {fullProductDetail?.category || selectedProduct.category || 'Product'}
                    </span>
                    <span className="text-[12px] font-medium text-[#64748B]">
                      SKU: {fullProductDetail?.sku || selectedProduct.sku || 'BOX-PRD-001'}
                    </span>
                  </div>
                  <h3 className="text-[18px] font-bold text-[#0F1729] mt-1 leading-snug">
                    {selectedProduct.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full hover:bg-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F1729] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {productDetailLoading && (
                <div className="text-center py-2 text-xs text-[#64748B]">
                  Updating latest details...
                </div>
              )}

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-3">
                  <span className="block text-[11px] font-medium text-[#64748B]">Total Orders</span>
                  <span className="text-[16px] font-bold text-[#0F1729] mt-0.5 block">{selectedProduct.orders ?? 0}</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-3">
                  <span className="block text-[11px] font-medium text-[#64748B]">Revenue</span>
                  <span className="text-[16px] font-bold text-[#E21D48] mt-0.5 block">
                    ${Number(selectedProduct.revenue || 0).toLocaleString('en-US')}
                  </span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-3">
                  <span className="block text-[11px] font-medium text-[#64748B]">Unit Price</span>
                  <span className="text-[16px] font-bold text-[#0F1729] mt-0.5 block">
                    ${Number(fullProductDetail?.basePrice || selectedProduct.basePrice || 50).toLocaleString('en-US')}
                  </span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-3">
                  <span className="block text-[11px] font-medium text-[#64748B]">Growth Trend</span>
                  <span className="text-[16px] font-bold text-[#10B77F] mt-0.5 block">
                    {selectedProduct.trend || '+18%'}
                  </span>
                </div>
              </div>

              {/* Details Summary */}
              <div className="border border-[#E2E8F0] rounded-[12px] p-4 bg-white space-y-2.5 text-[13px]">
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Product Name</span>
                  <span className="font-semibold text-[#0F1729]">{selectedProduct.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Category</span>
                  <span className="font-semibold text-[#0F1729]">{fullProductDetail?.category || selectedProduct.category || 'General'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Availability Status</span>
                  <span className="font-semibold text-[#10B77F] flex items-center gap-1">
                    <CheckCircle2 size={14} /> Available in Stock
                  </span>
                </div>
                <div className="pt-1">
                  <span className="block text-[#64748B] text-[12px] mb-1">Description</span>
                  <p className="text-[#0F1729] text-[12px] leading-relaxed">
                    {fullProductDetail?.description || selectedProduct.description || 'Premium quality curated item for corporate gifting and welcome kits.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#F1F5F9] bg-[#FAFBFD] flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-[8px] text-[13px] font-medium border border-[#E2E8F0] bg-white text-[#0F1729] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                to="/products"
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-[8px] text-[13px] font-medium bg-[#CE1C2B] hover:bg-[#b01422] text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Eye size={14} />
                <span>View in Products Master</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Popup Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-[16px] border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#F1F5F9] flex justify-between items-start bg-[#FAFBFD]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBF5FF] text-[#2E86DE] uppercase tracking-wider">
                    Order Summary
                  </span>
                  <span className={`h-6 px-[10px] py-[3px] rounded-full text-[12px] font-medium inline-flex items-center justify-center ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-[#0F1729] mt-1.5 leading-snug">
                  Order #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full hover:bg-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F1729] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-3">
                  <span className="block text-[11px] font-medium text-[#64748B]">Total Items</span>
                  <span className="text-[16px] font-bold text-[#0F1729] mt-0.5 block">{selectedOrder.items} units</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-3">
                  <span className="block text-[11px] font-medium text-[#64748B]">Total Amount</span>
                  <span className="text-[16px] font-bold text-[#CE1C2B] mt-0.5 block">{selectedOrder.total}</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-3">
                  <span className="block text-[11px] font-medium text-[#64748B]">Order Date</span>
                  <span className="text-[15px] font-bold text-[#0F1729] mt-0.5 block">{selectedOrder.date}</span>
                </div>
              </div>

              <div className="border border-[#E2E8F0] rounded-[12px] p-4 bg-white space-y-2.5 text-[13px]">
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Corporate Client</span>
                  <span className="font-semibold text-[#0F1729]">{selectedOrder.client}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B]">Fulfillment Status</span>
                  <span className="font-semibold text-[#0F1729]">{selectedOrder.status}</span>
                </div>
                {selectedOrder.shippingAddress && (
                  <div className="pt-1">
                    <span className="block text-[#64748B] text-[12px] mb-0.5">Shipping Destination</span>
                    <p className="text-[#0F1729] text-[12px]">
                      {selectedOrder.shippingAddress.street || 'Default Address'}, {selectedOrder.shippingAddress.city || 'City'}, {selectedOrder.shippingAddress.state || 'State'} - {selectedOrder.shippingAddress.zipCode || ''}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#F1F5F9] bg-[#FAFBFD] flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-[8px] text-[13px] font-medium border border-[#E2E8F0] bg-white text-[#0F1729] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                to="/orders"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-[8px] text-[13px] font-medium bg-[#CE1C2B] hover:bg-[#b01422] text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Eye size={14} />
                <span>Go to Orders Page</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

