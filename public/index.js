const form = document.getElementById("form");
const submitBtn = document.getElementById("submitBtn");

submitBtn.addEventListener("click", (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  // eventually we want to send this form data to the backend so we need to transform formData into a JavaScript object
  // Object.fromEntries can help us to that
  const dataObject = Object.fromEntries(formData);

  // next, convert the JavaScript object to a JSON string
  const payload = JSON.stringify(dataObject);
  console.log(payload);
});
