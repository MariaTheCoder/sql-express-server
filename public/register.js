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
    const response = await fetch(
      "http://127.0.0.1:3000/api/v1/users/register",
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://127.0.0.1",
        },
        body: payload,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      messageBox.textContent = data.message || "Registration failed.";
      messageBox.style.color = "red";
      return;
      // throw new Error(`${response.status}, ${response.statusText}`);
    }

    console.log("Success!");
    messageBox.textContent = "Registration successful!";
    messageBox.style.color = "green";
  } catch (err) {
    console.error("Error:", err);
    messageBox.textContent = "Something went wrong.";
    messageBox.style.color = "red";
  }
});
