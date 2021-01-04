const catchasync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIfeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchasync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchasync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchasync(async (req, res, next) => {
    //  const newTour = new Tour({})
    //  newTour.save()

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchasync(async (req, res, next) => {
    //Tour.findOne({_id:req.params.id})
    let query = Model.findById(req.params.id).populate('reviews');
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchasync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //EXECUTE QUERY
    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //const doc = await features.query.explain()
    const doc = await features.query;

    //Send response
    res.status(200).json({
      status: 'success',

      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
