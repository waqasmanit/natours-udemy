const express = require('express');
const path = require('path');

const app = express();
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes.js');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
//for setting pug template engine
app.enable('trust proxy');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//for cors
app.use(cors());
app.options('*', cors());
//for serving static files
app.use(express.static(path.join(__dirname, 'public')));

//set security http headers
app.use(helmet());

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

//for embedding body object to req object
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extends: true, limit: '10kb' }));
app.use(cookieParser());

//data sanitization against NoSql query injection
app.use(mongoSanitize());

//Data sanitization against xss
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use(compression());

//Third party middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//used for limiting request made by same client,helps in avoiding brute force attack
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'TO many request from this ip, try again in an hour !!',
});
app.use('/api', limiter);

//user defined middleware, it will be called for every request
//because there is no route defined
// app.use((req, res, next) => {
//   console.log('Hello from middleware ;(');
//   next();
// });
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
//for unhandled routes because if reach this point then it is beacause none of router have
//these routes to handle
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
