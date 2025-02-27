require('dotenv').config();
const express = require('express');

const cors = require('cors');
const logger = require('morgan');

require('./config/passport');
const {
  userRoutes,
  authRoutes,
  bookingRoutes,
  blogRoutes,
} = require('./routes');
const connectDB = require('./db');

const app = express();
const server = socketServer(app);

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: '*',
  })
);

app.use(logger('dev'));

app.get('/', (req, res) => {
  res.send('Welcome to Mixmatch Webservice!');
});

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/blog', blogRoutes);

server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
