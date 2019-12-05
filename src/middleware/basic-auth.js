function requireAuth(req, res, next) {
    console.log(req.get('authorization'))

    const authToken = req.get('authorization') || '';
    let bearerToken

    if(!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({error: 'Missing basic token'})
    } else {
        bearerToken = authToken.slice('bearer '.length, authToken.length)
    }

    const [tokenUsername, tokenPassword] = Buffer
        .from(bearerToken, 'base64')
        .toString()
        .split(':')

    if(!tokenUsername || !tokenPassword) {
        return res.status(401).json({error: 'Unauthorized request'})
    }

    req.app.get('db')('pug_user')
        .where({username: tokenUsername})
        .first()
        .then(user => {
            //console.log(user)
            if(!user || user.password !== tokenPassword) {
                return res.status(401).json({error: 'Unauthorized request'})
            }
            req.user = user
            next()
        })
        .catch(next)
}

module.exports = {
    requireAuth,
}