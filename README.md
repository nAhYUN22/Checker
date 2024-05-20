# Checker

## TODO

#### DB

- ~~DB 생성 및 테이블 생성~~
- 튜플 넣기

#### USER

- 이벤트 목록 렌더 코드 구현
- 이벤트 뷰 구현
- 이벤트 목록 검색 기능

#### ADMIN

- ~~로그인 기능~~
- ~~옵션 기능~~
- ~~쿼리 실행 함수 구현~~
- `CSV`, `xlsx` 파싱 함수 구현 <- `https://sancheck-developer.tistory.com/48` 
- 이벤트 상황 그래프 (완료도)
- 이름 검색
  - 미수령 인원만 보이게 정렬


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




## 계정
- **ROOT** : rhdqndyd123
- **DB** : checker / checker123
- **ADMIN** : checker / checkerpw