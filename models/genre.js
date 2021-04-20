var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//setup genere schema
var GenreSchema = new Schema(
  {
    name: {type: String, required: true, minLength: 3, maxLength: 100},
  }
);

//virtual for genere's URL
GenreSchema
  .virtual('url')
  .get(function() {
    return '/catalog/genre/' + this._id;
  });

  //export model
  module.exports = mongoose.model('Genere', GenreSchema);