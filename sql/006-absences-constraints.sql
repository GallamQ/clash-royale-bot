ALTER TABLE absences
ADD CONSTRAINT absences_tag_period_key UNIQUE (tag, start_date, end_date),
ADD CONSTRAINT absences_period_check CHECK (end_date >= start_date);
