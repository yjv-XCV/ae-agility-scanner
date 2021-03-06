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
let textForType = {
  agile: 'Agile',
  dispensedAgile: 'Agile',
  yoga: 'Yoga',
}
let scanner_config;


window.onload = function() {
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
      db.ref('scanner_config').once('value', function(snapshot) {
        scanner_config = snapshot.val();
      });
      document.getElementsByClassName('overlay')[0].classList.remove('overlay');
      Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
          scanner.start(cameras[0]);
        } else {
          console.error('No cameras found.');
        }
      }).catch(function (e) {
        console.error(e);
      });
    });
  }
  login();
  let timer;
  function startTimer() {
    timer = setTimeout(() => {
      document.getElementById('code').value = '';
      pleaseScanOrInput();
    }, scanner_config.countdown); 
  }
  function clearTimer() {
    clearTimeout(timer);
  }

  let result_pane = {
    positive: document.getElementById('positive'),
    negative: document.getElementById('negative'),
    neutral: document.getElementById('neutral'),
    text: document.getElementById('text'),
  }

  function codeIsValid(type) {
    result_pane.positive.classList.add('active');
    result_pane.negative.classList.remove('active');
    result_pane.neutral.classList.remove('active');
    result_pane.text.innerHTML = (`This ${textForType[type]} Challenge code is valid.`);
    if(scanner_config.useAlert)alert(`This ${textForType[type]} Challenge code is valid.`);
  }

  function codeIsRedeemed(type) {
    result_pane.positive.classList.remove('active');
    result_pane.negative.classList.add('active');
    result_pane.neutral.classList.remove('active');
    result_pane.text.innerHTML = (`This ${textForType[type]} Challenge code has been redeemed.`);
    if(scanner_config.useAlert)alert(`This ${textForType[type]} Challenge code has been redeemed.`);
  }

  function codeIsInvalid() {
    result_pane.positive.classList.remove('active');
    result_pane.negative.classList.add('active');
    result_pane.neutral.classList.remove('active');
    result_pane.text.innerHTML = (`This code is invalid.`);
    if(scanner_config.useAlert)alert(`This code is invalid.`);
  }

  function pleaseScanOrInput() {
    result_pane.positive.classList.remove('active');
    result_pane.negative.classList.remove('active');
    result_pane.neutral.classList.add('active');
    result_pane.text.innerHTML = ('Please scan a QR code or key in it.');
  }

  function validatingCode(content) {
    if(content && content.match(/^[a-zA-Z0-9]*$/)) {
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
                codeIsValid(type);
                // alert(`You have successfully redeemed your ${type} of reward!`);
              });
          } else codeIsRedeemed(type);
        } else  codeIsInvalid();
      });
      
    } else {
      codeIsInvalid();
    }
    startTimer();
  }

  document.getElementById('check').onclick = function() {
    let content = document.getElementById('code').value;
    clearTimer();
    validatingCode(content);
  }

  let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
  scanner.addListener('scan', function (content) {
    console.log(content);
    validatingCode(content);
  });

}