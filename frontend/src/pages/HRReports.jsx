import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Download,
  Users,
  TrendingUp,
  ShoppingBag,
  Bell,
  CheckCircle2,
  Send,
  Loader2
} from 'lucide-react';

const HRReports = () => {
  const { api } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remindingId, setRemindingId] = useState(null);
  const [remindedList, setRemindedList] = useState(new Set());
  const [toastMessage, setToastMessage] = useState('');
  const [exporting, setExporting] = useState(false);

  const [metrics, setMetrics] = useState({
    participationRate: 0,
    totalEmployees: 0,
    productsSelected: 0,
    productsPending: 0,
    mostPopular: 'Gift Hamper',
  });
  const [departmentData, setDepartmentData] = useState([]);
  const [budgetTrendData, setBudgetTrendData] = useState([]);
  const [preferencesData, setPreferencesData] = useState([]);
  const [pendingEmployees, setPendingEmployees] = useState([]);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        if (api) {
          const [dashRes, usersRes, selRes] = await Promise.allSettled([
            api.get('/dashboard'),
            api.get('/users'),
            api.get('/gift-selections'),
          ]);

          const dashData = dashRes.status === 'fulfilled' ? dashRes.value.data : {};
          const usersList = usersRes.status === 'fulfilled' ? (Array.isArray(usersRes.value.data) ? usersRes.value.data : (usersRes.value.data?.data || [])) : [];
          const selList = selRes.status === 'fulfilled' ? (Array.isArray(selRes.value.data) ? selRes.value.data : (selRes.value.data?.data || [])) : [];

          const m = dashData?.metrics || {};
          setMetrics({
            participationRate: m.participationRate || 0,
            totalEmployees: m.totalEmployees || usersList.length || 0,
            productsSelected: m.productsSelected || 0,
            productsPending: m.productsPending || 0,
            mostPopular: dashData?.productBreakdown?.[0]?.category || 'Gift Hamper',
          });

          if (dashData?.productBreakdown && dashData.productBreakdown.length > 0) {
            setPreferencesData(dashData.productBreakdown.map(p => ({
              name: p.category,
              percentage: p.percentage,
              color: p.color || '#E11D48',
            })));
          }

          if (dashData?.participationTrend && dashData.participationTrend.length > 0) {
            setBudgetTrendData(dashData.participationTrend.map((t, i) => ({
              label: t.week || `W${i + 1}`,
              value: (t.count || 0) * 2500,
              yPos: Math.max(30, 165 - (t.count || 0) * 2),
            })));
          }

          // Compute department participation dynamically
          const deptCounts = {};
          const deptSubmitted = {};
          usersList.forEach(u => {
            const d = u.department || 'General';
            deptCounts[d] = (deptCounts[d] || 0) + 1;
          });
          selList.forEach(s => {
            const d = s.employee?.department || 'General';
            deptSubmitted[d] = (deptSubmitted[d] || 0) + 1;
          });

          const dynamicDeptData = Object.keys(deptCounts).map(dept => {
            const total = deptCounts[dept] || 1;
            const sub = deptSubmitted[dept] || 0;
            return {
              name: dept,
              percentage: Math.min(100, Math.round((sub / total) * 100)),
            };
          });
          setDepartmentData(dynamicDeptData.length > 0 ? dynamicDeptData : [
            { name: 'Engineering', percentage: 0 },
            { name: 'Marketing', percentage: 0 },
            { name: 'Sales', percentage: 0 },
            { name: 'HR', percentage: 0 },
          ]);

          // Pending employees
          const submittedEmpIds = new Set(selList.map(s => s.employee?._id || s.employee));
          const pendingEmps = usersList
            .filter(u => !submittedEmpIds.has(u._id))
            .slice(0, 10)
            .map(u => ({
              id: u._id,
              name: u.name,
              department: u.department || 'General',
              initials: u.name ? u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'EM',
            }));
          setPendingEmployees(pendingEmps);
        }
      } catch (err) {
        // Keep empty defaults
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [api]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSendReminder = (id, name) => {
    setRemindingId(id);
    setTimeout(() => {
      setRemindedList((prev) => new Set(prev).add(id));
      setRemindingId(null);
      showToast(`Reminder notification sent to ${name}!`);
    }, 600);
  };

  const handleSendAllReminders = () => {
    showToast(`Batch reminders sent to all ${pendingEmployees.length} pending employees!`);
    setRemindedList(new Set(pendingEmployees.map((p) => p.id)));
  };

  const handleExportFullReport = () => {
    setExporting(true);
    setTimeout(() => {
      let csv = 'data:text/csv;charset=utf-8,Section,Metric,Value\n';
      csv += `KPI,Overall Participation,${metrics.participationRate}%\n`;
      csv += `KPI,Total Employees,${metrics.totalEmployees}\n`;
      csv += `KPI,Most Popular,${metrics.mostPopular}\n`;
      csv += `KPI,Pending Selections,${metrics.productsPending}\n`;
      departmentData.forEach((d) => {
        csv += `Department Participation,${d.name},${d.percentage}%\n`;
      });
      preferencesData.forEach((p) => {
        csv += `Product Preference,${p.name},${p.percentage}%\n`;
      });

      const encodedUri = encodeURI(csv);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `corporate_hr_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExporting(false);
      showToast('Corporate HR Full Report exported successfully!');
    }, 700);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E11D48]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-['Inter'] w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-[13.5px] font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header with Export Full Report Button */}
      <div className="flex items-center justify-end w-full">
        <button
          type="button"
          disabled={exporting}
          onClick={handleExportFullReport}
          className="h-10 px-5 bg-[#E11D48] hover:bg-[#BE123C] text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all border-none shadow-sm cursor-pointer"
        >
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={15} />}
          <span>Export Full Report</span>
        </button>
      </div>

      {/* Top Row: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Participation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-500">Overall Participation</span>
            <div className="w-9 h-9 rounded-xl bg-[#FCE8ED] text-[#E11D48] flex items-center justify-center flex-shrink-0">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[24px] font-bold text-slate-900 leading-tight">{metrics.participationRate}%</h3>
            <p className="text-[12px] font-normal text-slate-400 mt-0.5">{metrics.productsSelected} of {metrics.totalEmployees}</p>
          </div>
        </div>

        {/* Card 2: Total Employees */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-500">Total Employees</span>
            <div className="w-9 h-9 rounded-xl bg-[#FCE8ED] text-[#E11D48] flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[24px] font-bold text-slate-900 leading-tight">{metrics.totalEmployees}</h3>
            <p className="text-[12px] font-normal text-slate-400 mt-0.5">Enrolled</p>
          </div>
        </div>

        {/* Card 3: Most Popular */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-500">Most Popular Category</span>
            <div className="w-9 h-9 rounded-xl bg-[#FCE8ED] text-[#E11D48] flex items-center justify-center flex-shrink-0">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[20px] font-bold text-slate-900 leading-tight truncate">{metrics.mostPopular || 'N/A'}</h3>
            <p className="text-[12px] font-normal text-slate-400 mt-0.5">Top choice</p>
          </div>
        </div>

        {/* Card 4: Pending Selections */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-500">Pending Selections</span>
            <div className="w-9 h-9 rounded-xl bg-[#FCE8ED] text-[#E11D48] flex items-center justify-center flex-shrink-0">
              <Bell size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[24px] font-bold text-slate-900 leading-tight">{metrics.productsPending}</h3>
            <p className="text-[12px] font-normal text-slate-400 mt-0.5">Awaiting choice</p>
          </div>
        </div>
      </div>

      {/* Middle Row: 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart: Participation by Department */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-[15px] font-bold text-slate-900">Participation by Department</h3>

          {departmentData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No department data available</div>
          ) : (
            <div className="space-y-3 pt-2">
              {departmentData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-24 text-[12.5px] text-slate-600 font-medium text-right flex-shrink-0 truncate">
                    {item.name}
                  </span>
                  <div className="flex-grow bg-slate-100/80 h-6 rounded-r-md overflow-hidden relative">
                    <div
                      className="h-full bg-[#E11D48] rounded-r-md transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white"
                      style={{ width: `${Math.max(item.percentage, 0)}%` }}
                    >
                      {item.percentage > 15 ? `${item.percentage}%` : ''}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-10 text-right">{item.percentage}%</span>
                </div>
              ))}

              {/* X-axis indicators */}
              <div className="flex justify-between pl-27 pr-1 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Chart: Budget Utilisation Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-[15px] font-bold text-slate-900">Participation Trend</h3>

          {budgetTrendData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No participation trend records found</div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-[200px] pt-6 px-4">
              {budgetTrendData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[11px] font-bold text-slate-700">₹{(item.value / 1000).toFixed(0)}k</span>
                  <div className="w-full max-w-[40px] bg-rose-100 rounded-t-lg overflow-hidden flex items-end h-[120px]">
                    <div 
                      className="w-full bg-[#E11D48] rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.min(100, Math.max(10, (item.value / 600000) * 100))}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Product Preferences & Pending Selections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Product Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-[15px] font-bold text-slate-900">Product Preferences</h3>

          {preferencesData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No preference data recorded yet</div>
          ) : (
            <div className="space-y-3.5 pt-2">
              {preferencesData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-600 font-medium">{item.name}</span>
                    <span className="text-slate-900 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-rose-50 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color || '#E11D48' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Card: Pending Selections */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-slate-900">Pending Selections</h3>
            <button
              type="button"
              onClick={handleSendAllReminders}
              className="h-8 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-[12px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Send Reminders</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingEmployees.map((emp) => {
              const isReminded = remindedList.has(emp.id);
              return (
                <div
                  key={emp.id}
                  className="bg-[#FFF5F7] hover:bg-[#FEEFF2] transition-colors rounded-2xl p-3 px-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-[#FCE8ED] text-[#9B112E] font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                      {emp.initials}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-[13.5px] leading-tight">
                        {emp.name}
                      </div>
                      <div className="text-[12px] text-slate-500 font-normal mt-0.5">
                        {emp.department}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isReminded || remindingId === emp.id}
                    onClick={() => handleSendReminder(emp.id, emp.name)}
                    className={`text-[13px] font-bold transition-colors border-none bg-transparent cursor-pointer ${
                      isReminded
                        ? 'text-emerald-600 cursor-default'
                        : 'text-[#E11D48] hover:text-[#BE123C]'
                    }`}
                  >
                    {remindingId === emp.id ? (
                      <Loader2 size={14} className="animate-spin text-[#E11D48]" />
                    ) : isReminded ? (
                      'Reminded ✓'
                    ) : (
                      'Remind'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRReports;
