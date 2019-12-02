//SıGN UP
document.getElementById("signUp").addEventListener("click", newUser, false);

function newUser() {
    var newUserPassword = document.getElementById("sign-up-password").value;
    var retypedNewUserPassword = document.getElementById("sign-up-password-re").value;
    var newUserName = document.getElementById("sign-up-username").value;
    var newUserEmail = document.getElementById("sign-up-email").value;
    //TODO check retyped password
    if (newUserPassword === retypedNewUserPassword) {
        firebase.auth().createUserWithEmailAndPassword(newUserEmail, newUserPassword).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
            // ...
        });
    } else {
        alert("Passwords you have entered do not match!");
    }

    //alert("done");
}
//lOG IN
document.getElementById("login").addEventListener("click", loginUser, false);

function loginUser() {
    var UserPassword = document.getElementById("log-in-password").value;
    var UserEmail = document.getElementById("log-in-email").value;
    //TODO check retyped password

    firebase.auth().signInWithEmailAndPassword(UserEmail, UserPassword).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert("Provoni perseri.\n Dicka nuk funksionoi teksa po benit hyrjen!");
        // ...
    });



}
// user state changed
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.
        // ...
        localStorage.setItem('selected',1);
        window.location.href = "/editor.html";
    } else {
            console.log('User Not Logged in');
            //fiwindow.location.href = '/index.html';
    
    }
});

//sign out
document.getElementById("signOut").addEventListener("click", signOutUser, false);

function signOutUser() {
    firebase.auth().signOut().then(function() {}).catch(function(error) {

    });

}