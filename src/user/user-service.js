const UserService = {
    hasUserWithUserName(db, username) {
        return db('pug_user')
            .where({username})
            .first()
            .then(user => !!user)
    },

    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('pug_user')
            .returning('*')
            .then(([user]) => user)
    },

    serializeUser(user) {
        return {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name
        }
    }
}

module.exports = UserService;