# CDSS API & Data Flow Documentation

## 1. Overview
The CDSS (Clinical Decision Support System) uses a hybrid architecture combining **Next.js Route Handlers (REST APIs)** for client-side interactions and **Server Actions/Direct Queries** for data-intensive dashboard views.

- **Primary Logic**: Rule-based MSK heuristic engine.
- **AI Layer**: Mistral AI for preliminary qualitative analysis.
- **Persistence**: MongoDB with Mongoose ODM.

### Target Audience
- **Frontend Engineers**: Integrating assessment forms, patient dashboards, and clinician review interfaces.
- **Backend Engineers**: Maintaining API routes, ML bridge services, and database schemas.
- **samkiell**: Enhancing the heuristic engine and integrating Python-based ML models.

---

## 2. Page-to-API Mapping

### Onboarding & Public Pages
| Page | Endpoint / Action | Method | Description |
| :--- | :--- | :--- | :--- |
| **Login** (`/login`) | NextAuth.js | `POST` | Sets session cookie via `CredentialsProvider`. |
| **Register** (`/register`) | `/api/otp/send` | `POST` | Validates data and sends verification code. |
| **Verify** (`/verify`) | `/api/otp/verify` | `POST` | Verifies OTP and creates/activates user account. |

### Patient Experience
| Page | Endpoint / Action | Method | Description |
| :--- | :--- | :--- | :--- |
| **Assessment** (`/patient/assessment`) | `/api/diagnosis/ai-analysis` | `POST` | Generates a preview analysis for the summary screen. |
| **Assessment** (`/patient/assessment`) | `/api/assessment/submit` | `POST` | Final submission which creates `DiagnosisSession` and `CaseFile`. |
| **Dashboard** (`/patient/dashboard`) | `db.DiagnosisSession.find` | `QUERY` | Fetches sessions, appointments, and treatment plans directly. |
| **Media Uploads** | `/api/upload` | `POST` | Proxies files to Cloudinary for storage. |

### Clinician Workflow
| Page | Endpoint / Action | Method | Description |
| :--- | :--- | :--- | :--- |
| **Dashboard** (`/clinician/dashboard`) | `GET /api/diagnosis` | `GET` | (Proposed/Service-Level) Fetches assigned cases. |
| **Case Detail** (`/clinician/.../case/[id]`) | `GET /api/diagnosis/[id]` | `GET` | Retrieves full session data including AI analysis and responses. |
| **Case Detail** (`/clinician/.../case/[id]`) | `PATCH /api/diagnosis/[id]` | `PATCH` | Used by clinician to finalize the case with a review. |

---

## 3. Detailed Endpoint Specification

### Authentication & Profile
#### `POST /api/otp/send`
- **Request**: `{ "email": string, "firstName"?: string, "lastName"?: string, "password"?: string }`
- **Logic**: If registration data is provided, it's hashed and stored temporarily in the `EmailOtp` record until verification.

#### `POST /api/otp/verify`
- **Request**: `{ "email": string, "otp": string }`
- **Effect**: If valid, marks user as `isVerified: true`. If registration data was pending, creates the `User` record.

### Clinical Assessments
#### `POST /api/assessment/submit`
- **Headers**: Requires Auth Session.
- **Body**: 
  ```json
  {
    "bodyRegion": "Lumbar Spine",
    "symptomData": [{ "question": "string", "answer": "mixed" }],
    "mediaUrls": ["url"]
  }
  ```
- **Internal Logic**: 
  1. Calls Mistral AI for preliminary reasoning.
  2. Persists `DiagnosisSession`.
  3. Creates a `CaseFile` object for Admin visibility.

#### `POST /api/diagnosis/ai-analysis`
- **Description**: Lightweight endpoint for "real-time" AI feedback before the patient finally submits.
- **Response**: `{ "success": true, "analysis": { "temporalDiagnosis": "...", "confidenceScore": number, ... } }`

### System & Health
#### `GET /api/health`
- **Description**: Simple health check to verify the API and database connectivity status.
- **Response**: `{ "status": "healthy", "timestamp": "...", "version": "1.0.0" }`

---

## 4. Server Actions (Internal APIs)
Used in Admin and Dashboard pages to avoid full API roundtrips where Server Components are used.

### Admin Actions (`src/app/actions/admin.js`)
- `assignPatientToClinician(sessionId, clinicianId)`: 
  - Updates the session status to `assigned`.
  - Revalidates the dashboard cache.
- `getNewCases()`: 
  - Fetches `CaseFile` entries filtered by `pending_review`.
  - Sorts by AI Risk Level priority (Urgent > Moderate > Low).

---

## 5. Data Models
### User
Stores identity and roles (`PATIENT`, `CLINICIAN`, `ADMIN`).
- `isVerified`: Must be true for login.
- `role`: Controls access to `/clinician/*` or `/admin/*` routes.

### DiagnosisSession
The core clinical record.
- `symptomData`: Captured using the MSK Heuristic Engine format.
- `aiAnalysis`: Structured result from LLM (Reasoning, Risk, Confidence).
- `status`: `pending_review` -> `assigned` -> `completed`.

### CaseFile
A lightweight reference used for tracking assignments and visibility in the Admin Dashboard.

---

## 6. Environment & Prerequisites
- **`MONGODB_URI`**: Required for all database persistence.
- **`AUTH_SECRET`**: Required for session encryption.
- **`MISTRAL_API_KEY`**: Required for `ai-analysis` and `assessment/submit`.
- **`CLOUDINARY_URL`**: Required for handling image/document uploads.

---

## 7. Future Capability Stubs
Refer to `src/lib/ml-bridge/index.js` for integration hooks:
- **`POST /api/ml/diagnosis`**: Intended for Bayesian/Heuristic-ML ensemble analysis.
- **`GET /api/ml/explain`**: Intended for medical transparency (SHAP values).
