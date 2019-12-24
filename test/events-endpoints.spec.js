const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Events endpoints', () => {
    let db;

    const {
        testUsers,
        testEvents,
        testPlay
    } = helpers.makeEventsFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`GET /api/event`, () => {
        context(`Given no events`, () => {
            beforeEach(() =>
                helpers.seedUsers(db, testUsers)
            )

            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/event')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, [])
            })
        })

        context(`Given there are events in the database`, () => {
            beforeEach('insert events', () => 
                helpers.seedPugTables(
                    db,
                    testUsers,
                    testEvents,
                    testPlay
                )
            )

            it(`responds with 200 and all the events`, () => {
                const expectedEvents = testEvents.map(event =>
                    helpers.makeExpectedEvent(
                        testUsers,
                        event,
                        testPlay
                    )
                )
                return supertest(app)
                    .get('/api/event')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedEvents)
            })
        })
    })

    describe(`POST /api/event`, () => {
        beforeEach('insert events', () => 
            helpers.seedPugTables(
                db,
                testUsers,
                testEvents,
                testPlay
            )
        )

        it(`creates an event, responding with 201 and the new event`, function() {
            this.retries(3)
            const testUser = testUsers[0];
            const newEvent = {
                title: 'Alumni Game',
                sport: 'volleyball',
                datetime: new Date('2029-01-22T16:28:32.615Z'),
                max_players: 10,
                host_id: testUser.id
            }
            return supertest(app)
                .post('/api/event')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newEvent)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.title).to.eql(newEvent.title)
                    expect(res.body.sport).to.eql(newEvent.sport)
                    expect(res.body.max_players).to.eql(newEvent.max_players)
                    expect(res.headers.location).to.eql(`/api/event/${res.body.id}`)
                    const expectedDate = new Date('2029-01-22T16:28:32.615Z').toLocaleString('en', {timeZone: 'UTC'})
                    const actualDate = new Date(res.body.datetime).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })
                .expect(res =>
                    db
                        .from('pug_event')
                        .select('*')
                        .where({id: res.body.id})
                        .first()
                        .then(row => {
                            expect(row.title).to.eql(newEvent.title)
                            expect(row.sport).to.eql(newEvent.sport)
                            expect(row.max_players).to.eql(newEvent.max_players)
                            expect(row.host_id).to.eql(newEvent.host_id)
                            const expectedDate = new Date('2029-01-22T16:28:32.615Z').toLocaleString('en', {timeZone: 'UTC'})
                            const actualDate = new Date(res.body.datetime).toLocaleString()
                            expect(actualDate).to.eql(expectedDate)
                        })
                )
        })

        const requiredFields = ['title', 'sport', 'datetime', 'max_players'];

        requiredFields.forEach(field => {
            const newEvent = {
                title: 'Alumni Game',
                sport: 'volleyball',
                datetime: new Date('2029-01-22T16:28:32.615Z'),
                max_players: 10,
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newEvent[field]

                return supertest(app)
                    .post('/api/event')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newEvent)
                    .expect(400, {
                        error: {message: `Missing '${field}' in request body`}
                    })
            })
        })
    })

    //describe(`GET /api/event/sport_list`, () => {})

    describe(`GET /api/event/:event_id`, () => {
        context(`Given no events`, () => {
            beforeEach(() =>
                helpers.seedUsers(db, testUsers)
            )

            it(`responds with 404`, () => {
                const event_id = 123456;
                return supertest(app)
                    .get(`/api/event/${event_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: {message: `Event doesn't exist`}})
            })
        })

        context(`Given there are events`, () => {
            beforeEach('insert events', () => 
                helpers.seedPugTables(
                    db,
                    testUsers,
                    testEvents,
                    testPlay
                )
            )

            it('responds with 200 and the specified event', () => {
                const event_id = 2
                const expectedEvent = helpers.makeExpectedEvent(
                    testUsers,
                    testEvents[event_id - 1],
                    testPlay
                )
                expectedEvent.player_id = testUsers[1].id
                return supertest(app)
                    .get(`/api/event/${event_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                    .expect(200, expectedEvent)
            })
        })
    })

    /*describe(`DELETE /api/event/:event_id`, () => {})

    describe(`PATCH /api/event/:event_id`, () => {})*/

    describe(`GET /api/event/:event_id/players`, () => {
        beforeEach('insert events', () => 
            helpers.seedPugTables(
                db,
                testUsers,
                testEvents,
                testPlay
            )
        )

        it('responds with 200 and list of players', () => {
            const event_id = 2
            const expectedPlays = helpers.makeExpectedEventPlays(
                testUsers,
                event_id,
                testPlay
            )
            return supertest(app)
                .get(`/api/event/${event_id}/players`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                .expect(200, expectedPlays)
        })
    })
})