-- FIX: Enable Insert/Update policies for Prize Rules and Match History
-- Run this in your Supabase SQL Editor to fix the "500 Internal Server Error"

-- Allow Inserting Rules (Required for "Create Rule" feature)
create policy "Enable insert for all" on prize_rules for insert with check (true);

-- Allow Inserting History (Required for "Distribute & Log" feature)
create policy "Enable insert for all" on match_history for insert with check (true);

-- Optional: Allow Update/Delete for Rules (If you want to edit/delete rules later)
create policy "Enable update for all" on prize_rules for update using (true);
create policy "Enable delete for all" on prize_rules for delete using (true);
