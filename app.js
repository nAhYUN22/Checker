const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const db = require('./lib/db.js');
const crypto = require('crypto');

const app = express();
const port = 5000;


// db 접속
const checkerDB = new db();

// ejs 엔진 및 로그인 세션 라이브러리 로드 및 적용
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'components'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const session = require('express-session');
app.use(session({
    secret: 'ChoLeeKimSeok',
    resave: false,
    saveUninitialized: true
}));


// 정적 파일 제공 설정
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use(express.static(path.join(__dirname, 'public')));

// 데이터 파일 경로
const dataFilePath = path.join(__dirname, 'data', 'events.json');

// multer 설정 (파일 업로드)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // 파일명 지정
    }
});
const upload = multer({ storage });

// 데이터를 파일에서 읽어오는 함수
const readData = async () => {
    const result = await checkerDB.sendQuery('SELECT * FROM student;');
    return result;
};

// 데이터를 파일에 저장하는 함수
const saveData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8'); // 객체를 JSON 문자열로 변환하여 파일에 저장
};

// 기본 경로를 유저 페이지로 설정


// 이벤트 목록 API (페이징 처리 및 검색 기능 추가)
app.get('/api/events', (req, res) => {
    const data = readData();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    // 검색 기능
    const filteredData = data.filter(event =>
        event.name.toLowerCase().includes(search.toLowerCase())
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const resultData = filteredData.slice(startIndex, endIndex); // 해당 페이지의 데이터 추출

    // 결과 JSON 응답
    res.json({
        page,
        limit,
        total: filteredData.length,
        data: resultData
    });
});


// 이벤트 추가 API
app.post('/api/events', upload.single('image'), async (req, res) => {
    const data = readData();
    let options = [];
    try {
        options = JSON.parse(req.body.options); // JSON 문자열을 배열로 변환하여 옵션 리스트로 저장
    } catch (error) {
        console.error('Error parsing options:', error);
        options = []; // 파싱 오류 시 빈 배열로 초기화
    }
    const newEvent = {
        id: data.length + 1,
        name: req.body.name,
        num: req.body.num,
        eventHashFlag: req.body.eventHashFlag,
        modifyFlag: req.body.modifyFlag,
        progress: req.body.progress === 'true',
        content: req.body.content,
        duedate: req.body.duedate,
        image: req.file ? `/uploads/${req.file.filename}` : '',
        studentList: req.body.studentList.split(','),
        options: options
    };
    if (newEvent['modifyFlag'] == 1) {
        let makeStudentform = ""
        newEvent['studentList'].forEach(student => {
            makeStudentform += `name="${student.replace(" ", "")}" OR `;
        });
        makeStudentform = makeStudentform.slice(0, -4);

        let studentInfoResult = await checkerDB.sendQuery(`SELECT * FROM checker.student WHERE ${makeStudentform}`)

        // 이벤트 수정 쿼리
        checkerDB.sendQuery(`UPDATE checker.events SET event_name="${newEvent['name']}", event_image_url="${newEvent['image']}", event_status=${newEvent['progress']}, event_date="${newEvent['duedate']}", remain_count=${newEvent['num']}, remain_origin=${newEvent['num']} WHERE event_hash="${newEvent['eventHashFlag']}"`);

        // // 이벤트 옵션 수정 쿼리
        checkerDB.sendQuery(`UPDATE checker.event_additional_info SET options='${JSON.stringify(newEvent['options'])}' WHERE event_hash="${newEvent['eventHashFlag']}";`);

        // 학생 참여정보 테이블 수정
        studentInfoResult.forEach(student => {
            checkerDB.sendQuery(`INSERT IGNORE INTO checker.participation_info (student_id, student_name, student_pic, participation, event_hash, enrolled, fee, receiveFlag) VALUES ('${student['student_id']}', '${student['name']}', '${student['pic']}', '${newEvent['name']}', '${newEvent['eventHashFlag']}', ${student['enrolled']}, ${student['fee']}, 0);`);
        })



    } else {
        console.log("첫 등록이요~");
        let makeStudentform = ""
        newEvent['studentList'].forEach(student => {
            makeStudentform += `name="${student.replace(" ", "")}" OR `;
        });
        makeStudentform = makeStudentform.slice(0, -4);

        let studentInfoResult = await checkerDB.sendQuery(`SELECT * FROM checker.student WHERE ${makeStudentform}`)

        let eventHash = crypto.createHash('sha256').update(newEvent['name'] + newEvent['content'] + newEvent['duedate']).digest('hex');
        // 이벤트 등록 쿼리
        checkerDB.sendQuery(`INSERT INTO checker.events (event_name, event_hash, event_image_url, event_content, event_status, event_date, remain_count, remain_origin) VALUES ("${newEvent['name']}", "${eventHash}", "${newEvent['image']}", "${newEvent['content']}", ${newEvent['progress']}, "${newEvent['duedate']}", "${newEvent['num']}", "${newEvent['num']}");`);

        // // 이벤트 옵션 등록 쿼리
        checkerDB.sendQuery(`INSERT INTO checker.event_additional_info (event_hash, options) VALUES ('${eventHash}', '${JSON.stringify(newEvent['options'])}');`);

        // 학생 참여정보 테이블 등록
        studentInfoResult.forEach(student => {
            checkerDB.sendQuery(`INSERT INTO checker.participation_info (student_id, student_name, student_pic, participation, event_hash, enrolled, fee, receiveFlag) VALUES ('${student['student_id']}', '${student['name']}', '${student['pic']}', '${newEvent['name']}', '${eventHash}', ${student['enrolled']}, ${student['fee']}, 0);`);
        })
    }


});

// 이벤트 수정 API
app.put('/api/events/:id', upload.single('image'), (req, res) => {
    const data = readData();
    const eventId = parseInt(req.params.id);
    const eventIndex = data.findIndex(event => event.id === eventId);

    if (eventIndex !== -1) {
        let options = [];
        try {
            options = JSON.parse(req.body.options); // JSON 문자열을 배열로 변환하여 옵션 리스트로 저장
        } catch (error) {
            console.error('Error parsing options:', error);
            options = []; // 파싱 오류 시 빈 배열로 초기화
        }
        data[eventIndex] = {
            ...data[eventIndex],
            name: req.body.name,
            num: req.body.num,
            progress: req.body.progress === 'true',
            content: req.body.content,
            duedate: req.body.duedate,
            image: req.file ? `/uploads/${req.file.filename}` : data[eventIndex].image,
            studentList: req.body.studentList.split(','),
            options: options
        };
        saveData(data);
        res.status(200).json(data[eventIndex]); // 수정된 이벤트를 JSON으로 응답
    } else {
        res.status(404).json({ message: 'Event not found' }); // 이벤트를 찾을 수 없을때
    }
});








// =============== 로그인 기능 24-05-20 석지원 추가 ==========================


// 로그아웃
app.get('/logut', (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});


// 로그인 검증
app.post('/auth', (req, res, next) => {
    let post = req.body;

    let admin_id = post.admin_id;
    let admin_pw = post.admin_pw;

    if (admin_id == "checker" && admin_pw == "checkerpw") {
        req.session.is_logined = true;
        req.session.save(() => {
            res.redirect('/admin');
        });
    } else {
        res.redirect('/login');
    }
});

// 로그인 성공 시에만 관리자 페이지 로드
app.get('/admin', (req, res) => {
    if (req.session.is_logined == true) {
        res.render('admin.ejs');
    } else {
        res.redirect('/login');
    }
})

// 로그인 페이지 렌더링
app.get('/login', (req, res) => {
    res.render('login.ejs');
})


// =============== 로그인 기능 24-05-20 석지원 추가 ==========================

// =============== 쿼리 실행 24-05-20 석지원 추가 ==========================

app.get('/dbtest', async (req, res) => {
    const result = await checkerDB.sendQuery('SELECT * FROM student;');
    res.send(result);
})


// =============== 쿼리 실행 24-05-20 석지원 추가 ==========================


// 유저 페이지 리스트

app.post('/api/getEventName', async (req, res) => {
    let userList = await checkerDB.sendQuery(`SELECT DISTINCT * FROM checker.events a INNER JOIN checker.event_additional_info WHERE a.event_name LIKE '%${req.body.userInput}%';`);

    res.json(userList);
})


app.post('/api/eventListView', async (req, res) => {
    let userList = await checkerDB.sendQuery('SELECT DISTINCT * FROM checker.events a INNER JOIN checker.event_additional_info b ON a.event_hash = b.event_hash;');

    res.json(userList);
})

app.post('/api/getParticipationInfo', async (req, res) => {
    let userList = await checkerDB.sendQuery(`    SELECT DISTINCT * FROM checker.events a INNER JOIN checker.event_additional_info b ON a.event_hash = b.event_hash INNER JOIN checker.participation_info c ON a.event_hash= c.event_hash WHERE b.event_hash="${req.body.event_hash}" AND enrolled=1 AND fee=1;`);


    console.log(`SELECT DISTINCT * FROM checker.events a INNER JOIN checker.event_additional_info b ON a.event_hash = b.event_hash INNER JOIN checker.participation_info WHERE a.event_hash="${req.body.event_hash}" AND enrolled=1 AND fee=1;`);

    res.json(userList);
})




app.post('/api/userList', async (req, res) => {
    let userList = await checkerDB.sendQuery('SELECT DISTINCT * FROM checker.events a INNER JOIN checker.event_additional_info b ON a.event_hash = b.event_hash WHERE event_status=1;');

    res.json(userList);
})

app.post('/api/getEventHash', async (req, res) => {
    let userList = await checkerDB.sendQuery(`SELECT DISTINCT * FROM checker.events a INNER JOIN checker.event_additional_info WHERE a.event_hash="${req.body.eventHash}";`);

    res.json(userList);
});


app.get('/eventView/:eventHash', async (req, res) => {

    let userList = await checkerDB.sendQuery(`SELECT DISTINCT * FROM checker.events a INNER JOIN checker.event_additional_info WHERE a.event_hash="${req.params.eventHash}"`);

    console.log(userList);


    res.render('eventView.ejs', { eventInfo: userList });
});

// 갯수 카운팅 하기

app.post('/api/increaseEventRemain', async (req, res) => {
    let response = await checkerDB.sendQuery(`SELECT remain_count FROM checker.events WHERE event_hash="${req.body.eventHash}";`);
    let resJson = response[0];

    let remain_count = resJson['remain_count'] * 1;
    remain_count = remain_count + 1;

    let result = await checkerDB.sendQuery(`UPDATE checker.events SET remain_count=${remain_count} WHERE event_hash="${req.body.eventHash}";`);

    res.json(result);
});

app.post('/api/decreaseEventRemain', async (req, res) => {
    let response = await checkerDB.sendQuery(`SELECT remain_count FROM checker.events WHERE event_hash="${req.body.eventHash}";`);
    let resJson = response[0];

    let remain_count = resJson['remain_count'] * 1;
    remain_count = remain_count - 1;


    let result = await checkerDB.sendQuery(`UPDATE checker.events SET remain_count=${remain_count} WHERE event_hash="${req.body.eventHash}";`);

    res.json(result);
});

// 유저 수령 상태 변경
app.post('/api/updateUser', async (req, res) => {


    let result;
    if (req.body.statusType == 1) {
        result = await checkerDB.sendQuery(`UPDATE checker.participation_info SET receiveFlag=0 WHERE student_id="${req.body.userID}" AND event_hash="${req.body.eventHash}";`);
    }
    else {
        result = await checkerDB.sendQuery(`UPDATE checker.participation_info SET receiveFlag=1 WHERE student_id="${req.body.userID}" AND event_hash="${req.body.eventHash}";`);
    }

    // res.json(result);
});


app.post('/api/getEventStudentList', async (req, res) => {
    result = await checkerDB.sendQuery(`SELECT * FROM checker.participation_info WHERE event_hash='${req.body.eventHash}';`);

    res.json(result);
});

// 갯수 카운팅 하기


app.get('/', async (req, res) => {
    res.render('user.ejs'); // 유저페이지 렌더링
});

// 유저 페이지 리스트


// 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
