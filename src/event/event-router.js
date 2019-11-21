const path = require('path');
const express = require('express');
const EventService = require('./event-service');

const eventRouter = express.Router();
const jsonParser = express.json();

eventRouter
    .route('/')
    .get((req, res, next) => {
        EventService.getAllEvents(req.app.get('db'))
            .then(events => {
                //console.log(events);
                res.json(events.map(EventService.serializeEvents))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {title, sport, datetime, max_players, description, host_id} = req.body;
        const newEvent = {title, sport, datetime, max_players, host_id};

        for(const [key, value] of Object.entries(newEvent)) {
            if(value == null) {
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                })
            }
        }
        newEvent.description = description;

        EventService.insertEvent(
            req.app.get('db'),
            newEvent
        )
            .then(event => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${event.id}`))
                    .json(EventService.serializeEvent(event))
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