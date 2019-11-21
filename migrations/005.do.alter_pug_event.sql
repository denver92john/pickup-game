ALTER TABLE pug_event
    ADD COLUMN
        host_id INTEGER REFERENCES user_event(user_id) 
        ON DELETE CASCADE NOT NULL;