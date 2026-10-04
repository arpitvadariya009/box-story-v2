import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Building2,
  Gift,
  Archive,
  Briefcase,
  ShoppingCart,
  Truck,
  FileText,
  Receipt,
  Bell,
  Settings,
  Activity,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Package,
  UserPlus,
  ShoppingBag,
  Inbox,
  BarChart3,
  Plus,
  SlidersHorizontal,
  Users,
  ClipboardCheck,
  Layers,
  RefreshCw,
  Warehouse,
  LayoutGrid,
  CreditCard,
} from 'lucide-react';

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout, logoUrl } = useAuth();
  const [openSections, setOpenSections] = useState({
    Main: true,
    Management: true,
    Catalogue: true,
    Operations: true,
    Finance: true,
    System: true,
  });

  const location = useLocation();
  const isBDM = user?.role === 'BDM';
  const isProcurement = user?.role === 'Procurement';
  const isHR = user?.role === 'CorporateHRManager';
  const isDataEntry = user?.role === 'DataEntryOperator';
  const isWarehouse = user?.role === 'WarehouseLogistics';

  // Warehouse & Logistics navigation (matches 22-page mapping & Dashboard.jpg series)
  const warehouseNavStructure = [
    { type: 'link', name: 'Dashboard', path: '/wh-dashboard', icon: LayoutDashboard },
    {
      type: 'group',
      name: 'Master Management',
      icon: Briefcase,
      children: [
        { name: 'Product Master', path: '/wh-product-master', icon: Package }
      ]
    },
    {
      type: 'group',
      name: 'Procurement',
      icon: ShoppingBag,
      children: [
        { name: 'Purchase Requisition', path: '/wh-purchase-requisition', icon: FileText },
        { name: 'Purchase Order', path: '/wh-purchase-order', icon: ShoppingCart },
        { name: 'Goods Receipt Note (GRN)', path: '/wh-grn', icon: ClipboardCheck }
      ]
    },
    {
      type: 'group',
      name: 'Inventory',
      icon: Archive,
      children: [
        { name: 'Inventory Dashboard', path: '/wh-inventory', icon: LayoutGrid },
        { name: 'Stock Ledger', path: '/wh-stock-ledger', icon: FileText },
        { name: 'Product Snapshot', path: '/wh-product-snapshot', icon: Package }
      ]
    },
    {
      type: 'group',
      name: 'Sales',
      icon: ShoppingCart,
      children: [
        { name: 'Sales Order', path: '/wh-sales-order', icon: ShoppingCart },
        { name: 'Invoice', path: '/wh-invoice', icon: Receipt }
      ]
    },
    {
      type: 'group',
      name: 'Gift Box',
      icon: Gift,
      children: [
        { name: 'Gift Box Creation', path: '/wh-gift-box', icon: Gift },
        { name: 'Product Bundle Builder', path: '/wh-bundle-builder', icon: Package }
      ]
    },
    {
      type: 'group',
      name: 'Branding',
      icon: Activity,
      children: [
        { name: 'Branding Request', path: '/wh-branding', icon: Activity },
        { name: 'Branding Matrix', path: '/wh-branding-matrix', icon: Layers }
      ]
    },
    { type: 'link', name: 'Dispatch', path: '/wh-dispatch', icon: Truck },
    { type: 'link', name: 'Returns', path: '/wh-returns', icon: RefreshCw },
    {
      type: 'group',
      name: 'Product Catalog',
      icon: Briefcase,
      children: [
        { name: 'Catalog', path: '/wh-catalog', icon: Gift },
        { name: 'Product Detail', path: '/wh-product-detail', icon: Package },
        { name: 'Compare', path: '/wh-catalog-compare', icon: SlidersHorizontal }
      ]
    },
    { type: 'link', name: 'User Management', path: '/wh-user-management', icon: User },
    { type: 'link', name: 'Reports', path: '/wh-reports', icon: BarChart3 },
    { type: 'link', name: 'Inventory Levels', path: '/wh-inventory-levels', icon: Layers }
  ];
  const isAccounts = user?.role === 'AccountsTeam';

  // Accounts Team navigation (matches mockup images)
  const accountsNavItems = [
    { name: 'Dashboard', path: '/accounts', icon: LayoutDashboard },
    { name: 'Client Invoicing', path: '/accounts/invoices', icon: Receipt },
    { name: 'Receivables', path: '/accounts/receivables', icon: FileText },
    { name: 'Vendor Payables', path: '/accounts/payables', icon: CreditCard },
    { name: 'Vendor Registration', path: '/accounts/vendor-registration', icon: UserPlus },
    { name: 'e-Way Bill & Gate Pass', path: '/accounts/eway-bills', icon: Truck },
    { name: 'Financial Reports', path: '/accounts/reports', icon: Activity },
  ];

  // Data Entry Operator navigation (matches mockup images)
  const dataEntryNavItems = [
    { name: 'Dashboard', path: '/data-entry', icon: LayoutDashboard },
    { name: 'Product Entry', path: '/data-entry/products', icon: Package },
    { name: 'Inventory Entry', path: '/data-entry/inventory', icon: Warehouse },
    { name: 'Order Entry', path: '/data-entry/orders', icon: ShoppingCart },
    { name: 'My Submissions', path: '/data-entry/submissions', icon: ClipboardCheck },
  ];

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Specific BDM navigation list matching Image 1.jpg
  const bdmNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', path: '/clients', icon: Building2 },
    { name: 'Add Client', path: '/clients/new', icon: UserPlus },
    { name: 'Product Catalogue', path: '/products', icon: Package },
    { name: 'Gift Catalogue', path: '/catalogue', icon: Gift },
    { name: 'Order Tracker', path: '/orders', icon: ShoppingCart },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  // Procurement navigation matching Figma design
  const procurementNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
    { name: 'Create PO', path: '/purchase-orders/new', icon: Plus },
    { name: 'Vendors', path: '/procurement-vendors', icon: Building2 },
    { name: 'Product Catalogue', path: '/procurement-products', icon: Package },
    { name: 'Inbound Shipments', path: '/inbound-shipments', icon: Truck },
    { name: 'Goods Receipt', path: '/goods-receipt', icon: ShoppingBag },
    { name: 'Inventory', path: '/procurement-inventory', icon: Archive },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  // Specific Corporate HR Manager navigation list matching Figma Screenshot
  const hrNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
    { name: 'Product Catalogue', path: '/products', icon: ShoppingBag },
    { name: 'Catalogue Builder', path: '/catalogue', icon: SlidersHorizontal },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Gift Selections', path: '/gift-selections', icon: Gift },
    { name: 'Order Tracking', path: '/orders', icon: Truck },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  // Group items for SuperAdmin, Admin, etc.
  const menuGroups = [
    {
      title: 'Main',
      items: [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          roles: ['SuperAdmin', 'Admin', 'Procurement', 'WarehouseLogistics', 'DesignCustomisation', 'DataEntryOperator', 'AccountsTeam', 'CorporateHRManager', 'Employee'],
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          name: 'Users',
          path: '/users',
          icon: User,
          roles: ['SuperAdmin', 'Admin'],
        },
        {
          name: 'Corporate Clients',
          path: '/clients',
          icon: Building2,
          roles: ['SuperAdmin', 'Admin'],
        },
      ],
    },
    {
      title: 'Catalogue',
      items: [
        {
          name: 'Products',
          path: '/products',
          icon: Gift,
          roles: ['SuperAdmin', 'Admin', 'Procurement', 'DataEntryOperator', 'CorporateHRManager'],
        },
        {
          name: 'Inventory',
          path: '/inventory',
          icon: Archive,
          roles: ['SuperAdmin', 'Admin', 'Procurement', 'WarehouseLogistics'],
        },
        {
          name: 'Gift Catalogues',
          path: '/catalogue',
          icon: Briefcase,
          roles: ['SuperAdmin', 'Admin', 'CorporateHRManager'],
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          name: 'Orders',
          path: '/orders',
          icon: ShoppingCart,
          roles: ['SuperAdmin', 'Admin', 'Procurement', 'WarehouseLogistics', 'AccountsTeam', 'CorporateHRManager'],
        },
        {
          name: 'Dispatch & Logistics',
          path: '/dispatch',
          icon: Truck,
          roles: ['SuperAdmin', 'Admin', 'WarehouseLogistics'],
        },
      ],
    },
    {
      title: 'Finance',
      items: [
        {
          name: 'Finance Dashboard',
          path: '/finance',
          icon: FileText,
          roles: ['SuperAdmin', 'AccountsTeam'],
        },
        {
          name: 'Invoices',
          path: '/invoices',
          icon: Receipt,
          roles: ['SuperAdmin', 'AccountsTeam', 'CorporateHRManager'],
        },
        {
          name: 'Vendors',
          path: '/vendors',
          icon: Building2,
          roles: ['SuperAdmin', 'Procurement', 'AccountsTeam'],
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          name: 'Reports',
          path: '/reports',
          icon: FileText,
          roles: ['SuperAdmin', 'Admin', 'AccountsTeam'],
        },
        {
          name: 'Notifications',
          path: '/notifications',
          icon: Bell,
          roles: ['SuperAdmin'],
        },
        {
          name: 'Settings',
          path: '/settings',
          icon: Settings,
          roles: ['SuperAdmin'],
        },
        {
          name: 'Audit Log',
          path: '/audit-log',
          icon: Activity,
          roles: ['SuperAdmin'],
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white border-r border-[#F6F6F9] z-40 transition-all duration-300 flex flex-col justify-between ${collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-[65px] flex items-center justify-between px-4 border-b border-[#F6F6F9]">
          <div className="flex items-center gap-3 overflow-hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Brand Logo"
                className="w-[32px] h-[32px] object-contain rounded-lg flex-shrink-0 border border-[#E3E3E3]"
              />
            ) : (
              <div className="w-[32px] h-[32px] flex items-center justify-center bg-[#D90B37] text-white rounded-lg flex-shrink-0">
                <Package size={18} />
              </div>
            )}
            {!collapsed && (
              <span className="font-['Inter'] font-bold text-[18px] text-[#1A1A1A] tracking-tight whitespace-nowrap">
                BoxStories
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-[#F8FAFC] rounded border-none cursor-pointer text-[#878787] transition-colors hidden md:block"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)]">
          {isAccounts ? (
            /* Dedicated Accounts Team Menu (Mockup images) */
            <div className="space-y-1">
              {accountsNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.path === '/accounts'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all no-underline ${isActive
                        ? 'bg-[#FDEDEE] text-[#D90B37]'
                        : 'text-[#878787] hover:bg-[#F8FAFC] hover:text-[#1A1A1A]'
                      }`
                    }
                    title={collapsed ? item.name : ''}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate font-medium">{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          ) : isDataEntry ? (
            /* Dedicated Data Entry Operator Menu */
            <div className="space-y-1">
              {dataEntryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.path === '/data-entry'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all no-underline ${isActive
                        ? 'bg-[#FDEDEE] text-[#D90B37]'
                        : 'text-[#878787] hover:bg-[#F8FAFC] hover:text-[#1A1A1A]'
                      }`
                    }
                    title={collapsed ? item.name : ''}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate font-medium">{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          ) : user?.role === 'Employee' ? (
            /* Dedicated Employee Menu */
            <div className="space-y-1">
              {[
                { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { name: 'Gift Catalogue', path: '/catalogue', icon: Gift },
                { name: 'Order Tracking', path: '/orders', icon: Truck },
                { name: 'My Profile', path: '/settings', icon: User },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all no-underline ${isActive
                        ? 'bg-[#FDEDEE] text-[#D90B37]'
                        : 'text-[#878787] hover:bg-[#F8FAFC] hover:text-[#1A1A1A]'
                      }`
                    }
                    title={collapsed ? item.name : ''}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && (
                      <span className="truncate font-medium">{item.name}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ) : isProcurement ? (
            /* Dedicated Procurement Menu (Figma design) */
            <div className="space-y-1">
              {procurementNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all no-underline ${isActive
                        ? 'bg-[#FDEDEE] text-[#D90B37]'
                        : 'text-[#878787] hover:bg-[#F8FAFC] hover:text-[#1A1A1A]'
                      }`
                    }
                    title={collapsed ? item.name : ''}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate font-medium">{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          ) : isBDM ? (
            /* Dedicated BDM Menu (Image 1.jpg) */
            <div className="space-y-1">
              {bdmNavItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all no-underline ${isActive
                        ? 'bg-[#FDEDEE] text-[#D90B37]'
                        : 'text-[#878787] hover:bg-[#F8FAFC] hover:text-[#1A1A1A]'
                      }`
                    }
                    title={collapsed ? item.name : ''}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate font-medium">{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          ) : isHR ? (
            /* Dedicated Corporate HR Manager Menu (Screenshot 1) */
            <div className="space-y-1">
              {hrNavItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all no-underline ${isActive
                        ? 'bg-[#FDEDEE] text-[#D90B37]'
                        : 'text-[#878787] hover:bg-[#F8FAFC] hover:text-[#1A1A1A]'
                      }`
                    }
                    title={collapsed ? item.name : ''}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate font-medium">{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          ) : isWarehouse ? (
            /* Dedicated Warehouse & Logistics Accordion Menu (Dashboard.jpg series) */
            <div className="space-y-1">
              {warehouseNavStructure.map((item) => {
                if (item.type === 'link') {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end={item.path === '/wh-dashboard'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all no-underline ${isActive
                          ? 'bg-[#FDEDEE] text-[#D90B37]'
                          : 'text-[#878787] hover:bg-[#F8FAFC] hover:text-[#1A1A1A]'
                        }`
                      }
                      title={collapsed ? item.name : ''}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {!collapsed && <span className="truncate font-medium">{item.name}</span>}
                    </NavLink>
                  );
                } else {
                  const Icon = item.icon;
                  const isOpen = openSections[item.name] ?? true;
                  const isAnyChildActive = item.children.some(c => location.pathname === c.path);

                  return (
                    <div key={item.name} className="space-y-1">
                      <button
                        onClick={() => toggleSection(item.name)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-[#878787] hover:bg-[#F8FAFC] hover:text-[#1A1A1A] ${isAnyChildActive ? 'text-[#D90B37]' : ''}`}
                        title={collapsed ? item.name : ''}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Icon size={18} className="flex-shrink-0" />
                          {!collapsed && <span className="truncate font-medium">{item.name}</span>}
                        </div>
                        {!collapsed && (
                          isOpen ? <ChevronDown size={16} className="text-[#878787]" /> : <ChevronRight size={16} className="text-[#878787]" />
                        )}
                      </button>

                      {isOpen && !collapsed && (
                        <div className="pl-6 space-y-1">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            return (
                              <NavLink
                                key={child.name}
                                to={child.path}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all no-underline ${isActive
                                    ? 'bg-[#FDEDEE] text-[#D90B37]'
                                    : 'text-[#878787] hover:bg-[#F8FAFC] hover:text-[#1A1A1A]'
                                  }`
                                }
                              >
                                <ChildIcon size={15} className="flex-shrink-0" />
                                <span className="truncate font-medium">{child.name}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            /* SuperAdmin / Admin Grouped Navigation */
            menuGroups.map((group) => {
              const visibleItems = group.items.filter((item) =>
                item.roles.includes(user?.role)
              );

              if (visibleItems.length === 0) return null;

              return (
                <div key={group.title} className="space-y-1">
                  {/* Category Header */}
                  {!collapsed && (
                    <button
                      onClick={() => toggleSection(group.title)}
                      className="w-full flex items-center justify-between px-3 py-1 text-[12px] font-bold text-[#878787] uppercase tracking-wider hover:text-[#1A1A1A] transition-colors border-none bg-transparent cursor-pointer text-left"
                    >
                      <span>{group.title}</span>
                      {openSections[group.title] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  )}

                  {/* Items */}
                  {(collapsed || openSections[group.title]) && (
                    <div className="space-y-0.5 mt-1">
                      {visibleItems.map((item) => {
                        const Icon = item.icon;

                        return (
                          <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all no-underline ${isActive
                                ? 'bg-[#FDEDEE] text-[#D90B37]'
                                : 'text-[#878787] hover:bg-[#F8FAFC] hover:text-[#1A1A1A]'
                              }`
                            }
                            title={collapsed ? item.name : ''}
                          >
                            <Icon size={18} className="flex-shrink-0" />
                            {!collapsed && (
                              <span className="truncate font-medium">{item.name}</span>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-[#F6F6F9]">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-[#878787] hover:bg-[#FDEDEE] hover:text-[#D90B37] transition-all border-none bg-transparent cursor-pointer ${collapsed ? 'justify-center' : ''
            }`}
          title="Logout"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
