const path = require('path');
const express = require('express');
const EventService = require('./event-service');
const {requireAuth} = require('../middleware/jwt-auth');

const eventRouter = express.Router();
const jsonParser = express.json();

eventRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        EventService.getAllEvents(req.app.get('db'))
            .then(events => {
                //console.log(events);
                res.json(EventService.serializeEvents(events))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {title, sport, datetime, max_players, description} = req.body;
        const newEvent = {title, sport, datetime, max_players};

        for(const [key, value] of Object.entries(newEvent)) {
            if(value == null) {
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                })
            }
        }
        newEvent.description = description;
        newEvent.host_id = req.user_id;

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
    .all(requireAuth)
    .all((req, res, next) => {
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
                res.event = event
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(EventService.serializeEvent(res.event))
    })
    .delete((req, res, next) => {
        EventService.deleteEvent(
            req.app.get('db'),
            req.params.event_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {title, sport, datetime, max_players, description, host_id} = req.body;
        const eventToUpdate = {title, sport, datetime, max_players, description, host_id};
        const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length;

        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {message: `Request body must contain must update one of the fields`}
            })
        }

        EventService.updateEvent(
            req.app.get('db'),
            req.params.event_id,
            eventToUpdate
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = eventRouter;