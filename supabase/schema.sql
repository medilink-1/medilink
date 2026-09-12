-- =========================================================
-- MediLink schema
-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- Safe to re-run: uses "if not exists" everywhere.
-- =========================================================

-- 1. Profiles: one row per authenticated patient, linked to auth.users
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  role text default 'Patient',
  age int,
  gender text,
  blood_group text,
  health_id text,
  emergency_name text,
  emergency_relation text,
  emergency_phone text,
  seeded boolean default false,
  created_at timestamptz default now()
);

-- 2. Medical conditions
create table if not exists conditions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- 3. Drug allergies
create table if not exists allergies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  name text not null,
  severity text default 'high',
  created_at timestamptz default now()
);

-- 4. Current / past medications
create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  name text not null,
  dose text,
  frequency text,
  duration text,
  status text default 'active',
  created_at timestamptz default now()
);

-- 5. Laboratory results
create table if not exists lab_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  test_name text not null,
  value text,
  unit text,
  recorded_at date default current_date,
  created_at timestamptz default now()
);

-- 6. Clinic visits
create table if not exists clinic_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  visit_date date not null default current_date,
  doctor text,
  specialty text,
  complaint text,
  diagnosis text,
  prescription text,
  follow_up text,
  created_at timestamptz default now()
);

-- 7. Hospital visits
create table if not exists hospital_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  hospital_name text not null,
  admission_date date,
  discharge_date date,
  reason text,
  diagnosis text,
  treatment_summary text,
  created_at timestamptz default now()
);

-- 8. Dependents (children/family members tracked for vaccination)
create table if not exists dependents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  name text not null,
  age int,
  relationship text,
  created_at timestamptz default now()
);

-- 9. Vaccinations (per dependent)
create table if not exists vaccinations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  dependent_id uuid references dependents (id) on delete cascade not null,
  vaccine_name text not null,
  status text default 'completed', -- 'completed' | 'due_soon' | 'scheduled'
  event_date date,
  created_at timestamptz default now()
);

-- 10. Insurance policies
create table if not exists insurance_policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  provider text not null,
  policy_number text,
  policy_type text,
  coverage_amount numeric,
  status text default 'active',
  created_at timestamptz default now()
);

-- 11. Insurance claims (per policy)
create table if not exists insurance_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  policy_id uuid references insurance_policies (id) on delete cascade not null,
  claim_ref text,
  hospital_name text,
  status text default 'submitted',
  amount numeric,
  created_at timestamptz default now()
);

-- 12. Timeline events (longitudinal record, spans all categories)
create table if not exists timeline_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  event_year int not null,
  title text not null,
  category text not null, -- 'clinic' | 'hospital' | 'pharmacy' | 'laboratory'
  description text,
  created_at timestamptz default now()
);

-- =========================================================
-- Row Level Security: every patient can only see their own data
-- =========================================================
alter table profiles enable row level security;
alter table conditions enable row level security;
alter table allergies enable row level security;
alter table medications enable row level security;
alter table lab_results enable row level security;
alter table clinic_visits enable row level security;
alter table hospital_visits enable row level security;
alter table dependents enable row level security;
alter table vaccinations enable row level security;
alter table insurance_policies enable row level security;
alter table insurance_claims enable row level security;
alter table timeline_events enable row level security;

create policy "Profiles are self-viewable" on profiles for select using (auth.uid() = id);
create policy "Profiles are self-updatable" on profiles for update using (auth.uid() = id);
create policy "Profiles are self-insertable" on profiles for insert with check (auth.uid() = id);

create policy "Own conditions only" on conditions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own allergies only" on allergies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own medications only" on medications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own lab results only" on lab_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own clinic visits only" on clinic_visits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own hospital visits only" on hospital_visits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own dependents only" on dependents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own vaccinations only" on vaccinations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own insurance policies only" on insurance_policies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own insurance claims only" on insurance_claims for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own timeline events only" on timeline_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- 12. Documents (uploaded lab reports, prescriptions, discharge
--     papers, etc.) -- metadata table + Supabase Storage bucket.
--     Run this block once in the Supabase SQL editor to enable
--     file upload/download on the Patient Profile page.
-- =========================================================
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  file_name text not null,
  storage_path text not null,
  file_type text,
  size_bytes bigint,
  created_at timestamptz default now()
);

alter table documents enable row level security;

create policy "Own documents only" on documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Private storage bucket -- files are only reachable via short-lived
-- signed URLs generated for the owning user, never a public link.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Objects are stored at "<user_id>/<filename>", so folder segment 1
-- of the object path must match the requesting user's own id.
create policy "Users can upload their own documents"
on storage.objects for insert
with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view their own documents"
on storage.objects for select
using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own documents"
on storage.objects for delete
using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
