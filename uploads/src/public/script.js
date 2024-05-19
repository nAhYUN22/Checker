window.addEventListener("scroll", (e) => {
  let topBtn = document.querySelector(".floating");
  let topBox = document.querySelector('.topBox');
  topBtn.classList.toggle("show", window.scrollY > 100);
  topBox.classList.toggle("sticky", window.scrollY > 100);
});


window.onload = () => {
    let eventList = document.querySelectorAll('#section1 > .container > .contentLine > .boxList > .box');
    eventList.forEach(sEvent => {
        sEvent.addEventListener('click', () => {
            location.href='info.html';
        })
    })
}