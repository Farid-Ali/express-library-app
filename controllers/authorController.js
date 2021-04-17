var Author = require('../models/author');

//Display list of all authors
exports.author_list = function(req, res) {
  res.send('Not Implemented: Author list');
};

//Display detail page for a specific author
exports.author_detail = function(req, res) {
  res.send('Not Implemented: Author detail: ' + req.params.id);
};

//Display author create form on GET
exports.author_create_get = function(req, res) {
  res.send('Not Implemented: Author create GET');
};

//Handle author create on POST
exports.author_create_post = function(req, res) {
  res.send('Not Implemented: Author create POST');
};

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