const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Protected endpoints', () => {
    let db;

    const {
        testUsers,
        testEvents,
        testPlay
    } = helpers.makeEventsFixtures();

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

    beforeEach('insert events', () => 
        helpers.seedPugTables(
            db,
            testUsers,
            testEvents,
            testPlay
        )
    )

    const protectedEnpoints = [
        {
            name: 'GET /api/event',
            path: '/api/event',
            method: supertest(app).get
        },
        {
            name: 'POST /api/event',
            path: '/api/event',
            method: supertest(app).post
        },
        {
            name: 'GET /api/event/:event_id',
            path: '/api/event/1',
            method: supertest(app).get
        },
        {
            name: 'GET /api/event/:event_id/players',
            path: '/api/event/1/players',
            method: supertest(app).get
        },
        {
            name: 'GET /api/user',
            path: '/api/user',
            method: supertest(app).get
        },
        {
            name: 'POST /api/play/:event_id',
            path: '/api/play/1',
            method: supertest(app).post
        },
        {
            name: 'DELETE /api/play/:event_id',
            path: '/api/play/1',
            method: supertest(app).delete
        },
        {
            name: 'GET /api/play/user/:user_id',
            path: '/api/play/user/1',
            method: supertest(app).get
        },
        {
            name: 'GET /api/play/host/:user_id',
            path: '/api/play/host/1',
            method: supertest(app).get
        }
    ]

    protectedEnpoints.forEach(endpoint => {
        describe(endpoint.name, () => {
            it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
                return endpoint.method(endpoint.path)
                    .expect(401, {error: `Missing bearer token`})
            })

            it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
                const validUser = testUsers[0];
                const invalidSecret = 'bad-secret';
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                    .expect(401, {error: `Unauthorized request`})
            })

            it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
                const invalidUser = {username: 'user-not-exist', id: 1}
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(invalidUser))
                    .expect(401, {error: `Unauthorized request`})
            })
        })
    })
})