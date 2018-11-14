
function check_connection()
{


}

function authenticate_user()
{       var user_id = document.getElementById("user_id").value;
        var password = document.getElementById("password").value;
        // Check that there's some code there.
        if (user_id && password) {
          check_connection();
          alert("asdf")
          return;
        }
        // Save it using the Chrome extension storage API.
        chrome.storage.sync.set({'user_id': user_id}, function() {
          // Notify that we saved.
          message('Settings saved');
        });
        chrome.storage.sync.set({'password': password}, function() {
          // Notify that we saved.
          message('Settings saved');
        });
}


function main() {
  // Initialization work goes here.

}


$( document ).ready(function() {
  $( "#button" ).bind( "click", function( event ) {
    authenticate_user()
  });
});



