const eventForm = document.getElementById('event-form');
const formTitle = document.getElementById('form-title');
const eventIdInput = document.getElementById('event-id');
const eventList = document.getElementById('event-list');
const searchBar = document.getElementById('search-bar');
const addOptionButton = document.getElementById('add-option');
const optionsContainer = document.getElementById('options-container');
const modifyFlag = document.getElementById('modifyFlag');
const eventHashFlag = document.getElementById('eventHashFlag');
let page = 1;
const limit = 10;
let editingEventId = null;
let searchQuery = '';



// 업로드한 이미지 프리뷰 이벤트 등록
const imagePreview = () => {
    const fileDOM = document.querySelector('#section1 > .container > .contentLine > .formLine > form > input#event-image');
    const preview = document.querySelector('#section1 > .container > .contentLine > .imgBox > .imgLine > img');

    fileDOM.addEventListener('change', () => {
        const reader = new FileReader();
        reader.onload = ({ target }) => {
            preview.src = target.result;
        };
        reader.readAsDataURL(fileDOM.files[0]);
    });
}




// 옵션 제거 함수
const removeOption = (button) => {
    button.parentElement.remove();
};

// 옵션 추가 버튼 클릭 이벤트 리스너
addOptionButton.addEventListener('click', () => addOption());


// 초기 이벤트 로더
const loadFirst = async () => {
    let eventList = document.querySelector('#section2 > .container > .contentLine > #event-list');

    const response = await fetch("/api/eventListView", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });

    let jsonResult = await response.json();


    jsonResult.forEach(async (event) => {

        const studentResponse = await fetch("/api/getParticipationInfo", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "event_hash": event['event_hash']
            })
        });

        let studentList = await studentResponse.json();

        const eventItem = document.createElement('li');
        let optionList = JSON.parse(event['options']);
        let optionInfo = "";
        let studentMaker = ""

        studentList.forEach(student => {
            studentMaker += `
            <div class="student">
                
                <div class="hoverInfo">
                    <div class="content">
                        <img src="/uploads/src/studentPic/${student['student_pic']}" class="studentPic" />
                    </div>
                </div>
                <div class="stuInfo">
                        <input class="studentCheckedBox" type="checkbox" id="coding" name="checked" value="1" ${student['receiveFlag'] ? "checked" : ""}  />
                    <p class="studnetId">학번 : ${student['student_id']}</p>
                    <p class="studentName">이름 : ${student['student_name']}</p>
                </div>
            </div>
            `
        })

        optionList.forEach(option => {
            optionInfo += `${option['category']}: ${option['items'].join(", ")}
            `
        })

        eventItem.className = 'event-item';
        eventItem.innerHTML = `
            <h2>${event['event_name']}</h2>
            <div class="infoLine">
                <p class="eventHash">이벤트 Hash<br> ${event['event_hash']}</p>
                <p>Progress: ${event['event_status'] ? '활성화' : '비활성화'}</p>
                <p>종료일: ${new Date(event['event_date']).toLocaleString()}</p>
            </div>
            <p><img src="${event['event_image_url']}" alt="${event['event_name']}" /></p>
            <div class="studentList">
                ${studentMaker}
            </div>
            <b>이벤트 옵션</b>
            <p>${optionInfo}</p>
            <button onclick="editEvent('${event['event_hash']}')">수정하기</button>
        `;
        eventList.appendChild(eventItem);
    });


    setTimeout(() => {
        document.querySelectorAll('.studentCheckedBox').forEach(box => {
            box.addEventListener('click', async (e) => {
                let parentDOM = e.target.parentElement.parentElement.parentElement.parentElement;
                const eventHash = parentDOM.querySelector('.infoLine > p:nth-child(1)').innerText.split("\n")[1];
                let userIDInfo = e.target.parentElement.querySelector('.studnetId').innerText.split(":")[1].replace(" ", "")

                if (e.target.checked) {
                    let result = await fetch("/api/decreaseEventRemain", {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "eventHash": eventHash
                        })
                    })

                    // 여기서 체크박스 업데이트

                    await fetch("/api/updateUser", {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "eventHash": eventHash,
                            "userID": userIDInfo,
                            "statusType": 0
                        })
                    })


                } else {
                    let result = await fetch("/api/increaseEventRemain", {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "eventHash": eventHash
                        })
                    })

                    // 여기서 체크박스 업데이트
                    await fetch("/api/updateUser", {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "eventHash": eventHash,
                            "userID": userIDInfo,
                            "statusType": 1
                        })
                    })

                }
            })
        })
    }, 500)




}


