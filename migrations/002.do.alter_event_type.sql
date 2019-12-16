CREATE TYPE sport_type AS ENUM (
    'basketball',
    'football',
    'hockey',
    'volleyball',
    'walleyball',
    'biking',
    'weight lifting',
    'hiking'
);

ALTER TABLE pug_event
    ADD COLUMN
        sport sport_type;