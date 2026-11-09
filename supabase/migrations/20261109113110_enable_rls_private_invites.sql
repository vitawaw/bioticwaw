-- BIOTICWAW 1.4.x · applied on TEST 2026-11-09 (version 20261109113110). Apply on LIVE at release.
-- The invites table is private: row security on, no policies (only definer functions read it).
ALTER TABLE private.invites ENABLE ROW LEVEL SECURITY;
