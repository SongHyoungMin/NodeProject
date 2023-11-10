const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');
const app = express()
app.use(express.urlencoded({extended: true}));
app.use(express.json());


const directory = 'pyUpload'; // 디렉토리 이름
// 디렉토리가 존재하지 않는 경우 생성
if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
}
const storage = multer.diskStorage({ // 디스크 저장소 정의
    destination: function (req, file, cb) {
        cb(null, 'pyUpload') // cb 콜백 함수를 통해 전송된 파일 저장 디렉토리 설정
    },
    filename: function (req, file, cb) {
        const currentDate = new Date();

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더하고 두 자릿수로 만듭니다.
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');

        const formattedDate = year + month + day + hours + minutes + seconds;
        const fileExtension = path.extname(file.originalname); // 원본 파일 확장자 유지
        const originalFileNameWithoutExt = path.basename(file.originalname, fileExtension);
        cb(null, originalFileNameWithoutExt + '-' + formattedDate + fileExtension); // cb 콜백 함수를 통해 전송된 파일 이름 설정
    }
});

const upload = multer({storage: storage});

app.listen(8080, () => {
    console.log('http://localhost:8080 에서 파이썬 호출 테스트 서버 실행중')
})

app.get('/get', (req, res) => {
    console.log("get 요청 들어옴.")
    res.send('get test')
})
app.post('/upload', upload.single('file'), function (req, res, next) {
    console.log("요청들어옴")
    // 'file'은 폼 필드의 이름
    console.log(req.file); // 업로드된 파일 정보
    console.log(req.body); // 폼 필드 데이터
    console.log("요청끝남")
    res.end();
});

// 해당 파일 이름의  파이썬을 호출한다.
app.get('/run/:fileName', (req, res) => {
    console.log("파이썬 실행 요청 들어옴.")
    const fileName = req.params.fileName;
    // 파이썬 스크립트를 실행하기 위한 spawn 함수를 호출합니다.
    const pythonProcess = spawn('python3', ['./pyUpload/' + fileName]);
    // 파이썬 스크립트와의 상호 작용을 처리합니다.

// 표준 출력에서 데이터를 읽을 때 발생하는 이벤트
    pythonProcess.stdout.on('data', (data) => {
        // 데이터를 콘솔에 출력합니다.
        console.log(`stdout: ${data}`);
    });

// 표준 에러에서 데이터를 읽을 때 발생하는 이벤트
    pythonProcess.stderr.on('data', (data) => {
        // 에러를 콘솔에 출력합니다.
        console.error(`stderr: ${data}`);
    });

// 프로세스가 종료될 때 발생하는 이벤트
    pythonProcess.on('close', (code) => {
        // 종료 코드를 콘솔에 출력합니다.
        console.log(`Child process exited with code ${code}`);
        res.end();

    });
})
