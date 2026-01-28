# CDSS Platform - Clinical Decision Support System

A modular diagnostic application for musculoskeletal diagnosis built for academic institutions.

## 🏗️ Project Structure

This project uses Next.js 16+ App Router with route groups to separate patient and clinician interfaces:

```
src/
├── app/
│   ├── assessment/          # Symptom questionnaire
│   ├── dashboard/           # Patient dashboard
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   │
│   ├── clinician/           # Clinician-facing routes
│   │   ├── layout.js        # Clinician portal layout
│   │   ├── dashboard/       # Clinician dashboard
│   │   └── patients/        # Patient list & management
│   │
│   ├── api/                 # Backend API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── otp/             # OTP send & verify endpoints
│   │   ├── diagnosis/       # Diagnosis session CRUD
│   │   ├── upload/          # File upload (Cloudinary)
│   │   └── health/          # Health check
│   │
│   ├── layout.js            # Root layout
│   ├── page.js              # Landing page
│   └── globals.css          # Global styles
│
├── lib/
│   ├── db/                  # Database utilities
│   │   └── connect.js       # Mongoose connection singleton
│   │
│   ├── decision-engine/     # Diagnostic logic (framework-agnostic)
│   │   ├── heuristic.js     # Rule-based diagnosis engine
│   │   └── index.js         # Module exports
│   │
│   ├── ml-bridge/           # Future ML integration placeholder
│   │   └── index.js         # Bayesian network bridge
│   │
│   ├── cloudinary.js        # Cloudinary SDK configuration
│   └── utils.js             # Shared utility functions
│
├── models/                  # Mongoose schemas
│   ├── User.js              # User model (PATIENT, CLINICIAN, ADMIN)
│   ├── PatientProfile.js    # Extended patient information
│   ├── DiagnosisSession.js  # Diagnosis session with symptoms
│   └── index.js             # Model exports
│
├── store/                   # Zustand state management
│   ├── authStore.js         # Authentication state
│   ├── diagnosisStore.js    # Diagnosis session state
│   └── index.js             # Store exports
│
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   └── providers/           # Context providers
│
└── middleware.js            # Route protection middleware
```

### Route Structure

- **`/dashboard`**: Patient dashboard - main hub for authenticated patients
- **`/assessment`**: Symptom questionnaire for diagnostic intake
- **`/clinician/*`**: All clinician routes under `/clinician` prefix
  - `/clinician/dashboard` - Clinician overview and stats
  - `/clinician/patients` - Patient management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/New-PiedPiperr/CDSS.git
   cd CDSS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret for JWT signing (generate with `openssl rand -base64 32`)
   - `CLOUDINARY_*` - Cloudinary credentials
   - `NEXT_PUBLIC_API_URL` - API base URL

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run lint:fix  # Fix ESLint issues
npm run format    # Format code with Prettier
```

## 👥 Team Workflow

### Branching Strategy

```
main                    # Production-ready code
  └── dev               # Integration branch
       ├── feat/patient-ui        # Patient interface features
       ├── feat/clinician-ui      # Clinician dashboard features
       ├── feat/backend-api       # API development
       ├── feat/diagnostic-logic  # Decision engine work
       └── fix/[issue-id]         # Bug fixes
```

### Branch Naming Convention

- `feat/[feature-name]` - New features
- `fix/[issue-id]` - Bug fixes
- `refactor/[area]` - Code refactoring
- `docs/[area]` - Documentation updates

### Contribution Rules

1. **Never push directly to `main` or `dev`**
2. **Create feature branches from `dev`**
3. **Pull Requests require 1 approval before merge**
4. **Run `npm run lint` before committing**
5. **Write descriptive commit messages**

### PR Workflow

```bash
# 1. Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feat/your-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add symptom questionnaire component"

# 3. Push and create PR
git push origin feat/your-feature
# Create PR on GitHub: feat/your-feature → dev

# 4. After approval, squash and merge to dev
# 5. Periodically merge dev → main for releases
```

### Commit Message Format

```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting (no code change)
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance
```

## 🔧 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16+ (App Router) |
| Language | JavaScript (ES2022+) |
| Database | MongoDB + Mongoose |
| State | Zustand |
| Styling | Tailwind CSS |
| Storage | Cloudinary |
| Auth | JWT (scaffolded) |

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/lib/db/connect.js` | MongoDB connection with hot-reload handling |
| `src/models/EmailOtp.js` | Secure 4-digit OTP storage with TTL expiry |
| `src/services/otpService.js` | OTP generation, hashing (SHA-256), and email logic |
| `src/lib/decision-engine/heuristic.js` | Rule-based diagnostic algorithm |
| `src/store/authStore.js` | Authentication state management |
| `src/models/DiagnosisSession.js` | Core data model for diagnoses |

## 🔐 Authentication & Verification

The platform implements a **Secure Deferred Registration Flow**:

1. **Information Collection**: User registration details (Name, Email, Password) are collected.
2. **Account Deferral**: No record is created in the `users` collection initially. Instead, data is stored in the `email_otps` collection with a 5-minute expiry.
3. **OTP Delivery**: A 4-digit numeric code is generated server-side and sent via Nodemailer.
4. **Verification**: 
   - Uses constant-time hashing (SHA-256) for comparison.
   - Upon correct entry, the `users` record is officially created with the stored registration data.
   - Prevents database pollution from unverified or duplicate emails.

## 🩺 Decision Engine

The diagnostic engine (`src/lib/decision-engine/heuristic.js`) implements a **weighted matching paradigm**:

1. Patient symptoms are collected as response vectors
2. Responses are compared against condition-specific patterns
3. Weighted similarity scores determine diagnosis confidence
4. Primary and differential diagnoses are ranked

**This module is framework-agnostic** - no React hooks, pure JavaScript functions.

## 🔮 Future ML Integration

The `src/lib/ml-bridge/` module is a placeholder for:
- Bayesian network integration (Python pgmpy)
- Neural network models for pattern recognition
- Ensemble methods combining heuristic + ML approaches

## 📝 License

MIT License - See LICENSE file

---

**Team**: 5 developers | **Timeline**: 7 days | **Last Updated**: January 2026

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
