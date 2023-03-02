//* node-graphql/src/schema.js

const { gql } = require('apollo-server')

const typeDefs = gql`

type Movie{
    id: ID
    description: String
    movieName: String!
    createdAt: String
    directorName: String!
    releaseDate: String
    reviewCount: Int!
    reviews: [Review]!
}


type Review {
    id: ID!
    createdAt: String!
    movieId: String!
    userId: String!
    rating: Int
    comments: String
}
type User{
        id: ID!
        email: String!
        token: String!
        name: String!
}

input RegisterInput {
    name: String!
    password: String!
    confirmPassword: String!
    email: String!
}
type Query  {
    getMovies: [Movie]
    getMovie(movieId: ID!): Movie
}
type Mutation {
    register(registerInput: RegisterInput): User!
    login(name: String!, password: String!): User!
    createMovie(description: String, movieName: String!, createdAt: String, directorName: String!, releaseDate: String): Movie!
    deleteMovie(movieId: ID!): String!
    createReview(movieId: String!, body: String!): Movie!
    deleteReview(movieId: ID!, reviewId: ID!): Movie!
}


  type Student {
    id: ID!
    email: String!
    fullName: String!
    dept: String
    enrolled: Boolean
  }

  type Query {
    enrollment: [Student!]
    students: [Student!]!
    student(id: ID!): Student
  }

  type Mutation {
    registerStudent(email: String!, fullName: String!, dept: String): Student!
    enroll(id: ID!): Student
  }
`
module.exports = {
  typeDefs,
}