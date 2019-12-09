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
    alreadyPlaying(db, user_id, event_id) {
        return db('user_event')
            .where({
                user_id,
                event_id
            })
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