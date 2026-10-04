# BoxStories B2B Gifting & ERP Portal - Complete Repository Architecture & Technical Memory

> **Repository Master Reference Guide**  
> *This document provides a complete, self-contained, authoritative memory of the BoxStories repository architecture, data schemas, API routes, RBAC matrix, frontend UI state/routing across ALL user roles, real-time socket events, and business workflows. Any future development or enhancement can rely on this file without re-analyzing the codebase.*

---

## 1. Executive Summary & Business Domain

**BoxStories** is an enterprise-grade B2B corporate gifting portal and Enterprise Resource Planning (ERP) operations management system. 

### Core Platform Capabilities
1. **Multi-Role B2B Portal**: Serves 10 distinct user roles across internal operational teams (SuperAdmin, Admin, BDM, Procurement, Warehouse/Logistics, Designers, Accounts, Data Entry) and corporate clients (Corporate HR Managers, Corporate Employees).
2. **Curated Client Catalogues & Negotiated Pricing**: Custom catalogue creation per corporate client with negotiated pricing, custom branding rules, budget limits, and event-specific hampers (Diwali, Onboarding, Welcome Kits).
3. **Corporate Employee Gift Redemption**: Dedicated employee interface allowing employees of client companies to browse curated gift selections within corporate budget allocations and track delivery.
4. **End-to-End Order Processing Lifecycle**: 15-stage order lifecycle tracking orders from `Draft` to `Pending Approval`, `In Design`, `In Production`, `Quality Check`, `Packed`, `Dispatched`, and `Delivered`.
5. **Procurement & Goods Receipt (GRN)**: Purchase Order (PO) creation, vendor management, inbound shipment tracking, and Goods Receipt Note (GRN) inbound stock verification.
6. **Warehouse & Logistics ERP (22-Page Track)**: 3-tier inventory levels (Products, Packaging, Finished Boxes), pick list generation, packing slip creation, dispatch label generation, E-Way Bill tracking, stock ledgers, and return request processing.
7. **Design & Customization Proofing**: Artwork uploaded by clients, proof generation by designers, branding area matrix, and client approval workflow.
8. **Financial Ledger & Invoicing**: Automated invoice generation, receivables tracking, GST calculations (18%), and payment status tracking (`Unpaid`, `Paid`, `Overdue`).

---

## 2. Monorepo Architecture & Technology Stack

```
boxstory/
├── README.md               # Quickstart guide & 10-role login credentials overview
├── MEMORY.md               # Master repository architecture & operational reference
├── package.json            # Root monorepo placeholder metadata
├── Warehouse/              # Mockup images reference directory for UI fidelity
├── backend/                # Express.js API Server + Mongoose Models + Socket.IO
│   ├── .env                # Backend environment configuration
│   ├── package.json        # Node.js backend dependencies
│   ├── parse_figma_output.js
│   ├── test_db.js
│   ├── update_images.js
│   └── src/
│       ├── app.js          # Express app definition & route registry
│       ├── server.js       # HTTP server initialization & Socket.IO server setup
│       ├── seeder.js       # Comprehensive MongoDB Atlas database seeder (10 User Roles)
│       ├── config/
│       │   └── db.js       # Mongoose database connection module
│       ├── controllers/    # 20 Express controller modules
│       ├── middleware/     # JWT authentication & error handling middleware
│       ├── models/         # 22 Mongoose data models
│       └── routes/         # 20 Express route modules
└── frontend/               # React 19 SPA powered by Vite & Tailwind CSS v4
    ├── index.html          # HTML5 entry point
    ├── package.json        # Frontend React & Vite dependencies
    ├── postcss.config.js   # PostCSS configuration
    ├── tailwind.config.js  # Tailwind CSS theme extensions
    ├── vite.config.js      # Vite build & proxy settings
    └── src/
        ├── App.jsx         # React Router v7 root routes & ProtectedLayout
        ├── App.css         # Global styling rules
        ├── index.css       # Tailwind directives & CSS variables
        ├── main.jsx        # React DOM root render
        ├── components/     # Reusable layout & UI components (10 components)
        ├── context/        # React Auth & Socket context providers (2 contexts)
        └── pages/          # Application page views (64 page components across 9 role tracks)
```

### Stack & Dependency Specifications

