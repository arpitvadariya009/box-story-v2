import React, { useState, useEffect } from 'react';
import { Search, Eye, Calendar, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  Active: { bg: '#DCFCE7', color: '#15803D' },
  Draft: { bg: '#F1F5F9', color: '#64748B' },
  Approved: { bg: '#D1FAE5', color: '#059669' },
  Expired: { bg: '#F1F5F9', color: '#64748B' },
};

const filterTabs = ['All', 'Active', 'Draft', 'Approved', 'Expired'];

const mapCatalogue = (cat) => ({
  _id: cat._id,
  name: cat.name,
  client: cat.client?.companyName || cat.client?.name || (typeof cat.client === 'string' ? cat.client : 'Client'),
  status: cat.status || 'Active',
  items: Array.isArray(cat.products) ? cat.products.length : (cat.items || 0),
  employees: cat.employees || 0,
  utilized: cat.budgetUtilizedPct || 0,
  rawBudget: cat.budget || 0,
  budgetUsed: cat.budgetUsed ? `₹${(cat.budgetUsed / 100000).toFixed(1)}L` : '₹0.0L',
  budgetTotal: cat.budget ? `₹${(cat.budget / 100000).toFixed(1)}L` : '₹0.0L',
  validTill: cat.activeTo
    ? new Date(cat.activeTo).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—',
});

const BDMGiftCatalogue = () => {
  const { api } = useAuth();
  const [catalogues, setCatalogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchCatalogues = async () => {
      setLoading(true);
      try {
        const res = await api.get('/products/catalogue/my-catalogues');
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data)) {
          setCatalogues(data.map(mapCatalogue));
        }
      } catch (_) {
        setCatalogues([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogues();
  }, [api]);

  const filtered = catalogues.filter((c) => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.client?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'All' || c.status === activeTab;
    return matchSearch && matchTab;
  });

  const totalBudgetSum = catalogues.reduce((sum, c) => sum + (c.rawBudget || 0), 0);
  const totalBudgetFormatted = totalBudgetSum > 0 ? `₹${(totalBudgetSum / 100000).toFixed(1)}L` : '₹0.0L';

  const stats = {
    total: catalogues.length,
    active: catalogues.filter((c) => c.status === 'Active').length,
    totalBudget: totalBudgetFormatted,
    clients: new Set(catalogues.map((c) => c.client).filter(Boolean)).size,
  };

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-[#0F1729]">Gift Catalogue</h1>
        <p className="text-[13px] text-[#64748B] mt-0.5">View gift catalogues for your assigned clients</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Catalogues', value: stats.total, icon: '🎁', iconBg: '#FEE2E8' },
          { label: 'Active', value: stats.active, icon: '✨', iconBg: '#D1FAE5' },
          { label: 'Total Budget', value: stats.totalBudget, icon: '₹', iconBg: '#EDE9FE', isText: true },
          { label: 'Clients Covered', value: stats.clients, icon: '👥', iconBg: '#DBEAFE' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#F1F5F9] p-5 flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-[18px] shrink-0"
              style={{ background: stat.iconBg }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-[22px] font-bold text-[#0F1729] leading-tight">{stat.value}</p>
              <p className="text-[12px] text-[#64748B]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by client or catalogue name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer border-none ${
                activeTab === tab
                  ? 'bg-[#D90B37] text-white'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#D90B37] hover:text-[#D90B37]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Catalogue Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-[#64748B]">Loading catalogues...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((cat) => {
            const sc = statusConfig[cat.status] || { bg: '#F1F5F9', color: '#64748B' };
            return (
              <div key={cat._id} className="bg-white rounded-2xl border border-[#F1F5F9] overflow-hidden">
                {/* Red top border accent */}
                <div className="h-1 bg-[#D90B37]" />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FEE2E8] flex items-center justify-center text-[16px]">🎁</div>
                      <div>
                        <p className="text-[14px] font-bold text-[#0F1729]">{cat.name}</p>
                        <p className="text-[12px] text-[#94A3B8]">{cat.client}</p>
                      </div>
                    </div>
                    <span
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}30` }}
                    >
                      {cat.status}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Items', value: cat.items },
                      { label: 'Employees', value: cat.employees },
                      { label: 'Utilized', value: `${cat.utilized}%` },
                    ].map((s) => (
                      <div key={s.label} className="text-center border-r border-[#F1F5F9] last:border-none">
                        <p className="text-[16px] font-bold text-[#0F1729]">{s.value}</p>
                        <p className="text-[11px] text-[#94A3B8]">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Budget */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] text-[#64748B]">Budget Utilization</span>
                      <span className="text-[12px] font-semibold text-[#64748B]">{cat.budgetUsed} / {cat.budgetTotal}</span>
                    </div>
                    <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D90B37] rounded-full"
                        style={{ width: `${cat.utilized}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F8FAFC]">
                    <div className="flex items-center gap-1.5 text-[12px] text-[#94A3B8]">
                      <Calendar size={12} />
                      Valid till {cat.validTill}
                    </div>
                    <button className="flex items-center gap-1.5 text-[13px] text-[#D90B37] font-semibold hover:underline cursor-pointer border-none bg-transparent">
                      <Eye size={14} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BDMGiftCatalogue;
