// CHROME EXTENSION STORE VARIABLE IN YOUR BROWSER
// 1. user_id
// 2. password
// 3. is_credentials_valid
// 4. dynamic variable for today $date_in_time


function check_connection(user_id,password)
{
        // Check that there's some code there.
        if (user_id && password) {
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://tornados.herokuapp.com/",
            "method": "POST",
            "headers": {
              "content-type": "application/json"
            },
            "processData": false,
            "data": "{\"userid\":\"" + user_id + "\",\n\"password\":\"" + password + "\",\"only_validate\":\"true\"" + "}"
          }

          $.ajax(settings).done(function (response) {
            // update userid and password in chrome extension
                    chrome.storage.sync.set({'user_id': userid});
          });

}

function authenticate_user()
{       var user_id = document.getElementById("user_id").value;
        var password = document.getElementById("password").value;
        // Check that there's some code there.

        if (user_id && password) {
          check_connection();
          /*
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://tornados.herokuapp.com/",
            "method": "POST",
            "headers": {
              "content-type": "application/json"
            },
            "processData": false,
            "data": "{\"userid\":\"" + user_id + "\",\n\"password\":\"" + password + "\"}"
          }

          $.ajax(settings).done(function (response) {

            var in_time =  new Date(response['datetime']);
            var now_time = new Date($.now());

            var delta = Math.abs(now_time - in_time) / 1000;
            // calculate (and subtract) whole days
            var days = Math.floor(delta / 86400);
            delta -= days * 86400;
            // calculate (and subtract) whole hours
            var hours = Math.floor(delta / 3600) % 24;
            delta -= hours * 3600;
            // calculate (and subtract) whole minutes
            var minutes = Math.floor(delta / 60) % 60;
            delta -= minutes * 60;
            // what's left is seconds
            var seconds = Math.round(delta % 60);


            function checkTime(i) {
                if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
                return i;
            }
            hours = checkTime(hours)
            minutes = checkTime(minutes)
            seconds = checkTime(seconds)
            document.getElementById('txt').innerHTML = "Total Time in office: " + hours + ":" + minutes + ":" + seconds;
          

          });
          */

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



