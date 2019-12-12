const Treeize = require('treeize');

const PlayService = {
    getById(db, id) {
        return db
            .from('user_event AS play')
            .select(
                'play.id',
                ...eventFields,
                ...userFields,
            )
            .leftJoin(
                'pug_event AS event',
                'play.event_id',
                'event.id'
            )
            .leftJoin(
                'pug_user AS usr',
                'play.user_id',
                'usr.id'
            )
            //.groupBy('event.id', 'usr.id')
            .where('play.id', id)
            .first()
    },
    getByUser(db, user_id) {
        return db
            .from('user_event AS play')
            .select(
                'event.id',
                'event.title',
                'event.datetime',
                'event.sport',
                'event.host_id'
            )
            .leftJoin(
                'pug_event AS event',
                'play.event_id',
                'event.id'
            )
            .where('play.user_id', user_id)
    },
    getByUserAndEvent(db, user_id, event_id) {
        return db
            .from('user_event AS play')
            .select(
                'play.id',
                ...eventFields,
                ...userFields,
            )
            .leftJoin(
                'pug_event AS event',
                'play.event_id',
                'event.id'
            )
            .leftJoin(
                'pug_user AS usr',
                'play.user_id',
                'usr.id'
            )
            .where({
                'play.user_id': user_id,
                'play.event_id': event_id
            })
            .first()
    },
    getUserHostedEvents(db, user_id) {
        return db
            .from('pug_event AS event')
            .select(
                'event.id',
                'event.title',
                'event.datetime',
                'event.sport',
                'event.host_id'
            )
            .where('event.host_id', user_id)
    },
    alreadyPlaying(db, alreadyPlay /*user_id, event_id*/) {
        return db('user_event')
            /*.where({
                user_id,
                event_id
            })*/
            .where(alreadyPlay)
            .first()
            .then(play => !!play)
    },
    insertPlay(db, newPlay) {
        return db
            .insert(newPlay)
            .into('user_event')
            .returning('*')
            .then(([play]) => play)
            .then(play =>
                PlayService.getById(db, play.id)
            )
    },
    deletePlay(db, deletePlay /*user_id, event_id*/) {
        return db('user_event')
            /*.where({
                user_id,
                event_id
            })*/
            .where(deletePlay)
            .delete()
    },
    serializePlay(play) {
        const playTree = new Treeize();
        const playData = playTree.grow([play]).getData()[0];

        return {
            id: playData.id,
            event: playData.event || {},
            user: playData.user || {},
        }
    },
}

const userFields = [
    'usr.id AS user:id',
    'usr.username AS user:username',
    'usr.first_name AS user:first_name',
    'usr.last_name AS user:last_name'
]

const eventFields = [
    'event.id AS event:id',
    'event.title AS event:title',
    'event.datetime AS event:datetime',
    'event.sport AS event:sport'
]

module.exports = PlayService;