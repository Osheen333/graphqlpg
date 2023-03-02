const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const User = require('../../schema');
const {validateRegisterInput, validateLoginInput} = require('../../util/validators')
const {UserInputError } = require('apollo-server');
const { prisma } = require("../../database.js");


const { SECRET_KEY } = require('../../config')


function generateToken(user){
   return jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name
    }, SECRET_KEY, { expiresIn: '3h'});
}
module.exports = {


    Mutation: {
        async login(parent, { name, password}){

            console.clear();
            console.log({name, password});
            const {errors, valid } = validateLoginInput(name, password);
           
            if(!valid) {
                throw new UserInputError('Errors', {errors} )
            }
            const user = await prisma.user.findFirst({
                where: { name: String(name) },
              });

            if(!user) {
                errors.general = "User not found ";
                throw new UserInputError('Wrong Credentials', {errors});


            }
            const match = await bcrypt.compare(password, user.password);
            if(!match) {
                errors.general = "Wrong credentials";
                throw new UserInputError("Wrong credentails", { errors});
            }
            const token = generateToken(user);


            return {
                ...user,
                token
            }
        },




      async register(parent, {registerInput:  {
            name, email, password, confirmPassword
        }}, context, info){
            // TODO: validate user data
            const {valid, errors } = validateRegisterInput(name, email, password, confirmPassword)


            if(!valid) {
                throw new UserInputError('Error', {errors} )
            }
            
            // TODO: Make sure user doesn't already  exists
            const user = await prisma.user.findFirst({
                where: { name: String(name) },
              })
            if(user){
                throw new UserInputError('name is taken', {
                    errors: {
                        name: 'This name is Taken'
                    }
                })
            }


            // TODO: hash password and create auth token
            password = await bcrypt.hash(password, 12);


            const newUser = {
                email,
                name,
                password,
            };

            const res =  await prisma.user.create({data:newUser})
            


            const token = await generateToken(res);

                console.log('res========', res);
                console.log('token ===', token);
            return {
                ...res,
                token
            }
        },
       
    }
}
