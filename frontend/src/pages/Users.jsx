import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Search, X, Check, AlertCircle, Users as UsersIcon } from 'lucide-react';
import { ViewIcon, EditIcon, DeleteIcon } from '../components/ActionIcons';
import FilterModal from '../components/FilterModal';
import ExportModal from '../components/ExportModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ActionButtons from '../components/ActionButtons';
import DataTable from '../components/DataTable';
import Toast, { showToast } from '../components/Toast';
import {
  InputField,
  SelectField,
  PrimaryButton,
  SecondaryButton,
  ModalFooter,
  FormErrorBanner,
  validateEmail,
  validatePhone
} from '../components/FormControls';
import { handleExport, fetchPaginatedDataQueue } from '../utils/exportUtils';

const ROLES = [
  { value: "Admin", label: "Admin" },
  { value: "BDM", label: "Business Development Manager" },
  { value: "Procurement", label: "Procurement Officer" },
  { value: "WarehouseLogistics", label: "Warehouse & Logistics" },
  { value: "DesignCustomisation", label: "Design & Customisation" },
  { value: "DataEntryOperator", label: "Data Entry Operator" },
  { value: "AccountsTeam", label: "Accounts Team" },
  { value: "CorporateHRManager", label: "Corporate HR Manager" },
  { value: "Employee", label: "Employee" },
];

