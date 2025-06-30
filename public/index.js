const form = document.getElementById("form");
const submitBtn = document.getElementById("submitBtn");

submitBtn.addEventListener("click", (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  for (const [key, value] of formData) {
    console.log(`${key}: ${value}\n`);
  }
});
