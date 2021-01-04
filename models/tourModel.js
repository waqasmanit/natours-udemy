const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Lenght must not exceed 40 characters'],
      minlength: [10, 'Lenght must not preceed 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain alphabets'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour Must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour Must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'It should have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficultu is either easy medium difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'RatingsAverage can not preceed 1'],
      max: [5, 'RatingsAverage can not exceed 5'],
      set: (val) => Math.round(val * 10) * 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to newly created documents and not applicable on update
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) shoulb be below egular price',
      },
    },
    summary: {
      type: String,
      trim: true, //removes the whitespaces before and after string
      required: [true, 'Must have tour summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have imageCover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //mongodb has two properties 'type' and 'coordinate for geospatial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        //address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); // for geosaptial query

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
//Document Middleware
tourSchema.pre('save', function () {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', async function (next) {
  const guidePromise = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidePromise);
  next();
});
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//Query Middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

//Aggeration Middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  //console.log(docs);
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