| Component | Technology | Version | Purpose / Key Features |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | Node.js | `>= 18.x` | Asynchronous JavaScript runtime |
| **Web Server** | Express.js | `^4.19.2` | RESTful API routing, middleware execution |
| **Database** | MongoDB Atlas | Mongoose `^8.3.1` | NoSQL database modeling with schemas & population |
| **Authentication** | JWT & Bcrypt | `jsonwebtoken ^9.0.2`, `bcryptjs ^2.4.3` | Token-based stateless auth & password hashing |
| **Real-Time Websockets**| Socket.IO | `^4.8.3` (Server & Client) | Live status updates, notification broadcasting |
| **Frontend Framework**| React | `^19.2.7` | UI component library with Hooks |
| **Build System** | Vite | `^8.1.1` | ESM dev server & fast production bundler |
| **Routing** | React Router DOM | `^7.18.1` | SPA layout routing & navigation guards |
| **Styling** | Tailwind CSS | `^4.3.3` + Autoprefixer | Utility-first CSS styling framework |
| **Icons** | Lucide React | `^1.27.0` | Comprehensive UI SVG icons |
| **HTTP Client** | Axios | `^1.18.1` | Promise-based API request handler with base config |

---

## 3. Role-Based Access Control (RBAC) & Security System

The application implements granular Role-Based Access Control via `backend/src/middleware/authMiddleware.js`.

### User Roles Matrix (10 Defined Roles)

| Role Code | Display Name | Core Permissions & Operational Scope |
| :--- | :--- | :--- |
| `SuperAdmin` | Super Admin | **Unrestricted Access**: Bypasses all role checks. Full control over system settings, client management, user management, financials, cataloguing, and database management. |
| `Admin` | Operations Admin | Full management of clients, users, products, inventory, orders, invoices, and settings. |
| `BDM` | Business Development Manager | Manages assigned corporate clients (`assignedBDM`), creates custom client catalogues, adds new clients (`/clients/new`), tracks client orders, and views BDM sales reports. |
| `Procurement` | Procurement Lead | Manages vendors, creates & approves Purchase Orders (POs), tracks inbound shipments, and monitors stock reorder alerts. |
| `WarehouseLogistics` | Warehouse & Logistics | Manages 22-page Warehouse ERP track: 3-tier inventory levels, pick lists, packing slips, dispatch labels, carrier tracking, return requests, and branding matrices. |
| `DesignCustomisation` | Graphic Designer | Manages design jobs (`/api/design-jobs`), uploads branding proofs, sets specifications, and handles client proof approvals. |
| `DataEntryOperator` | Data Entry Specialist | Manages product cataloguing, SKU product entry, inventory record updates, order entry, and data submission audit trails. |
| `AccountsTeam` | Finance & Accounts | Manages invoices, accounts receivable ledgers, overdue payment tracking, payment status updates, and financial summary reports. |
| `CorporateHRManager` | Corporate Client HR | Client-side manager. Views client-curated catalogues, manages employee gift accounts, approves employee gift selections, submits company orders, and tracks shipments. |
| `Employee` | Corporate Employee | End beneficiary. Views active corporate gift catalogue, selects gift items within assigned budget, submits gift redemption orders, and tracks delivery status. |

---

## 4. Comprehensive Database Schemas (22 Mongoose Models)

All database models reside in `backend/src/models/`:

1. `User.js` — System accounts, passwords, roles, permissions, client associations.
2. `Client.js` — Corporate client profiles, GSTIN, credit limits, payment terms (`Net 30`, `Net 45`), assigned BDM.
3. `Product.js` — Catalog products, SKUs, base prices, HSN codes, GST rates (18%), dimensions, customization rules.
4. `Catalogue.js` — Client-specific catalogues with negotiated pricing, active dates, and budget caps.
5. `Order.js` — Corporate sales orders, items, status lifecycle (15 stages), tracking details, gift messages.
6. `Inventory.js` — Stock levels, available/reserved quantities, bin/rack locations, reorder thresholds, ledger history.
7. `Invoice.js` — Financial invoices, GST breakdowns, due dates, payment status (`Unpaid`, `Paid`, `Overdue`).
8. `Vendor.js` — Supplier directory, rating, payment terms, contact details.
9. `PurchaseOrder.js` — Inbound procurement POs, vendor items, total amounts, approval status.
10. `GoodsReceipt.js` (GRN) — Goods Receipt Notes, ordered vs received vs accepted stock quantities.
11. `DesignJob.js` — Artwork proofing jobs, client uploads, designer proofs, revision history.
12. `ClientCommunication.js` — Interaction logs between BDMs and client contacts.
13. `PickList.js` — Warehouse picking assignments, bin locations, picker status.
14. `PackingSlip.js` — Package contents verification slips for warehouse packing.
15. `Dispatch.js` — Shipping records, carrier names, tracking/AWB numbers, dispatch dates.
16. `WarehouseException.js` — Damaged goods, short shipments, or inventory mismatch reports.
17. `GiftSelection.js` — Employee gift choice records and corporate event allocations.
18. `Notification.js` — Real-time in-app alerts and Socket.IO notifications.
19. `Setting.js` — System configuration keys, tax defaults, white-label branding URLs.
20. `AuditLog.js` — Audit trail logging user actions, IP addresses, resource modifications.
21. `Report.js` — Generated analytics reports, date ranges, export file paths.
22. `EWayBill.js` — Government GST E-Way Bill numbers, transport vehicle numbers, validity dates.

