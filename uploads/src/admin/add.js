window.addEventListener("scroll", (e) => {
  let topBtn = document.querySelector(".floating");
  let topBox = document.querySelector(".topBox");
  topBtn.classList.toggle("show", window.scrollY > 100);
  topBox.classList.toggle("sticky", window.scrollY > 100);
});
