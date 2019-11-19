CREATE TABLE pug_event (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    datetime TIMESTAMPTZ DEFAULT now() NOT NULL,
    max_players INTEGER NOT NULL
);