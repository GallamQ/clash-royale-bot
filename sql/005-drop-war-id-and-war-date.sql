ALTER TABLE war_logs
DROP COLUMN war_id,
DROP COLUMN war_date;

ALTER TABLE war_logs
ALTER COLUMN war_start_date SET NOT NULL;
