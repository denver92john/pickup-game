const express = require('express');
const EventService = require('./event-service');

const eventRouter = express.Router();

eventRouter
    .route('/')
    .get((req, res, next) => {
        EventService.getAllEvents(req.app.get('db'))
            .then(events => {
                //console.log(events);
                res.json(events.map(EventService.serializeEvent))
            })
            .catch(next)
    })

eventRouter
    .route('/:event_id')
    .get((req, res, next) => {
        EventService.getById(
            req.app.get('db'),
            req.params.event_id
        )
            .then(event => {
                if(!event) {
                    return res.status(404).json({
                        error: {message: `Event doesn't exist`}
                    })
                }
                //console.log(event)
                res.json(EventService.serializeEvent(event))
                next()
            })
            .catch(next)
    })

module.exports = eventRouter;