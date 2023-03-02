const { UserInputError, AuthenticationError } = require('apollo-server');
const checkAuth = require('../../util/check-auth');
const { prisma } = require("../../database.js");


module.exports = {
    Mutation: {
        createReview: async (parent, {movieId, body }, context) => {


            const user = checkAuth(context);

            if(body.trim() === ''){
                throw new UserInputError('Empty Review', {
                    errors: {
                        body: "Review body must not be empty"
                    }
                })
            }else {
                const movie = await prisma.movie.findById(movieId);


                if(movie) {
                    movie.reviews.unshift({
                        body,
                        userName: user.userName,
                        createdAt: new Date().toISOString()
                    })
                    await movie.save();
                    return movie;


                }else throw new UserInputError('Movies not found');
            }
               
            },
            async deleteReview(parent, {movieId, reviewId}, context){
                const {userName} = checkAuth(context);
                const movie = await prisma.movie.findById(movieId);


                if(movie){
                    const reviewIndex = movie.reviews.findIndex( c => c.id === reviewId);


                    console.log('movie.reviews', movie.reviews);
                    if(movie.reviews[reviewIndex].userName === userName){
                        movie.reviews.splice(reviewIndex, 1);
                        await movie.save();
                        return movie;
                    }else {
                        throw new AuthenticationError('Action not allowed')
                    }
                }else {
                    throw new UserInputError('movie not found')
                }
        }
    }
}
