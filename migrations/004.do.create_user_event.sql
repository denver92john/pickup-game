CREATE TABLE user_event (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES pug_event(id),
    user_id INTEGER REFERENCES pug_user(id)
);

