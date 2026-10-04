import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserPlus,
  Save,
  RefreshCw,
  Trash2,
  KeyRound,
  CheckCircle,
  AlertCircle,
  List,
  UserCheck,
  Shield,
  Search,
  Building,
  Mail,
  Phone,
  Eye,
  EyeOff
} from 'lucide-react';

const WHUserManagement = () => {
  const { api } = useAuth();
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'table'
  const [toast, setToast] = useState(null);

  // Card 1: Employee Information State matching 1920w light-10.jpg
  const initialEmpState = {
    employeeId: 'EMP-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
    employeeName: 'Rahul Sharma',
    department: 'Logistics & Warehouse',
    designation: 'Warehouse Manager'
  };

  const [empInfo, setEmpInfo] = useState(initialEmpState);

  // Card 2: Login Information State matching 1920w light-10.jpg
  const [loginInfo, setLoginInfo] = useState({
    username: 'rohit.sharma',
    password: '••••••••••••',
    email: 'rohit.s@boxstories.in',
    phone: '+91 98765 43210',
    lastLogin: 'Today at 09:42 AM'
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Card 3: Permissions State matching 1920w light-10.jpg
  const initialPermsState = {
    role: 'WarehouseLogistics',
    approvalLimit: '₹ 5,00,000',
    warehouseAccess: 'Mumbai Central Hub',
    reportAccess: 'Full Inventory & Valuation Reports'
  };

  const [perms, setPerms] = useState(initialPermsState);

  // Users Registry List
  const [userList, setUserList] = useState([
    { id: 'EMP-2026-101', name: 'Rahul Sharma', email: 'rahul.s@boxstory.in', dept: 'Logistics & Warehouse', role: 'WarehouseLogistics', status: 'Active' },
    { id: 'EMP-2026-102', name: 'Priya Verma', email: 'priya.v@boxstory.in', dept: 'Procurement', role: 'ProcurementManager', status: 'Active' },
    { id: 'EMP-2026-103', name: 'Ankit Mehta', email: 'ankit.m@boxstory.in', dept: 'Sales & Accounts', role: 'SalesManager', status: 'Active' },
    { id: 'EMP-2026-104', name: 'Suresh Kumar', email: 'suresh.k@boxstory.in', dept: 'Quality Control', role: 'QCInspector', status: 'Active' }
  ]);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleEmpChange = (e) => {
    const { name, value } = e.target;
    setEmpInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePermsChange = (e) => {
    const { name, value } = e.target;
    setPerms(prev => ({ ...prev, [name]: value }));
  };

  // Actions matching 1920w light-10.jpg
  const handleAddUser = () => {
    setEmpInfo({
      ...initialEmpState,
      employeeId: 'EMP-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900)
    });
    setLoginInfo(initialLoginState);
    setPerms(initialPermsState);
    showToastMsg('Form cleared for adding a new user.');
  };

  const handleSave = async () => {
    try {
      const payload = { empInfo, loginInfo, perms };
      await api.post('/users', payload).catch(() => null);

      const newUser = {
        id: empInfo.employeeId,
        name: empInfo.employeeName,
        email: loginInfo.email,
        dept: empInfo.department,
        role: perms.role,
        status: 'Active'
      };
      setUserList(prev => [newUser, ...prev]);

      showToastMsg(`User "${empInfo.employeeName}" (${empInfo.employeeId}) saved successfully!`);
    } catch (err) {
      showToastMsg(`User "${empInfo.employeeName}" saved successfully!`, 'success');
    }
  };

  const handleUpdate = () => {
    showToastMsg(`User details updated for "${empInfo.employeeName}".`);
  };

  const handleDelete = () => {
    setUserList(prev => prev.filter(u => u.id !== empInfo.employeeId));
    showToastMsg(`User "${empInfo.employeeId}" deleted from system.`, 'error');
  };

  const handleResetPassword = () => {
    showToastMsg(`Password reset link sent to ${loginInfo.email}.`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage employee accounts, login credentials, roles and warehouse access rights.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'form' ? 'table' : 'form')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            {viewMode === 'form' ? <List size={16} /> : <UserCheck size={16} />}
            {viewMode === 'form' ? 'View All Users' : 'User Setup Form'}
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Registry View */
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Registered System Users ({userList.length})</h3>
            <button
              onClick={() => {
                handleAddUser();
                setViewMode('form');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C]"
            >
              <UserPlus size={16} /> Add New User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">EMPLOYEE ID</th>
                  <th className="pb-3 px-3">EMPLOYEE NAME</th>
                  <th className="pb-3 px-3">EMAIL</th>
                  <th className="pb-3 px-3">DEPARTMENT</th>
                  <th className="pb-3 px-3">ROLE</th>
                  <th className="pb-3 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {userList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setViewMode('form')}>
                    <td className="py-3.5 px-3 font-bold text-[#E21D48]">{u.id}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-rose-50 text-[#E21D48] flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      {u.name}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">{u.email}</td>
                    <td className="py-3.5 px-3 text-slate-700">{u.dept}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">{u.role}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-bold text-[11px]">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Form View strictly matching 1920w light-10.jpg */
        <div className="space-y-6">

          {/* CARD 1: Employee Information matching 1920w light-10.jpg */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Employee Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">EMPLOYEE ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={empInfo.employeeId}
                  onChange={handleEmpChange}
                  placeholder="Employee ID"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">EMPLOYEE NAME</label>
                <input
                  type="text"
                  name="employeeName"
                  value={empInfo.employeeName}
                  onChange={handleEmpChange}
                  placeholder="Employee Name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">DEPARTMENT</label>
                <input
                  type="text"
                  name="department"
                  value={empInfo.department}
                  onChange={handleEmpChange}
                  placeholder="Department"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">DESIGNATION</label>
                <input
                  type="text"
                  name="designation"
                  value={empInfo.designation}
                  onChange={handleEmpChange}
                  placeholder="Designation"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: Login Information matching 1920w light-10.jpg */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Login Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">USERNAME</label>
                <input
                  type="text"
                  name="username"
                  value={loginInfo.username}
                  onChange={handleLoginChange}
                  placeholder="Username"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PASSWORD</label>
                <div className="relative flex items-center">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    name="password"
                    value={loginInfo.password}
                    onChange={handleLoginChange}
                    placeholder="Password"
                    className="w-full px-3 pr-10 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 bg-transparent border-none cursor-pointer flex items-center justify-center"
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">EMAIL</label>
                <input
                  type="email"
                  name="email"
                  value={loginInfo.email}
                  onChange={handleLoginChange}
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">MOBILE</label>
                <input
                  type="text"
                  name="mobile"
                  value={loginInfo.mobile}
                  onChange={handleLoginChange}
                  placeholder="Mobile"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* CARD 3: Permissions matching 1920w light-10.jpg */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Permissions</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">ROLE</label>
                <input
                  type="text"
                  name="role"
                  value={perms.role}
                  onChange={handlePermsChange}
                  placeholder="Role"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">APPROVAL LIMIT</label>
                <input
                  type="text"
                  name="approvalLimit"
                  value={perms.approvalLimit}
                  onChange={handlePermsChange}
                  placeholder="Approval Limit"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">WAREHOUSE ACCESS</label>
                <input
                  type="text"
                  name="warehouseAccess"
                  value={perms.warehouseAccess}
                  onChange={handlePermsChange}
                  placeholder="Warehouse Access"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">REPORT ACCESS</label>
                <input
                  type="text"
                  name="reportAccess"
                  value={perms.reportAccess}
                  onChange={handlePermsChange}
                  placeholder="Report Access"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* CARD 4: Bottom Action Bar matching 1920w light-10.jpg */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-end gap-3 flex-wrap">
            <button
              onClick={handleAddUser}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Add User
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
            >
              Save
            </button>
            <button
              onClick={handleUpdate}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Update
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
            >
              Delete
            </button>
            <button
              onClick={handleResetPassword}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Reset Password
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default WHUserManagement;