---

## 5. All Role Application Tracks & Page Mapping

The frontend includes dedicated page tracks for every user role in `frontend/src/pages/`:

### Track 1: Warehouse & Logistics ERP Track (22 Pages)
- `WarehouseDashboard.jsx` (`/wh-dashboard`) — 8 KPI Cards, Revenue vs Cost Bar Chart, Category Mix Donut, Stock Trend Area Chart, Low Stock Alerts, Recent Orders Table.
- `WHProductMaster.jsx` (`/wh-product-master`) — Product Information, Physical Details, Pricing, Inventory Rules.
- `WHPurchaseRequisition.jsx` (`/wh-purchase-requisition`) — PR Header, Item Grid, Save/Submit/Approve/Reject actions.
- `WHPurchaseOrder.jsx` (`/wh-purchase-order`) — PO Header, Vendor Info, Delivery Info, Line Items, Print/Email actions.
- `WHGoodsReceiptNote.jsx` (`/wh-grn`) — GRN Header, QC Details, `Accepted Qty = Received Qty - Rejected Qty` calculation.
- `WHInventoryDashboard.jsx` (`/wh-inventory`) — 7 KPI Cards, Stock Movement Chart, Stock Adjustment Modal.
- `WHStockLedger.jsx` (`/wh-stock-ledger`) — Filters card, transaction ledger grid, search, export Excel/PDF.
- `WHProductSnapshot.jsx` (`/wh-product-snapshot`) — Product information, `Available to Sell` calculation, movement history.
- `WHSalesOrder.jsx` (`/wh-sales-order`) — Order details, product grid, Sales Orders Registry view.
- `WHInvoice.jsx` (`/wh-invoice`) — Invoice header, totals summary (Subtotal, GST, Freight, Discount, Total), Invoices Registry view.
- `WHGiftBoxCreation.jsx` (`/wh-gift-box`) — Gift box code, component table, packaging, Live Cost Summary side panel (`FINAL PRICE ₹ 1,465`).
- `WHBundleBuilder.jsx` (`/wh-bundle-builder`) — 4-Step wizard (`Products`, `Packaging`, `Branding`, `Costing`), dynamic price calculation.
- `WHBrandingRequest.jsx` (`/wh-branding`) — Branding details, options, artwork upload (AI, PDF, PNG, Mockup), approval bar.
- `WHBrandingMatrix.jsx` (`/wh-branding-matrix`) — Supported branding tag badges, branding area table, quantity cost breaks matrix.
- `WHDispatch.jsx` (`/wh-dispatch`) — Dispatch header, courier details, packing slips, dispatch labels, E-Way Bill tracking.
- `WHReturnRequest.jsx` (`/wh-returns`) — Return request details, product grid with return reasons, approval bar.
- `WHCatalog.jsx` (`/wh-catalog`) — Catalog sub-nav tabs, top filters, category/price sidebar filters, 6 product hamper cards.
- `WHProductDetail.jsx` (`/wh-product-detail`) — Large product image card, specifications card, pricing tier matrix table, downloads card.
- `WHCompare.jsx` (`/wh-compare`) — Side-by-side product comparison table across specifications, costs, and margins.
- `WHUserManagement.jsx` (`/wh-user-management`) — Employee information, login credentials, permissions card, registered users registry.
- `WHReports.jsx` (`/wh-reports`) — Report filters, 14 interactive report tiles, report output preview table.
- `WHInventoryLevels.jsx` (`/wh-inventory-levels`) — 3-tier inventory maintenance (Individual Products, Packaging, Finished Gift Boxes) & outcome badges.

### Track 2: Business Development Manager (BDM) Track
- `BDMClients.jsx` (`/clients`) — Assigned corporate clients list, credit limit status, contract dates.
- `BDMAddClient.jsx` (`/clients/new`) — Corporate client onboarding form with GSTIN/PAN auto-validation.
- `BDMProductCatalogue.jsx` (`/products`) — Product catalog browsing and customized client pricing setup.
- `BDMGiftCatalogue.jsx` (`/catalogue`) — Custom client gift catalogue builder and budget allocator.
- `BDMOrderTracker.jsx` (`/orders`) — Live client order progress tracker and pipeline view.
- `BDMReports.jsx` (`/reports`) — Sales performance metrics, client revenue breakdown reports.

