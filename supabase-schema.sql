-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

create table survey_responses (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  -- participant info (denormalised for easy export)
  participant_token     text not null,
  participant_first_name text,
  participant_last_name  text,
  participant_email      text,
  participant_group      text,
  participant_org        text,

  -- study progress
  step_reached          text,
  completed             boolean default false,

  -- background questions
  background            jsonb,

  -- post-task survey
  survey_answers        jsonb
);

-- Index for fast lookup when upserting
create index on survey_responses (participant_token);

-- Disable row-level security for the service role (the API uses the service key)
alter table survey_responses enable row level security;

create policy "service role full access"
  on survey_responses
  using (true)
  with check (true);
