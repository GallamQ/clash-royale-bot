CREATE TABLE published_messages (
    kind            VARCHAR(20) NOT NULL,
    reference_date  DATE        NOT NULL,
    published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (kind, reference_date)
);

ALTER TABLE published_messages OWNER TO clanbot;
