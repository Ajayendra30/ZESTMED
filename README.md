# ZESTMED – Premium Healthcare Platform

**Your Health, Our Priority.**

A modern, responsive healthcare platform designed to simplify medicine ordering, diagnostic test booking, prescription management, and doorstep healthcare services.

---

## 🌟 Project Overview

**ZESTMED** is a healthcare web platform that brings pharmacy services, diagnostic testing, and patient healthcare management together in one place.

The platform provides an intuitive user experience with a clean medical design, responsive layouts, interactive components, and dedicated dashboards for patients, lab executives, and administrators.

### Key Highlights

- Online medicine browsing and ordering
- Diagnostic test discovery and booking
- Prescription upload workflow
- Home sample collection scheduling
- Patient health dashboard
- Lab executive operations dashboard
- Centralized administrative dashboard
- Responsive design for desktop, tablet, and mobile devices

### Design Identity

| Element | Specification |
|---|---|
| Primary Blue | `#1677C8` |
| Secondary Teal | `#14B8A6` |
| Background | `#F8FAFC` |
| Typography | Inter & Plus Jakarta Sans |
| Icon Library | Lucide React |
| Design Style | Modern, clean, premium healthcare UI |

---

## 🚀 Development Roadmap

| Phase | Module | Status |
|---|---|---|
| Phase 1 | Public Website & Interactive Homepage | ✅ Completed & Verified |
| Phase 2 | Medicine Store (`/medicines`) | ✅ Completed & Verified |
| Phase 3 | Diagnostic Tests & Booking (`/diagnostics`) | ✅ Completed & Verified |
| Phase 4 | Patient Dashboard (`/patient-dashboard`) | ✅ Completed & Verified |
| Phase 5 | Lab Executive Dashboard (`/lab-dashboard`) | ✅ Completed & Verified |
| Phase 6 | Admin Dashboard (`/admin-dashboard`) | ✅ Completed & Verified |
| Phase 7 | Complete Integration & End-to-End Verification | 🔄 In Progress |

---

## 🛠️ Technology Stack

### Frontend

- **Framework:** React.js 18.3.1
- **Build Tool:** Vite 6.0.1
- **Styling:** Tailwind CSS 3.4.16
- **Routing:** React Router DOM 6.28.0
- **Icons:** Lucide React
- **State Management:** React Context API
- **Persistence:** Browser LocalStorage (demo session persistence)

### React Context Providers

- `CartContext` – Shopping cart management
- `AuthContext` – Demo authentication and user session
- `LocationContext` – Location and PIN code management
- `ToastContext` – Application notifications and feedback

### Current Architecture

**Frontend-only implementation.**

The current version uses local demo data and browser LocalStorage for interactive functionality.

- No backend API integration
- No production database connection
- No live payment gateway
- No real SMS or OTP authentication
- No live laboratory or pharmacy integrations

Backend and production integrations are planned for the next development stage.

---

# 📱 Platform Features

## 1. Public Website & Homepage

The ZESTMED homepage provides a complete introduction to the healthcare platform.

### Sticky Header & Navigation

- ZESTMED branding with medical cross logo
- Navigation links: Home, Medicines, Lab Tests, Health Packages, About Us, and Contact
- Location selector with city and PIN code
- Quick prescription upload
- Shopping cart with dynamic quantity counter
- Demo authentication and patient profile dropdown
- Responsive mobile navigation drawer

### Hero Section

- Main tagline: "Your Health, Our Priority."
- Call-to-action buttons:
  - Book a Lab Test
  - Order Medicines
  - Upload Prescription
- Healthcare-themed doctor illustration
- Floating feature cards highlighting home collection, pharmacy authenticity, and ratings
- Trust metrics showcasing patients, medicine quality, and pickup services

### Smart Search

- Real-time frontend search across medicines, diagnostic tests, and health packages
- Category-based search filters
- Instant search suggestions
- Empty search state with guidance
- Direct navigation to product and test details

### Medicine & Diagnostic Discovery

- Medicine category shortcuts
- Diagnostic test categories
- Health package recommendations
- Interactive product and test detail modals
- Responsive product and diagnostic cards

