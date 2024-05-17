const eventForm = document.getElementById('event-form');
const formTitle = document.getElementById('form-title');
const eventIdInput = document.getElementById('event-id');
const eventList = document.getElementById('event-list');
let page = 1;
const limit = 10;
let editingEventId = null;

const loadEvents = async (page, limit) => {
    const response = await fetch(`/api/events?page=${page}&limit=${limit}`);
    const data = await response.json();
    return data;
};

const renderEvents = (events, clear = false) => {
    if (clear) {
        eventList.innerHTML = '';  // Clear the list before rendering
    }
    events.forEach(event => {
        const eventItem = document.createElement('li');
        eventItem.className = 'event-item';
        eventItem.innerHTML = `
            <h2>${event.name}</h2>
            <p>ID: ${event.num}</p>
            <p>Progress: ${event.progress}</p>
            <p>Due Date: ${event.duedate}</p>
            <p>Image: <img src="${event.image}" alt="${event.name}" /></p>
            <p>Students: ${event.studentList.join(', ')}</p>
            <button onclick="editEvent(${event.id})"> Edit </button>
        `;
        eventList.appendChild(eventItem);
    });
};

const handleScroll = async () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        page++;
        const data = await loadEvents(page, limit);
        renderEvents(data.data);
    }
};

const editEvent = async (id) => {
    const response = await fetch(`/api/events/${id}`);
    const event = await response.json();
    if (event) {
        eventIdInput.value = event.id;
        document.getElementById('event-num').value = event.num;
        document.getElementById('event-name').value = event.name;
        document.getElementById('event-progress').value = event.progress;
        document.getElementById('event-content').value = event.content;
        document.getElementById('event-duedate').value = event.duedate;
        document.getElementById('event-studentList').value = event.studentList.join(', ');
        formTitle.innerText = 'Edit Event';
        editingEventId = id;
    }
};

eventForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(eventForm); // 폼 데이터를 FormData 객체로 생성
    const url = editingEventId ? `/api/events/${editingEventId}` : '/api/events';
    const method = editingEventId ? 'PUT' : 'POST';
    const response = await fetch(url, {
        method,
        body: formData
    });
    const newEvent = await response.json();
    loadEvents(1, limit).then(data => renderEvents(data.data, true));
    eventForm.reset();
    formTitle.innerText = 'Add Event';
    editingEventId = null;
});

// 초기 이벤트 로드
loadEvents(page, limit).then(data => renderEvents(data.data, true));

// 무한 스크롤 핸들러 추가
window.addEventListener('scroll', handleScroll);
