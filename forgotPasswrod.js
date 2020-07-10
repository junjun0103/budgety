var resetPassword = (function () {
  var DOMstrings = {
    formForgotPassword: 'forgotPassword__form',
    email: '.forgotPassword__email',
  };

  var sendPasswordReset = function (email) {
    // [START sendpasswordemail]
    firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(function () {
        // Password Reset Email Sent!
        // [START_EXCLUDE]
        alert('Password Reset Email Sent!');
        // [END_EXCLUDE]
      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode == 'auth/invalid-email') {
          alert(errorMessage);
        } else if (errorCode == 'auth/user-not-found') {
          alert(errorMessage);
        }
        console.log(error);
        // [END_EXCLUDE]
      });
    // [END sendpasswordemail];
  };

  var forgotPassword = function () {
    var emailAddress = document.querySelector(DOMstrings.email).value;
    sendPasswordReset(emailAddress);
  };

  return {
    init: function () {
      document
        .getElementById(DOMstrings.formForgotPassword)
        .addEventListener('submit', forgotPassword);
    },
  };
})();

resetPassword.init();
