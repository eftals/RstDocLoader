
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var DOCSchema = new Schema({
  name: {type : String, default : '', trim : true},
  folder: {type : String, default : '', trim : true},
  guid: {type : String, default : '', trim : true},
  createdAt  : {type : Date, default : Date.now}
})

// Ensure virtual fields are serialised.
DOCSchema.set('toJSON', {
    virtuals: true
});

// Duplicate the ID field.
DOCSchema.virtual('id').get(function(){
    return this._id.toHexString();
});




DOCSchema.statics = {

  /**
   * Find document by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .exec(cb)
  },

  /**
   * List documents
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {}

    this.find(criteria)
      .exec(cb)
  }

}

mongoose.model('DOC', DOCSchema)
