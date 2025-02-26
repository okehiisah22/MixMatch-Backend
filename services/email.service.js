const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const nodemailer = require('nodemailer');

const headerTemplate = fs.readFileSync(
  path.join(process.cwd(), 'services/templates/header.hbs'),
  'utf8'
);
const footerTemplate = fs.readFileSync(
  path.join(process.cwd(), 'services/templates/footer.hbs'),
  'utf8'
);

handlebars.registerPartial('header', headerTemplate);
handlebars.registerPartial('footer', footerTemplate);

exports.sendEmail = async (email, subject, template, context) => {
  try {
    const templateFile = fs.readFileSync(
      path.join(process.cwd(), `/services/templates/${template}.hbs`),
      'utf8'
    );

    const templateData = handlebars.compile(templateFile);

    const transporter = nodemailer.createTransport({
      port: 465,
      host: 'smtp.zoho.com',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
      secure: true,
    });

    await transporter.verify();
    console.log('Server is ready to take our messages');

    // Send email
    const info = await transporter.sendMail({
      from: {
        name: 'Mixmatch',
        address: process.env.EMAIL,
      },
      to: typeof email === 'string' ? email?.toString() : email,
      subject: subject,
      html: templateData(context),
    });

    console.log(info, 'Email sent successfully');
    return info;
  } catch (error) {
    console.error(error, 'Failed to send email');
    throw error;
  }
};
