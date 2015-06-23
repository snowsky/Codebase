var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
//var cheerio = require('cheerio');

var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-api-quickstart.json';
var userId = 'hao.1.wang@gmail.com';
var maxResults = 100;

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecret(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
//  authorize(JSON.parse(content), listLabels);
  authorize(JSON.parse(content), listMessages);
});

function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  //Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });

}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth, labelName) {
  var gmail = google.gmail('v1');
  gmail.users.labels.list({
    auth: auth,
    userId: userId,
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var labels = response.labels;
    if (labels.length == 0) {
      console.log('No labels found.');
    } else {
      console.log('Labels:');
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        console.log('- %s', label.name);
      }
    }
  });
}

function listMessages(auth) {
  var gmail = google.gmail('v1');
  var labelId;

  gmail.users.labels.list({
    auth: auth,
    userId: userId,
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var labels = response.labels;
    if (labels.length == 0) {
      console.log('No labels found.');
    } else {
      for (var i = 0; i < labels.length; i++) {
        if (labels[i].name == "hr") {
          labelId = labels[i].id;
          gmail.users.messages.list({
            auth: auth,
            userId: userId,
            labelIds: labelId,
            maxResults: maxResults,
          }, function (err, response) {
            if (err) {
              console.log('list messages failed: ' + err);
              return;
            }
            var messages = response.messages;
            if (messages.length == 0) {
              console.log('No messages found.');
            } else {
              for (var i = 0; i < maxResults; i ++) {
                var message = messages[i];
                //console.log('- %s', extractField(message, "Subject"));
                gmail.users.messages.get({
                  auth: auth,
                  id: message.id,
                  userId: userId,
                  format: "full",
                }, function (err, response) {
                  if (err) {
                    console.log('get messages failed: ' + err);
                    return;
                  } else {
                    console.log(extractField(response, "Subject"));
                  }
                });
        //        console.log('- %s', JSON.stringify(message));
              }
            }
          });

          return;
        }
      }
    }
  });
}

var extractField = function(json, fieldName) {
  return json.payload.headers.filter(function(header) {
    return header.name === fieldName;
  })[0].value;
};
