window.addEventListener("scroll", (e) => {
    let topBtn = document.querySelector(".floating");
    let topBox = document.querySelector('.topBox');
    topBtn.classList.toggle("show", window.scrollY > 100);
    topBox.classList.toggle("sticky", window.scrollY > 100);
});

const loadEvents = async (page, limit, search) => {
    const response = await fetch(`/api/events?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    const data = await response.json();
    return data;
};

const renderEvents = (events, clear = false) => {
    const eventListDOM = document.querySelector('#section1 > .container > .contentLine > .boxList');


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


const dateFormChanger = (date) => {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    hour = hour >= 10 ? hour : '0' + hour;
    minute = minute >= 10 ? minute : '0' + minute;
    second = second >= 10 ? second : '0' + second;

    return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

const userListget = async () => {

    const response = await fetch("/api/userList", {
        method: "POST",
    });

    let postList = await response.json();

    let temp = "";
    postList.forEach(eventBox => {
        temp += `
<div class="box" event-hash=${eventBox['event_hash']} onclick="location.href='/eventView/${eventBox['event_hash']}';">
    <div class="boxContent">
        <div class="top">
            <img src="${eventBox['event_image_url']}" alt="">
        </div>
        <div class="bottom">
            <div class="topLine">
                <p class="eName">${eventBox['event_name']}</p>
                <p class="dateTime">${dateFormChanger(new Date(eventBox['event_date']))}</p>
            </div>
            <div class="bottomLine">
                <div class="contentPreview">
                    <p>${eventBox['event_content']}</p>
                </div>
            </div>
        </div>
    </div>

    <div class="hoverBox">

    </div>
</div>    
`
    })

    setTimeout(() => {
        document.querySelector('#section1 > .container > .contentLine > .boxList').innerHTML = temp;
    }, 500)
}


userListget();