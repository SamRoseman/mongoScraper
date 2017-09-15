// Grab the articles as a json
$.getJSON("/articles", function(data) {
  for (var i = 0; i < data.length; i++) {
    var html = "<div class='row'>";
    html += "<div class='col s12'>";
    html+= "<div class='card blue-grey darken-1'>";
    html += "<div class='card-content white-text'>";
    html += "<a href='" + data[i].link + "' target='_blank' class='card-title'>"+ data[i].title +"</a>";
    html += " <p> "+ data[i].summary +"</p> </div>";
    html += "<div class='card-action'>";
    html +=  "<a href='"+ data[i].link +"' target='_blank''>Read It!</a>";
    html +=  "<a id='writenote' data-id='" + data[i]._id + "'>Add a Note!</a>";
    html +=  "<a id='save-art' data-id='" + data[i]._id + "'>Save It!</a>";
    html +=  "<a id='un-save-art' data-id='" + data[i]._id + "'>Un-Save It!</a>";
    html += "</div></div></div></div>";
    $("#articles").append(html);
  }
});

$(document).on("click", "#writenote", function() {
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      // The title of the article
      $("#notes").append("<h6>" + data.title + "</h6>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});


$(document).on("click", "#save-art", function() {
        var thisId = $(this).attr("data-id");
        $.ajax({
            method: "GET",
            url: "/marksaved/" + thisId
        }).done(function(){
            $(this).text("Saved!");
        });
    });

$(document).on("click", "#un-save-art", function() {
        var thisId = $(this).attr("data-id");
        $.ajax({
            method: "GET",
            url: "/markunsaved/" + thisId
        }).done(function(){
            $(this).text("Save It!");
        });

});
