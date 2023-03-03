const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const User = require('../../schema');
const {validateRegisterInput, validateLoginInput, validateChangePassword} = require('../../util/validators')
const {UserInputError } = require('apollo-server');
const { prisma } = require("../../database.js");
const checkAuth = require('../../util/check-auth')
require('dotenv').config();




function generateToken(user){
   return jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name
    }, process.env.SECRET_KEY, { expiresIn: '3h'});
}
module.exports = {


    Mutation: {
        async login(parent, { email, password}){

            const {errors, valid } = validateLoginInput(email, password);
           
            if(!valid) {
                throw new UserInputError('Errors', {errors} )
            }
            const user = await prisma.user.findFirst({
                where: { email: String(email) },
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
                where: { email: String(email) },
              })
            if(user){
                throw new UserInputError('email is taken', {
                    errors: {
                        email: 'This name is Taken'
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

            return {
                ...res,
                token
            }
        },



        async changePassword(parent, { currentPassword, password, confirmPassword }, context, info){
            // TODO: validate user data
            const {valid, errors } = validateChangePassword( password, confirmPassword)


            if(!valid) {
                throw new UserInputError('Error', {errors} )
            }
            const user = checkAuth(context);

                try {

                    const getUser = await prisma.user.findFirst({
                        where: { id: user.id
                         },
                      });

                      const isPasswordMatch = await bcrypt.compare(
                        currentPassword,
                        getUser.password
                      );
                    
                      if(isPasswordMatch){

                        password = await bcrypt.hash(password, 12);

                        res = await prisma.user.update({
                            where: { id: user.id},
                            data: {password},
                          })
            
                        return res
                        
                      }else{
                         throw new UserInputError("Current password is not correct" )
                      }
                } catch (error) {
                    throw new Error(error)
                    
                }
                
            
            
          
        },
       
    }
}
