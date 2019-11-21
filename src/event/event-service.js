const EventService = {
    getAllEvents(db) {
        return db
            .from('pug_event AS event')
            .select(
                'event.id',
                'event.title',
                'event.description',
                'event.datetime',
                'event.max_players',
                'event.sport',
                db.raw(
                    `json_build_object(
                        'id', usr.id,
                        'username', usr.username,
                        'first_name', usr.first_name,
                        'last_name', usr.last_name
                    ) AS "host"`
                ),
            )
            .leftJoin(
                'pug_user AS usr',
                'event.host_id',
                'usr.id'
            )
            //.groupBy('event.id', 'usr.id')
            .orderBy('event.id', 'usr.id')
    },

    getById(db, id) {
        return EventService.getAllEvents(db)
            .where('event.id', id)
            .first()
    },

    insertEvent(db, newEvent) {
        return db
            .insert(newEvent)
            .into('pug_event')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    deleteEvent(db, id) {
        return db('pug_event')
            .where({id})
            .delete()
    },

    updateEvent(db, id, newEventFields) {
        return db('pug_event')
            .where({id})
            .update(newEventFields)
    },

    serializeEvents(events) {
        const {host} = events;
        return {
            id: events.id,
            title: events.title,
            description: events.description,
            datetime: events.datetime,
            max_players: events.max_players,
            sport: events.sport,
            host: {
                id: host.id,
                username: host.username,
                first_name: host.first_name,
                last_name: host.last_name
            }
        }
    },

    serializeEvent(event) {
        return {
            id: event.id,
            title: event.title,
            description: event.description,
            datetime: event.datetime,
            max_players: event.max_players,
            sport: event.sport,
            host_id: event.host_id
        }
    }
}

module.exports = EventService;