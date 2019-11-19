BEGIN;

TRUNCATE
    pug_user,
    pug_event
    RESTART IDENTITY CASCADE;

INSERT INTO pug_user (username, password, first_name, last_name)
VALUES
    ('JDenver', 'jdenver', 'John', 'Denver'),
    ('Beast Mode', 'seahawks', 'Marshawn', 'Lynch'),
    ('brady12', 'patriots', 'Tom', 'Brady');

INSERT INTO pug_event (title, description, datetime, max_players, sport, host_id)
VALUES
    ('Turkey Bowl', 'Thanksgiving football game', 'November 15 16:20:55 2019 GMT', 10, 'football', 1),
    ('Championship', 'Hockey game for who can make it', 'November 15 16:20:55 2019 GMT', 6, 'hockey', 2),
    ('Dunk Fest', 'The premier pickup basketball game of the summer', 'November 15 16:20:55 2019 GMT', 8, 'basketball', 3);

COMMIT;