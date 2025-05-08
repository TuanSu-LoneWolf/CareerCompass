// Load nghề từ file JSON (giả sử bạn đặt nó trong public/data)
fetch('../../data/processed/data.json')
  .then(response => response.json())
  .then(json => {
    const careers = json.careers;
    const select = document.getElementById("career");
    careers.forEach(career => {
      const option = document.createElement("option");
      option.value = career.name;
      option.textContent = career.name;
      select.appendChild(option);
    });
  });

const ageSelect = document.getElementById("age");
for (let i = 1; i <= 100; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  ageSelect.appendChild(option);
}

document.getElementById("infoForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const career = document.getElementById("career").value;

  const params = new URLSearchParams({ name, age, career });
  window.location.href = `index.html?${params.toString()}`;
});
