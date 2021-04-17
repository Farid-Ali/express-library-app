var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//setup genere schema
var GenereSchema = new Schema(
  {
    name: {type: String, required: true, minLength: 3, maxLength: 100},
  }
);

//virtual for genere's URL
GenereSchema
  .virtual('url')
  .get(function() {
    return '/catalog/genere/' + this._id;
  });

  //export model
  module.exports = mongoose.model('Genere', GenereSchema);