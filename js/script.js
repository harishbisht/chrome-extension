// CHROME EXTENSION STORE VARIABLE IN YOUR BROWSER
// 1. userid
// 2. password
// 3. is_credentials_valid
// 4. dynamic variable for today $date_in_time

function show_time(in_time) {
  console.log(in_time)
  var in_time = new Date(in_time);
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
    if (i < 10) {
      i = "0" + i
    }; // add zero in front of numbers < 10
    return i;
  }
  hours = checkTime(hours)
  minutes = checkTime(minutes)
  seconds = checkTime(seconds)
  document.getElementById('txt').innerHTML = "<p>Total Time in office: " + hours + ":" + minutes + ":" + seconds + "</p>";
}

function generate_key() {
  var date_obj = new Date();
  var key = date_obj.toDateString().replace(/\s/g, '');
  return key
}

function main() {
  // check today key exist, if not create a key in chrome storage
  key = generate_key()
  // check if value exist

  chrome.storage.sync.get(key, function (data) {
    if (typeof data[key] === 'undefined') {
      // if not set then set it
      // check the credentials and call the api
      chrome.storage.sync.get("is_credentials_valid", function (data) {
        console.log(data)
        if (typeof data.is_credentials_valid === 'undefined') {
          document.getElementById('txt').innerHTML = "click on new credentials and enter your ADT ID and password"
        } else if (data.is_credentials_valid == "false") {
          document.getElementById('txt').innerHTML = "click on new credentials and update your ADT ID and password"
        } else if (data.is_credentials_valid == "true") {
          chrome.storage.sync.get(null, function (data) {
            check_connection(data.userid, data.password);
          });
        }

      });
      //

    } else {
      show_time(data[key])
    }
  });
}


function fetch_intime_from_server(userid, password) {
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://tornados.herokuapp.com/",
    "method": "POST",
    "headers": {
      "content-type": "application/json"
    },
    "processData": false,
    "data": "{\"userid\":\"" + userid + "\",\n\"password\":\"" + password + "\"}"
  }
  $.ajax(settings).done(function (response) {
    console.log(response)
    var in_time = response['datetime'];
    if (in_time == "NA") {
      document.getElementById('txt').innerHTML = "No checkIn time found for today"
    } else {
      var dict = {}
      dict[key] = in_time
      console.log(dict)
      chrome.storage.sync.set(dict, function () {});
      main();
    }
  });
}

function check_connection(userid, password) {
  if (userid && password) {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://tornados.herokuapp.com/",
      "method": "POST",
      "headers": {
        "content-type": "application/json"
      },
      "processData": false,
      "data": "{\"userid\":\"" + userid + "\",\n\"password\":\"" + password + "\",\"only_validate\":\"true\"" + "}"
    }
    console.log("got it")
    $.ajax(settings).done(function (response) {
      // update userid and password in chrome extension
      if (response.validated == true && response.err == undefined) {
        chrome.storage.sync.set({
          "userid": userid
        }, function () {});
        chrome.storage.sync.set({
          "password": password
        }, function () {});
        chrome.storage.sync.set({
          "is_credentials_valid": "true"
        }, function () {});
        console.log(response)
        fetch_intime_from_server(userid, password)
      } else {
        chrome.storage.sync.set({
          "is_credentials_valid": "false"
        }, function () {});
        console.log("invalid");
        document.getElementById('txt').innerHTML = "Invalid Credentials please enter again"
      }
    }).fail(function () {
      alert('request failed');
    });
  } //if ends here
}

function authenticate_user() {
  var userid = document.getElementById("userid").value;
  var password = document.getElementById("password").value;

  // cleaning old storage if any
  chrome.storage.sync.clear()
  // Check that there's some code there.
  if (userid && password) {
    check_connection(userid, password);
    return 1;
  } else {
    document.getElementById('txt').innerHTML = "Enter your credentials"
  }
}


$(document).ready(function () {
  // starting point of app
  main();
  $("#button").bind("click", function (event) {
    document.getElementById('txt').innerHTML = "Wait. validating your credentials..."
    authenticate_user()
  });
});