const express = require('express');
const PlayService = require('./playService');
const {requireAuth} = require('../middleware/jwt-auth');

const playRouter = express.Router();
const jsonBodyParser = express.json();

playRouter
    .route('/')
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const {event_id} = req.body;
        const newPlay = {event_id};

        for(const [key, value] of Object.entries(newPlay)) {
            if(value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
            }
        }

        newPlay.user_id = req.user_id

        console.log(newPlay)

        PlayService.alreadyPlaying(
            req.app.get('db'),
            newPlay.user_id,
            newPlay.event_id
        )
            .then(alreadyPlaying => {
                console.log(alreadyPlaying)
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
    })

module.exports = playRouter;