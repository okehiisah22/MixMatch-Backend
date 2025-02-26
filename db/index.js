const mongoose = require('mongoose');

module.exports = () => {
  const DB =
    process.env.NODE_ENV === 'development'
      ? process.env.LOCAL_DATABASE
      : process.env.REMOTE_DATABASE;
  console.log(process.env.NODE_ENV, DB);
  mongoose
    .connect(DB)
    .then(() => console.log('Successfully connected to DB'))
    .catch((error) => {
      console.log('An error occurred while connecting to DB:', error);
    });
};
