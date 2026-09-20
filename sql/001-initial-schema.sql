CREATE TABLE clan_members (
    tag       VARCHAR(20)  PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    role      VARCHAR(20)  NOT NULL,
    join_date DATE         NOT NULL
);

CREATE TABLE absences (
    id         SERIAL      PRIMARY KEY,
    tag        VARCHAR(20) NOT NULL REFERENCES clan_members(tag),
    start_date DATE        NOT NULL,
    end_date   DATE        NOT NULL
);

CREATE TABLE war_logs (
    id       SERIAL      PRIMARY KEY,
    war_date DATE        NOT NULL,
    tag      VARCHAR(20) REFERENCES clan_members(tag) ON DELETE SET NULL,
    fame     INTEGER     NOT NULL,
    war_id   VARCHAR(50)
);

CREATE UNIQUE INDEX war_logs_war_id_tag_idx ON war_logs (war_id, tag);
