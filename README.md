# BoxStories B2B Gifting & ERP Portal

A premium enterprise-grade full-stack B2B corporate gifting portal and Enterprise Resource Planning (ERP) operations management system designed for **BoxStories**.

This monorepo workspace contains two main packages:
1. **`backend/`**: Express.js MVC REST API server connecting to MongoDB Atlas + Socket.IO real-time notification gateway.
2. **`frontend/`**: React.js 19 SPA powered by Vite, Tailwind CSS v4, and Lucide Icons with multi-role RBAC routing.

---

## 🚀 Quick Start Guide

### 1. Database & Backend Configuration

Make sure your connection string is active in `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://arpitvadariya003:808280@cluster0.plaliru.mongodb.net/boxstories
JWT_SECRET=supersecretjwtkeyforboxstories123!
```

#### Step A: Run the Database Seeder
This will populate MongoDB Atlas with mock products, corporate clients, and test accounts for all 10 user roles.
```bash
cd backend
node src/seeder.js
```

#### Step B: Start the Backend Server
```bash
cd backend
npm run dev
```
The server will start running on `http://localhost:5000`.

---

### 2. Frontend Launch

#### Step A: Start the Vite Development Server
```bash
cd frontend
npm run dev
```
The app will start running on `http://localhost:5173`.

---

## 🔑 Demo User Credentials (All 10 RBAC User Roles)

Log in to the portal using any of the following credentials to experience the role-specific portal layouts, dashboards, and workflows:

| Role | Email | Password | Primary Module Access & Operational Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@boxstories.com` | `password123` | **Unrestricted Access**: Full control over system settings, users, clients, financials, and master data. |
| **Admin** | `admin@boxstories.com` | `password123` | Operations management: Clients, Catalogues, Orders, Inventory, Users, Invoices, Settings, Audit Logs. |
| **BDM (Business Development)** | `bdm@boxstories.com` | `password123` | Assigned client management, custom client catalogue creation, client order tracking, sales performance reports. |
| **Procurement Lead** | `procurement@boxstories.com` | `password123` | Purchase Order (PO) creation, vendor management, inbound shipment tracking, stock reorder alerts, GRN verification. |
| **Warehouse & Logistics Lead** | `warehouse@boxstories.com` | `password123` | **22-Page Warehouse ERP**: Inventory Dashboard, Stock Ledger, Product Master, Requisitions, POs, GRN, Sales Orders, Invoices, Gift Box Creation, Bundle Builder, Branding Matrix, Returns, Catalog, Comparison, User Management, Reports, Inventory Levels, Dispatch. |
| **Graphic Designer** | `designer@boxstories.com` | `password123` | Design job proofing, uploading artwork proofs, logo vector management, client proof approvals. |
| **Data Entry Operator** | `dataentry@boxstories.com` | `password123` | Data entry dashboard, SKU product entry, inventory record entry, order entry, my submission tracking. |
| **Accounts / Finance** | `accounts@boxstories.com` | `password123` | Finance Dashboard, invoice ledgers, payment status updates (Paid, Unpaid, Overdue), revenue summaries. |
| **Corporate HR Manager (Acme)** | `hr@boxstories.com` | `password123` | Corporate client manager portal: Curated client catalogue, employee gift allocations, gift approval, order tracking. |
| **Corporate Employee (Acme)** | `employee@boxstories.com` | `password123` | Corporate beneficiary portal: Browse approved gift selections within budget, submit redemption requests, track delivery. |

---

## 📦 Key System Modules Across All Role Tracks

### 1. Operations & Admin Track
- **Dashboard**: Executive metrics, revenue trends, quick action shortcuts.
- **Client Management**: B2B corporate profiles, GSTIN/PAN validation, credit limits, payment terms (`Net 30`, `Net 45`).
- **User Management**: Multi-role RBAC user provisioning, approval limits, password reset, permission matrix.

### 2. Business Development (BDM) Track
- **Client Management**: Add/manage corporate leads and assigned clients.
- **Catalogue Builder**: Custom client catalogues with negotiated pricing and custom branding rules.
- **Order Tracker**: Live status tracking of corporate orders.

### 3. Procurement & Inbound Supply Chain Track
- **Purchase Orders (POs)**: Vendor PO generation with itemized cost breakdowns.
- **Vendor Management**: Vendor directories, ratings, payment terms, and product catalogues.
- **Inbound Shipments & GRN**: Goods Receipt Note verification, QC acceptance/rejection logging.

### 4. Warehouse & Logistics ERP Track (22-Page Flow)
- **Inventory Tiers**: Individual Product (Level 1), Packaging Consumables (Level 2), Finished Gift Boxes (Level 3).
- **Gift Box & Bundle Builder**: Dynamic BOM calculation (`Product + Branding + Packaging + Logistics + Margin % = Final Selling Price`).
- **Branding Matrix & Requests**: UV Printing, Screen Printing, Laser Engraving, Embroidery, Foiling with quantity price breaks.
- **Returns & Dispatch**: Return request approval workflow, courier dispatch label generation, and E-Way Bill logging.

### 5. Data Entry Track
- **Operator Workspace**: Streamlined forms for bulk product creation, stock updates, order logging, and submission audit trail.

### 6. Corporate Client HR & Employee Gifting Track
- **HR Catalogue Builder**: Custom corporate gift collections tailored to company events (Onboarding, Diwali, Executive Gifts).
- **Employee Redemption Portal**: Simple gift claim interface with address validation and tracking.
