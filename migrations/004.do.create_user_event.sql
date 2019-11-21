CREATE TABLE user_event (
    event_id INTEGER REFERENCES pug_event(id),
    user_id INTEGER REFERENCES pug_user(id),
    PRIMARY KEY (event_id, user_id)
);

