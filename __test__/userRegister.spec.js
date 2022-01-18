const request = require('supertest');

const app = require('../src/app');

const user = require('../src/user/User');

const sequelize = require('../src/config/database');
const nodeMailerStub = require('nodemailer-stub');

beforeAll(() => {
 return sequelize.sync({force:true});
});

beforeEach(() => {
  return user.destroy({
    truncate: true,
  });
});
const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'password4P',
};

const postUser = (user = validUser , options = {}) => {
  const agent  = request(app).post('/api/1.0/users');
  if(options.language)
  {
    agent.set('accept-header' , options.language);
  }
  return agent.send(user);
};

describe('User Registeration', () => {



  it('return 200 satatus code when user successfuly registerd', async () => {
    const response = await postUser();

    expect(response.status).toBe(200);
  });

  it('return success message   when user successfuly registerd', async () => {
    const response = await postUser();

    expect(response.body.message).toBe('user created');
  });

  it('Save User to DataBase', async () => {
    await postUser();
    const userList = await user.findAll();

    expect(userList.length).toBe(1);
  });

  it('Save specific User to DataBase', async () => {
    await postUser();
    const userList = await user.findAll();

    expect(userList[0].username).toBe('user1');
    expect(userList[0].email).toBe('user1@mail.com');
  });

  it('Check if User Password is hashed in database', async () => {
    await postUser();
    const userList = await user.findAll();

    expect(userList[0].password).not.toBe('password');
  });

  it('return 400 status if username is null', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'password4P',
    });

    expect((await response).status).toBe(400);
  });

  it('return validation error object for invalid user', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'password4P',
    });
    const body = response.body;
    expect(body.validationErrors).not.toBeUndefined();
  });



  // it('return username cannot be null if username is null',async()=>{

  //   const response = await postUser(
  //     {
  //       username: null,
  //       email: 'user1@mail.com',
  //       password: 'password',
  //     }
  //   )

  //   const body = response.body;
  //   expect(body.validationErrors.username).toBe("username cannot be null");

  // });

  // it('return email cannot be null if email is null',async()=>{

  //   const response = await postUser(
  //     {
  //       username: 'user1',
  //       email: null,
  //       password: 'password',
  //     }
  //   )

  //   const body = response.body;
  //   expect(body.validationErrors.email).toBe("email cannot be null");

  // });

  // it('return password cannot be null if passowrd is null',async()=>{

  //   const response = await postUser(
  //     {
  //       username: 'user1',
  //       email: 'user1@mail.com',
  //       password: null,
  //     }
  //   )

  //   const body = response.body;
  //   expect(body.validationErrors.password).toBe("password cannot be null");

  // });

  // it.each([
  //   ['username', 'username cannot be null'],
  //   ['email', 'email cannot be null'],
  //   ['password', 'password cannot be null'],
  // ])('return $s if the value of $s is null', async (field, expectedMessage) => {
  //   const user = {
  //     username: 'user1',
  //     email: 'user1@mail.com',
  //     password: 'password',
  //   };

  //   user[field] = null;

  //   const response = await postUser(user);

  //   const body = response.body;
  //   expect(body.validationErrors[field]).toBe(expectedMessage);
  // });

  const usernameCannotBeNull = 'username cannot be null';
  const emailCannotBeNull = 'email cannot be null';
  const passwordCannotBeNull = 'password cannot be null';
  const usernameLength = 'username must be min 4 char and max 32 char';
  const passwordLength = 'password must be atleast 6 character';
  const notvalidEmail = 'email is not valid';
  const emailInUse = 'e-mail in use';
  const passwordPattern = 'password must have atleast 1 Uppercase , 1 lowercase letter, 1 number';


  it.each`
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${usernameCannotBeNull}
    ${'username'} | ${'usr'}           | ${usernameLength}
    ${'username'} | ${'us'.repeat(32)} | ${usernameLength}
    ${'email'}    | ${null}            | ${emailCannotBeNull}
    ${'email'}    | ${'email.com'}     | ${notvalidEmail}
    ${'email'}    | ${'@.com'}         | ${notvalidEmail}
    ${'email'}    | ${'user.mail.com'} | ${notvalidEmail}
    ${'email'}    | ${'user@mail'}     | ${notvalidEmail}
    ${'password'} | ${null}            | ${passwordCannotBeNull}
    ${'password'} | ${'pas'}           | ${passwordLength}
    ${'password'} | ${'alllowercase'}  | ${passwordPattern}
    ${'password'} | ${'ALLUPPER'}  | ${passwordPattern}
    ${'password'} | ${'1236589'}  | ${passwordPattern}
    ${'password'} | ${'onlylowerandUPPER'}  | ${passwordPattern}
    ${'password'} | ${'UPPER12354'}  | ${passwordPattern}
  `('return $expectedMessage if $field is $value', async ({ field, expectedMessage, value }) => {
    const user = {
      username: 'user1',
      email: 'user1@mail.com',
      password: 'password',
    };

    user[field] = value;

    const response = await postUser(user);

    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  it('return validationErrors object with email and username cannot be null if email and username is null', async () => {
    const response = await postUser({
      username: null,
      email: null,
      password: 'password4P',
    });

    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });

  it('return e-mail in use if email is used', async () => {

   await user.create({...validUser});

    const response = await postUser();

    const body = response.body;
    expect(body.validationErrors.email).toBe(emailInUse);
  });

  it('return e-mail and username in error object  if email is used and username is null', async () => {

    await user.create({...validUser});

    const response = await postUser({
      username:null,
      email:validUser.email,
      password:validUser.password,
    });

    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });

  it('create user in inactive mode' , async ()=>{

    await postUser();
    const users = await user.findAll();
    const savedUser = users[0];
    expect(savedUser.inActive).toBe(true);

  });

  it('create user in inactive mode even inActive feild is false' , async ()=>{

    await postUser({...validUser , inActive: false});
    const users = await user.findAll();
    const savedUser = users[0];
    expect(savedUser.inActive).toBe(true);

  });

  it('create user in inactive mode with activationToken' , async ()=>{

    await postUser();
    const users = await user.findAll();
    const savedUser = users[0];
    expect(savedUser.activationToken).toBeTruthy();

  });

  it('send an user activation email with activationToken' , async ()=>{

    await postUser();

    const lastMail = nodeMailerStub.interactsWithMail.lastMail();

    expect(lastMail.to[0]).toBe(validUser.email);
    const users = await user.findAll();
    const savedUser = users[0];
    
    expect(lastMail.content).toContain(savedUser.activationToken);

  })
});

