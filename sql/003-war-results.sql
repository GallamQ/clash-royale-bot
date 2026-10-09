CREATE TABLE war_results (
    war_start_date  DATE        NOT NULL REFERENCES wars (start_date),
    tag             VARCHAR(20) NOT NULL REFERENCES clan_members (tag) ON DELETE CASCADE,
    fame            INTEGER     NOT NULL,
    exempt          BOOLEAN     NOT NULL,
    role            VARCHAR(20) NOT NULL,
    frozen_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (war_start_date, tag)
);

ALTER TABLE war_results OWNER TO clanbot;
