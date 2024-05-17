const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 설정
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// 데이터 파일 경로
const dataFilePath = path.join(__dirname, 'data', 'events.json');

// multer 설정 (파일 업로드)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 파일이 저장될 폴더 지정
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // 파일명 지정
    }
});
const upload = multer({ storage }); // multer 인스턴스 생성

// 데이터를 파일에서 읽어오는 함수
const readData = () => {
    const data = fs.readFileSync(dataFilePath, 'utf8'); // 파일을 동기적으로 읽음
    return JSON.parse(data); // JSON 문자열을 JavaScript 객체로 변환
};

// 데이터를 파일에 저장하는 함수
const saveData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8'); // 객체를 JSON 문자열로 변환하여 파일에 저장
};

// 기본 경로
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // 기본 페이지 전송
});

// 관리 페이지 경로
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html')); // 관리자 페이지 전송
});

// 이벤트 목록 API (페이징 처리 및 검색 기능 추가)
app.get('/api/events', (req, res) => {
    const data = readData(); // 이벤트 데이터를 읽어옴
    const page = parseInt(req.query.page) || 1; // 현재 페이지 번호
    const limit = parseInt(req.query.limit) || 10; // 페이지당 항목 수
    const search = req.query.search || ''; // 검색어

    // 검색 기능
    const filteredData = data.filter(event => 
        event.name.toLowerCase().includes(search.toLowerCase()) // 이벤트 이름에 검색어가 포함된 항목 필터링
    );

    const startIndex = (page - 1) * limit; // 시작 인덱스 계산
    const endIndex = startIndex + limit; // 끝 인덱스 계산
    const resultData = filteredData.slice(startIndex, endIndex); // 해당 페이지의 데이터 추출

    // 결과 JSON 응답
    res.json({
        page,
        limit,
        total: filteredData.length,
        data: resultData
    });
});

// 특정 이벤트 정보 API
app.get('/api/events/:id', (req, res) => {
    const data = readData(); // 이벤트 데이터를 읽어옴
    const eventId = parseInt(req.params.id); // 이벤트 ID
    const event = data.find(event => event.id === eventId); // ID에 해당하는 이벤트 찾기

    if (event) {
        res.json(event); // 이벤트 데이터 응답
    } else {
        res.status(404).json({ message: 'Event not found' }); // 이벤트를 찾을 수 없는 경우
    }
});

// 이벤트 추가 API
app.post('/api/events', upload.single('image'), (req, res) => {
    const data = readData(); // 이벤트 데이터를 읽어옴
    const newEvent = {
        id: data.length + 1, // 새로운 이벤트 ID
        name: req.body.name, // 이벤트 이름
        num: req.body.num, // 이벤트 번호
        progress: req.body.progress, // 진행 상태
        content: req.body.content, // 내용
        duedate: req.body.duedate, // 종료 날짜
        image: req.file ? `/uploads/${req.file.filename}` : '', // 이미지 경로
        studentList: req.body.studentList.split(',') // 학생 리스트 (콤마로 구분된 문자열을 배열로 변환)
    };
    data.push(newEvent); // 새로운 이벤트를 데이터에 추가
    saveData(data); // 데이터를 파일에 저장
    res.status(201).json(newEvent); // 생성된 이벤트를 JSON으로 응답
});

// 이벤트 수정 API
app.put('/api/events/:id', upload.single('image'), (req, res) => {
    const data = readData(); // 이벤트 데이터를 읽어옴
    const eventId = parseInt(req.params.id); // 이벤트 ID
    const eventIndex = data.findIndex(event => event.id === eventId); // ID에 해당하는 이벤트 인덱스 찾기

    if (eventIndex !== -1) {
        data[eventIndex] = {
            ...data[eventIndex], // 기존 이벤트 데이터 유지
            name: req.body.name, // 수정된 이름
            num: req.body.num, // 수정된 번호
            progress: req.body.progress, // 수정된 진행 상태
            content: req.body.content, // 수정된 내용
            duedate: req.body.duedate, // 수정된 종료 날짜
            image: req.file ? `/uploads/${req.file.filename}` : data[eventIndex].image, // 수정된 이미지 경로
            studentList: req.body.studentList.split(',') // 수정된 학생 리스트
        };
        saveData(data); // 데이터를 파일에 저장
        res.status(200).json(data[eventIndex]); // 수정된 이벤트를 JSON으로 응답
    } else {
        res.status(404).json({ message: 'Event not found' }); // 이벤트를 찾을 수 없는 경우
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`); // 서버 시작 메시지
});
