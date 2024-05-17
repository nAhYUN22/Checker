const eventList = document.getElementById('event-list');
const searchBar = document.getElementById('search-bar');
let page = 1;
const limit = 10;
let searchQuery = '';

const loadEvents = async (page, limit, search) => {
    const response = await fetch(`/api/events?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    const data = await response.json();
    return data;
};

const renderEvents = (events, clear = false) => {
    if (clear) {
        // 렌더링 이전 리스트 초기화
        eventList.innerHTML = '';
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
        `;
        eventList.appendChild(eventItem);
    });
};

// 무한 스크롤 스크립트
const handleScroll = async () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        page++;
        const data = await loadEvents(page, limit, searchQuery);
        renderEvents(data.data);
    }
};

// 검색 스크립트
const handleSearch = async (event) => {
    searchQuery = event.target.value;
    page = 1;
    const data = await loadEvents(page, limit, searchQuery);
    renderEvents(data.data, true);
};

searchBar.addEventListener('input', handleSearch); // 검색 감지
window.addEventListener('scroll', handleScroll); // 스크롤 감지

// 초기 이벤트 로드
loadEvents(page, limit, searchQuery).then(data => renderEvents(data.data));
