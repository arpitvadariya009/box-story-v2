import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ExternalLink, Search, Plus, ChevronDown, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BDMClients = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [quickViewClient, setQuickViewClient] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients');
      setClients(res.data?.clients || res.data?.data || (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [api]);

  const statusOptions = ['All Status', 'Active', 'Pending', 'Draft'];

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName?.toLowerCase().includes(search.toLowerCase()) ||
      c.contactEmail?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All Status' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColors = {
    Active: { bg: '#DCFCE7', color: '#15803D' },
    Pending: { bg: '#FEF9C3', color: '#B45309' },
    Draft: { bg: '#F1F5F9', color: '#64748B' },
    Inactive: { bg: '#FEE2E2', color: '#DC2626' },
  };

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#0F1729]">Corporate Clients</h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">{filtered.length} of {clients.length} clients</p>
        </div>
        <button
          onClick={() => navigate('/clients/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D90B37] text-white text-[14px] font-semibold rounded-xl hover:bg-[#B80930] transition-colors cursor-pointer border-none"
        >
          <Plus size={16} />
          Add New Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by name or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-9 py-2.5 border border-[#E2E8F0] rounded-xl text-[13px] text-[#0F1729] focus:outline-none focus:border-[#D90B37] bg-white cursor-pointer"
          >
            {statusOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#F1F5F9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider">Company</th>
                <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider hidden md:table-cell">Catalogue</th>
                <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider hidden lg:table-cell">Last Order</th>
                <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider hidden lg:table-cell">Contact</th>
                <th className="text-right px-5 py-3.5 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#64748B] text-[14px]">
                    Loading clients...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#64748B] text-[14px]">
                    No clients found.
                  </td>
                </tr>
              ) : (
                filtered.map((client, idx) => {
                  const sc = statusColors[client.status] || { bg: '#F1F5F9', color: '#64748B' };
                  return (
                    <tr key={client._id} className="border-b border-[#F8FAFC] hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-[14px] font-semibold text-[#0F1729]">{client.companyName}</p>
                        <p className="text-[12px] text-[#94A3B8] mt-0.5">{client.industry || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-[13px] text-[#64748B]">{client.catalogue || '—'}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-[13px] text-[#64748B]">{client.lastOrder || '—'}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-[13px] font-medium text-[#0F1729]">{client.contactPerson || '—'}</p>
                        <p className="text-[12px] text-[#94A3B8]">{client.email || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setQuickViewClient(client)}
                            className="flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#D90B37] font-medium transition-colors cursor-pointer border-none bg-transparent"
                          >
                            <Eye size={15} />
                            Quick View
                          </button>
                          <button
                            onClick={() => navigate(`/clients/${client._id}`)}
                            className="flex items-center gap-1 text-[13px] text-[#0F1729] hover:text-[#D90B37] font-semibold bg-[#F1F5F9] hover:bg-[#FEE2E8] px-3 py-1 rounded-lg transition-colors cursor-pointer border-none"
                          >
                            Open
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

      {/* Quick View Modal */}
      {quickViewClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-[#0F1729]">{quickViewClient.companyName}</h2>
              <button
                onClick={() => setQuickViewClient(null)}
                className="text-[#94A3B8] hover:text-[#0F1729] text-[20px] leading-none cursor-pointer border-none bg-transparent font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between"><span className="text-[#64748B]">Industry</span><span className="font-medium text-[#0F1729]">{quickViewClient.industry || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Status</span>
                <span className="font-semibold px-2 py-0.5 rounded-full text-[12px]" style={{ background: (statusColors[quickViewClient.status]||{bg:'#F1F5F9'}).bg, color: (statusColors[quickViewClient.status]||{color:'#64748B'}).color }}>
                  {quickViewClient.status}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-[#64748B]">Catalogue</span><span className="font-medium text-[#0F1729]">{quickViewClient.catalogue || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Last Order</span><span className="font-medium text-[#0F1729]">{quickViewClient.lastOrder || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Contact</span><span className="font-medium text-[#0F1729]">{quickViewClient.contactPerson || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Email</span><span className="font-medium text-[#0F1729]">{quickViewClient.email || '—'}</span></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { navigate(`/clients/${quickViewClient._id}`); setQuickViewClient(null); }}
                className="flex-1 py-2.5 bg-[#D90B37] text-white text-[13px] font-semibold rounded-xl hover:bg-[#B80930] transition-colors cursor-pointer border-none"
              >
                Open Full Profile
              </button>
              <button
                onClick={() => setQuickViewClient(null)}
                className="flex-1 py-2.5 bg-[#F1F5F9] text-[#64748B] text-[13px] font-semibold rounded-xl hover:bg-[#E2E8F0] transition-colors cursor-pointer border-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BDMClients;
