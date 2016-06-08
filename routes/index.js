var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', attachDB, function(req, res, next) {
  res.render('index');
});

router.get('/about-us', function(req, res, next) {
  res.render('about-us');
});

router.get('/contacts', function(req, res, next) {
  res.render('contacts');
});

router.get('/enroll', function(req, res, next) {
  res.render('enroll');
});

module.exports = router;
