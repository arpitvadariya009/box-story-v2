import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import GiftCatalogues from './pages/GiftCatalogues';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Clients from './pages/Clients';
import Users from './pages/Users';
import Invoices from './pages/Invoices';
import Vendors from './pages/Vendors';
import Settings from './pages/Settings';
import Dispatch from './pages/Dispatch';
import FinanceDashboard from './pages/FinanceDashboard';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import AuditLog from './pages/AuditLog';

// BDM Pages
import BDMClients from './pages/BDMClients';
import BDMAddClient from './pages/BDMAddClient';
import BDMProductCatalogue from './pages/BDMProductCatalogue';
import BDMGiftCatalogue from './pages/BDMGiftCatalogue';
import BDMOrderTracker from './pages/BDMOrderTracker';
import BDMReports from './pages/BDMReports';

// Procurement Pages
import ProcurementDashboard from './pages/ProcurementDashboard';
import ProcurementPurchaseOrders from './pages/ProcurementPurchaseOrders';
import ProcurementCreatePO from './pages/ProcurementCreatePO';
import ProcurementInboundShipments from './pages/ProcurementInboundShipments';
import ProcurementGoodsReceipt from './pages/ProcurementGoodsReceipt';
import ProcurementInventory from './pages/ProcurementInventory';
import ProcurementProductCatalogue from './pages/ProcurementProductCatalogue';
import ProcurementVendors from './pages/ProcurementVendors';

// HR Pages
import HRProductCatalogue from './pages/HRProductCatalogue';
import HRCatalogueBuilder from './pages/HRCatalogueBuilder';
import HREmployees from './pages/HREmployees';
import HRGiftSelections from './pages/HRGiftSelections';
import HROrderTracking from './pages/HROrderTracking';
import HRReports from './pages/HRReports';
// Data Entry Operator Pages
import DataEntryDashboard from './pages/DataEntryDashboard';
import DataEntryProductEntry from './pages/DataEntryProductEntry';
import DataEntryInventoryEntry from './pages/DataEntryInventoryEntry';
import DataEntryOrderEntry from './pages/DataEntryOrderEntry';
import DataEntryMySubmissions from './pages/DataEntryMySubmissions';

// Accounts Team Pages
import AccountsDashboard from './pages/AccountsDashboard';
import AccountsClientInvoicing from './pages/AccountsClientInvoicing';
import AccountsReceivables from './pages/AccountsReceivables';
import AccountsVendorPayables from './pages/AccountsVendorPayables';
import AccountsVendorRegistration from './pages/AccountsVendorRegistration';
import AccountsEWayBills from './pages/AccountsEWayBills';
import AccountsFinancialReports from './pages/AccountsFinancialReports';

// Warehouse & Logistics Pages
import WarehouseDashboard from './pages/WarehouseDashboard';
import WHProductMaster from './pages/WHProductMaster';
import WHPurchaseRequisition from './pages/WHPurchaseRequisition';
import WHPurchaseOrder from './pages/WHPurchaseOrder';
import WHGoodsReceiptNote from './pages/WHGoodsReceiptNote';
import WHInventoryDashboard from './pages/WHInventoryDashboard';
import WHStockLedger from './pages/WHStockLedger';
import WHProductSnapshot from './pages/WHProductSnapshot';
import WHSalesOrder from './pages/WHSalesOrder';
import WHInvoice from './pages/WHInvoice';
import WHGiftBoxCreation from './pages/WHGiftBoxCreation';
import WHBundleBuilder from './pages/WHBundleBuilder';
import WHBrandingRequest from './pages/WHBrandingRequest';
import WHBrandingMatrix from './pages/WHBrandingMatrix';
import WHDispatch from './pages/WHDispatch';
import WHReturnRequest from './pages/WHReturnRequest';
import WHCatalog from './pages/WHCatalog';
import WHProductDetail from './pages/WHProductDetail';
import WHCompare from './pages/WHCompare';
import WHUserManagement from './pages/WHUserManagement';
import WHReports from './pages/WHReports';
import WHInventoryLevels from './pages/WHInventoryLevels';

