const movieResolvers = require('./movies')
const userResolvers = require('./users')
const reviewsResolvers = require('./reviews')


module.exports = {
    Movie: {
    reviewCount: (parent) => parent.reviews.length
    },
    Query: {
        ...movieResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...movieResolvers.Mutation,
        ...reviewsResolvers.Mutation
    }


}
