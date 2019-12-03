const Treeize = require('treeize');
const xss = require('xss');

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
                ...hostFields,
                db.raw(
                    `count(DISTINCT user_event) AS number_of_players`
                ),
                /*db.raw(
                    `json_build_object(
                        'id', usr.id,
                        'username', usr.username,
                        'first_name', usr.first_name,
                        'last_name', usr.last_name
                    ) AS "host"`
                ),*/
            )
            .leftJoin(
                'user_event',
                'event.id',
                'user_event.event_id'
            )
            .leftJoin(
                'pug_user AS usr',
                'event.host_id',
                'usr.id'
            )
            .groupBy('event.id', 'usr.id')
            //.orderBy('event.id', 'usr.id')
    },

    getById(db, id) {
        return EventService.getAllEvents(db)
            .where('event.id', id)
            .first()
    },

    //getPlayers(db, id) {},

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
        return events.map(this.serializeEvent)
    },

    serializeEvent(event) {
        const eventTree = new Treeize();
        const eventData = eventTree.grow([event]).getData()[0];

        return {
            id: eventData.id,
            title: xss(eventData.title),
            description: xss(eventData.description),
            datetime: eventData.datetime,
            max_players: eventData.max_players,
            sport: eventData.sport,
            number_of_players: eventData.number_of_players,
            host: eventData.host || {},
        }
        /*const {host} = events;
        return {
            id: events.id,
            title: events.title,
            description: events.description,
            datetime: events.datetime,
            max_players: events.max_players,
            sport: events.sport,
            number_of_players: Number(events.number_of_players),
            host: {
                id: host.id,
                username: host.username,
                first_name: host.first_name,
                last_name: host.last_name
            }
        }*/
    },
}

const hostFields = [
    'usr.id AS host:id',
    'usr.username AS host:username',
    'usr.first_name AS host:first_name',
    'usr.last_name AS host:last_name',
]

module.exports = EventService;