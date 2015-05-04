if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.login.events({
  	'submit #login-form' : function (e, t) {
      e.preventDefault();
      var email = t.find('#login-email').value
        , password = t.find('#login-password').value;
        
      //
      
      Meteor.loginWithPassword(email, password, function (err) {
        if (err) {
          console.log("ok");          
        } else {
          console.log("fail");          
        }
      });
      return false;
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
