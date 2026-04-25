-- D1/D2: M1 (jaw opening) and M2 (jaw protrusion) performed live in Phase 1.
-- Two new BOOLEAN columns replace intake fallback for these indicators.
-- Scoring reads assessment.tmj_m1_jaw_opening / tmj_m2_jaw_protrusion directly.
-- No intake fallback remains for these fields (overlapping rule stays for S1/S6/S7/S8).

ALTER TABLE phase1_assessment
  ADD COLUMN tmj_m1_jaw_opening BOOLEAN NULL,
  ADD COLUMN tmj_m2_jaw_protrusion BOOLEAN NULL;
