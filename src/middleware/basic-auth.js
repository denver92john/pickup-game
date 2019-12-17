const AuthService = require('../auth/auth-service');

function requireAuth(req, res, next) {
    const authToken = req.get('authorization') || '';
    let bearerToken

    if(!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({error: 'Missing basic token'})
    } else {
        bearerToken = authToken.slice('bearer '.length, authToken.length)
    }

    const [tokenUsername, tokenPassword] = AuthService.parseBasicToken(bearerToken);

    if(!tokenUsername || !tokenPassword) {
        return res.status(401).json({error: 'Unauthorized request'})
    }

    AuthService.getUserWithUsername(
        req.app.get('db'),
        tokenUsername
    )
        .then(user => {
            if(!user) {
                return res.status(401).json({error:'Unauthorized request'})
            }

            return AuthService.comparePasswords(tokenPassword, user.password)
                .then(passwordsMatch => {
                    if(!passwordsMatch) {
                        return res.status(401).json({error: 'Unauthorized request'})
                    }

                    req.user = user
                    next()
                })
        })
        .catch(next)

    /*req.app.get('db')('pug_user')
        .where({username: tokenUsername})
        .first()
        .then(user => {
            if(!user || user.password !== tokenPassword) {
                return res.status(401).json({error: 'Unauthorized request'})
            }
            req.user = user
            next()
        })
        .catch(next)*/
}

module.exports = {
    requireAuth,
}