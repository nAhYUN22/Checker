const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 5000;

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
const readData = () => {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data); // JSON 문자열을 JavaScript 객체로 변환
};

// 데이터를 파일에 저장하는 함수
const saveData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8'); // 객체를 JSON 문자열로 변환하여 파일에 저장
};

// 기본 경로를 유저 페이지로 설정
app.get('/', (req, res) => {
    res.render('user.ejs'); // 유저페이지 렌더링
});

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

// 특정 이벤트 정보 API
app.get('/api/events/:id', (req, res) => {
    const data = readData();
    const eventId = parseInt(req.params.id);
    const event = data.find(event => event.id === eventId);

    if (event) {
        res.json(event); // 이벤트 데이터 응답
    } else {
        res.status(404).json({ message: 'Event not found' }); // 이벤트를 찾을 수 없는 경우
    }
});

// 이벤트 추가 API
app.post('/api/events', upload.single('image'), (req, res) => {
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
        progress: req.body.progress === 'true',
        content: req.body.content,
        duedate: req.body.duedate,
        image: req.file ? `/uploads/${req.file.filename}` : '',
        studentList: req.body.studentList.split(','),
        options: options
    };
    data.push(newEvent);
    saveData(data);
    res.status(201).json(newEvent); // 생성된 이벤트를 JSON으로 응답
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

// 로그인 성공 시에만 관리자페이지 로드
app.get('/admin', function (req, res) {
    if (req.session.is_logined == true) {
        res.render('admin.ejs');
    } else {
        res.redirect('/login');
    }
})

// 로그인 페이지 렌더링
app.get('/login', function (req, res) {
    res.render('login.ejs');
})


// =============== 로그인 기능 24-05-20 석지원 추가 ==========================



// 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
