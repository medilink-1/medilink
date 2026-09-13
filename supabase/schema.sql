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

-- =========================================================
-- 13. Shareable read-only health summary links
--     Lets a patient generate a temporary, revocable link that shows
--     a read-only health summary -- no MediLink account or login
--     required to view it -- e.g. to hand to a treating doctor.
--     Run this block once in the Supabase SQL editor to enable
--     "Share with a Doctor" on the Patient Profile page.
-- =========================================================
create table if not exists share_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  token text unique not null,
  label text,
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  revoked boolean default false
);

alter table share_links enable row level security;

-- Only the owning patient can see, create, or revoke their own share links.
create policy "Own share links only" on share_links for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Security-definer function: this is the ONLY way an anonymous visitor
-- (the doctor opening the link, with no MediLink account of their own)
-- can read any patient data. It validates the token is not expired and
-- not revoked, then returns a deliberately narrow, read-only summary --
-- never raw table access, and nothing writable.
create or replace function get_shared_health_summary(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link share_links%rowtype;
  v_result json;
begin
  select * into v_link from share_links
    where token = p_token and revoked = false and expires_at > now();

  if not found then
    return null;
  end if;

  select json_build_object(
    'profile', (
      select json_build_object(
        'full_name', full_name,
        'age', age,
        'gender', gender,
        'blood_group', blood_group,
        'health_id', health_id,
        'emergency_name', emergency_name,
        'emergency_relation', emergency_relation,
        'emergency_phone', emergency_phone
      )
      from profiles where id = v_link.user_id
    ),
    'allergies', (
      select coalesce(json_agg(json_build_object('name', name, 'severity', severity)), '[]'::json)
      from allergies where user_id = v_link.user_id
    ),
    'conditions', (
      select coalesce(json_agg(json_build_object('name', name)), '[]'::json)
      from conditions where user_id = v_link.user_id
    ),
    'medications', (
      select coalesce(json_agg(json_build_object('name', name, 'dose', dose, 'frequency', frequency, 'status', status)), '[]'::json)
      from medications where user_id = v_link.user_id and status = 'active'
    ),
    'label', v_link.label,
    'expires_at', v_link.expires_at
  ) into v_result;

  return v_result;
end;
$$;

-- Anyone (including an anonymous, logged-out visitor) may call this
-- function -- it is the sole entry point, and it enforces its own
-- token/expiry/revocation checks internally before returning anything.
grant execute on function get_shared_health_summary(text) to anon, authenticated;

-- =========================================================
-- 14. PIN-protected Emergency QR access
--     Lets the Smart Health Card's QR code point at a URL instead of
--     embedding raw PII, and gates that page behind a 4-6 digit PIN the
--     patient sets themselves -- so a scan (or a photo/screenshot of the
--     QR) is useless without the PIN, and the whole thing is revocable
--     by regenerating it, unlike a static QR code.
-- =========================================================
create extension if not exists pgcrypto;

alter table share_links add column if not exists pin_hash text;
alter table share_links add column if not exists failed_attempts int not null default 0;
alter table share_links add column if not exists locked_until timestamptz;

-- Creates (or replaces) this patient's one emergency-QR link. Calling it
-- again always revokes whatever was created before, so regenerating the
-- QR / changing the PIN immediately invalidates any old printed or saved
-- copy. Ordinary security (SECURITY INVOKER, not DEFINER): it only ever
-- touches the calling patient's own rows, so it relies on -- and is
-- protected by -- the existing "Own share links only" RLS policy.
create or replace function create_emergency_qr_link(p_pin text, p_hours int default 8760)
returns table(token text, expires_at timestamptz)
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  v_user uuid := auth.uid();
  v_token text;
  v_expires timestamptz;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;
  if p_pin is null or p_pin !~ '^[0-9]{4,6}$' then
    raise exception 'PIN must be 4 to 6 digits';
  end if;

  update share_links set revoked = true
    where user_id = v_user and label = '__emergency_qr__' and revoked = false;

  v_token := replace(gen_random_uuid()::text, '-', '');
  v_expires := now() + (p_hours || ' hours')::interval;

  insert into share_links (user_id, token, label, expires_at, pin_hash)
  values (v_user, v_token, '__emergency_qr__', v_expires, crypt(p_pin, gen_salt('bf')));

  return query select v_token, v_expires;
end;
$$;

revoke all on function create_emergency_qr_link(text, int) from public;
grant execute on function create_emergency_qr_link(text, int) to authenticated;

-- Revokes the patient's current emergency QR link outright (e.g. "I lost
-- my phone" / "someone else saw my PIN") without needing a replacement.
create or replace function revoke_emergency_qr_link()
returns void
language sql
security invoker
set search_path = public
as $$
  update share_links set revoked = true
    where user_id = auth.uid() and label = '__emergency_qr__' and revoked = false;
$$;

revoke all on function revoke_emergency_qr_link() from public;
grant execute on function revoke_emergency_qr_link() to authenticated;

-- Replaces the read function to add the PIN gate. Dropped and recreated
-- (rather than "create or replace") because the parameter list is
-- changing -- otherwise Postgres would keep the old 1-argument version
-- around as a separate overload instead of actually replacing it.
drop function if exists get_shared_health_summary(text);

create or replace function get_shared_health_summary(p_token text, p_pin text default null)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_link share_links%rowtype;
  v_result json;
begin
  select * into v_link from share_links
    where token = p_token and revoked = false and expires_at > now();

  if not found then
    return json_build_object('status', 'not_found');
  end if;

  if v_link.locked_until is not null and v_link.locked_until > now() then
    return json_build_object('status', 'locked', 'locked_until', v_link.locked_until);
  end if;

  if v_link.pin_hash is not null then
    if p_pin is null or p_pin = '' then
      return json_build_object(
        'status', 'pin_required',
        'label', nullif(v_link.label, '__emergency_qr__')
      );
    end if;

    if crypt(p_pin, v_link.pin_hash) <> v_link.pin_hash then
      update share_links set
        failed_attempts = failed_attempts + 1,
        locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else locked_until end
        where id = v_link.id;
      return json_build_object(
        'status', 'invalid_pin',
        'attempts_left', greatest(0, 5 - (v_link.failed_attempts + 1))
      );
    end if;

    update share_links set failed_attempts = 0, locked_until = null where id = v_link.id;
  end if;

  select json_build_object(
    'status', 'ok',
    'profile', (
      select json_build_object(
        'full_name', full_name, 'age', age, 'gender', gender,
        'blood_group', blood_group, 'health_id', health_id,
        'emergency_name', emergency_name, 'emergency_relation', emergency_relation,
        'emergency_phone', emergency_phone
      )
      from profiles where id = v_link.user_id
    ),
    'allergies', (
      select coalesce(json_agg(json_build_object('name', name, 'severity', severity)), '[]'::json)
      from allergies where user_id = v_link.user_id
    ),
    'conditions', (
      select coalesce(json_agg(json_build_object('name', name)), '[]'::json)
      from conditions where user_id = v_link.user_id
    ),
    'medications', (
      select coalesce(json_agg(json_build_object('name', name, 'dose', dose, 'frequency', frequency, 'status', status)), '[]'::json)
      from medications where user_id = v_link.user_id and status = 'active'
    ),
    'label', nullif(v_link.label, '__emergency_qr__'),
    'expires_at', v_link.expires_at
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function get_shared_health_summary(text, text) from public;
grant execute on function get_shared_health_summary(text, text) to anon, authenticated;

-- =========================================================
-- 15. Medication doses (daily adherence checklist)
--     One row per medication per calendar day, recording whether that
--     day's dose was checked off as taken. Deliberately coarse -- one
--     checkbox per medication per day, no matter how many times a day
--     it's actually taken -- and separate from the automatic
--     course-end reminders (which watch a course's end date, not
--     daily adherence). Run this block once in the Supabase SQL
--     editor to enable the "Today's Medications" checklist on the
--     Home page.
-- =========================================================
create table if not exists medication_doses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade not null,
  medication_id uuid references medications (id) on delete cascade not null,
  dose_date date not null default current_date,
  taken_at timestamptz,
  created_at timestamptz default now(),
  unique (medication_id, dose_date)
);

alter table medication_doses enable row level security;

create policy "Own medication doses only" on medication_doses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
