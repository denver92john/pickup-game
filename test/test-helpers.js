const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
    return [
        {
            id: 1,
            username: 'JDenver',
            password: 'jdenver',
            first_name: 'John',
            last_name: 'Denver'
        },
        {
            id: 2,
            username: 'BeastMode',
            password: 'seahawks',
            first_name: 'Marshawn',
            last_name: 'Lynch'
        },
        {
            id: 3,
            username: 'brady12',
            password: 'patriots',
            first_name: 'Tom',
            last_name: 'Brady'
        }
    ]
}

function makeEventsArray(users) {
    return [
        {
            id: 1,
            title: 'Turkey Bowl',
            description: 'Thanksgiving football game',
            datetime: new Date('2029-01-22T16:28:32.615Z'),
            max_players: 10,
            sport: 'football',
            host_id: users[0].id
        },
        {
            id: 2,
            title: 'Championship',
            description: 'Hockey game for who can make it',
            datetime: new Date('2029-01-22T16:28:32.615Z'),
            max_players: 10,
            sport: 'hockey',
            host_id: users[1].id
        },
        {
            id: 3,
            title: 'Dunk Fest',
            description: 'Pickup bball game of the summer',
            datetime: new Date('2029-01-22T16:28:32.615Z'),
            max_players: 10,
            sport: 'basketball',
            host_id: users[2].id
        }
    ]
}

function makePlayArray(users, events) {
    return [
        {
            id: 1,
            event_id: events[0].id,
            user_id: users[0].id
        },
        {
            id: 2,
            event_id: events[0].id,
            user_id: users[1].id
        },
        {
            id: 3,
            event_id: events[1].id,
            user_id: users[1].id
        },
        {
            id: 4,
            event_id: events[1].id,
            user_id: users[2].id
        },
        {
            id: 5,
            event_id: events[2].id,
            user_id: users[2].id
        }
    ]
}

function makeExpectedEvent(users, event, plays=[]) {
    const host = users
        .find(user => user.id === event.host_id)
    
    const number_of_players = plays
        .filter(play => play.event_id === event.id).length.toString()

    return {
        id: event.id,
        title: event.title,
        description: event.description || '',
        datetime: event.datetime.toISOString(),
        max_players: event.max_players,
        sport: event.sport,
        number_of_players,
        player_id: event.player_id || '',
        host: {
            id: host.id,
            username: host.username,
            first_name: host.first_name,
            last_name: host.last_name
        }
    }
}

function makeExpectedEventPlays(users, event_id, plays) {
    const expectedPlays = plays
        .filter(play => play.event_id === event_id)
    
    return expectedPlays.map(play => {
        const playUser = users.find(user => user.id === play.user_id)
        return {
            id: playUser.id,
            username: playUser.username
        }
    })
}

function makeEventsFixtures() {
    const testUsers = makeUsersArray()
    const testEvents = makeEventsArray(testUsers)
    const testPlay = makePlayArray(testUsers, testEvents)
    return {testUsers, testEvents, testPlay}
}

function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
                pug_event,
                pug_user,
                user_event
            `
        )
        .then(() =>
            Promise.all([
                trx.raw(`ALTER SEQUENCE pug_event_id_seq minvalue 0 START WITH 1`),
                trx.raw(`ALTER SEQUENCE pug_user_id_seq minvalue 0 START WITH 1`),
                trx.raw(`ALTER SEQUENCE user_event_id_seq minvalue 0 START WITH 1`),
                trx.raw(`SELECT setval('pug_event_id_seq', 0)`),
                trx.raw(`SELECT setval('pug_user_id_seq', 0)`),
                trx.raw(`SELECT setval('user_event_id_seq', 0)`),
            ])
        )
    )
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('pug_user').insert(preppedUsers)
        .then(() => 
            db.raw(
                `SELECT setval('pug_user_id_seq', ?)`,
                [users[users.length - 1].id],
            )
        )
}

function seedPugTables(db, users, events, plays=[]) {
    return db.transaction(async trx => {
        await seedUsers(trx, users)
        await trx.into('pug_event').insert(events)
        await trx.raw(
            `SELECT setval('pug_event_id_seq', ?)`,
            [events[events.length - 1].id],
        )
        if(plays.length) {
            await trx.into('user_event').insert(plays)
            await trx.raw(
                `SELECT setval('user_event_id_seq', ?)`,
                [plays[plays.length - 1].id],
            )
        }
    })
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({user_id: user.id}, secret, {
        subject: user.username,
        algorithm: 'HS256',
    })
    return `Bearer ${token}`
}

module.exports = {
    makeUsersArray,
    makeEventsArray,
    makePlayArray,
    makeExpectedEvent,
    makeExpectedEventPlays,
    makeEventsFixtures,
    cleanTables,
    seedUsers,
    seedPugTables,
    makeAuthHeader
}