-- Prize Rules Table
create table if not exists prize_rules (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null, -- 'equal_share', 'rank_kill', 'fixed_list'
  config jsonb not null, -- Stores the specific logic params
  created_at timestamp with time zone default now()
);

-- Match History Table (For public display)
create table if not exists match_history (
  id uuid default gen_random_uuid() primary key,
  match_id text not null unique, -- Link to original match ID
  title text not null,
  rule_id uuid references prize_rules(id),
  completed_at timestamp with time zone default now(),
  winners jsonb not null -- Array of {uid, amount, breakdown, username}
);

-- Enable RLS (Optional, depending on your setup)
alter table prize_rules enable row level security;
alter table match_history enable row level security;

-- Policies (Public Read, Admin Write)
create policy "Public rules are viewable by everyone" on prize_rules for select using (true);
create policy "Public history is viewable by everyone" on match_history for select using (true);

-- Note: You need to add policies for INSERT/UPDATE for authenticated service role users if RLS is on.