### Home Collection

- PIN code serviceability checker
- Appointment scheduling modal
- Date and time slot selection
- Patient address entry
- Demo appointment reservation workflow

### Additional Homepage Sections

- How ZESTMED Works
- Why Choose ZESTMED
- Customer Testimonials
- Frequently Asked Questions
- Newsletter Subscription
- Professional Footer

---

## 2. Medicine Store – `/medicines`

A dedicated medicine shopping interface with product discovery and filtering.

### Features

- 16 demo medicine products
- 10 medicine categories
- Product manufacturer and pricing information
- Discount and prescription-required badges
- Product stock status and ratings
- Salt composition and dosage form information
- Product detail modal
- Dynamic sidebar filters:
  - Price
  - Dosage Form
  - Prescription Requirement
  - Categories
- Prescription upload shortcut
- Medicine refill reminder

---

## 3. Diagnostic Tests & Booking – `/diagnostics`

A dedicated diagnostic discovery and booking module.

### Features

- 16 individual diagnostic test listings
- 6 preventive health packages
- Diagnostic categories:
  - Full Body Checkup
  - Blood Tests
  - Diabetes
  - Thyroid
  - Liver
  - Kidney
  - Lipid Profile
  - Vitamins
  - Heart Health
- Test preparation instructions
- Fasting requirements
- Sample type information
- Turnaround Time (TAT)
- Detailed test and package inspection modals
- Multi-step booking workflow
- PIN code validation
- Date and time slot selection

---

## 4. Patient Dashboard – `/patient-dashboard`

A centralized patient portal for managing healthcare activities.

### Health Overview

- Blood Pressure
- Fasting Blood Sugar
- Total Cholesterol
- Body Mass Index (BMI)
- HbA1c
- SpO2

### Medicine Orders

- Order tracking interface
- Delivery status stepper
- Itemized order details
- GST invoice modal
- Medicine reorder functionality

### Diagnostic Reports

- Diagnostic report viewer
- NABL-style report presentation
- Test parameters and reference ranges
- Abnormal result indicators
- Demo PDF download

### Prescription Vault

- Saved prescription records
- Doctor details
- Prescription validity indicators
- One-click medicine reorder

### Family Health Profiles

- Self
- Spouse
- Parents
- Allergy information
- Chronic condition tracking

### Additional Features

- Saved addresses
- Assam PIN code validation (`78xxxx`)
- Notification preferences
- Demo data reset functionality

---

## 5. Lab Executive Dashboard – `/lab-dashboard`

A dedicated interface for managing laboratory and doorstep sample collection operations.

### Executive Station

- Active shift toggle
- Regional coverage monitoring
- On-time performance indicators
- Regional hubs:
  - Guwahati Central Hub
  - Jorhat
  - Dibrugarh
  - Silchar

### Phlebotomy Dispatch Queue

- Doorstep collection job listings
- District-based filters
- Job search
- Collection status management

### Specimen Intake & Barcoding

- Sample collection modal (`SampleCollectionModal.jsx`)
- Fasting verification
- Vacutainer checklist
- Automated demo barcode generation
- Barcode format: `AS-BC-781001-xxxx`
- Cooler box assignment

### Cold-Chain Logistics

- Simulated temperature readings (`3.9°C–4.8°C`)
- Battery health indicators
- Sample transit monitoring
- Route tracking interface

### Laboratory Analyzer Worklist

- Sample worklist
- Clinical findings entry
- Report preparation workflow
- Pathologist authorization interface (`PublishReportModal.jsx`)

### Phlebotomist Fleet Management

- Regional phlebotomist roster
- Contact dialer interface
- Vaccination audit information
- Collection kit inspection status

### Barcode Specimen Lookup

- Barcode search interface
- Patient specimen lookup
- Specimen lifecycle tracking

---

## 6. Admin Dashboard – `/admin-dashboard`

A centralized administrative control panel for managing platform operations.

### Super Admin Dashboard

- Platform revenue overview
- Medicine units dispensed
- Diagnostic assays conducted
- Registered patient statistics
- Administrative overview

