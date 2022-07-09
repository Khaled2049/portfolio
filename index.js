const sendEmail = (values) => {
  console.log('sending email');
  const body = `Hey Khaled I'm FirstName: ${values.firstName} LastName: ${values.lastName} My phone number is: ${values.phone} and my email: ${values.email} and my message: ${values.msg}`;
  window.open(
    `mailto:khaledhossain.not@gmail.com?subject=Message From website&body=${body}`
  );
};

const sendButton = document.querySelector('#sendButton');
sendButton.addEventListener('click', (event) => {
  event.preventDefault();
  let firstName = document.querySelector('#fname').value;
  let lastName = document.querySelector('#lname').value;
  let email = document.querySelector('#email').value;
  let phone = document.querySelector('#phone').value;
  let msg = document.querySelector('#message').value;

  if (email !== '' && firstName !== '' && (lastName !== '') & (msg != '')) {
    sendEmail({ firstName, lastName, email, phone, msg });
  } else {
    console.log('Enter Email, firstname, lastname & message');
  }
});

particlesJS.load('particles-js', 'assets/particles.json', function () {
  console.log('callback - particles.js config loaded');
});
