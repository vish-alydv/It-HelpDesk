# IT Helpdesk & Incident Management System (DBMS Capstone)

A modern, responsive, full-stack **IT Helpdesk & Incident Management System** tailored directly to your Node.js/Express backend, MySQL relational database, and MongoDB chat/activity datastore.

---

## 🚀 Key Features by User Role

### 1. 👑 Administrator (`role_id: 5`) & IT Manager (`role_id: 4`)
- **Central Admin Dashboard**: Live incident metrics, open/resolved counters, overdue SLA watchlist.
- **Incident Queue & Assignment**: View all organization tickets, assign technicians via `PATCH /api/incidents/:id/assign`.
- **SLA & Overdue Monitoring**: Track resolution deadlines and identify breached incidents (`GET /api/sla/overdue`).
- **Technician Management**: Monitor technician workloads, availability status, and support teams (`GET /api/technicians`).
- **IT Asset Inventory**: Track laptops, servers, switches, and peripherals (`/api/assets`).
- **Service Catalog**: Manage corporate IT services and operational health (`/api/services`).
- **Problem Management**: Log recurring incidents and root causes (`/api/problems`).
- **Incident Escalations**: Oversee Tier 1–3 escalated incidents (`/api/escalations`).

### 2. 🛠️ Technician (`role_id: 3`)
- **Technician Workbench**: Scoped queue displaying only incidents assigned to the logged-in technician.
- **Incident Resolution**: Record diagnostic resolution notes and mark tickets resolved (`POST /api/incidents/:id/resolve`).
- **Status Updates**: Transition incidents from Assigned to In Progress.
- **Activity & Discussion**: Real-time communication with users stored in MongoDB.
- **Audit History**: Inspect state transitions and previous notes logged in MySQL.

### 3. 👤 Employee / User (`role_id: 1`)
- **Employee Portal**: Dedicated dashboard tracking submitted tickets.
- **Create Support Ticket**: Submit issues with Subject, Category, Priority, and detailed description.
- **Real-Time Communication**: Reply to technician queries in the MongoDB activity discussion thread.
- **Service Feedback**: Submit 1–5 star rating and feedback upon incident resolution (`POST /api/feedback`).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router v6
- **Backend**: Node.js, Express.js (REST APIs, JWT authentication, RBAC middleware)
- **Relational Database**: MySQL (`helpdesk_db`) with fallback relational engine
- **Document / NoSQL Database**: MongoDB (`helpdesk_nosql`, `incident_activities` collection)

---

## 🔑 Demo Login Credentials

For quick evaluation, one-click demo login buttons are built right into the Login page:

| Role | Email | Password | Role ID | Dashboard |
| :--- | :--- | :--- | :---: | :--- |
| **Administrator** | `admin@helpdesk.com` | `password123` | `5` | `/admin` |
| **Technician** | `tech@helpdesk.com` | `password123` | `3` | `/technician` |
| **Employee** | `employee@company.com` | `password123` | `1` | `/employee` |
| **IT Manager** | `manager@helpdesk.com` | `password123` | `4` | `/admin` |
| **Helpdesk Agent** | `agent@helpdesk.com` | `password123` | `2` | `/employee` |

*(New employees can also register directly via the **Register** page)*

---

## 📦 Installation & Running

### 1. Start Backend API Server
```bash
# From the project root
npm run start:backend
```
The backend API starts on **http://localhost:5000**.

### 2. Start Frontend Website
```bash
# In a separate terminal
npm run start:frontend
```
Open **http://localhost:3000** in your web browser.

---

## 🗄️ Database Setup (MySQL & MongoDB)

1. **MySQL**:
   - The SQL schema DDL is located at: `backend/database/schema.sql`
   - The initial seed data is located at: `backend/database/seed.sql`
   - Configure your MySQL credentials in `backend/.env`:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=helpdesk_db
     PORT=5000
     JWT_SECRET=your_jwt_secret
     MONGO_URI=mongodb://127.0.0.1:27017/helpdesk_nosql
     ```
   - If MySQL daemon is offline, the backend engages an automatic relational fallback so the application runs with real schema data without crashing!

2. **MongoDB**:
   - Ticket conversations and activities are saved into MongoDB via Mongoose model `IncidentActivity` (`incident_activities` collection).
