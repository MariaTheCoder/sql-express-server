const form = document.getElementById("form");
const submitBtn = document.getElementById("submitBtn");
const messageBox = document.getElementById("messageBox");

submitBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  // eventually we want to send this form data to the backend so we need to transform formData into a JavaScript object
  // Object.fromEntries can help us to that
  const dataObject = Object.fromEntries(formData);

  // next, convert the JavaScript object to a JSON string
  const payload = JSON.stringify(dataObject);
  console.log(payload);

  try {
    const response = await fetch("http://127.0.0.1:3000/api/v1/users/login", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://127.0.0.1",
      },
      body: payload,
    });

    if (!response.ok) {
      messageBox.textContent = `Error status ${response.status}: ${response.statusText}`;
      messageBox.style.color = "red";
      throw new Error(`${response.status}, ${response.statusText}`);
    } else {
      const user = await response.json();

      messageBox.textContent = `A magic link was sent to your email ${user.Email}!`;
      messageBox.style.color = "green";
    }
  } catch (err) {
    console.error("Fetch", err);
  }
});
