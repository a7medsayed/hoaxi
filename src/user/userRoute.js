const express = require('express');

const router = express.Router();

const userServices = require('./userService');

const { check, validationResult } = require('express-validator');

const validateUsername = (req, res, next) => {
  const user = req.body;
  if (user.username === null) {
    req.validationErrors = {
      username: 'username cannot be null',
    };
  }
  next();
};

const validateEmail = (req, res, next) => {
  const user = req.body;
  if (user.email === null) {
    req.validationErrors = {
      ...req.validationErrors,
      email: 'email cannot be null',
    };
  }
  next();
};

router.post(
  '/api/1.0/users',
  check('username')
    .notEmpty()
    .withMessage('usernameCannotBeNull')
    .bail()
    .isLength({ min: 4, max: 32 })
    .withMessage('usernameLength'),
  check('email')
  .notEmpty()
  .withMessage('emailCannotBeNull')
  .bail()
  .isEmail()
  .withMessage('notvalidEmail')
  .bail()
  .custom(async (email)=>{

    const user1  = await userServices.findByEmail(email);
    if(user1)
    {
      throw new Error('emailInUse');
    }

  }),
  check('password')
    .notEmpty()
    .withMessage('passwordCannotBeNull')
    .bail()
    .isLength({ min: 6 }) 
    .withMessage('passwordLength')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('passwordPattern')
   ,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors.array().forEach((err) => {
        validationErrors[err.param] = req.t(err.msg);
      });
      return res.status(400).send({
        validationErrors: validationErrors,
      });
    }

    await userServices.saveUser(req.body);
    return res.send({
      message: 'user created',
    });
   }
);

module.exports = router;
