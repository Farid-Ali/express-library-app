var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
var async = require('async');
const { body, validationResult } = require('express-validator');

exports.index = function(req, res) {

  async.parallel({
    book_count: function(callback) {
      Book.countDocuments({}, callback);
    },
    book_instance_count: function(callback) {
      BookInstance.countDocuments({}, callback);
    },
    book_instance_available_count: function(callback) {
      BookInstance.countDocuments({status: 'Available'}, callback);
    },
    author_count: function(callback) {
      Author.countDocuments({}, callback);
    },
    genre_count: function(callback) {
      Genre.countDocuments({}, callback);
    }
  }, function(err, results) {
    res.render('index', { title: 'Express Library App Home', error: err, data: results});
  });
};

// Display list of all books.
exports.book_list = function(req, res, next) {
  
  Book.find({}, 'title author')
    .populate('author')
    .exec(function (err, list_books) {
      if (err) { return next(err); }
      //Successful so render
      res.render('book_list', {title: 'Book List', book_list: list_books });
    });
};

// Display detail page for a specific book.
exports.book_detail = function(req, res) {
  async.parallel({
    book: function(callback) {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genere')
        .exec(callback);
    },
    book_instance: function(callback) {
      BookInstance.find({ 'book': req.params.id })
        .exec(callback);
    },
  }, function(err, results) {
    if (err) { return next(err); }
    if (results.book == null ) {
      var err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    console.log(results);
    //successful, so render
    res.render('book_detail', { title: results.book.title, book: results.book, book_instance: results.book_instance });
  });
};

// Display book create form on GET.
exports.book_create_get = function(req, res) {
  // get all authors and genres, which we can use for adding to our book
  async.parallel({
    authors: function(callback) {
      Author.find(callback);
    },
    genres: function(callback) {
      Genre.find(callback);
    }
  }, function(err, results) {
    if (err) { return next(err); }
    res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, book: 'undefined', errors: 'undefined' });
  });
};

// Handle book create on POST.
exports.book_create_post = [
  // convert the genre to an array
  (req, res, next) => {
    if (!(req.body.genere instanceof Array)) {
      if (typeof req.body.genere === 'undefined')
      req.body.genere = []
      else
      req.body.genere = new Array(req.body.genere);
    }
    next();
  },

  //validate and sanitize fields
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1}).escape(),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('isbn', 'ISBN must not be empty.').trim().isLength({ min: 1}).escape(),
  body('genere.*').escape(),

  //process request after validation and sanitization
  (req, res, next) => {
    // extract the validation errors from a request
    const errors = validationResult(req);

    // create a book object with escaped and trimmed data
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genere: req.body.genere
    });

    if (!errors.isEmpty()) {
      // there are errors. render the form again with sanitized values/error messages.

      // get all authors and genres for form
      async.parallel({
        authors: function(callback) {
          Author.find(callback);
        },
        genres: function(callback) {
          Genre.find(callback);
        },
      }, function(err, results) {
        if (err) { return next(err); }
        // mark our selected genres as checked
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genere.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
      });
      return;
    } else {
      //data from form is valid. save book.
      book.save(function(err) {
        if (err) { return next(err); }
        // successful - redirect to new book record.
        res.redirect(book.url);
      });
    }
  },
];

// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res, next) {
  // get book, authors and genres for form
  async.parallel({
    book: function(callback) {
      Book.findById(req.params.id)
      .populate('author')
      .populate('genere')
      .exec(callback);
    },
    authors: function(callback) {
      Author.find(callback);
    },
    genres: function(callback) {
      Genre.find(callback);
    }
  }, function(err, results) {
    if (err) { return next(err); }
    if (results.book === null) {
      var err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    //success
    // mark our selected genres as checked
    for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
      for (var book_g_iter = 0; book_g_iter < results.book.length; book_g_iter++) {
        if (results.genres[all_g_iter]._id.toString() === results.book.genre[book_g_iter]._id.toString()) {
          results.genres[all_g_iter].checked = 'true';
        }
      }
    }
    res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book, errors: 'undefined' });
  });
};

// Handle book update on POST.
exports.book_update_post = [
  // convert the genre to an array
  (req, res, next) => {
    if (!(req.body.genere instanceof Array)) {
      if (typeof req.body.genere === 'undefined') {
        req.body.genere = [];
      } else {
        req.body.genere = new Array(req.body.genere);
      }
    }
    next();
  },

  //validate and sanitise fields
  body('title', 'Title must not be empty').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty').trim().isLength({ min: 1 }).escape(),
  body('summary', 'Summary must not be empty').trim().isLength({ min: 1 }).escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genere.*').escape(),

  // process request after validation and sanitization
  (req, res, next) => {
    //extract the validation errors from a request
    const errors = validationResult(req);

    // create a book object with escaped/trimmed data and old id
    var book = new Book(
      {
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genere: (typeof req.body.genere === 'undefined') ? [] : req.body.genere,
        _id: req.params.id //this is required, or a new id will be assigned
      }
    );

    if (!errors.isEmpty()) {
      //there are errors. render form again with sanitized values/error messages.

      // get all authors and genres for form
      async.parallel({
        authors: function(callback) {
          Author.find(callback);
        },
        genres: function(callback) {
          Genre.find(callback);
        },
      }, function(err, results) {
        if (err) { return next(err); }
        //mark our selected genres as checked
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genere.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
        res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
      });
      return;
    } else {
      // data from form is valid. update the record
      Book.findByIdAndUpdate(req.params.id, book, {}, function(err, thebook) {
        if (err) { return next(err); }
        //succesful - redirect to book detail page
        res.redirect(thebook.url);
      });
    }
  }
];