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
                //...playerFields,
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
            //.orderBy('event.id', 'usr.id')
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
                //...playerFields,
                //...eventFields
                'usr.id',
                'usr.username'
            )
            /*.leftJoin(
                'pug_event AS event',
                'play.event_id',
                'event.id'
            )*/
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
            player_id: eventData.player_id || '',
            //players: eventData.players || {},
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

    serializePlayers(players) {
        return players.map(this.serializePlayer)
    },

    serializePlayer(player) {
        /*const playTree = new Treeize();
        const playData = playTree.grow([player]).getData()[0];
        return {
            id: playData.id,
            players: playData.players,
            event: playData.event
        }*/
    },

     
}

const hostFields = [
    'usr.id AS host:id',
    'usr.username AS host:username',
    'usr.first_name AS host:first_name',
    'usr.last_name AS host:last_name',
]

const playerFields = [
    'usr.id AS players:id',
    'usr.username AS players:username'
]

const eventFields = [
    'event.id AS event:id',
    'event.title AS event:title'
]

module.exports = EventService;