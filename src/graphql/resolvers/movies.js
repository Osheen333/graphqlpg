const { AuthenticationError } = require('apollo-server');
const { prisma } = require("../../database.js");
const checkAuth = require('../../util/check-auth')


module.exports = {
    Query: {
        async getMovies(_, {offset = 2, limit= 5, search}, context){
            try {
                const movies = await prisma.movie.findMany({
                    where: {
                        OR: [
                          {
                            description: {
                              contains: search
                            }
                          },
                          {
                            directorName: {
                              contains: search
                            }
                          },
                          {
                            movieName: {
                              contains: search
                            }
                          }
                        ]
                      },                    
                    skip: offset,
                    take: limit,
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
                
            const user = await checkAuth(context);

   
            const newMovie = {
                userId: user.id,
                description,
                movieName,
                directorName,
                releaseDate
            };
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
                if(user.id === movie.userId){
                    await prisma.$executeRaw`

                    DELETE FROM movie
                    WHERE id = 1;
                  
                  `
                    
                    delete({
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
                
            const user = await checkAuth(context);
                try {

                const getMovie = await prisma.movie.findFirst({
                    where: { id: Number(movieId) },
                  })

                  if(!getMovie){
                throw new UserInputError('movie not found', {errors} )
                  }

                  // consider owner of the movie
                if(+user.id === +getMovie.userId){
   
            const newMovie = {
                description,
                movieName,
                directorName,
                releaseDate
            };
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
