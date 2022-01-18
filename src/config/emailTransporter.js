const nodemailer = require('nodemailer');
const nodeMailerStub = require('nodemailer-stub');
const transporter = nodemailer.createTransport(nodeMailerStub.stubTransport);

module.exports = transporter;