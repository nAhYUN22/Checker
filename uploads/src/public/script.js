window.addEventListener("scroll", (e) => {
  let topBtn = document.querySelector(".floating");
  let topBox = document.querySelector('.topBox');
  topBtn.classList.toggle("show", window.scrollY > 100);
  topBox.classList.toggle("sticky", window.scrollY > 100);
});


// window.onload = () => {
//     let eventList = document.querySelectorAll('#section1 > .container > .contentLine > .boxList > .box');
//     eventList.forEach(sEvent => {
//         sEvent.addEventListener('click', () => {
//             location.href='info.html';
//         })
//     })
// }



const loadEvents = async (page, limit, search) => {
    const response = await fetch(`/api/events?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    const data = await response.json();
    return data;
};

const renderEvents = (events, clear = false) => {
    const eventListDOM = document.querySelector('#section1 > .container > .contentLine > .boxList');

    console.log(events);

    // if (clear) {
    //     eventList.innerHTML = ''; // 기존 목록을 지우기
    // }

    let frame = "";
    events.forEach(event => {
        frame += `
    <div class="box">
        <div class="boxContent">
            <div class="top">
                <img src="${event['image']}" alt="">
            </div>
            <div class="bottom">
                <div class="topLine">
                    <p class="eName">${event['name']}</p>
                    <p class="dateTime">${event['duedate'].replace("T", "  ")}</p>
                </div>
                <div class="bottomLine">
                    <div class="contentPreview">
                        <p>${event['content']}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="hoverBox">

        </div>
    </div>
        `
    })

    eventListDOM.innerHTML = frame;
};


let page = 1;
const limit = 10;
let editingEventId = null;
let searchQuery = '';

loadEvents(page, limit, searchQuery).then(data => renderEvents(data.data, true));