### Demo Dashboard Metrics

| Metric | Demo Value |
|---|---:|
| Monthly Revenue | ₹4.82L |
| Medicine Units Dispensed | 2,410 |
| Diagnostic Assays | 1,840 |
| Registered Patients | 8,920 |

### Regional Performance Monitoring

Regional throughput monitoring for:

- Kamrup Metro (Guwahati)
- Dibrugarh
- Jorhat
- Silchar
- Nagaon / Tezpur

### Pharmacy Inventory Management

- Medicine inventory
- Batch number tracking
- Expiry date monitoring
- Warehouse rack locations
- Low-stock alerts
- Add medicine modal (`AddMedicineModal.jsx`)

### Prescription Verification

- Prescription verification queue
- Doctor registration information
- Medicine matching
- Prescription audit modal (`AuditPrescriptionModal.jsx`)

### Diagnostic Catalog Management

- Laboratory test listings
- Test turnaround times
- Specimen tube information
- Add diagnostic test modal (`AddDiagnosticTestModal.jsx`)

### Regional Hub Management

- Regional service status
- PIN code coverage management
- Coverage range: `781001–788999`
- Doorstep service response indicators

### Platform Governance

- Administrative activity logs
- Audit trail interface
- Demo data reset controls

---

## 🎨 UI/UX Design Principles

ZESTMED follows a modern healthcare design system focused on usability, accessibility, and trust.

- Clean and consistent layouts
- Responsive design across screen sizes
- Rounded cards and subtle shadows
- Consistent typography and spacing
- Clear call-to-action buttons
- Intuitive navigation
- Interactive modals and dropdowns
- Meaningful loading, empty, and feedback states
- No intentionally dead or non-functional UI controls

---

## 📂 Project Setup & Installation

### Prerequisites

Make sure the following tools are installed:

- Node.js
- npm
- Git
- Visual Studio Code (recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/Ajayendra30/ZESTMED.git
```

### 2. Navigate to the Project Directory

```bash
cd ZESTMED
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

### 5. Create a Production Build

```bash
npm run build
```

### 6. Preview the Production Build

```bash
npm run preview
```

---

## 🧪 Testing & Verification

The current development milestone focuses on completing integration and end-to-end verification.

The following areas should be verified:

- All application routes load correctly
- Navigation links work as expected
- Medicine search and filters function correctly
- Cart operations update the quantity and totals
- Diagnostic test discovery and booking workflows work
- Prescription upload interactions work
- Patient dashboard components render correctly
- Lab executive operations work as expected
- Admin dashboard controls work as expected
- Responsive layouts work across devices
- No broken images or missing assets
- No critical console errors
- Production build completes successfully

---

## 🔮 Future Development

The current project is frontend-only. Planned backend development can introduce:

- Python FastAPI backend
- PostgreSQL database
- Supabase integration
- Secure mobile OTP authentication
- Role-based access control (Patient, Lab Executive, Admin)
- Real medicine inventory management
- Diagnostic booking and order management APIs
- Secure prescription and report storage
- Payment gateway integration
- SMS and email notifications
- Live order and sample tracking
- Flutter mobile application integration

---

## ⚠️ Important Project Disclaimer

ZESTMED is currently a frontend demonstration project.

All displayed patient information, medicine listings, prices, orders, laboratory readings, revenue figures, testimonials, and operational metrics are demo data unless explicitly connected to verified production systems.

The application is not currently connected to a live pharmacy, diagnostic laboratory, payment provider, or healthcare database. It should not be used as a substitute for professional medical advice or as a live healthcare service.

---

## 📌 Current Project Status

**Phase 1–6:** Completed & Verified  
**Phase 7:** Integration & End-to-End Verification in Progress

The next milestone is to complete integration testing and prepare the platform for backend development and production deployment.

---

## 👨‍💻 Project

**ZESTMED – Premium Healthcare Platform**

**Tagline:** Your Health, Our Priority.

**Repository:** [GitHub – ZESTMED](https://github.com/Ajayendra30/ZESTMED)

