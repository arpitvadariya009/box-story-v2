import React, { useState, useEffect } from 'react';
import { Search, Eye, Pencil, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  Active: { bg: 'bg-green-50', text: 'text-green-600' },
  Inactive: { bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-500' },
};

const ProcurementProductCatalogue = () => {
  const { api } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/products');
        const arr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const mapped = arr.map((p, i) => ({
          _id: p._id,
          sku: p.sku || `SKU-${String(i + 1).padStart(3, '0')}`,
          name: p.name,
          category: p.category || 'General',
          vendor: p.vendor?.name || '—',
          moq: p.moq ? `${p.moq} Units` : (p.dimensions?.weight ? `${p.dimensions.weight} Kg` : '1 unit'),
          price: p.basePrice != null ? `₹${Number(p.basePrice).toLocaleString('en-IN')}` : '—',
          status: p.status || 'Active',
        }));
        setProducts(mapped);
      } catch (e) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [api]);

  const active = products.filter(p => p.status === 'Active').length;
  const pending = products.filter(p => p.status === 'Pending').length;
  const vendorLinks = new Set(products.map(p => p.vendor).filter(v => v !== '—')).size;

  const filtered = products.filter(p =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.vendor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-12 font-['Inter'] space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0F1729]">Product Catalogue</h1>
          <p className="text-[13px] text-[#65758B] mt-0.5">{products.length} products · Live catalogue</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', count: products.length, icon: '📦', iconBg: 'bg-red-50', textColor: 'text-[#D90B37]' },
          { label: 'Active', count: active, icon: '✅', iconBg: 'bg-green-50', textColor: 'text-green-600' },
          { label: 'Pending Approval', count: pending, icon: '⏳', iconBg: 'bg-amber-50', textColor: 'text-amber-500' },
          { label: 'Linked Vendors', count: vendorLinks, icon: '🔗', iconBg: 'bg-blue-50', textColor: 'text-blue-600' },
        ].map(c => (
          <div key={c.label} className="bg-white border border-[#E1E7EF] rounded-[12px] p-5 flex items-center gap-4 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${c.iconBg}`}>{c.icon}</div>
            <div>
              <div className={`text-[24px] font-bold ${c.textColor}`}>{c.count}</div>
              <div className="text-[12px] text-[#65758B] leading-tight">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878787]" />
        <input
          type="text"
          placeholder="Search products, SKU, vendor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-[#E3E3E3] rounded-xl text-[#0F1729] placeholder-[#878787] focus:outline-none focus:border-[#D90B37] transition-all"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E1E7EF] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E1E7EF]">
                {['SKU', 'PRODUCT', 'CATEGORY', 'VENDOR', 'MOQ', 'PRICE', 'STATUS', 'ACTIONS'].map(h => (
                  <th key={h} className="px-6 py-4 text-[11px] font-bold text-[#878787] tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7EF]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D90B37]"></div>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#65758B]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package size={32} className="text-gray-300" />
                      <p className="text-sm font-medium">No products found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p, idx) => {
                  const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG['Active'];
                  return (
                    <tr key={p._id || idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 text-[13px] text-[#65758B]">{p.sku}</td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-[#0F1729]">{p.name}</td>
                      <td className="px-6 py-4 text-[13px] text-[#65758B]">{p.category}</td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-[#D90B37]">{p.vendor}</td>
                      <td className="px-6 py-4 text-[13px] text-[#65758B]">{p.moq}</td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-[#0F1729]">{p.price}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${sc.bg} ${sc.text}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 text-[#65758B] hover:text-[#D90B37] transition-colors bg-transparent border-none cursor-pointer" title="View">
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProcurementProductCatalogue;
