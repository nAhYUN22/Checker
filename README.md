# Checker

## TODO

#### DB

- ~~DB 생성 및 테이블 생성~~
- ~~튜플 넣기~~

#### USER

- ~~이벤트 목록 렌더 코드 구현~~
- 이벤트 뷰 구현
- 이벤트 목록 검색 기능

#### ADMIN

- ~~로그인 기능~~
- ~~옵션 기능~~
- ~~쿼리 실행 함수 구현~~
- ~~`CSV`, `xlsx` 파싱 함수 구현 <- `https://sancheck-developer.tistory.com/48`  요거 지금 구현하기엔 쉽지않을 듯,,~~
- 이벤트 상황 그래프 (완료도)
- 이름 검색
  - 미수령 인원만 보이게 정렬 <- 이거 넣어야하나 고민 해보자,, 시간이 없어서


----
### 05-19 구현 내용    
백엔드 구현 <br>
이미지 표출
- Express 프레임워크 사용 (업로드된 이미지 파일 호스팅)

스크롤 핸들 스크립트
- 페이지 끝에 도달했는지 확인
이벤트 목록에 새 데이터 추가해 렌더링

검색 스크립트
검색어에 맞는 이벤트 1페이지 로드
-> 기존 이벤트 목록 지우고 새 데이터 렌더링



----
### 05-20 구현 내용

- 로그인 구현 완료
  - http://118.34.232.178/login
    - ID : checker
    - PW : checkerpw
  - http://118.34.232.178/admin 페이지 로그인 시에만 보임 : )
-  프로젝트 구조 변경
  - `ejs` 사용
  - `components` 디렉토리에 모든 페이지 관리
  - `uploads` 디렉토리에 `css`, `js` 파일 관리 및 로드 (예진이가 구현한 `app.js` 이미지 로드 로직 수정 필요함)
- 쿼리 실행 함수 작성 완료.
  - `lib/db.js`
  - 사용방법 : `const 결과 = wait checkerDB.sendQuery(쿼리);`
  - 테스트페이지 : http://118.34.232.178/dbtest


---
### 05-20 구현 내용

- 유저 및 관리자 페이지 CSS 적용 완료
- 유저 페이지 로드 구현 완료
- 아직 이벤트 뷰 페이지는 구현 안됐아,,
- 이제 이벤트를 data/events.json 에 저장하기전에 DB에 저장하는 코드도 짜야해



---
### 05-31 구현 내용
- 학생 데이터(나현이가 만든 거) `STUDENT` 테이블 삽입 완료
- 이벤트 생성 시 `이벤트 테이블(EVENTS)`, `이벤트 부가 정보 테이블(EVENT_ADDITIONAL_INFO)`에 `INSERT`기능 구현 완료
	- 학생 정보 파싱 해서 참여 정보 테이블 업데이트하는 코드 작성해야 함 <- 학생 목록 선택 박스 기능으로 구현해 보기


## 계정
- **ROOT** : rhdqndyd123
- **DB** : checker / checker123
- **ADMIN** : checker / checkerpw