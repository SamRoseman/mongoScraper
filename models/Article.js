// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  summary: {
      type: String,
  },
  saved: {
      type: Boolean,
      required: true,
      default: false
  },
  date: {
      type: Date,
      default: Date.now

  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
    }
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;
