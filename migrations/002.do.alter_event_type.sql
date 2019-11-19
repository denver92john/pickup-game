CREATE TYPE sport_type AS ENUM (
    'basketball',
    'football',
    'hockey'
);

ALTER TABLE pug_event
    ADD COLUMN
        sport sport_type;