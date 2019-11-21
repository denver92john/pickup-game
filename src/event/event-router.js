const express = require('express');

const eventRouter = express.Router();

const serializeEvent = (event) => {
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

eventRouter
    .route('/')
    .get((req, res) => {
        const knexInstance = req.app.get('db');
        knexInstance
            .from('pug_event AS event')
            .select('*')
            .then(result => {
                console.log(result)
                res.json(result.map(serializeEvent))
            })
    })


module.exports = eventRouter;