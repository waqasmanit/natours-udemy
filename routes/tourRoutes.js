const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();
const tourController = require('../controllers/tourController');
const reviewRouter = require('./reviewRoutes');

router.use('/:tourId/reviews', reviewRouter);

//router.param('id', tourController.checkID);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guides'),
    tourController.getMonthlyPlan
  );

router
  .route('/tour-within/:distance/centre/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/top-5-cheap')
  .get(tourController.alisTopTour, tourController.getAllTours);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
