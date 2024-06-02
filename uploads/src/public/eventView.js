window.addEventListener("scroll", (e) => {
    let topBtn = document.querySelector(".floating");
    let topBox = document.querySelector(".topBox");
    topBtn.classList.toggle("show", window.scrollY > 100);
    topBox.classList.toggle("sticky", window.scrollY > 100);
});

let sec1 = document.querySelector(
    "#section1 > .container > .contentLine > .bgdLine"
);
let sec1Txt = document.querySelector(
    "#section1 > .container > .contentLine > .textLine"
);

window.onload = () => {
    setTimeout(() => {
        sec1.classList.add("blured");
    }, 300);

    setTimeout(() => {
        sec1Txt.classList.add("show");
    }, 400);
};

const CountDownTimer = (dt, id) => {
    var end = new Date(dt);

    var _second = 1000;
    var _minute = _second * 60;
    var _hour = _minute * 60;
    var _day = _hour * 24;
    var timer;

    function showRemaining() {
        var now = new Date();
        var distance = end - now;
        if (distance < 0) {
            clearInterval(timer);
            document.querySelector(id).innerHTML = "종료됨";

            return;
        }
        var days = Math.floor(distance / _day);
        var hours = Math.floor((distance % _day) / _hour);
        var minutes = Math.floor((distance % _hour) / _minute);
        var seconds = Math.floor((distance % _minute) / _second);

        document.querySelector(id).querySelector('.day > p').innerHTML = days;
        document.querySelector(id).querySelector('.hour > p').innerHTML = hours;
        document.querySelector(id).querySelector('.minute > p').innerHTML = minutes;
        document.querySelector(id).querySelector('.second > p').innerHTML = seconds;
    }

    timer = setInterval(showRemaining, 1000);
}


timerInfo = document.querySelector('.dueDate');

CountDownTimer(timerInfo.innerText, "#section2 > .container > .contentLine > .timeLine > .timeInfo");