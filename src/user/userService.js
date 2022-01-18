
const userEntity = require('./user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emailService = require('../email/EmailService')

const generateUserToken =  (length)=>{

  return crypto.randomBytes(length).toString('hex').substring(0, length);
}

const saveUser = async (user) =>{

  const {username  , email} = user;
    const hashedPassword =   await  bcrypt.hash(user.password , 10);

     user = {username , email, password: hashedPassword ,activationToken: generateUserToken(10)};
    
     await  userEntity.create(user);

   await  emailService.sendEmailActivation(email , user.activationToken);


    
}

const findByEmail = async (email) =>{


   
  return  await  userEntity.findOne({where:{email:email}});
}

module.exports = {saveUser , findByEmail};