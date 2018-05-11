let config = {
  apiKey: "AIzaSyDY2koLmpABB65fwaf0HHhBfzuK6mc_jRc",
  authDomain: "ae-aglity-challenge.firebaseapp.com",
  databaseURL: "https://ae-aglity-challenge.firebaseio.com",
  projectId: "ae-aglity-challenge",
  storageBucket: "ae-aglity-challenge.appspot.com",
  messagingSenderId: "302554562396"
};

let email = 'user1@mail.io';
let pass = 'user1@mail.io';

let app = firebase.initializeApp(config);
let db = firebase.database();
let login = function() {
  firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
    // ...
  }).then(function() {
    console.log('Ready');
  });
}
login();

window.onload = function() {

  let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
  scanner.addListener('scan', function (content) {
    console.log(content);
    if(content.match(/^[a-zA-Z0-9]*$/)) {
      // Get data, ammend data
      let type;
      let isRedeemed;
      let value;
      db.ref(`codes/${content}`).once('value').then(snapshot => {
        value = snapshot.val();
        if(value) {
          type = value.type;
          isRedeemed = value.redeemed;
          if(!isRedeemed) {
            db.ref(`codes/${content}/redeemed`)
              .set(1)
              .catch(e => {
                console.log(e);
              })
              .then(() => {
                alert(`You have successfully redeemed your ${type} of reward!`);
              });
          } else alert('This code has been redeemed!');
        } else  alert ('This code doesn\'t exist');
      });
      
    } else {
      alert('The QR code doens\'t follow the format');
    }

  });
  Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
      scanner.start(cameras[0]);
    } else {
      console.error('No cameras found.');
    }
  }).catch(function (e) {
    console.error(e);
  });

}