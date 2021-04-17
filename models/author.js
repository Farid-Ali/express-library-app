var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//set up author schema
var AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, maxLength: 100 },
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

//virtual for author's full name
AuthorSchema
  .virtual('name')
  .get(function() {
    return this.family_name + ', ' + this.first_name;
  });

  //virtual for author's lifespan
  AuthorSchema
    .virtual('lifespan')
    .get(function() {
      return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
    });

//virtual for author's URL
AuthorSchema
  .virtual('url')
  .get(function() {
    return '/catalog/author/' + this._id;
  });

  //export model
  module.exports = mongoose.model('Author', AuthorSchema);