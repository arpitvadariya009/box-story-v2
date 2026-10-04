import React, { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProcurementInventory = () => {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const res = await api.get('/inventory');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const mapped = data.map(i => ({
          _id: i._id,
          item: i.product?.name || 'Unknown Item',
          sku: i.product?.sku || '—',
          category: i.product?.category || '—',
          warehouse: i.warehouseLocation || 'Main WH',
          stock: `${i.availableQty ?? 0} units`,
          stockVal: Number(i.availableQty ?? 0),
          reorderAt: `${i.reorderLevel ?? 0} units`,
          statusType: (i.availableQty ?? 0) <= (i.reorderLevel ?? 0) ? 'low' : 'in',
        }));
        setItems(mapped);
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [api]);

  const lowItems = items.filter(i => i.statusType === 'low');
  const filtered = items.filter(i =>
    !search ||
    i.item?.toLowerCase().includes(search.toLowerCase()) ||
    i.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnits = items.reduce((s, i) => s + (i.stockVal || 0), 0);

  return (
    <div className="pb-12 font-['Inter'] space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[20px] font-semibold text-[#0F1729]">Inventory</h1>
        <p className="text-[13px] text-[#65758B] mt-0.5">Live view of current stock levels</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Items', count: items.length, icon: '📦', iconBg: 'bg-red-50', textColor: 'text-[#D90B37]' },
          { label: 'Total Stock Units', count: totalUnits.toLocaleString('en-IN'), icon: '📊', iconBg: 'bg-green-50', textColor: 'text-green-600' },
          { label: 'Low Stock Items', count: lowItems.length, icon: '⚠️', iconBg: 'bg-amber-50', textColor: 'text-amber-500' },
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
          placeholder="Search items or SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-[#E3E3E3] rounded-xl text-[#0F1729] placeholder-[#878787] focus:outline-none focus:border-[#D90B37] transition-all"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#E1E7EF] rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E1E7EF]">
                {['ITEM', 'SKU', 'CATEGORY', 'WAREHOUSE', 'CURRENT STOCK', 'REORDER LEVEL', 'STATUS'].map(h => (
                  <th key={h} className="px-6 py-4 text-[11px] font-bold text-[#878787] tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7EF]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D90B37]"></div>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#65758B]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package size={32} className="text-gray-300" />
                      <p className="text-sm font-medium">No inventory records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4 text-[13px] font-semibold text-[#0F1729]">{item.item}</td>
                    <td className="px-6 py-4 text-[13px] text-[#65758B]">{item.sku}</td>
                    <td className="px-6 py-4 text-[13px] text-[#65758B]">{item.category}</td>
                    <td className="px-6 py-4 text-[13px] text-[#65758B]">{item.warehouse}</td>
                    <td className="px-6 py-4 text-[13px] font-semibold text-[#0F1729]">{item.stock}</td>
                    <td className="px-6 py-4 text-[13px] text-[#65758B]">{item.reorderAt}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${item.statusType === 'low' ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-600'}`}>
                        {item.statusType === 'low' ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProcurementInventory;
