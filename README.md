# MediLink

**A Patient-Owned Smart Health Card Integrating Longitudinal Health Records
with Real-Time Medication Safety Intelligence**

*"Your Health. Connected. Your Medication. Safer."*

Full-stack build: React (Vite) front end + Supabase for real authentication
and a real database. Every page is backed by live data -- sign up and you get
a working account seeded with the brief's demo patient (Anjali Patil, 68),
which you can then edit, extend, or clear out.

> This is an academic innovation prototype. It does not diagnose disease,
> prescribe medication, or replace professional clinical judgment -- the
> medication safety engine is simple rule-based demo logic, not a validated
> clinical decision support system.

## Pages

- **Home** -- hero, patient quick overview, the 6-module health ecosystem,
  timeline preview, medication safety preview, "how it works" flow, impact section
- **Patient Profile** -- personal + emergency info, conditions, allergies,
  medications table, lab summary, Smart Health Card
- **Pharmacy Visit** -- the core feature: enter/select a medication and get a
  full patient-specific safety report (allergy check, interaction check,
  disease contraindication, duplication, renal/hepatic review, ADR history)
- **Clinic Visit** -- consultation records, add new visits
- **Hospital Visit** -- admissions with discharge summaries
- **Child Vaccination** -- dependents + immunization timeline
- **Medical Insurance** -- policy details + claims history
- **Health Timeline** -- full longitudinal record with category filters
- **Medication Safety** -- standalone version of the safety engine
- **About MediLink** -- problem / solution / core innovation
- **Login / Sign up** -- real Supabase auth

## 1. Set up Supabase (your database + login system)

1. Go to https://supabase.com, sign in, and click **New project**.
2. Open **Project Settings -> API** and copy the **Project URL** and the
   **anon public** key -- you'll need both in step 3.
3. Open the **SQL Editor** -> **New query**, paste the entire contents of
   `supabase/schema.sql`, and click **Run**. This creates all 12 tables
   (profiles, conditions, allergies, medications, lab_results, clinic_visits,
   hospital_visits, dependents, vaccinations, insurance_policies,
   insurance_claims, timeline_events) with row-level security so each patient
   only ever sees their own data.
4. (Optional, recommended for testing) Under **Authentication -> Providers ->
   Email**, turn off "Confirm email" so new sign-ups can log in immediately.

## 2. Run it locally

```bash
npm install
cp .env.example .env
# open .env and paste in your Project URL + anon key from step 1
npm run dev
```

Visit http://localhost:5173, click **Sign in -> Create one**. Your new
account is automatically populated with the brief's demo dataset (via
`src/lib/seedDemoData.js`) so every page is immediately browsable.

## 3. Push the code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: MediLink app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(Create the empty repo first at https://github.com/new -- don't add a README
there, since this project already has one.)

## 4. Deploy it live

### Option A -- Vercel (recommended, simplest)
1. https://vercel.com -> sign in with GitHub -> **Add New -> Project** -> pick this repo.
2. Framework preset: **Vite** (auto-detected).
3. Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Click **Deploy**. Every push to `main` redeploys automatically.

### Option B -- GitHub Pages (workflow included)
1. Repo **Settings -> Pages -> Build and deployment -> Source** -> **GitHub Actions**.
2. **Settings -> Secrets and variables -> Actions** -> add `VITE_SUPABASE_URL`
   and `VITE_SUPABASE_ANON_KEY`.
3. Push to `main`. Live at `https://<your-username>.github.io/<your-repo>/`.

## Project structure

```
src/
  components/    Navbar, ProtectedRoute, SmartHealthCard
  context/       AuthContext (session, sign in/up/out, triggers demo seed)
  lib/           supabaseClient, usePatientData (shared data hook),
                 medicationSafety (rule engine), seedDemoData
  pages/         Home, About, Login, SignUp, PatientProfile, PharmacyVisit,
                 ClinicVisit, HospitalVisit, ChildVaccination,
                 MedicalInsurance, HealthTimeline, MedicationSafety
supabase/
  schema.sql     All 12 tables + row-level security policies
```

## How the medication safety engine works

`src/lib/medicationSafety.js` runs entirely in the browser against the
signed-in patient's own allergies, conditions, lab results, and current
medications. It runs 7 checks (allergy, drug-drug interaction, drug-disease
contraindication, therapeutic duplication, renal function, hepatic function,
prior ADR history) and returns an overall risk level. Try entering
**Amoxicillin** (flags the demo patient's penicillin allergy), **Ibuprofen**
(flags CKD/renal caution), or **Metformin** (flags renal dosing review based
on eGFR) to see it in action.

## Notes

- This is a working demo/prototype, not a certified medical-records or
  clinical-decision-support product. Don't use it with real patient data
  without a proper security/compliance review.
- All data access goes through Supabase row-level security, so each signed-in
  user only ever reads/writes their own rows.
