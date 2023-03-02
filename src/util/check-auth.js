const jwt = require('jsonwebtoken');
const {AuthenticationError } = require('apollo-server')
const {SECRET_KEY} = require('../config')


module.exports = (context) => {
    // context = {... headers }
    const authHeader = context.req.headers.authorization;
    if(authHeader){
        // bearer ...
        const token = authHeader.split('Bearer ')[1];
        console.log('token', token);
    if(token){
        try {
            const user =  jwt.verify(token, SECRET_KEY);
            console.log('user====', user);


            return user
        } catch(error){
            throw new AuthenticationError('Invalid/Expired Token')
        }
    }
    throw new Error("Authentication token must be \'Bearer [token]")
}
throw new Error("Authorization header must be provided")

}
