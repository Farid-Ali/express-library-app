var Author = require('../models/author');
var async = require('async');
var Book = require('../models/book');
const { body, validationResult } = require('express-validator');
const e = require('express');

//Display list of all authors
exports.author_list = function(req, res) {
  Author.find()
    .sort([['family_name', 'ascending']])
    .exec(function(err, list_authors) {
      if (err) { return next(err); }
      //successful, so render
      res.render('author_list', { title: 'Author List', author_list: list_authors });
    });
};

//Display detail page for a specific author
exports.author_detail = function(req, res) {
  
  async.parallel({
    author: function(callback) {
      Author.findById(req.params.id)
        .exec(callback)
    },
    authors_books: function(callback) {
      Book.find({ 'author': req.params.id }, 'title summary')
        .exec(callback)
    },
  }, function(err, results) {
    if (err) { return next(err); }
    if (results.author == null ) {
      var err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books });
  });
};

//Display author create form on GET
exports.author_create_get = function(req, res, next) {
  res.render('author_form', { title: 'Create Author' });
};

//Handle author create on POST
exports.author_create_post = [
  // validate and sanitize fields
  body('first_name').trim().isLength({ min: 1 }).escape().withMessage('Frist name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumaric characters.'),
  body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumaric characters.'),
  body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('date_of_death', 'Invalid date of death.').optional({ checkFalsy: true }).isISO8601().toDate(),

  //progress request after validation and sanitization
  (req, res, next) => {
    // extract the validation errors from request
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // there are errors. render form again with sanitized values/errors message.
      res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
      return;
    } else {
      // data from form is valid

      // create an author object with escaped and trimmed data.
      var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
      });
      author.save(function(err) {
        if (err) { return next(err); }
        // sucessful, so redirect to new author record
        res.redirect(author.url);
      });
    }
  }
];

//Display author delete form on GET
exports.author_delete_get = function(req, res) {
  res.send('Not Implemented: Author delete GET');
};

//Handle author delete on POST
exports.author_delete_post = function(req, res) {
  res.send('Not Implemented: Author delete POST');
};

//Display author update form on GET
exports.author_update_get = function(req, res) {
  res.send('Not Implemented: Author update GET');
};

//Handle author update on POST
exports.author_update_post = function(req, res) {
  res.send('Not Implemented: Author update POST');
};