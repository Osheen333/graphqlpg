const { UserInputError, AuthenticationError } = require('apollo-server');
const checkAuth = require('../../util/check-auth');
const { prisma } = require("../../database.js");


module.exports = {
    Mutation: {
        createReview: async (parent, {movieId, comment, rating }, context) => {


            const user = checkAuth(context);

            if(comment.trim() === ''){
                throw new UserInputError('Empty Review', {
                    errors: {
                        comment: "Review comment must not be empty"
                    }
                })
            }else {
                const movie = await prisma.movie.findFirst({
                    where: { id: Number(movieId) },
                  })

                if(movie) {
                    console.log('user====+++', user);
                    const newReview = {
                        comment,
                        rating,
                        movieId,
                        userId: user.id
                    };
                  
                  const reviewdMoview =  await prisma.review.create({data:newReview});
                    return reviewdMoview;


                }else throw new UserInputError('Movies not found');
            }
               
            },
            async deleteReview(parent, { reviewId}, context){
                const user = checkAuth(context);
            

                    // TODO: reviewd user is only able to delete review

                         const review = await prisma.review.delete({
                    where: {
                      id: +reviewId,
                    },
                  });   

                  console.log('review', review);
                  return 'review deleted successfuly';
               
          
        },
        updateReview: async (parent, {reviewId, comment, rating }, context) => {


            const user = checkAuth(context);

            if(comment.trim() === ''){
                throw new UserInputError('Empty Review', {
                    errors: {
                        comment: "Review comment must not be empty"
                    }
                })
            }else {
                const movie = await prisma.review.findFirst({
                    where: { id: Number(reviewId) },
                  })

                if(movie) {
                    console.log('user====+++', user);
                    const newReview = {
                        comment,
                        rating,
                    };
                  
                  const reviewdMoview =  await prisma.review.update({
                    where: { id: +reviewId},
                    data: newReview,
                  });

                    return reviewdMoview;


                }else throw new UserInputError('Review not found');
            }
               
            },
    }
}
