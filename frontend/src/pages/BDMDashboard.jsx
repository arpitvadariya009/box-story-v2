import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Target,
  Clock,
  IndianRupee,
  Bell,
  ArrowRight,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import api from '../services/api';

const BDMDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    activeClients: 0,
    activeClientsChange: '0 this month',
    newLeads: 0,
    newLeadsChange: '0 pending',
    pendingApprovals: 0,
    pendingApprovalsUrgent: '0 urgent',
    revenueContributed: '₹0.0L',
    revenueChange: 'Live revenue',
    totalRevenue: '0',
    target: '2,00,00,000',
    achievement: 0,
  });

  const [reminders, setReminders] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [pipelineDeals, setPipelineDeals] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Clients
        const clientsRes = await api.get('/clients');
        const clients = clientsRes.data?.data || clientsRes.data || [];

        // 2. Fetch Orders
        const ordersRes = await api.get('/orders');
        const orders = ordersRes.data?.data || ordersRes.data || [];

        const actClients = clients.filter((c) => c.status === 'Active').length;
        const leads = clients.filter((c) => c.status === 'Pending').length;
        const pendingApp = orders.filter((o) => o.status === 'Pending Approval').length;

        // Calculate actual revenue
        const deliveredOrders = orders.filter((o) => o.status === 'Delivered');
        const revTotal = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const allOrdersTotal = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Format revenue display
        const revLakhs = revTotal > 0 ? `₹${(revTotal / 100000).toFixed(1)}L` : '₹0.0L';

        // Calculate progress percentage against target (2 Crores)
        const targetVal = 20000000;
        const achievementPct = Math.min(100, Math.round((allOrdersTotal / targetVal) * 100)) || 0;

        // Update dashboard KPI stats dynamically
        setDashboardData({
          activeClients: actClients,
          activeClientsChange: `${clients.length} total clients`,
          newLeads: leads,
          newLeadsChange: `${leads} pending approval`,
          pendingApprovals: pendingApp,
          pendingApprovalsUrgent: pendingApp > 0 ? `${pendingApp} urgent` : '0 urgent',
          revenueContributed: revLakhs,
          revenueChange: `${orders.length} total orders`,
          totalRevenue: allOrdersTotal.toLocaleString('en-IN'),
          target: targetVal.toLocaleString('en-IN'),
          achievement: achievementPct,
        });

        // Generate dynamic pipeline deals from actual orders in Draft or Pending state
        if (orders.length > 0) {
          const draftOrPending = orders.filter(o => ['Draft', 'Pending Approval', 'Approved'].includes(o.status)).slice(0, 4);
          if (draftOrPending.length > 0) {
            const mappedDeals = draftOrPending.map((o, idx) => {
              const companyName = o.client?.companyName || o.client?.name || 'Corporate Client';
              const stage = o.status === 'Pending Approval' ? 'Proposal Sent' : o.status === 'Approved' ? 'Negotiation' : 'Proposal Draft';
              const progressMap = { 'Draft': 25, 'Pending Approval': 60, 'Approved': 80 };
              return {
                id: o._id || idx,
                company: companyName,
                stage,
                amount: '₹' + Number(o.totalAmount || 0).toLocaleString('en-IN'),
                progress: progressMap[o.status] || 50,
              };
            });
            setPipelineDeals(mappedDeals);
          }
        }

        // Generate dynamic activity list from real clients/orders
        const activities = [];
        if (orders.length > 0) {
          orders.slice(0, 3).forEach((o, i) => {
            activities.push({
              id: `act-ord-${i}`,
              text: `Order ${o.orderNumber || ''} for ${o.client?.companyName || 'Client'}`,
              time: new Date(o.createdAt || Date.now()).toLocaleDateString(),
              status: o.status || 'Active',
              statusColor: o.status === 'Delivered' ? '#10B981' : '#F59E0B',
              statusBg: o.status === 'Delivered' ? '#D1FAE5' : '#FEF3C7',
            });
          });
        }
        if (clients.length > 0) {
          clients.slice(0, 2).forEach((c, i) => {
            activities.push({
              id: `act-cli-${i}`,
              text: `Client ${c.companyName} registered`,
              time: new Date(c.createdAt || Date.now()).toLocaleDateString(),
              status: c.status || 'Pending',
              statusColor: c.status === 'Active' ? '#10B981' : '#F59E0B',
              statusBg: c.status === 'Active' ? '#D1FAE5' : '#FEF3C7',
            });
          });
        }
        setRecentActivity(activities.slice(0, 4));

        // Generate dynamic reminders based on clients
        if (clients.length > 0) {
          const reminderList = clients.slice(0, 4).map((c, i) => {
            const tasks = [
              'Send revised proposal',
              'Follow up on catalogue review',
              'Schedule planning call',
              'Share updated product list'
            ];
            const priorities = ['High', 'Medium', 'Low'];
            return {
              id: c._id || i,
              task: tasks[i % tasks.length],
              company: c.companyName,
              date: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : 'Upcoming',
              priority: priorities[i % priorities.length],
            };
          });
          setReminders(reminderList);
        }

      } catch (err) {
        console.error('Failed to load dynamic BDM Dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const priorityConfig = {
    High: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
    Medium: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
    Low: { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  };

  const totalSegments = 20;
  const filledSegments = Math.round((dashboardData.achievement / 100) * totalSegments);

  return (
    <div className="space-y-6 pb-12 font-['Inter']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#0F1729] leading-tight">Dashboard</h1>
          <p className="text-[14px] text-[#64748B] mt-0.5">
            Welcome back, {user?.name || 'John'}. Here's your BD overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D90B37] text-white text-[14px] font-semibold rounded-xl hover:bg-[#B80930] transition-colors cursor-pointer border-none"
          >
            <span className="text-[18px] leading-none">+</span>
            New Proposal
          </button>
          <button
            onClick={() => navigate('/clients/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#0F1729] text-[14px] font-semibold rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <Users size={16} />
            Add Client
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#64748B] font-semibold">
          Loading dashboard metrics...
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#F1F5F9] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] text-[#64748B] font-medium">Active Clients</p>
                  <p className="text-[28px] font-bold text-[#0F1729] mt-1 leading-tight">{dashboardData.activeClients}</p>
                  <p className="text-[12px] text-[#10B981] mt-1.5 font-medium">↑ {dashboardData.activeClientsChange}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FEE2E8' }}>
                  <Users size={20} color="#D90B37" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#F1F5F9] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] text-[#64748B] font-medium">New Leads</p>
                  <p className="text-[28px] font-bold text-[#0F1729] mt-1 leading-tight">{dashboardData.newLeads}</p>
                  <p className="text-[12px] text-[#10B981] mt-1.5 font-medium">↑ {dashboardData.newLeadsChange}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FEE2E8' }}>
                  <Target size={20} color="#D90B37" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#F1F5F9] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] text-[#64748B] font-medium">Pending Approvals</p>
                  <p className="text-[28px] font-bold text-[#0F1729] mt-1 leading-tight">{dashboardData.pendingApprovals}</p>
                  <p className="text-[12px] text-[#EF4444] mt-1.5 font-medium">↓ {dashboardData.pendingApprovalsUrgent}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FEE2E8' }}>
                  <Clock size={20} color="#D90B37" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#F1F5F9] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] text-[#64748B] font-medium">Revenue Contributed</p>
                  <p className="text-[28px] font-bold text-[#0F1729] mt-1 leading-tight">{dashboardData.revenueContributed}</p>
                  <p className="text-[12px] text-[#10B981] mt-1.5 font-medium">↑ {dashboardData.revenueChange}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FEE2E8' }}>
                  <IndianRupee size={20} color="#D90B37" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Revenue Contributed Bar */}
          <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6">
            <p className="text-[13px] text-[#64748B] font-medium mb-1">Total Revenue Contributed (FY 2025-26)</p>
            <p className="text-[28px] font-bold text-[#D90B37] leading-tight">₹{dashboardData.totalRevenue}</p>
            <div className="flex items-center gap-4 mt-2 mb-4">
              <p className="text-[13px] text-[#64748B]">Target: ₹{dashboardData.target}</p>
              <p className="text-[13px] text-[#64748B]">Achievement: {dashboardData.achievement}%</p>
            </div>
            {/* Segmented Progress Bar */}
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: totalSegments }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 flex-1 min-w-[30px] rounded-full transition-all"
                  style={{
                    background: i < filledSegments ? '#D90B37' : '#F1F5F9',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Follow-up Reminders + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Follow-up Reminders */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Bell size={17} color="#D90B37" />
                  <h3 className="text-[15px] font-bold text-[#0F1729]">Follow-up Reminders</h3>
                </div>
                <span className="text-[12px] text-[#64748B] font-medium">{reminders.length} pending</span>
              </div>
              <div className="space-y-4">
                {reminders.map((r) => {
                  const pc = priorityConfig[r.priority] || priorityConfig.Medium;
                  return (
                    <div key={r.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-semibold text-[#0F1729]">{r.task}</p>
                        <p className="text-[12px] text-[#64748B] mt-0.5">{r.company}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <span className="flex items-center gap-1 text-[12px] text-[#64748B]">
                          <Calendar size={12} />
                          {r.date}
                        </span>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}
                        >
                          {r.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-bold text-[#0F1729]">Recent Activity</h3>
                <button className="flex items-center gap-1 text-[13px] text-[#D90B37] font-semibold hover:underline cursor-pointer border-none bg-transparent">
                  View all <ArrowRight size={13} />
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((a) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-semibold text-[#0F1729]">{a.text}</p>
                      <p className="text-[12px] text-[#64748B] mt-0.5">{a.time}</p>
                    </div>
                    <span
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full ml-4 shrink-0"
                      style={{ background: a.statusBg, color: a.statusColor }}
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pipeline Deals */}
          <div className="bg-white rounded-2xl border border-[#F1F5F9] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={17} color="#D90B37" />
                <h3 className="text-[15px] font-bold text-[#0F1729]">Pipeline Deals</h3>
              </div>
              <button className="flex items-center gap-1 text-[13px] text-[#D90B37] font-semibold hover:underline cursor-pointer border-none bg-transparent">
                View all <ArrowRight size={13} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {pipelineDeals.map((deal) => (
                <div key={deal.id}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[14px] font-bold text-[#0F1729]">{deal.company}</p>
                    <p className="text-[14px] font-bold text-[#D90B37]">{deal.amount}</p>
                  </div>
                  <p className="text-[12px] text-[#64748B] mb-2">{deal.stage}</p>
                  <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D90B37] rounded-full transition-all"
                      style={{ width: `${deal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BDMDashboard;
