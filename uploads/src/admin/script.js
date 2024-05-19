const eventForm = document.getElementById('event-form');
const formTitle = document.getElementById('form-title');
const eventIdInput = document.getElementById('event-id');
const eventList = document.getElementById('event-list');
const searchBar = document.getElementById('search-bar');
const addOptionButton = document.getElementById('add-option');
const optionsContainer = document.getElementById('options-container');
let page = 1;
const limit = 10;
let editingEventId = null;
let searchQuery = '';

// 옵션 추가 함수
const addOption = (category = '', items = '') => {
    const optionItem = document.createElement('div');
    optionItem.className = 'option-item';
    optionItem.innerHTML = `
        <input type="text" name="optionCategory[]" placeholder="Option Category" value="${category}" required>
        <input type="text" name="optionItems[]" placeholder="Option Items (comma separated)" value="${items}" required>
        <button type="button" onclick="removeOption(this)">Remove</button>
    `;
    optionsContainer.appendChild(optionItem);
};

// 옵션 제거 함수
const removeOption = (button) => {
    button.parentElement.remove();
};

// 옵션 추가 버튼 클릭 이벤트 리스너
addOptionButton.addEventListener('click', () => addOption());

// 이벤트 데이터를 서버에서 로드하는 함수
const loadEvents = async (page, limit, search) => {
    const response = await fetch(`/api/events?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    const data = await response.json();
    return data;
};

// 이벤트 목록을 렌더링하는 함수
const renderEvents = (events, clear = false) => {
    if (clear) {
        eventList.innerHTML = ''; // 기존 목록을 지우기
    }
    events.forEach(event => {
        const eventItem = document.createElement('li');
        eventItem.className = 'event-item';
        eventItem.innerHTML = `
            <h2>${event.name}</h2>
            <p>ID: ${event.num}</p>
            <p>Progress: ${event.progress ? 'True' : 'False'}</p>
            <p>Due Date: ${new Date(event.duedate).toLocaleString()}</p>
            <p>Image: <img src="${event.image}" alt="${event.name}" /></p>
            <p>Students: ${event.studentList.join(', ')}</p>
            <b>Additional Options</b>
            <p>${event.options ? event.options.map(opt => `${opt.category}: ${opt.items.join(', ')}`).join('; ') : ''}</p>
            <button onclick="editEvent(${event.id})">Edit</button>
        `;
        eventList.appendChild(eventItem);
    });
};

// 무한 스크롤 이벤트 핸들러
const handleScroll = async () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        page++;
        const data = await loadEvents(page, limit, searchQuery);
        renderEvents(data.data);
    }
};

// 검색 입력 이벤트 핸들러
const handleSearch = async (event) => {
    searchQuery = event.target.value;
    page = 1;
    const data = await loadEvents(page, limit, searchQuery);
    renderEvents(data.data, true);
};

// 이벤트 수정 함수
const editEvent = async (id) => {
    const response = await fetch(`/api/events/${id}`);
    const event = await response.json();
    if (event) {
        eventIdInput.value = event.id;
        document.getElementById('event-num').value = event.num;
        document.getElementById('event-name').value = event.name;
        document.getElementById('event-progress').checked = event.progress;
        document.getElementById('event-content').value = event.content;
        document.getElementById('event-duedate').value = event.duedate.slice(0, 16); // "2024-05-14T12:00" 형식으로 설정
        document.getElementById('event-studentList').value = event.studentList.join(', ');

        // 옵션 필드 초기화 후 다시 추가
        optionsContainer.innerHTML = '';
        if (event.options) {
            event.options.forEach(option => addOption(option.category, option.items.join(', ')));
        }

        formTitle.innerText = 'Edit Event';
        editingEventId = id;
    }
};

// 이벤트 폼 제출 이벤트 핸들러
eventForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(eventForm);

    // 체크박스의 값을 true/false로 설정
    const progress = document.getElementById('event-progress').checked;
    formData.set('progress', progress);

    // 옵션 필드를 JSON 문자열로 변환하여 추가
    const options = [];
    const categories = document.getElementsByName('optionCategory[]');
    const items = document.getElementsByName('optionItems[]');
    for (let i = 0; i < categories.length; i++) {
        options.push({
            category: categories[i].value,
            items: items[i].value.split(',')
        });
    }
    formData.append('options', JSON.stringify(options)); // JSON 문자열로 변환하여 추가

    const url = editingEventId ? `/api/events/${editingEventId}` : '/api/events';
    const method = editingEventId ? 'PUT' : 'POST';
    const response = await fetch(url, {
        method,
        body: formData
    });
    const newEvent = await response.json();
    loadEvents(1, limit, searchQuery).then(data => renderEvents(data.data, true));
    eventForm.reset();
    formTitle.innerText = 'Add Event';
    editingEventId = null;
    optionsContainer.innerHTML = ''; // 옵션 필드 초기화
    addOption(); // 기본 옵션 필드 추가
});

// 초기 이벤트 로드
loadEvents(page, limit, searchQuery).then(data => renderEvents(data.data, true));

// 검색 입력 이벤트 리스너 추가
searchBar.addEventListener('input', handleSearch);

// 무한 스크롤 이벤트 리스너 추가
window.addEventListener('scroll', handleScroll);

// 초기 옵션 필드 추가
addOption();