describe('Internationalization', () => {

  const postUser = (user = validUser) => {
    return request(app).post('/api/1.0/users').set('accept-language' , 'ar').send(user);
  };

  
  const usernameCannotBeNull = 'يجب ادخال اسم المستخدم';
  const emailCannotBeNull = 'يجب ادخال الايميل';
  const passwordCannotBeNull = 'يجب ادخال الرقم السري';
  const usernameLength = 'اسم المستخدم لايقل عن 4 خانات ولا يزيد عن 32 خانة';
  const passwordLength = 'الرقم السري لا يقل عن 6 خانات';
  const notvalidEmail = 'الايميل غير صحيح';
  const emailInUse = 'الايميل مستخدم من قبل';
  const passwordPattern = 'الرقم السري يجب ان يحتوي على حرف كبير وحرف صغير ورقم';


  it.each`
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${usernameCannotBeNull}
    ${'username'} | ${'usr'}           | ${usernameLength}
    ${'username'} | ${'us'.repeat(32)} | ${usernameLength}
    ${'email'}    | ${null}            | ${emailCannotBeNull}
    ${'email'}    | ${'email.com'}     | ${notvalidEmail}
    ${'email'}    | ${'@.com'}         | ${notvalidEmail}
    ${'email'}    | ${'user.mail.com'} | ${notvalidEmail}
    ${'email'}    | ${'user@mail'}     | ${notvalidEmail}
    ${'password'} | ${null}            | ${passwordCannotBeNull}
    ${'password'} | ${'pas'}           | ${passwordLength}
    ${'password'} | ${'alllowercase'}  | ${passwordPattern}
    ${'password'} | ${'ALLUPPER'}  | ${passwordPattern}
    ${'password'} | ${'1236589'}  | ${passwordPattern}
    ${'password'} | ${'onlylowerandUPPER'}  | ${passwordPattern}
    ${'password'} | ${'UPPER12354'}  | ${passwordPattern}
  `('return $expectedMessage if $field is $value', async ({ field, expectedMessage, value }) => {
    const user = {
      username: 'user1',
      email: 'user1@mail.com',
      password: 'password',
    };

    user[field] = value;

    const response = await postUser(user , {language:'ar'});

    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  it('return e-mail in use if email is used', async () => {

    await user.create({...validUser});
 
     const response = await postUser({...validUser} ,{language:'ar'} );
 
     const body = response.body;
     expect(body.validationErrors.email).toBe(emailInUse);
   });

});

