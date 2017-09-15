// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");


var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

mongoose.Promise = Promise;

var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

var databaseUri = "mongod://localhost/onionScrape";

// Database configuration with mongoose
if (process.env.MONGOD_URI) {
    mongoose.connect(process.env.MONGOD_URI);
}
else {
    mongoose.connect("mongodb://localhost/onionScrape");

}
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======

// A GET request to scrape the echojs website
app.get("/peel", function(req, res) {
  request("http://www.theonion.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    $("article.summary").each(function(i, element) {
      var result = {};
      var base = "http://www.theonion.com";

      result.title = $(this).children("div.info").children("div.inner").children("header").children().children().attr("title");
      result.link = base + $(this).children("a.handler").attr("href");
      result.summary = $(this).children("div.info").children("div.inner").children("div.desc").text();


      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });

    });
  });

  res.redirect("/");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  Article.find({}).sort({date: 1}).exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  Article.findOne({ "_id": req.params.id }).populate("note").exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});


// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);

  newNote.save(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id }).exec(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          res.send(doc);
        }
      });
    }
  });
});


app.get("/marksaved/:id", function(req, res) {
    Article.findOneAndUpdate({"_id": req.params.id}, {$set: {saved: true}}, function(err, data) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(data);
        }
    })
})

app.get("/markunsaved/:id", function(req, res) {
    Article.findOneAndUpdate({"_id": req.params.id}, {$set: {saved: false}}, function(err, data) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(data);
        }
    })
})



// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
