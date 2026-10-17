const sidebar = document.getElementById("sidebar");
const hamburgerButton = document.getElementById("hamburger-button");

hamburgerButton.addEventListener("click", function () {
    sidebar.classList.toggle("expanded");
});