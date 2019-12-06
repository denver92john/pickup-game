const express = require('express');
const path = require('path');
const UserService = require('./user-service');

const userRouter = express.Router();
const jsonParser = express.json();

userRouter
    .post('/', jsonParser, (req, res, next) => {
        const {username, password, first_name, last_name} = req.body;

        for(const field of ['username', 'password']) {
            if(!req.body[field]) {
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }

        const passwordError = UserService.validatePassword(password)

        if(passwordError) {
            return res.status(400).json({error: passwordError})
        }

        UserService.hasUserWithUserName(
            req.app.get('db'),
            username
        )
            .then(hasUserWithUserName => {
                if(hasUserWithUserName) {
                    return res.status(400).json({
                        error: `Username already taken`
                    })
                }

                return UserService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            username,
                            password: hashedPassword,
                            first_name,
                            last_name
                        }

                        return UserService.insertUser(
                            req.app.get('db'),
                            newUser
                        )
                            .then(user => {
                                res
                                    .status(201)
                                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                    .json(UserService.serializeUser(user))
                            })
                    })
            })
            .catch(next)
    })

module.exports = userRouter;