### Track 3: Procurement & Vendor Management Track
- `ProcurementDashboard.jsx` (`/dashboard`) — Procurement overview, open PO count, low stock reorder alerts.
- `ProcurementPurchaseOrders.jsx` (`/purchase-orders`) — Purchase orders list, status filters, vendor approvals.
- `ProcurementCreatePO.jsx` (`/purchase-orders/new`) — Vendor PO creation form with auto-calculated totals.
- `ProcurementVendors.jsx` (`/procurement-vendors`) — Vendor directory, ratings, lead times, payment terms.
- `ProcurementInboundShipments.jsx` (`/inbound-shipments`) — Expected inbound shipment tracking and courier ETAs.
- `ProcurementGoodsReceipt.jsx` (`/goods-receipt`) — Inbound stock verification and quality check receipts.

### Track 4: Data Entry Operator Track
- `DataEntryDashboard.jsx` (`/data-entry`) — Data entry metrics, daily submission targets, pending reviews.
- `DataEntryProductEntry.jsx` (`/data-entry/products`) — Bulk & single product cataloguing form.
- `DataEntryInventoryEntry.jsx` (`/data-entry/inventory`) — Stock adjustment and bin location entry form.
- `DataEntryOrderEntry.jsx` (`/data-entry/orders`) — Manual order entry interface for phone/email orders.
- `DataEntryMySubmissions.jsx` (`/data-entry/submissions`) — Historical submission audit log and approval status.

### Track 5: Corporate HR Manager Portal Track
- `HRProductCatalogue.jsx` (`/products`) — Corporate gift catalogue catalog tailored for company events.
- `HRCatalogueBuilder.jsx` (`/catalogue`) — Custom employee gift catalogue curation tool.
- `HREmployees.jsx` (`/employees`) — Employee directory, gift allowance limits, department tagging.
- `HRGiftSelections.jsx` (`/gift-selections`) — Employee gift selection approvals and budget allocation.
- `HROrderTracking.jsx` (`/orders`) — Company order delivery tracking and recipient status.
- `HRReports.jsx` (`/reports`) — HR gifting budget utilization and employee claim analytics.

### Track 6: Accounts & Finance Controller Track
- `FinanceDashboard.jsx` (`/finance`) — Financial overview, total revenue, pending receivables, GST breakdown.
- `Invoices.jsx` (`/invoices`) — Invoice management table, payment status toggle (`Unpaid`, `Paid`, `Overdue`), invoice downloads.

### Track 7: SuperAdmin & Operations Admin Track
- `Dashboard.jsx` (`/dashboard`) — Master operational dashboard with global metrics.
- `Clients.jsx` (`/clients`) — Global client management directory.
- `Users.jsx` (`/users`) — User account management and permission editor.
- `Products.jsx` (`/products`) — Master product management.
- `Inventory.jsx` (`/inventory`) — Master inventory control.
- `Orders.jsx` (`/orders`) — Master order pipeline controller.
- `Vendors.jsx` (`/vendors`) — Vendor database master view.
- `Reports.jsx` (`/reports`) — Global system analytics and export center.
- `Settings.jsx` (`/settings`) — White-label logo, tax defaults, system configurations.
- `AuditLog.jsx` (`/audit-log`) — System audit trail for security compliance.

---

## 6. Seeded Test Credentials (10 Roles)

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@boxstories.com` | `password123` | Master system control across all modules |
| **Admin** | `admin@boxstories.com` | `password123` | Operations management |
| **BDM** | `bdm@boxstories.com` | `password123` | BDM client portal & sales tracking |
| **Procurement** | `procurement@boxstories.com` | `password123` | POs, vendor management, inbound stock |
| **Warehouse Lead** | `warehouse@boxstories.com` | `password123` | Full 22-page Warehouse ERP track |
| **Designer** | `designer@boxstories.com` | `password123` | Branding proofs & specifications |
| **Data Entry** | `dataentry@boxstories.com` | `password123` | Data entry & cataloguing workspace |
| **Accounts** | `accounts@boxstories.com` | `password123` | Financials, invoices, receivables |
| **Corporate HR (Acme)** | `hr@boxstories.com` | `password123` | Corporate client manager portal |
| **Employee (Acme)** | `employee@boxstories.com` | `password123` | Corporate gift selection & tracking portal |

---

## 7. Command Quick Reference

### 1. Populate/Reset MongoDB Atlas Database
```bash
cd backend
node src/seeder.js
```

### 2. Start Backend API Server
```bash
cd backend
npm run dev
# Server listening on http://localhost:5000
```

### 3. Start Frontend Vite Development Server
```bash
cd frontend
npm run dev
# Application accessible on http://localhost:5173
```
