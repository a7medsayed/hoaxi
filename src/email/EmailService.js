const transporter = require('../config/emailTransporter');

const sendEmailActivation = async (email , activationToken)=>{
    await transporter.sendMail({
        from: 'My App <info@myapp.com',
        to: email,
        subject: 'Account Activation',
        html: `Token Is ${activationToken}`
      });
}

module.exports = {sendEmailActivation};