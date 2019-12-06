BEGIN;

TRUNCATE
    user_event,
    pug_user,
    pug_event
    RESTART IDENTITY CASCADE;

INSERT INTO pug_event (title, description, datetime, max_players, sport)
VALUES
    ('Turkey Bowl', 'Thanksgiving football game', 'November 15 16:20:55 2019 GMT', 10, 'football'),
    ('Championship', 'Hockey game for who can make it', 'November 15 16:20:55 2019 GMT', 6, 'hockey'),
    ('Dunk Fest', 'The premier pickup basketball game of the summer', 'November 15 16:20:55 2019 GMT', 8, 'basketball');

INSERT INTO pug_user (username, password, first_name, last_name)
VALUES
    ('JDenver', '$2a$12$41JChQH2h/VVu.sAMwWwpOOjnXp1ypmE1QZuqqa9AjxyLl15Mkbzy', 'John', 'Denver'),
    ('BeastMode', '$2a$12$V6NEsIOtTE12zA9gtBNufO3SuHYywU2g4JwAnfy.SBeXLNjzGvj9W', 'Marshawn', 'Lynch'),
    ('brady12', '$2a$12$Bro2daZtepqKwJBKolSvE.F6h3XYYSQUAwFSPr9dMIRciIHtPSyC.', 'Tom', 'Brady');

UPDATE pug_event SET host_id = 1 WHERE id = 1;
UPDATE pug_event SET host_id = 2 WHERE id = 2;
UPDATE pug_event SET host_id = 3 WHERE id = 3;

INSERT INTO user_event (event_id, user_id)
VALUES 
    (1, 1),
    (1, 2),
    (2, 2),
    (2, 3),
    (3, 1),
    (3, 2),
    (3, 3);

COMMIT;

-- Add colums (managers) to tables (departments)
/*
UPDATE department SET manager = 7 WHERE id = 1;
UPDATE department SET manager = 3 WHERE id = 2;
UPDATE department SET manager = 6 WHERE id = 3;
UPDATE department SET manager = 5 WHERE id = 4;
*/