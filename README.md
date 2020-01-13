# PickUp Game API
[Live version](https://pickup-game.now.sh/)
This API for the PickUp Game "PUG Sports" app is used to assist users in finding local pickup games for them to participate in. 

## Dependencies
*   [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Optimized bcrypt in JavaScript with zero dependencies.
*   [cors](https://www.npmjs.com/package/cors) - CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
*   [dotenv](https://www.npmjs.com/package/dotenv) - Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.
*   [helmet](https://www.npmjs.com/package/helmet) - Helmet helps you secure your Express apps by setting various HTTP headers. 
*   [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - For generating JWTs used by authentication.
*   [knex](https://www.npmjs.com/package/knex) - query builder for Node.js.
*   [morgan](https://www.npmjs.com/package/morgan) - HTTP request logger middleware for node.js.
*   [treeize](https://www.npmjs.com/package/treeize) - Converts row data (in JSON/associative array format or flat array format) to object/tree structure based on simple column naming conventions.

## Application Structure
*   `app.js` - Entry point to the application. 
*   `auth` - This folder contains the auth router and auth service object to handle authentication endpoint requests.
*   `event` - This folder contains the event router and event service object to handle event endpoint requests.
*   `middleware` - This folder contains the authentication logic.
*   `play` - This folder contains the play router and play service object that handles playing endpoint requests. When a user signs up to play in an event and when the user removes themself from an event.
*   `user` - This folder contains the user router and user service object that handles user endpoint requests. Creating a new user and GET requests for an individual user.

## Technologies
*   Express
*   Node
*   PostgreSQL