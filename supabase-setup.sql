-- Run this in your Supabase SQL Editor
-- Go to: supabase.com/dashboard > your project > SQL Editor > New Query

-- 1. Create the submissions table
create table submissions (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  title text not null,
  industry text not null,
  sector text not null,
  salary numeric not null,
  experience text,
  company text
);

-- 2. Enable Row Level Security (important!)
alter table submissions enable row level security;

-- 3. Allow anyone to read submissions (public data)
create policy "Anyone can read submissions"
  on submissions for select
  using (true);

-- 4. Allow anyone to insert submissions (anonymous submissions)
create policy "Anyone can insert submissions"
  on submissions for insert
  with check (true);

-- 5. Nobody can update or delete (protects data integrity)
-- No policy needed, RLS blocks by default

-- 6. Add some seed data so the site doesn't look empty on launch
insert into submissions (title, industry, sector, salary, experience) values
  ('Software Developer', 'ICT', 'Private', 2200, '3-5 years'),
  ('Civil Engineer', 'Construction', 'Government', 2800, '6-10 years'),
  ('Accountant', 'Finance & Insurance', 'Private', 1800, '3-5 years'),
  ('Teacher', 'Education', 'Government', 2500, '10+ years'),
  ('Marketing Executive', 'Wholesale & Retail', 'Private', 1100, '0-2 years'),
  ('Process Engineer', 'Oil & Gas', 'Private', 4500, '6-10 years'),
  ('Nurse', 'Health', 'Government', 2100, '3-5 years'),
  ('Admin Assistant', 'Government', 'Government', 1200, '0-2 years'),
  ('Waiter', 'Hospitality & Food', 'Private', 600, '0-2 years'),
  ('IT Manager', 'ICT', 'Semi-Government (GLC)', 3500, '10+ years');
