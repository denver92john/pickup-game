CREATE TABLE pug_user (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT
);

ALTER TABLE pug_event
    ADD COLUMN
        host_id INTEGER REFERENCES pug_user(id) 
        ON DELETE CASCADE NOT NULL;