// Protected Layout wrapper
const ProtectedLayout = ({ title, setTitle }) => {
  const { token, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#CE1C2B]"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[#F7F7F7] overflow-x-hidden">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />
      {mobileMenuOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className={`flex-grow min-h-screen transition-all duration-300 flex flex-col min-w-0 w-full overflow-x-hidden ${collapsed ? 'pl-20' : 'pl-0 md:pl-64'
          }`}
      >
        <Navbar
          title={title}
          collapsed={collapsed}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="p-4 md:p-5 mt-14 max-w-[1632px] mx-auto w-full box-border flex-grow flex flex-col min-h-0 min-w-0 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const RouteTitleHandler = ({ title, setTitle, children }) => {
  React.useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
  return children;
};

const AppContent = () => {
  const [title, setTitle] = useState('Dashboard');
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route element={<ProtectedLayout title={title} setTitle={setTitle} />}>
        <Route
          path="/dashboard"
          element={
            <RouteTitleHandler title="Dashboard" setTitle={setTitle}>
              {user?.role === 'WarehouseLogistics' ? (
                <Navigate to="/wh-dashboard" replace />
              ) : user?.role === 'DataEntryOperator' ? (
                <Navigate to="/data-entry" replace />
              ) : user?.role === 'AccountsTeam' ? (
                <Navigate to="/accounts" replace />
              ) : (
                <Dashboard />
              )}
            </RouteTitleHandler>
          }
        />
        <Route
          path="/products"
          element={
            <RouteTitleHandler title="Product Catalogue" setTitle={setTitle}>
              {user?.role === 'BDM' ? (
                <BDMProductCatalogue />
              ) : user?.role === 'CorporateHRManager' ? (
                <HRProductCatalogue />
              ) : (
                <Products />
              )}
            </RouteTitleHandler>
          }
        />
        <Route
          path="/catalogue"
          element={
            <RouteTitleHandler title={user?.role === 'CorporateHRManager' ? "Catalogue Builder" : "Gift Catalogue"} setTitle={setTitle}>
              {user?.role === 'BDM' ? (
                <BDMGiftCatalogue />
              ) : user?.role === 'CorporateHRManager' ? (
                <HRCatalogueBuilder />
              ) : (
                <GiftCatalogues />
              )}
            </RouteTitleHandler>
          }
        />
        <Route
          path="/orders"
          element={
            <RouteTitleHandler title="Order Tracking" setTitle={setTitle}>
              {user?.role === 'BDM' ? (
                <BDMOrderTracker />
              ) : user?.role === 'CorporateHRManager' ? (
                <HROrderTracking />
              ) : (
                <Orders />
              )}
            </RouteTitleHandler>
          }
        />
        <Route
          path="/dispatch"
          element={
            <RouteTitleHandler title="Dispatch & Logistics" setTitle={setTitle}>
              <Dispatch />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/inventory"
          element={
            <RouteTitleHandler title="Inventory Management" setTitle={setTitle}>
              <Inventory />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/clients"
          element={
            <RouteTitleHandler title="Corporate Clients" setTitle={setTitle}>
              {user?.role === 'BDM' ? <BDMClients /> : <Clients />}
            </RouteTitleHandler>
          }
        />
        <Route
          path="/clients/new"
          element={
            <RouteTitleHandler title="Add New Client" setTitle={setTitle}>
              <BDMAddClient />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/users"
          element={
            <RouteTitleHandler title="User Management" setTitle={setTitle}>
              {user?.role === 'CorporateHRManager' ? <HREmployees /> : <Users />}
            </RouteTitleHandler>
          }
        />
        <Route
          path="/employees"
          element={
            <RouteTitleHandler title="Employees" setTitle={setTitle}>
              <HREmployees />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/gift-selections"
          element={
            <RouteTitleHandler title="Gift Selections" setTitle={setTitle}>
              {user?.role === 'CorporateHRManager' ? <HRGiftSelections /> : <GiftCatalogues />}
            </RouteTitleHandler>
          }
        />
        <Route
          path="/finance"
          element={
            <RouteTitleHandler title="Finance Dashboard" setTitle={setTitle}>
              <FinanceDashboard />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/invoices"
          element={
            <RouteTitleHandler title="Invoice Management" setTitle={setTitle}>
              <Invoices />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/vendors"
          element={
            <RouteTitleHandler title="Vendor Management" setTitle={setTitle}>
              <Vendors />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/reports"
          element={
            <RouteTitleHandler title="Reports" setTitle={setTitle}>
              {user?.role === 'BDM' ? (
                <BDMReports />
              ) : user?.role === 'CorporateHRManager' ? (
                <HRReports />
              ) : (
                <Reports />
              )}
            </RouteTitleHandler>
          }
        />
        <Route
          path="/notifications"
          element={
            <RouteTitleHandler title="Notifications" setTitle={setTitle}>
              <Notifications />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/settings"
          element={
            <RouteTitleHandler title="Account Settings" setTitle={setTitle}>
              <Settings />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/profile"
          element={
            <RouteTitleHandler title="My Profile" setTitle={setTitle}>
              <Settings />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/audit-log"
          element={
            <RouteTitleHandler title="Audit Log" setTitle={setTitle}>
              <AuditLog />
            </RouteTitleHandler>
          }
        />
        {/* Procurement Routes */}
        <Route
          path="/purchase-orders"
          element={
            <RouteTitleHandler title="Purchase Orders" setTitle={setTitle}>
              <ProcurementPurchaseOrders />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/purchase-orders/new"
          element={
            <RouteTitleHandler title="Create Order" setTitle={setTitle}>
              <ProcurementCreatePO />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/inbound-shipments"
          element={
            <RouteTitleHandler title="Inbound Shipments" setTitle={setTitle}>
              <ProcurementInboundShipments />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/goods-receipt"
          element={
            <RouteTitleHandler title="Goods Receipt" setTitle={setTitle}>
              <ProcurementGoodsReceipt />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/procurement-inventory"
          element={
            <RouteTitleHandler title="Inventory" setTitle={setTitle}>
              <ProcurementInventory />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/procurement-products"
          element={
            <RouteTitleHandler title="Product Catalogue" setTitle={setTitle}>
              <ProcurementProductCatalogue />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/procurement-vendors"
          element={
            <RouteTitleHandler title="Vendor Management" setTitle={setTitle}>
              <ProcurementVendors />
            </RouteTitleHandler>
          }
        />

        {/* ── Data Entry Operator Routes ───────────────────────── */}
        <Route
          path="/data-entry"
          element={
            <RouteTitleHandler title="Dashboard" setTitle={setTitle}>
              <DataEntryDashboard />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/data-entry/products"
          element={
            <RouteTitleHandler title="Product Entry" setTitle={setTitle}>
              <DataEntryProductEntry />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/data-entry/inventory"
          element={
            <RouteTitleHandler title="Inventory Entry" setTitle={setTitle}>
              <DataEntryInventoryEntry />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/data-entry/orders"
          element={
            <RouteTitleHandler title="Order Entry" setTitle={setTitle}>
              <DataEntryOrderEntry />
            </RouteTitleHandler>
          }
        />
        {/* ── Accounts Team Routes ───────────────────────── */}
        <Route
          path="/accounts"
          element={
            <RouteTitleHandler title="Finance Dashboard" setTitle={setTitle}>
              <AccountsDashboard />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/accounts/invoices"
          element={
            <RouteTitleHandler title="Client Invoicing" setTitle={setTitle}>
              <AccountsClientInvoicing />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/accounts/receivables"
          element={
            <RouteTitleHandler title="Receivables" setTitle={setTitle}>
              <AccountsReceivables />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/accounts/payables"
          element={
            <RouteTitleHandler title="Vendor Payables" setTitle={setTitle}>
              <AccountsVendorPayables />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/accounts/vendor-registration"
          element={
            <RouteTitleHandler title="Vendor Registration" setTitle={setTitle}>
              <AccountsVendorRegistration />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/accounts/eway-bills"
          element={
            <RouteTitleHandler title="e-Way Bill & Gate Pass" setTitle={setTitle}>
              <AccountsEWayBills />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/accounts/reports"
          element={
            <RouteTitleHandler title="Financial Reports" setTitle={setTitle}>
              <AccountsFinancialReports />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/data-entry/submissions"
          element={
            <RouteTitleHandler title="My Submissions" setTitle={setTitle}>
              <DataEntryMySubmissions />
            </RouteTitleHandler>
          }
        />

        {/* ── Warehouse & Logistics Routes (22-Page Mapping) ───────────────────────── */}
        <Route
          path="/wh-dashboard"
          element={
            <RouteTitleHandler title="Dashboard" setTitle={setTitle}>
              <WarehouseDashboard />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-product-master"
          element={
            <RouteTitleHandler title="Product Master" setTitle={setTitle}>
              <WHProductMaster />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-purchase-requisition"
          element={
            <RouteTitleHandler title="Purchase Requisition" setTitle={setTitle}>
              <WHPurchaseRequisition />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-purchase-order"
          element={
            <RouteTitleHandler title="Purchase Order" setTitle={setTitle}>
              <WHPurchaseOrder />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-grn"
          element={
            <RouteTitleHandler title="Goods Receipt Note (GRN)" setTitle={setTitle}>
              <WHGoodsReceiptNote />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-inventory"
          element={
            <RouteTitleHandler title="Inventory Dashboard" setTitle={setTitle}>
              <WHInventoryDashboard />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-stock-ledger"
          element={
            <RouteTitleHandler title="Stock Ledger" setTitle={setTitle}>
              <WHStockLedger />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-product-snapshot"
          element={
            <RouteTitleHandler title="Product Snapshot" setTitle={setTitle}>
              <WHProductSnapshot />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-sales-order"
          element={
            <RouteTitleHandler title="Sales Order" setTitle={setTitle}>
              <WHSalesOrder />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-invoice"
          element={
            <RouteTitleHandler title="Invoice" setTitle={setTitle}>
              <WHInvoice />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-gift-box"
          element={
            <RouteTitleHandler title="Gift Box Creation" setTitle={setTitle}>
              <WHGiftBoxCreation />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-bundle-builder"
          element={
            <RouteTitleHandler title="Product Bundle Builder" setTitle={setTitle}>
              <WHBundleBuilder />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-branding"
          element={
            <RouteTitleHandler title="Branding Request" setTitle={setTitle}>
              <WHBrandingRequest />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-branding-matrix"
          element={
            <RouteTitleHandler title="Branding Matrix" setTitle={setTitle}>
              <WHBrandingMatrix />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-dispatch"
          element={
            <RouteTitleHandler title="Dispatch" setTitle={setTitle}>
              <WHDispatch />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-returns"
          element={
            <RouteTitleHandler title="Return Request" setTitle={setTitle}>
              <WHReturnRequest />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-catalog"
          element={
            <RouteTitleHandler title="Catalog" setTitle={setTitle}>
              <WHCatalog />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-product-detail"
          element={
            <RouteTitleHandler title="Product Detail" setTitle={setTitle}>
              <WHProductDetail />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-catalog-compare"
          element={
            <RouteTitleHandler title="Compare Products" setTitle={setTitle}>
              <WHCompare />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-compare"
          element={
            <RouteTitleHandler title="Compare Products" setTitle={setTitle}>
              <WHCompare />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-user-management"
          element={
            <RouteTitleHandler title="User Management" setTitle={setTitle}>
              <WHUserManagement />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-reports"
          element={
            <RouteTitleHandler title="Reports" setTitle={setTitle}>
              <WHReports />
            </RouteTitleHandler>
          }
        />
        <Route
          path="/wh-inventory-levels"
          element={
            <RouteTitleHandler title="Inventory Levels" setTitle={setTitle}>
              <WHInventoryLevels />
            </RouteTitleHandler>
          }
        />

        {/* Fallback route - MUST be at the end */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppContent />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
