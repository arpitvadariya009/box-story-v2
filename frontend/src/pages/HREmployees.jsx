import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Download,
  Upload,
  UserPlus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  ChevronDown
} from 'lucide-react';
import { InputField, SelectField, PrimaryButton, SecondaryButton, ModalFooter } from '../components/FormControls';

const HREmployees = () => {
  const { api } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentEditEmp, setCurrentEditEmp] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    budget: 0,
    employeeId: '',
    status: 'Pending',
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      if (api) {
        const [userRes, selRes] = await Promise.all([
          api.get('/users'),
          api.get('/gift-selections').catch(() => ({ data: [] }))
        ]);

        const usersList = Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []);
        const selMap = {};
        if (Array.isArray(selRes.data)) {
          selRes.data.forEach((s) => {
            const empId = s.employee?._id || s.employee;
            if (empId) selMap[empId] = s.status;
          });
        }

        const mapped = usersList.map((u) => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          department: u.department || 'General',
          budget: u.budget || 0,
          status: selMap[u._id] || (u.status === 'Active' ? 'Submitted' : 'Pending'),
        }));
        setEmployees(mapped);
      }
    } catch (err) {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [api]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const getInitials = (name) => {
    if (!name) return 'EM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('submit')) {
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[12px] font-semibold bg-[#E11D48] text-white">
          Submitted
        </span>
      );
    }
    if (s.includes('process') || s.includes('approv')) {
      return (
        <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[12px] font-semibold bg-[#FCE8ED] text-[#9B112E]">
          Processed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[12px] font-semibold bg-white border border-[#D1D5DB] text-[#111827]">
        Pending
      </span>
    );
  };

  // Add Employee Handler
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (api) {
        await api.post('/users', {
          name: formData.name,
          email: formData.email,
          department: formData.department,
          budget: Number(formData.budget) || 0,
          role: 'Employee',
          password: 'password123',
        });
      }
      await fetchEmployees();
      setShowAddModal(false);
      setFormData({ name: '', email: '', department: 'Engineering', budget: 0, employeeId: '', status: 'Pending' });
      showToast(`Employee "${formData.name}" added successfully to database!`);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error adding employee');
    } finally {
      setSaving(false);
    }
  };

  // Edit Employee Handler
  const handleEditEmployee = async (e) => {
    e.preventDefault();
    if (!currentEditEmp) return;
    setSaving(true);
    try {
      if (api) {
        await api.put(`/users/${currentEditEmp._id}`, {
          name: currentEditEmp.name,
          email: currentEditEmp.email,
          department: currentEditEmp.department,
          budget: Number(currentEditEmp.budget) || 0,
        });
      }
      await fetchEmployees();
      setShowEditModal(false);
      showToast(`Employee "${currentEditEmp.name}" updated successfully in database!`);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error updating employee');
    } finally {
      setSaving(false);
    }
  };

  // Delete Employee Handler
  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      if (api) {
        await api.delete(`/users/${id}`);
      }
      await fetchEmployees();
      showToast(`Employee "${name}" deleted from database.`);
    } catch (err) {
      console.error(err);
      showToast('Error deleting employee');
    }
  };

  // Download Template Handler
  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Name,Email,Department,EmployeeId,Budget\n' +
      'Rajesh Kumar,rajesh.k@company.com,Engineering,EMP-501,2500\n' +
      'Sneha Roy,sneha.r@company.com,Marketing,EMP-502,2500\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'employees_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Employee CSV template downloaded!');
  };

  // Bulk Upload Handler
  const handleBulkFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const lines = text.split('\n').filter((l) => l.trim() !== '');
        const newEmps = [];
        for (let i = 1; i < lines.length; i++) {
          const [name, email, department, employeeId, budget] = lines[i].split(',');
          if (name && email) {
            newEmps.push({
              _id: 'bulk-' + i + '-' + Date.now(),
              name: name.trim(),
              email: email.trim(),
              department: department?.trim() || 'General',
              budget: Number(budget) || 2500,
              status: 'Pending',
            });
            if (api) {
              api.post('/users', {
                name: name.trim(),
                email: email.trim(),
                department: department?.trim() || 'General',
                employeeId: employeeId?.trim() || `EMP-${100 + i}`,
                budget: Number(budget) || 2500,
                role: 'Employee',
                password: 'password123',
              }).catch(() => {});
            }
          }
        }
        setEmployees((prev) => [...newEmps, ...prev]);
        setShowUploadModal(false);
        showToast(`Successfully uploaded ${newEmps.length} employees from CSV!`);
      }
    };
    reader.readAsText(file);
  };

  // Filter Logic
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      selectedDepartment === 'All' ||
      emp.department?.toLowerCase() === selectedDepartment.toLowerCase();
    return matchesSearch && matchesDept;
  });

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

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-end gap-3 w-full">
        {/* Download Template Button */}
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-[13px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <Download size={15} className="text-slate-600" />
          <span>Download Template</span>
        </button>

        {/* Bulk Upload CSV Button */}
        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-[13px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <Upload size={15} className="text-slate-600" />
          <span>Bulk Upload CSV</span>
        </button>

        {/* Add Employee Button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4.5 bg-[#E11D48] hover:bg-[#BE123C] text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all border-none shadow-sm cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Search & Department Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-11 bg-white border border-slate-200/80 rounded-xl pl-10 pr-4 text-[13.5px] text-slate-800 placeholder-slate-400 outline-none focus:border-[#E11D48] transition-all shadow-2xs"
          />
        </div>

        {/* Department Dropdown */}
        <div className="relative min-w-[140px] sm:w-[170px]">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full h-11 bg-white border border-slate-200/80 rounded-xl px-3.5 pr-8 text-[13px] font-medium text-slate-700 outline-none focus:border-[#E11D48] appearance-none cursor-pointer shadow-2xs"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Design">Design</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Employees Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-[12px] font-medium bg-[#FFF5F7]/60">
                <th className="py-3.5 pl-6 font-medium text-left">Employee</th>
                <th className="py-3.5 font-medium text-left hidden sm:table-cell">Department</th>
                <th className="py-3.5 font-medium text-left hidden md:table-cell">Budget</th>
                <th className="py-3.5 font-medium text-left">Status</th>
                <th className="py-3.5 pr-6 font-medium text-right hidden sm:table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp._id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  {/* Employee Info with Initials Avatar */}
                  <td className="py-3.5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#FCE8ED] text-[#9B112E] font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                        {getInitials(emp.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-[13.5px] truncate">
                          {emp.name}
                        </div>
                        <div className="text-[12px] text-slate-400 font-normal truncate">
                          {emp.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 text-slate-600 text-[13px] hidden sm:table-cell">
                    {emp.department}
                  </td>

                  {/* Budget */}
                  <td className="py-3.5 font-semibold text-slate-900 text-[13.5px] hidden md:table-cell">
                    ₹{(emp.budget || 0).toLocaleString('en-IN')}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5">
                    {getStatusBadge(emp.status)}
                  </td>

                  {/* Actions: Edit & Delete */}
                  <td className="py-3.5 pr-6 text-right hidden sm:table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentEditEmp(emp);
                          setShowEditModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer rounded-lg hover:bg-slate-100"
                        title="Edit Employee"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer rounded-lg hover:bg-red-50"
                        title="Delete Employee"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-[18px] font-bold text-slate-900">Add New Employee</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="mt-4 space-y-4">
              <InputField
                label="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
              />

              <InputField
                label="Corporate Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. rahul.sharma@company.com"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Design">Design</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </SelectField>

                <InputField
                  label="Budget (₹)"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                />
              </div>

              <ModalFooter>
                <SecondaryButton onClick={() => setShowAddModal(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" loading={saving}>
                  Add Employee
                </PrimaryButton>
              </ModalFooter>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && currentEditEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-[18px] font-bold text-slate-900">Edit Employee</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditEmployee} className="mt-4 space-y-4">
              <InputField
                label="Full Name"
                required
                value={currentEditEmp.name}
                onChange={(e) => setCurrentEditEmp({ ...currentEditEmp, name: e.target.value })}
              />

              <InputField
                label="Email"
                type="email"
                required
                value={currentEditEmp.email}
                onChange={(e) => setCurrentEditEmp({ ...currentEditEmp, email: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Department"
                  value={currentEditEmp.department}
                  onChange={(e) => setCurrentEditEmp({ ...currentEditEmp, department: e.target.value })}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Design">Design</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </SelectField>

                <InputField
                  label="Budget (₹)"
                  type="number"
                  value={currentEditEmp.budget}
                  onChange={(e) => setCurrentEditEmp({ ...currentEditEmp, budget: Number(e.target.value) })}
                />
              </div>

              <ModalFooter>
                <SecondaryButton onClick={() => setShowEditModal(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" loading={saving}>
                  Save Changes
                </PrimaryButton>
              </ModalFooter>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload CSV Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-[17px] font-bold text-slate-900">Bulk Upload CSV</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="border-2 border-dashed border-slate-200 hover:border-[#E11D48] rounded-2xl p-8 text-center transition-colors cursor-pointer bg-slate-50/50">
                <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-[13px] font-semibold text-slate-700">
                  Click to choose CSV file or drag and drop
                </p>
                <p className="text-[11.5px] text-slate-400 mt-1">
                  Format: Name, Email, Department, EmployeeId, Budget
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleBulkFileUpload}
                  className="mt-4 text-[12px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-rose-50 file:text-[#E11D48] hover:file:bg-rose-100"
                />
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-[12.5px] text-[#E11D48] hover:underline font-semibold bg-transparent border-none cursor-pointer"
                >
                  Need a template? Download CSV template here
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HREmployees;
