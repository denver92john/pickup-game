const express = require('express');

const eventRouter = express.Router();

eventRouter
    .route('/')
    .get((req, res) => {
        res.send('Getting it')
    })


module.exports = eventRouter;