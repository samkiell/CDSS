# CDSS API & Data Flow Documentation

## 1. Overview
The CDSS (Clinical Decision Support System) uses a hybrid architecture combining **Next.js Route Handlers (REST APIs)** for client-side interactions and **Server Actions/Direct Queries** for data-intensive dashboard views.

- **Primary Logic**: Rule-based MSK heuristic engine.
- **AI Layer**: Mistral AI for preliminary qualitative analysis.
- **Persistence**: MongoDB with Mongoose ODM.

### Target Audience & Team Ownership
- **👑 Samkiell (Lead)**: Core architecture, all dashboard shells, admin UI, AI core logic.
- **🔥 Philip (Heavy Full-Stack)**: Core business flows (Assessment → Diagnosis → Review), Clinician Case View.
- **🎨 Abraham (Frontend)**: Patient-side UI implementation, Settings, Help Center.
- **🔄 Tobi (Light Full-Stack)**: Clinician support pages (Patient list, Messages).
- **🧱 Robert (Backend)**: Profile APIs, Stats, Data Contracts.

---

## 2. Page & Route Mapping
This section defines the ownership and logic for every route in the system.

### 2.1 Patient Routes (Dashboard & UI)
| Route | Owner | Purpose | API / Logic |
| :--- | :--- | :--- | :--- |
| `/patient/dashboard` | Samkiell | Overview & Stats | `db.DiagnosisSession`, `db.Appointment` |
| `/patient/assessment/**` | Philip | Assessment Wizard | `/api/assessment/submit` |
| `/patient/progress` | Abraham | Recovery Charts | Heuristic Engine Output UI |
| `/patient/messages` | Philip | Communication | (Planned) WebSockets or Polling |
| `/patient/settings` | Abraham | User Profile | `/api/patients/profile` |

### 2.2 Clinician Routes (Core & Support)
| Route | Owner | Purpose | API / Logic |
| :--- | :--- | :--- | :--- |
| `/clinician/dashboard` | Samkiell | Patient Queue | `getAssignedCases` Service |
| `/clinician/cases/[id]` | Philip | Case Review | `GET /api/diagnosis/[id]` |
| `/clinician/patients` | Tobi | CRM / Patient List | `/api/users?role=PATIENT` |
| `/clinician/guided-diagnostic`| Philip | Assisted Physical Exam | Heuristic Engine Logic |
| `/clinician/treatment-planner`| Philip | Recovery Planning | `db.TreatmentPlan` CRUD |

### 2.3 Admin Routes
| Route | Owner | Purpose | API / Logic |
| :--- | :--- | :--- | :--- |
| `/admin/**` | Samkiell | System Mgt | `src/app/actions/admin.js` |

---

## 3. Core API Specifications

### 3.1 Onboarding & Clinical Flow (Philip / Samkiell)
#### `POST /api/otp/send`
- **Owner**: Samkiell
- **Request**: `{ email, firstName?, lastName?, password? }`
- **Logic**: Generates OTP, hashes password (via Robert's helper), and sends email.

#### `POST /api/assessment/submit`
- **Owner**: Samkiel
- **Logic**: Mistral AI Integration → `DiagnosisSession` creation → `CaseFile` indexing.
- **Payload**: `{ bodyRegion, symptomData: [], mediaUrls: [] }`

#### `POST /api/upload`
- **Owner**: Samkiel
- **Purpose**: Server-side proxy for Cloudinary medical image uploads.

---

## 4. Backend Implementation (Robert's Scope)

This section details the specific requirements for the APIs owned by **Robert (@bobanih00)**.

### 4.1 Patient Profile
- **Endpoint**: `/api/patients/profile`
- **Method**: `GET`
  - **Purpose**: Fetch the logged-in patient's profile data.
  - **Response**: `{ success: true, data: { firstName, lastName, email, phone, gender, dateOfBirth, avatar } }`
- **Method**: `PATCH`
  - **Purpose**: Update patient demographics.
  - **Body**: `{ phone?, gender?, dateOfBirth?, avatar? }`

### 4.2 User Management
- **Endpoint**: `/api/users`
- **Method**: `GET`
  - **Query**: `role=PATIENT`
  - **Purpose**: Retrieve a list of all patients for the clinician's CRM/Queue views.
  - **Response**: `{ success: true, count: number, users: [...] }`

### 4.3 Clinician Analytics
- **Endpoint**: `/api/clinician/stats`
- **Method**: `GET`
  - **Purpose**: Aggregated stats for the clinician dashboard.
  - **Logic**: Count `DiagnosisSession` by status (`pending_review`, `assigned`, `completed`) for the logged-in clinician.
  - **Response**: `{ success: true, data: { pending: 5, active: 12, completed: 45 } }`

### 4.4 Advanced Diagnosis Support
- **Endpoint**: `/api/diagnosis/[id]`
- **Method**: `PATCH`
  - **Purpose**: Allow clinicians to provide a final, verified diagnosis and notes.
  - **Body**: `{ clinicianReview: { confirmedDiagnosis: string, notes: string }, status: 'completed' }`

### 4.5 Security & Registration
- **Module**: `/api/auth/register` (and `/api/otp/send`)
- **Deliverable**: 
  - Implementation of **Bcrypt** hashing for all new user passwords.
  - Ensure passwords are never stored in plain text during the OTP registration flight.
  - Validate that hashing occurs *before* persistence in the `User` model.

---

## 5. Operational Governance (Hard Boundaries)

### 5.1 Dashboard Shell Authority
To maintain UI consistency and role enforcement, the **Dashboard Shells** (Sidebar, TopNav, Layout logic) are restricted.
- **Protected Controllers**: `Samkiell` & `Philip` only.
- **Rule**: No direct modifications to layout files by other team members without PR approval.

### 5.2 PR & Integration Workflow
1. **Feature Isolation**: One branch per developer per feature.
2. **Review Tier**: All core logic changes (Heuristic/AI) must be reviewed by Samkiell.
3. **Parity**: Ensure patient and clinician experiences share component libraries where medically applicable.

---

## 6. Data Models & Contracts
### 6.1 DiagnosisSession
The source of truth for MSK assessments. Stores `symptomData` (Heuristic input) and `aiAnalysis` (LLM output).

### 6.2 CaseFile
The administrative link between a patient's session and a clinician assignment.

### 6.3 TreatmentPlan
Iterative recovery schedules, including sets/reps and daily goals.
---

## 7. Appendix

### 7.1 Project Milestones
- **Current Cycle Deadline**: Thursday, January 30th, 2026.
- **Review Frequency**: Physical meetings held weekly for integration sync.

### 7.2 Glossary
- **Temporal Diagnosis**: An immediate, rule-based clinical assessment generated by the Heuristic Engine.
- **Provisional AI Analysis**: Qualitative reasoning provided by the LLM agent (requires clinician validation).
- **Hard Shell**: Components (Sidebar/Nav) protected by lead developers to ensure role-based enforcement.
- **VAS Scale**: Visual Analogue Scale used for subjective pain measurement in assessments.