// 이벤트 목록 만들기
const eventUpdate = async (data) => {

    let eventList = document.querySelector('#section2 > .container > .contentLine > #event-list');
    eventList.replaceChildren();

    let jsonResult = data;


    jsonResult.forEach(async (event) => {

        const studentResponse = await fetch("/api/getParticipationInfo", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "event_hash": event['event_hash']
            })
        });

        let studentList = await studentResponse.json();

        const eventItem = document.createElement('li');
        let optionList = JSON.parse(event['options']);
        let optionInfo = "";
        let studentMaker = ""

        studentList.forEach(student => {
            studentMaker += `
            <div class="student">
                <div class="hoverInfo">
                    <div class="content">
                        <img src="/uploads/src/studentPic/${student['student_pic']}" class="studentPic" />
                    </div>
                </div>
                <div class="stuInfo">
                    <p class="studnetId">학번 : ${student['student_id']}</p>
                    <p class="studentName">이름 : ${student['student_name']}</p>
                </div>
            </div>
            `
        })

        optionList.forEach(option => {
            optionInfo += `${option['category']}: ${option['items'].join(", ")}
            `
        })

        eventItem.className = 'event-item';
        eventItem.innerHTML = `
            <h2>${event['event_name']}</h2>
            <div class="infoLine">
                <p>이벤트 Hash<br> ${event['event_hash']}</p>
                <p>Progress: ${event['event_status'] ? '활성화' : '비활성화'}</p>
                <p>종료일: ${new Date(event['event_date']).toLocaleString()}</p>
            </div>
            <p><img src="${event['event_image_url']}" alt="${event['event_name']}" /></p>
            <div class="studentList">
                ${studentMaker}
            </div>
            <b>이벤트 옵션</b>
            <p>${optionInfo}</p>
            <button onclick="editEvent('${event['event_hash']}')">수정하기</button>
        `;
        eventList.appendChild(eventItem);
    });



    document.querySelectorAll('.studentCheckedBox').forEach(box => {
        console.log(box);
        box.addEventListener('click', async (event) => {
            console.log(event.target.parentElement);
            // let response = await fetch(url, {
            //     method: "POST",
            //     body: JSON.stringify({
            //         "adsf": 
            //     })
            // })
        })
    })



}

// 옵션 추가 함수
const addOption = (category = '', items = '') => {
    const optionItem = document.createElement('div');
    optionItem.className = 'option-item';
    optionItem.innerHTML = `
        <input type="text" name="optionCategory[]" placeholder="이벤트 옵션 이름" value="${category}" required>
        <input type="text" name="optionItems[]" placeholder="내용" value="${items}" required>
        <button type="button" onclick="removeOption(this)">옵션 제거</button>
    `;
    optionsContainer.appendChild(optionItem);
};

// 이벤트 수정 함수
const editEvent = async (eventHash) => {

    const response = await fetch("/api/getEventHash", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "eventHash": eventHash })
    });

    let jsonResult = await response.json();
    jsonResult = jsonResult[0];
    console.log(jsonResult);

    if (jsonResult) {
        modifyFlag.value = 1;
        eventHashFlag.value = jsonResult['event_hash'];
        console.log(new Date(jsonResult['event_date']).toISOString());
        document.getElementById('event-num').value = jsonResult['remain_origin'];
        document.getElementById('event-name').value = jsonResult['event_name'];
        document.getElementById('event-progress').checked = jsonResult['event_status'];
        document.getElementById('event-content').value = jsonResult['event_content'];
        document.getElementById('event-duedate').value = new Date(jsonResult['event_date']).toISOString().substring(0, 16);
        // 학생 목록 업데이트 하기

        // fetch로 가져오고 리스팅해주기

        let studentListGet = await fetch("/api/getEventStudentList", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "eventHash": eventHash })
        })

        let resultJson = await studentListGet.json();

        let userListForm = "";
        resultJson.forEach((student) => {
            userListForm += `${student['student_name']}, `;
        })
        userListForm = userListForm.slice(0, -2);



        document.querySelector('#event-studentList').value = userListForm;


        document.querySelector('#section1 > .container > .contentLine > .imgBox > .imgLine > img').src = jsonResult['event_image_url'];

        // 옵션 필드 초기화 후 다시 추가
        optionsContainer.innerHTML = '';
        if (jsonResult['options']) {
            let options = JSON.parse(jsonResult['options']);
            console.log(options);
            options.forEach(option => addOption(option['category'], option['items'].join(', ')));
        }
    }

};

// 이벤트 폼 제출 이벤트 핸들러
eventForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log(eventForm);
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

    const url = '/api/events';
    const method = 'POST';
    const response = await fetch(url, {
        method,
        body: formData
    }).then(() => {
        window.location.reload();
    });
});


// 검색 입력 이벤트 리스너 추가
searchBar.addEventListener('input', async (event) => {

    let inputer = event.target.value;

    const response = await fetch("/api/getEventName", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "userInput": inputer })
    });

    let jsonResult = await response.json();

    eventUpdate(jsonResult);
});

// 초기 옵션 필드 추가
addOption();

imagePreview();
loadFirst();