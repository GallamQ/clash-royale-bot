CREATE TABLE wars (
    start_date      DATE        PRIMARY KEY,
    start_index     INTEGER     NOT NULL,
    end_date        DATE,
    period_type     VARCHAR(20) NOT NULL
);

INSERT INTO wars (
    start_date,
    start_index,
    end_date,
    period_type
) VALUES (
    '2026-10-01',
    24,
    '2026-10-05',
    'colosseum'
);

INSERT INTO wars (
    start_date,
    start_index,
    end_date,
    period_type
) VALUES (
    '2026-10-08',
    3,
    NULL,
    'warDay'
);

ALTER TABLE war_logs
ADD COLUMN war_start_date DATE;

UPDATE war_logs
SET war_start_date = '2026-10-01'
WHERE war_id = '24';

UPDATE war_logs
SET war_start_date = '2026-10-08'
WHERE war_id = '3';

ALTER TABLE war_logs
ADD CONSTRAINT war_logs_war_start_date_fkey
FOREIGN KEY (war_start_date) REFERENCES wars (start_date);

CREATE UNIQUE INDEX war_logs_war_start_date_tag_idx
ON war_logs (war_start_date, tag);
