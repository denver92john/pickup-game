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
            .groupBy('event.id', 'usr.id')
    },

    getById(db, id) {
        return EventService.getAllEvents(db)
            .where('event.id', id)
            .first()
    },

    serializeEvent(event) {
        const {host} = event;
        return {
            id: event.id,
            title: event.title,
            description: event.description,
            datetime: event.datetime,
            max_players: event.max_players,
            sport: event.sport,
            host: {
                id: host.id,
                username: host.username,
                first_name: host.first_name,
                last_name: host.last_name
            }
        }
    }
}

module.exports = EventService;