const Users = () => {
  const { api } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Modal visibility
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // View User State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  // Edit User State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editClientId, setEditClientId] = useState("");
  const [editStatus, setEditStatus] = useState("Active");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete User State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Invite form
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteDepartment, setInviteDepartment] = useState("");
  const [inviteClientId, setInviteClientId] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [userFieldErrors, setUserFieldErrors] = useState({});
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Export form
  const [exportFormat, setExportFormat] = useState("Excel");
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);

  // Filter form
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [appliedFilterStatus, setAppliedFilterStatus] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, rowsPerPage, debouncedSearch, appliedFilterStatus, appliedDateFrom, appliedDateTo]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedFilterStatus && appliedFilterStatus !== 'All' && appliedFilterStatus !== 'All statuses') {
        params.status = appliedFilterStatus;
      }
      if (appliedDateFrom) params.from = appliedDateFrom;
      if (appliedDateTo) params.to = appliedDateTo;

      const res = await api.get("/users", { params });
      if (res.data && typeof res.data === 'object' && Array.isArray(res.data.users)) {
        setUsersList(res.data.users);
        setTotalUsers(res.data.total ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      } else if (Array.isArray(res.data)) {
        const total = res.data.length;
        setTotalUsers(total);
        setTotalPages(Math.ceil(total / rowsPerPage) || 1);
        const start = (currentPage - 1) * rowsPerPage;
        setUsersList(res.data.slice(start, start + rowsPerPage));
      }
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get("/clients");
      setClients(res.data || []);
    } catch (error) {
      console.error("Error fetching clients", error);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    setInviteError("");
    const fErrors = {};
    if (!inviteName.trim()) fErrors.name = "Full name is required";
    const emailErr = validateEmail(inviteEmail);
    if (emailErr) fErrors.email = emailErr;
    if (!inviteRole) fErrors.role = "Please select a role";
    if (invitePhone.trim()) {
      const phoneErr = validatePhone(invitePhone);
      if (phoneErr) fErrors.phone = phoneErr;
    }

    if (Object.keys(fErrors).length > 0) {
      setUserFieldErrors(fErrors);
      setInviteError(Object.values(fErrors)[0]);
      return;
    }

    setInviteLoading(true);
    try {
      const payload = {
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        ...(typeof tempPassword !== 'undefined' && tempPassword ? { password: tempPassword } : {}),
        role: inviteRole || "Procurement",
        client: ['CorporateHRManager', 'Employee'].includes(inviteRole) ? inviteClientId : undefined,
        phone: invitePhone.trim(),
        department: inviteDepartment.trim(),
        status: "Active",
      };
      const res = await api.post("/users", payload);
      setInviteSuccess(true);
      if (res.data?.emailSent) {
        showToast(setToast, 'success', `User invited & login credentials emailed to ${inviteEmail}!`);
      } else {
        showToast(setToast, 'success', `User "${inviteName}" invited successfully!`);
      }
      fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to invite user.";
      setInviteError(msg);
      // Inline display only, no error toast
    } finally {
      setInviteLoading(false);
    }
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInviteName(""); setInviteEmail(""); setInviteRole("");
    setInvitePhone(""); setInviteDepartment(""); setInviteClientId("");
    setInviteError(""); setUserFieldErrors({}); setInviteSuccess(false);
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === "Active" ? "Inactive" : "Active";
      await api.put(`/users/${user._id}`, { status: newStatus });
      fetchUsers();
      showToast(setToast, 'success', `Status updated to ${newStatus}.`);
    } catch (error) {
      showToast(setToast, 'error', 'Failed to update status.');
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilterStatus(filterStatus);
    setAppliedDateFrom(filterDateFrom);
    setAppliedDateTo(filterDateTo);
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setFilterStatus(""); setFilterDateFrom(""); setFilterDateTo("");
    setAppliedFilterStatus(""); setAppliedDateFrom(""); setAppliedDateTo("");
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleExportData = async () => {
    setExportLoading(true);
    setExportProgress({ percentage: 0, message: 'Starting export queue...' });
    try {
      const exportList = await fetchPaginatedDataQueue({
        fetchPage: async (page, limit) => {
          const params = { page, limit };
          if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
          if (appliedFilterStatus && appliedFilterStatus !== 'All' && appliedFilterStatus !== 'All statuses') {
            params.status = appliedFilterStatus;
          }
          if (appliedDateFrom) params.from = appliedDateFrom;
          if (appliedDateTo) params.to = appliedDateTo;

          const res = await api.get("/users", { params });
          const usersData = res.data?.users || (Array.isArray(res.data) ? res.data : []);
          return {
            items: usersData,
            total: res.data?.total ?? usersData.length,
            totalPages: res.data?.totalPages || 1,
          };
        },
        batchSize: 250,
        onProgress: setExportProgress,
      });

      const headers = ['Name', 'Email', 'Role', 'Status', 'Last Login'];
      const rows = exportList.map((u) => [
        u.name || '—',
        u.email || '—',
        u.role === 'CorporateHRManager'
          ? `Client: ${u.client?.companyName || 'Corporate'}`
          : ROLES.find((r) => r.value === u.role)?.label || u.role || '—',
        u.status || 'Active',
        u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-GB') : '—',
      ]);

      handleExport(exportFormat, 'Users_Report', headers, rows);
      showToast(setToast, 'success', `Exported ${rows.length} user records successfully.`);
      setShowExportModal(false);
    } catch (err) {
      console.error('Export error:', err);
      showToast(setToast, 'error', err.message || 'Failed to export users.');
    } finally {
      setExportLoading(false);
      setExportProgress(null);
    }
  };

  const handleOpenView = (userObj) => {
    setViewingUser(userObj);
    setShowViewModal(true);
  };

  const handleOpenEdit = (userObj) => {
    setEditingUser(userObj);
    setEditName(userObj.name || "");
    setEditEmail(userObj.email || "");
    setEditRole(userObj.role || "Employee");
    setEditPhone(userObj.phone || "");
    setEditDepartment(userObj.department || "");
    setEditClientId(userObj.client?._id || userObj.client || (clients[0]?._id || ""));
    setEditStatus(userObj.status || "Active");
    setEditError("");
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);
    setEditError("");
    try {
      const payload = {
        name: editName,
        email: editEmail,
        role: editRole,
        client: ['CorporateHRManager', 'Employee'].includes(editRole) ? editClientId : null,
        phone: editPhone,
        department: editDepartment,
        status: editStatus,
      };
      await api.put(`/users/${editingUser._id}`, payload);
      showToast(setToast, 'success', `User "${editName}" updated successfully.`);
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update user.";
      setEditError(msg);
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenDelete = (userObj) => {
    setDeletingUser(userObj);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/users/${deletingUser._id}`);
      showToast(setToast, 'success', `User "${deletingUser.name}" deleted successfully.`);
      setShowDeleteModal(false);
      setDeletingUser(null);
      fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete user.";
      showToast(setToast, 'error', msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: "Name",
      key: "name",
      render: (userObj) => (
        <span className="text-sm font-medium text-[#0F1729]">{userObj.name || "—"}</span>
      ),
    },
    {
      header: "Email",
      key: "email",
      render: (userObj) => (
        <span className="text-sm text-[#878787]">{userObj.email || "—"}</span>
      ),
    },
    {
      header: "Role",
      key: "role",
      render: (userObj) => (
        <span className="text-sm text-[#0F1729]">
          {userObj.role === "CorporateHRManager"
            ? `Client: ${userObj.client?.companyName || "Corporate"}`
            : ROLES.find((r) => r.value === userObj.role)?.label || userObj.role || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (userObj) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(userObj);
          }}
          className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-all cursor-pointer ${
            (userObj.status || "Active") === "Active"
              ? "bg-[#2ECC70]/10 text-[#2ECC70] border-[#2ECC70]/20 hover:bg-[#2ECC70]/20"
              : "bg-[#F0F0F0] text-[#878787] border-[#F0F0F0] hover:bg-slate-200"
          }`}
          title="Click to toggle status"
        >
          {userObj.status || "Active"}
        </button>
      ),
    },
    {
      header: "Last Login",
      key: "lastLogin",
      render: (userObj) => (
        <span className="text-sm text-[#878787]">
          {userObj.lastLogin ? new Date(userObj.lastLogin).toLocaleDateString("en-CA") : "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      align: "center",
      headerClassName: "text-center whitespace-nowrap",
      render: (userObj) => (
        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenView(userObj)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#2E86DE] hover:bg-blue-50 transition-colors border-none bg-transparent cursor-pointer"
            title="View User Details"
          >
            <ViewIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(userObj)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#D97706] hover:bg-amber-50 transition-colors border-none bg-transparent cursor-pointer"
            title="Edit User"
          >
            <EditIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(userObj)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#E21D48] hover:bg-rose-50 transition-colors border-none bg-transparent cursor-pointer"
            title="Delete User"
          >
            <DeleteIcon size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-[calc(100vh-88px)] md:h-[calc(100vh-96px)] flex flex-col overflow-hidden font-[Inter,sans-serif] w-full min-w-0 max-w-full">
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white border border-[#E1E7EF] rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden w-full max-w-full">
        {/* Header Toolbar */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-4 md:px-6 md:py-4 gap-4 border-b border-[#E3E3E3] w-full">
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-semibold text-[#0F1729] tracking-tight">All Users</h2>
            <span className="px-2 py-0.5 text-[12px] font-medium bg-[#F0F0F0] text-[#878787] rounded-full">
              {totalUsers}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full sm:w-56 pl-10 pr-4 text-sm bg-[#F7F7F7] border border-[#E3E3E3] rounded-[10px] text-[#0F1729] placeholder-[#878787] focus:outline-none focus:border-[#D90B37] transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 text-[#878787]" size={16} />
            </div>

            <ActionButtons
              compact
              hasActiveFilter={Boolean((appliedFilterStatus && appliedFilterStatus !== 'All' && appliedFilterStatus !== 'All statuses') || appliedDateFrom || appliedDateTo)}
              onFilterClick={() => { setFilterStatus(appliedFilterStatus); setFilterDateFrom(appliedDateFrom); setFilterDateTo(appliedDateTo); setShowFilterModal(true); }}
              onExportClick={() => setShowExportModal(true)}
            />

            <button
              onClick={() => { if (clients.length > 0) setInviteClientId(clients[0]._id); setShowInviteModal(true); }}
              className="h-9 bg-[#D90B37] hover:bg-[#AE032C] text-white px-4 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm border-none whitespace-nowrap"
            >
              <UserPlus size={16} />
              <span>Invite User</span>
            </button>
          </div>
        </div>

        {/* Reusable Data Table Component with Server-side Pagination */}
        <DataTable
          columns={columns}
          data={usersList}
          loading={loading}
          emptyMessage="No users found"
          emptySubMessage="Try adjusting your search or filters"
          emptyIcon={UsersIcon}
          itemLabel="users"
          manualPagination={true}
          page={currentPage}
          totalPages={totalPages}
          totalItems={totalUsers}
          rowsPerPage={rowsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onRowsPerPageChange={(r) => {
            setRowsPerPage(r);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[540px] rounded-2xl shadow-2xl relative border border-[#E1E7EF] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 pt-6 pb-5">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-[#D90B37]" strokeWidth={2.2} />
                <h3 className="text-[16px] font-bold text-[#0F1729] tracking-tight">Invite New User</h3>
              </div>
              <button
                type="button"
                onClick={closeInviteModal}
                className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="px-8 pb-10 pt-2 flex flex-col items-center text-center">
                {/* Success Icon */}
                <div className="relative mb-5">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#22C55E]/20 to-[#16A34A]/10 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center shadow-lg shadow-green-200">
                      <Check size={30} strokeWidth={3} className="text-white" />
                    </div>
                  </div>
                  {/* Decorative dots */}
                  <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[#D90B37] opacity-70" />
                  <span className="absolute bottom-1 left-0 w-2 h-2 rounded-full bg-[#F59E0B] opacity-80" />
                  <span className="absolute top-4 -left-2 w-1.5 h-1.5 rounded-full bg-[#3B82F6] opacity-60" />
                  <span className="absolute -bottom-1 right-3 w-2 h-2 rounded-full bg-[#22C55E] opacity-60" />
                </div>

                {/* Headline */}
                <h4 className="text-[24px] font-extrabold text-[#0F1729] tracking-tight mb-1">Invitation Sent!</h4>
                <p className="text-[13.5px] text-[#878787] mb-8 leading-relaxed">
                  <span className="font-semibold text-[#0F1729]">{inviteName}</span> has been invited.<br />
                  A secure login password has been generated and sent to <span className="font-medium text-[#0F1729]">{inviteEmail}</span>.
                </p>

                {/* Done CTA */}
                <PrimaryButton onClick={closeInviteModal} className="w-full">
                  <Check size={17} strokeWidth={3} className="mr-2" /> Done
                </PrimaryButton>
              </div>
            ) : (
              <form onSubmit={handleInviteUser} className="px-8 pb-8 space-y-4">
                <FormErrorBanner error={inviteError} onClose={() => setInviteError('')} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Full Name"
                    required
                    value={inviteName}
                    error={userFieldErrors.name}
                    onChange={(e) => {
                      setInviteName(e.target.value);
                      if (userFieldErrors.name) setUserFieldErrors(prev => ({ ...prev, name: '' }));
                    }}
                    placeholder="Enter full name"
                  />
                  <InputField
                    label="Email"
                    type="email"
                    required
                    value={inviteEmail}
                    error={userFieldErrors.email}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      if (userFieldErrors.email) setUserFieldErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="user@company.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Role"
                    required
                    value={inviteRole}
                    error={userFieldErrors.role}
                    onChange={(e) => {
                      setInviteRole(e.target.value);
                      if (userFieldErrors.role) setUserFieldErrors(prev => ({ ...prev, role: '' }));
                    }}
                  >
                    <option value="" disabled>Select role</option>
                    {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </SelectField>

                  <InputField
                    label="Phone"
                    type="tel"
                    isPhone={true}
                    error={userFieldErrors.phone}
                    placeholder="10-digit mobile number"
                    value={invitePhone}
                    onChange={(e) => {
                      setInvitePhone(e.target.value);
                      if (userFieldErrors.phone) setUserFieldErrors(prev => ({ ...prev, phone: '' }));
                    }}
                  />
                </div>

                {['CorporateHRManager', 'Employee'].includes(inviteRole) && clients.length > 0 && (
                  <SelectField
                    label="Associate Corporate Client"
                    value={inviteClientId}
                    onChange={(e) => setInviteClientId(e.target.value)}
                  >
                    {clients.map((c) => <option key={c._id} value={c._id}>{c.companyName}</option>)}
                  </SelectField>
                )}

                <InputField
                  label="Department"
                  value={inviteDepartment}
                  onChange={(e) => setInviteDepartment(e.target.value)}
                  placeholder="e.g. Sales, Operations"
                />

                <ModalFooter>
                  <SecondaryButton onClick={closeInviteModal}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton type="submit" loading={inviteLoading}>
                    Send Invite
                  </PrimaryButton>
                </ModalFooter>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[540px] rounded-2xl shadow-2xl relative border border-[#E1E7EF]">
            <div className="flex items-center justify-between px-8 pt-8 pb-4">
              <h3 className="text-[20px] font-bold text-[#0F1729]">Edit User</h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingUser(null); }}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="px-8 pb-8 space-y-4">
              {editError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
                  <AlertCircle size={16} className="flex-shrink-0" /><span>{editError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter full name"
                />
                <InputField
                  label="Email"
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="user@company.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Role"
                  required
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </SelectField>

                <SelectField
                  label="Status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </SelectField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Phone"
                  type="tel"
                  placeholder="Phone number"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
                <InputField
                  label="Department"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  placeholder="e.g. Sales, Operations"
                />
              </div>

              {['CorporateHRManager', 'Employee'].includes(editRole) && clients.length > 0 && (
                <SelectField
                  label="Associate Corporate Client"
                  value={editClientId}
                  onChange={(e) => setEditClientId(e.target.value)}
                >
                  {clients.map((c) => <option key={c._id} value={c._id}>{c.companyName}</option>)}
                </SelectField>
              )}

              <ModalFooter>
                <SecondaryButton onClick={() => { setShowEditModal(false); setEditingUser(null); }}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" loading={editLoading}>
                  Save Changes
                </PrimaryButton>
              </ModalFooter>
            </form>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {showViewModal && viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-[500px] w-full rounded-2xl shadow-2xl p-6 relative border border-[#E1E7EF]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2E86DE] flex items-center justify-center font-bold text-base">
                  {viewingUser.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#0F1729]">{viewingUser.name || 'User Details'}</h3>
                  <p className="text-xs text-[#878787]">{viewingUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowViewModal(false); setViewingUser(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Role</div>
                  <div className="font-semibold text-[#0F1729] mt-0.5">
                    {ROLES.find((r) => r.value === viewingUser.role)?.label || viewingUser.role || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</div>
                  <div className="mt-0.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      (viewingUser.status || 'Active') === 'Active' ? 'bg-[#2ECC70]/15 text-[#2ECC70]' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {viewingUser.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-400">Phone</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">{viewingUser.phone || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Department</div>
                  <div className="text-[13px] font-medium text-[#0F1729] mt-0.5">{viewingUser.department || '—'}</div>
                </div>
              </div>

              {viewingUser.client && (
                <div>
                  <div className="text-xs font-semibold text-slate-400">Associated Client</div>
                  <div className="text-[13px] font-semibold text-[#D90B37] mt-0.5">
                    {viewingUser.client?.companyName || viewingUser.client}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs text-[#878787]">
                <div>Created: {viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString() : '—'}</div>
                <div>Last Login: {viewingUser.lastLogin ? new Date(viewingUser.lastLogin).toLocaleDateString() : 'Never'}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-[#F0F0F0]">
              <SecondaryButton onClick={() => { setShowViewModal(false); setViewingUser(null); }}>
                Close
              </SecondaryButton>
              <button
                type="button"
                onClick={() => {
                  const u = viewingUser;
                  setShowViewModal(false);
                  handleOpenEdit(u);
                }}
                className="px-4 py-2 bg-[#D90B37] hover:bg-[#AE032C] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-none"
              >
                <EditIcon size={14} /> Edit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeletingUser(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? They will permanently lose access to the portal."
        itemName={deletingUser ? `${deletingUser.name} (${deletingUser.email})` : ''}
        loading={deleteLoading}
      />

      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        recordCount={totalUsers}
        onExport={handleExportData}
        loading={exportLoading}
        progress={exportProgress}
      />

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        statusOptions={['All statuses', 'Active', 'Inactive', 'Suspended']}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDateFrom={filterDateFrom}
        setFilterDateFrom={setFilterDateFrom}
        filterDateTo={filterDateTo}
        setFilterDateTo={setFilterDateTo}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Users;
