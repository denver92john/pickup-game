const express = require('express');
const PlayService = require('./playService');
const {requireAuth} = require('../middleware/jwt-auth');

const playRouter = express.Router();
const jsonBodyParser = express.json();

/*playRouter
    .route('/')
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const {event_id, max_players, number_of_players} = req.body;
        const newPlay = {event_id};

        if(number_of_players >= max_players) {
            return res.status(400).json({
                error: `Game is full`
            })
        }

        for(const [key, value] of Object.entries(newPlay)) {
            if(value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
            }
        }

        newPlay.user_id = req.user_id

        PlayService.alreadyPlaying(
            req.app.get('db'),
            newPlay.user_id,
            newPlay.event_id
        )
            .then(alreadyPlaying => {
                if(alreadyPlaying) {
                    return res.status(400).json({error: `Already playing in this game`})
                }
                
                PlayService.insertPlay(
                    req.app.get('db'),
                    newPlay
                )
                    .then(play => {
                        res
                            .status(201)
                            .json(PlayService.serializePlay(play))
                    })
                    .catch(next)
            })
    })*/

playRouter
    .route('/:event_id')
    .all(requireAuth)
    .get((req, res, next) => {
        const getPlay = {event_id: req.params.event_id, user_id: req.user_id}
        PlayService.alreadyPlaying(
            req.app.get('db'),
            getPlay
        )
            .then(checkedPlay => {
                
                if(!checkedPlay) {
                    res.status(204).end()
                } else {
                    res.send('signed up to play')
                }
            })
            .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const {max_players, number_of_players} = req.body;
        const newPlay = {event_id: req.params.event_id};

        if(number_of_players >= max_players) {
            return res.json({
                message: `Game is full`
            })
        }

        for(const [key, value] of Object.entries(newPlay)) {
            if(value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
            }
        }
        newPlay.user_id = req.user_id

        PlayService.alreadyPlaying(
            req.app.get('db'),
            newPlay
        )
            .then(alreadyPlaying => {
                if(alreadyPlaying) {
                    return res.status(400).json({error: `Already playing in this game`})
                    //res.send('Already playing in this game')
                }
                
                PlayService.insertPlay(
                    req.app.get('db'),
                    newPlay
                )
                    .then(play => {
                        res.status(204).end()
                    })
                    .catch(next)
            })
    })
    .delete((req, res, next) => {
        const deletePlay = {
            user_id: req.user_id,
            event_id: req.params.event_id
        }

        PlayService.alreadyPlaying(
            req.app.get('db'),
            deletePlay
        )
            .then(alreadyPlaying => {
                if(!alreadyPlaying) {
                    return res.status(400).json({error: `Not yet playing in this game`})
                    //return res.send('Not yet playing in this game')
                }

                PlayService.deletePlay(
                    req.app.get('db'),
                    deletePlay
                )
                    .then(() => {
                        res.status(204).end()
                    })
                    .catch(next)
            })
    })

playRouter
    .route('/user/:user_id')
    .all(requireAuth)
    .get((req, res, next) => {
        PlayService.getByUser(
            req.app.get('db'),
            req.params.user_id
        )
            .then(userGames => {
                res.json(userGames)
            })
            .catch(next)
    })

playRouter
    .route('/host/:user_id')
    .all(requireAuth)
    .get((req, res, next) => {
        PlayService.getUserHostedEvents(
            req.app.get('db'),
            req.params.user_id
        )
            .then(hostedGames => {
                res.json(hostedGames)
            })
            .catch(next)
    })


module.exports = playRouter;