DROP INDEX war_logs_war_id_tag_idx;

ALTER TABLE war_logs
ALTER COLUMN war_date DROP NOT NULL;
