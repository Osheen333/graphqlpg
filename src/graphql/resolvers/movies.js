const { AuthenticationError } = require('apollo-server');
const { prisma } = require("../../database.js");
const checkAuth = require('../../util/check-auth')


module.exports = {
    Query: {
        async getMovies(){
            try {
                const movies = await prisma.movie.findMany({
                    orderBy: {
                        id: 'desc',
                      },
                    
                })
                return movies;
            } catch (error) {
                throw new Error(error)
            }
        },
        async getMovie(parent, {movieId}){
            try{
                const movie = await prisma.movie.findFirst({
                    where: { id: Number(movieId) },
                  })

                console.log(movie);
                if(movie) {
                    return movie
                }else {
                  throw new Error('Movie not Found')
                }
            }
            catch (error){
                throw new Error(error)
            }
        },
    },
        Mutation: {
            async createMovie(_, {description, movieName, directorName, releaseDate}, context){
                console.log(description, movieName, directorName, releaseDate);
                
            const user = await checkAuth(context);
                console.log('user', user);

                console.log('=====');
   
            const newMovie = {
                userId: user.id,
                description,
                movieName,
                directorName,
                releaseDate
            };
            console.log('newMovie', newMovie);
            const movie = await prisma.movie.create({data:newMovie});


            return movie;
            },


            async deleteMovie(parent, {movieId}, context){


                const user = checkAuth(context);


                try {
                    const movie = await prisma.movie.findFirst({
                        where: { id: Number(movieId) },
                      })
                    //TODO: need to fix if condition prisma.movie.userName needs to taken from 
                    console.log(user.name);
                    console.log(movie.name);
                if(user.name !== movie.name){
                    console.log('=====', movieId);
                    await prisma.movie.delete({
                        where: {
                          id: +movieId,
                        },
                      })
                      
                    return 'Movie deleted successfuly'
                }else {
                    throw new AuthenticationError('Auction not allowed');
                }
                } catch (error) {
                    throw new Error(error)
                }
            },

            async updateMovie(_, {movieId, description, movieName, directorName, releaseDate}, context){
                console.log(description, movieName, directorName, releaseDate);
                
            const user = await checkAuth(context);
                console.log('user', user);
                try {

                const getMovie = await prisma.movie.findFirst({
                    where: { id: Number(movieId) },
                  })

                  if(!getMovie){
                throw new UserInputError('movie not found', {errors} )
                  }

                  // consider owner of the movie
                if(+user.id === +getMovie.userId){
                    console.log(user.id, getMovie.userId);
                console.log('=====');
   
            const newMovie = {
                description,
                movieName,
                directorName,
                releaseDate
            };
            console.log('newMovie', newMovie);
            const movie = await prisma.movie.update({
                where: { id: +movieId},
                data: newMovie,
              })

            return movie;
            }else {
                throw new AuthenticationError('Auction not allowed');

            }
        } catch (error) {
            throw new Error(error)
        }
        }
        }
}
