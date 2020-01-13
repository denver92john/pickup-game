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
                    `count(DISTINCT play) AS number_of_players`
                )
            )
            .leftJoin(
                'user_event AS play',
                'event.id',
                'play.event_id'
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

    getPlayers(db, event_id) {
        return db
            .from('user_event AS play')
            .select(
                'usr.id',
                'usr.username'
            )
            .leftJoin(
                'pug_user AS usr',
                'play.user_id',
                'usr.id'
            )
            .where('play.event_id', event_id)
    },

    getSportsList(db) {
        return db
            .from('pug_event')
            .select(
                db.raw(
                    `enum_range(NULL::sport_type)`
                )
            )
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
            player_id: eventData.player_id || '',
        }
    },
}

const hostFields = [
    'usr.id AS host:id',
    'usr.username AS host:username',
    'usr.first_name AS host:first_name',
    'usr.last_name AS host:last_name',
]

module.exports = EventService;