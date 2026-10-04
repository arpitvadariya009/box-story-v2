import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, BarChart2, Package, Truck, Download, AlertTriangle } from 'lucide-react';
import ClientWiseRevenueChart from '../components/charts/ClientWiseRevenueChart';
import ProductDemandTrendsChart from '../components/charts/ProductDemandTrendsChart';
import { exportToCSV } from '../utils/exportUtils';

const Reports = () => {
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState('Business Overview');
  const [analytics, setAnalytics] = useState(null);
  const [reorderAlerts, setReorderAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, invRes] = await Promise.all([
        api.get('/reports/analytics').catch(() => ({ data: null })),
        api.get('/inventory').catch(() => ({ data: [] })),
      ]);

      if (analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }

      if (invRes.data) {
        const lowItems = invRes.data.filter(
          (inv) => inv.availableQty <= inv.reorderLevel
        );
        setReorderAlerts(lowItems);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = analytics?.metrics || {
    totalRevenue: 0,
    totalOrders: 0,
    fulfillmentRate: 100,
    totalInventoryUnits: 0,
  };

  const clientRevenueData = analytics?.clientRevenueData || [];
  const inventoryCategoryData = analytics?.inventoryCategoryData || [];
  const courierPerformanceData = analytics?.courierPerformanceData || [];
  const productDemandTrends = analytics?.productDemandTrends || [];

  const avgOrderValue =
    metrics.totalOrders > 0
      ? Math.round(metrics.totalRevenue / metrics.totalOrders)
      : 0;

  const formatRevenue = (val) => {
    if (!val) return '₹0';
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const handleExportChart = (reportName) => {
    let headers = [];
    let rows = [];
    if (reportName === 'Client-wise Revenue') {
      headers = ['Client Name', 'Revenue (INR)'];
      rows = clientRevenueData.map((d) => [d.client, d.revenue]);
    } else if (reportName === 'Product Demand Trends') {
      headers = ['Month', 'Gift Boxes', 'Eco Merchandise', 'Custom Swag', 'Total Demand'];
      rows = productDemandTrends.map((d) => [d.month, d.series1 ?? '—', d.series2 ?? '—', d.series3 ?? '—', d.demand]);
    } else if (reportName === 'Stock Distribution by Category') {
      headers = ['Category', 'Available Stock Units'];
      rows = inventoryCategoryData.map((d) => [d.category, d.count]);
    } else if (reportName === 'Courier Performance') {
      headers = ['Courier Partner', 'Successful Deliveries'];
      rows = courierPerformanceData.map((d) => [d.courier, d.deliveries]);
    }

    if (rows.length === 0) {
      alert('No data available to export for this report.');
      return;
    }

    exportToCSV(reportName.toLowerCase().replace(/\s+/g, '_'), headers, rows);
  };

  return (
    <div className="pb-12 font-['Inter'] space-y-6">
      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-[#E3E3E3] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-[#878787] block mb-1">Total Revenue</span>
            <div className="text-2xl font-bold text-[#0F1729]">{formatRevenue(metrics.totalRevenue)}</div>
            <span className="text-xs font-semibold text-emerald-600 mt-1.5 inline-block">
              Delivered & In-transit
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDEDEE] flex items-center justify-center text-[#D90B37] flex-shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-[#E3E3E3] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-[#878787] block mb-1">Total Orders</span>
            <div className="text-2xl font-bold text-[#0F1729]">{metrics.totalOrders.toLocaleString('en-IN')}</div>
            <span className="text-xs font-semibold text-emerald-600 mt-1.5 inline-block">
              Across all clients
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDEDEE] flex items-center justify-center text-[#D90B37] flex-shrink-0">
            <BarChart2 size={20} />
          </div>
        </div>

        {/* Card 3: Avg Order Value */}
        <div className="bg-white rounded-2xl p-5 border border-[#E3E3E3] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-[#878787] block mb-1">Avg Order Value</span>
            <div className="text-2xl font-bold text-[#0F1729]">₹{avgOrderValue.toLocaleString('en-IN')}</div>
            <span className="text-xs font-semibold text-emerald-600 mt-1.5 inline-block">
              Per order average
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDEDEE] flex items-center justify-center text-[#D90B37] flex-shrink-0">
            <Package size={20} />
          </div>
        </div>

        {/* Card 4: Fulfillment Rate */}
        <div className="bg-white rounded-2xl p-5 border border-[#E3E3E3] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-[#878787] block mb-1">Fulfillment Rate</span>
            <div className="text-2xl font-bold text-[#0F1729]">{metrics.fulfillmentRate}%</div>
            <span className="text-xs font-semibold text-emerald-600 mt-1.5 inline-block">
              Delivered successfully
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDEDEE] flex items-center justify-center text-[#D90B37] flex-shrink-0">
            <Truck size={20} />
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="inline-flex p-1 bg-[#F1F5F9] rounded-xl gap-1">
        {['Business Overview', 'Inventory', 'Dispatch'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer border-none ${
              activeTab === tab
                ? 'bg-white text-[#0F1729] shadow-sm font-bold'
                : 'text-[#878787] hover:text-[#0F1729] bg-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Business Overview Tab */}
      {activeTab === 'Business Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client-wise Revenue (Horizontal Bar Chart matching UI image) */}
          <ClientWiseRevenueChart
            data={clientRevenueData}
            onExport={() => handleExportChart('Client-wise Revenue')}
          />

          {/* Product Demand Trends (Multi-line Smooth Spline Chart matching UI image) */}
          <ProductDemandTrendsChart
            data={productDemandTrends}
            onExport={() => handleExportChart('Product Demand Trends')}
          />
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'Inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#E3E3E3] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[16px] font-bold text-[#0F1729]">Stock Distribution by Category</h3>
              <button
                onClick={() => handleExportChart('Stock Distribution by Category')}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E3E3E3] rounded-xl text-xs font-semibold text-[#0F1729] hover:bg-slate-50 cursor-pointer bg-white transition-colors"
              >
                <Download size={14} />
                <span>Export</span>
              </button>
            </div>
            <div className="space-y-4 py-2">
              {inventoryCategoryData.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#878787]">No category inventory data recorded yet.</div>
              ) : (
                inventoryCategoryData.map((d, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-36 text-xs font-medium text-[#878787] truncate text-right">
                      {d.category}
                    </span>
                    <div className="flex-grow flex items-center gap-3">
                      <div
                        style={{ width: d.widthPct }}
                        className="h-7 bg-[#D90B37] rounded-md hover:bg-[#AE032C] transition-all cursor-pointer"
                      ></div>
                      <span className="text-xs font-bold text-[#0F1729]">{d.count} units</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E3E3E3] p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[16px] font-bold text-[#0F1729]">Stock Reorder Alerts</h3>
              <span className="text-xs font-semibold bg-[#FDEDEE] text-[#D90B37] px-2.5 py-1 rounded-full">
                {reorderAlerts.length} Low Stock Items
              </span>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-64">
              {reorderAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#878787]">All stock levels are optimal.</div>
              ) : (
                reorderAlerts.map((inv, idx) => (
                  <div key={inv._id || idx} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#0F1729] truncate pr-2">
                      {inv.product?.name || inv.sku || 'Inventory SKU'}
                    </span>
                    <span className="text-xs font-bold text-[#D90B37] flex-shrink-0">
                      {inv.availableQty} left (Reorder: {inv.reorderLevel})
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Tab */}
      {activeTab === 'Dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#E3E3E3] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[16px] font-bold text-[#0F1729]">Courier Performance</h3>
              <button
                onClick={() => handleExportChart('Courier Performance')}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E3E3E3] rounded-xl text-xs font-semibold text-[#0F1729] hover:bg-slate-50 cursor-pointer bg-white transition-colors"
              >
                <Download size={14} />
                <span>Export</span>
              </button>
            </div>
            <div className="space-y-4 py-2">
              {courierPerformanceData.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#878787]">No courier deliveries recorded yet.</div>
              ) : (
                courierPerformanceData.map((d, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-36 text-xs font-medium text-[#878787] truncate text-right">
                      {d.courier}
                    </span>
                    <div className="flex-grow flex items-center gap-3">
                      <div
                        style={{ width: d.widthPct }}
                        className="h-7 bg-[#10B981] rounded-md hover:bg-[#0D894F] transition-all cursor-pointer"
                      ></div>
                      <span className="text-xs font-bold text-[#0F1729]">{d.deliveries}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E3E3E3] p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[16px] font-bold text-[#0F1729]">Fulfillment Breakdown</h3>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                {metrics.fulfillmentRate}% Delivered
              </span>
            </div>
            <div className="space-y-4 py-4">
              <div>
                <div className="flex justify-between text-sm font-semibold text-[#0F1729] mb-1.5">
                  <span>Delivered Orders</span>
                  <span className="text-emerald-600">{metrics.fulfillmentRate}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, metrics.fulfillmentRate)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold text-[#0F1729] mb-1.5">
                  <span>Pending / In-Transit Orders</span>
                  <span className="text-amber-500">{(100 - metrics.fulfillmentRate).toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, 100 - metrics.fulfillmentRate)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

