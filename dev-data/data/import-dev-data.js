const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './../../config.env' });

const DATABASE =
  'mongodb+srv://waqas:<PASSWORD>@cluster0.mzy3t.mongodb.net/natours?retryWrites=true&w=majority';
const DATABASE_PASSWORD = 'waqas123';
const DB = DATABASE.replace('<PASSWORD>', DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    //for connecting locally
    //process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database successfully connected');
  });

//READ FILE
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const review = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//iMPORT DATA
const importData = async () => {
  try {
    await Tour.create(tour);
    await User.create(user, { validateBeforeSave: false });
    await Review.create(review);
    console.log('Data successfully imported');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deletData = async () => {
  try {
    await Tour.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});
    console.log('Data successfully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deletData();
}

console.log(process.argv);
