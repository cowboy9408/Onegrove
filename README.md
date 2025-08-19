# Ongrove Admin CMS 구축 프로젝트

> 이 프로젝트는 React + Vite 기반으로 구축된 관리자 CMS입니다.  
> TailwindCSS, Zustand, 다양한 캘린더 및 폼 관리 라이브러리가 통합되어 있어 일정 관리, UI 구성, 상태 관리를 빠르고 유연하게 개발할 수 있도록 구성되어 있습니다.

---

## � 기본 정보

| 항목            | 설명                                |
| --------------- | ----------------------------------- |
| 프레임워크      | React 19, Vite, Node 22.14.0        |
| 스타일링        | TailwindCSS, shadcn/ui              |
| 상태 관리       | Zustand                             |
| 폼 처리 및 검증 | React Hook Form, Zod                |
| 일정 처리       | FullCalendar, React Big Calendar 등 |
| 빌드 도구       | Vite                                |
| 아이콘          | Lucide Icons                        |
| 애니메이션      | Framer Motion                       |
| 인증 처리       | JWT, js-cookie                      |

---

## 설치 및 실행 방법

### 1. 의존성 설치

```bash
yarn install
# 또는
npm install
```

### 2. 로컬,개발, 운영 서버 실행

```bash
yarn dev
# 또는
npm run dev
```

- 로컬 서버는 기본적으로 **http://localhost:5173** 에서 실행됩니다.
- 개발(테스트) 서버는 **https://admin-dev.onegrove.kr/** 입니다.
- 운영 서버는 **https://cms.onegrove.kr/** 입니다.

---

### 3. 빌드

```bash
yarn build
```

---

### 4. 형상관리

형상관리 : GITLab

- dev : development

개발 시 해당 개발자명으로 브랜치를 따로 생성해 개발할 것

## 전체 폴더 구조

```bash
.
├── public/                     # 정적 파일 (favicon, 이미지 등)
├── src/
│   ├── components/             # 재사용 가능한 컴포넌트
│   ├── hooks/                  # 커스텀 훅
│   ├── lib/                    # 유틸 함수, 공통 로직
│   ├── pages/                  # 라우팅되는 주요 페이지 컴포넌트
│   ├── styles/
│   │   └── index.css          # TailwindCSS 포함된 메인 CSS
│   └── main.jsx               # React 진입점
├── vite.config.js             # Vite 설정 파일
├── components.json            # shadcn/ui 설정
├── package.json               # 의존성 및 스크립트 정의
└── README.md                  # 현재 문서
```

---

## 주요 컴포넌트 세부 구조

# components/common 디렉토리 구조 및 컴포넌트 설명

`components/common` 폴더는 공통적으로 사용되는 UI 요소들을 모아 둔 폴더입니다.  
버튼, 입력 필드, 캘린더, 테이블, 에디터 등 다양한 UI 컴포넌트가 포함되어 있어 재사용성과 유지보수성을 높입니다.

---

## 디렉토리 구조

```bash

components/common/
├── Button.jsx
├── Calendar.jsx
├── CalendarToolbar.jsx
├── calendar.css
├── Checkbox.jsx
├── CustomToolbar.jsx
├── DataTable.jsx
├── DataTableSimple.jsx
├── Datepicker.jsx
├── Editor.jsx
├── Input.jsx
├── LoadingSpinner.jsx
├── Modal.jsx
├── NewInput.jsx
├── NewTab.jsx
├── OfficeFloorForm.jsx
├── Pagination.jsx
├── Radio.jsx
├── RadioGroup.jsx
├── ResultSummary.jsx
├── Select.jsx
├── SelectInput.jsx
├── styles.css
├── textType.jsx
├── Textarea.jsx
├── Tooltip.jsx
└── Upload.jsx
```

## 컴포넌트 상세 설명

### Button.jsx

공통 버튼 컴포넌트. `variant` prop으로 스타일 변경 가능 (`default`, `white`, `outline` 등).

---

### Calendar.jsx

`react-big-calendar`를 커스터마이징한 달력 컴포넌트.  
날짜 선택, 이벤트 처리, 툴바 및 팝업 포함. 주말/공휴일 선택 제한 기능 포함.

---

### CalendarToolbar.jsx

달력 전용 툴바. 월 전환, 날짜 선택 기능 포함. `Datepicker`와 함께 사용.

---

### calendar.css

달력 관련 컴포넌트의 스타일을 커스터마이징한 CSS 파일.  
`.rbc-*` 클래스를 오버라이드하여 UI 개선.

---

### Checkbox.jsx

커스텀 체크박스. 기본 스타일과 함께 라벨, disabled 지원.

---

### CustomToolbar.jsx

달력 내 상단 툴바 UI. 월 이동, 날짜 포맷 등 단순한 내비게이션 툴바.

---

### DataTable.jsx

체크박스를 포함한 테이블 UI. 선택 기능, 링크 이동, 커스텀 컬럼 등을 지원.

---

### DataTableSimple.jsx

선택 기능이 빠진 간단한 테이블 UI.

---

### Datepicker.jsx

`react-datepicker` 기반 날짜/시간 선택 컴포넌트.  
`single`, `range`, `time-only`, `icon-only` 모드 지원.

---

### Editor.jsx

`BlockNote` 기반의 블록 에디터.  
파일 업로드, 커스텀 명령어, 폰트 크기 등 다양한 편집 기능 제공.

---

### Input.jsx

기본 입력 필드. 비밀번호 보기/숨기기, 클리어 버튼, 오류 메시지 등 포함.

---

### LoadingSpinner.jsx

전역 로딩 스피너. `zustand` 상태를 기반으로 조건부 렌더링.

---

### Modal.jsx

재사용 가능한 모달 컴포넌트. `onClose`, `onConfirm`, `showConfirm`, `showCancel` 등 지원.

---

### NewInput.jsx

`Input.jsx`의 좌측 라벨 정렬 버전. 같은 기능 + 레이아웃 차이.

---

### NewTab.jsx

탭 전환 컴포넌트. 탭 배열과 index를 넘겨서 외부 제어 가능.

---

### OfficeFloorForm.jsx

오피스 및 층 입력 폼. 최대 4개 항목까지 추가/삭제 가능. `react-hook-form`과 통합.

---

### Pagination.jsx

페이지 이동 버튼. `< ≪ 1 2 3 ≫ >` 형태의 기본 페이지네이션 UI.

---

### Radio.jsx

단일 라디오 버튼. label, value, onChange, checked, disabled 지원.

---

### RadioGroup.jsx

`Radio.jsx`를 묶어서 라디오 그룹을 구성하는 컴포넌트. 설명, 유효성 메시지 포함.

---

### ResultSummary.jsx

"총 00건" 형태로 결과 개수를 요약 출력하는 컴포넌트. 테이블 위에 표시.

---

### Select.jsx

기본 드롭다운 셀렉트 박스. 포커스 상태에 따라 아이콘 전환 포함.

---

### SelectInput.jsx

셀렉트 + 인풋 필드 조합. 셀렉트 값 + 직접 입력 값 혼합 입력 가능.

---

### styles.css

에디터 블록의 커스텀 스타일 정의. `.fontsize`, `.alert-icon` 등 포함.

---

### textType.jsx

`BlockNote`용 커스텀 블록 정의 (Alert 타입 등). 폰트 사이즈 선택 드롭다운 포함.

---

### Textarea.jsx

여러 줄 텍스트 입력 컴포넌트. `maxLength` 제한 시 글자 수 표시 가능.

---

### Tooltip.jsx

커스텀 툴팁. `top`, `bottom`, `left`, `right` 위치 지원. 마우스 hover로 표시됨.

---

### Upload.jsx

이미지 및 영상 업로드 컴포넌트. 미리보기, 파일 타입/용량 제한, 업로드 요청 처리 포함.

---

# components/modal 디렉토리 구조 및 컴포넌트 설명

`components/modal` 폴더는 해당 프로젝트에서 사용되는 모달을 모아놓은 공간입니다.  
showmodal을 통해 사용되며, 위에 설명한 공통 UI를 포함하고 있습니다.

---

## 디렉토리 구조

```bash
components/modal/
├─ BrandList.jsx
├─ MainBrandList.jsx
├─ WhatsOnList.jsx
├─ CompanySelectModal.jsx
├─ UserDetailModal.jsx
├─ PasswordResetModal.jsx
├─ ReservationForm.jsx
├─ SleepReservationForm.jsx
├─ SleepReservationDetail.jsx
└─ VisitForm.jsx
```

## 컴포넌트 설명

---

### BrandList.jsx

- 용도: **이벤트·프로모션용 브랜드 선택 모달**(다중 선택).
- 검색/필터: 대표 카테고리(`GET /api/v1/event-promotion/item/category`) + 브랜드명 키워드.
- 데이터: `GET /api/v1/event-promotion/item/brand?lang=ko|en` → 테이블 표시(카테고리/브랜드명).
- 선택: 체크박스 다중 선택 → `onConfirm(checkedIds)`로 반환, 초기값은 `selected` 반영.

---

### MainBrandList.jsx

- 용도: **메인 노출용 브랜드 선택 모달**(다중 선택).
- 검색/필터: 대표 카테고리(`GET /api/v1/brand/category`) + 브랜드명.
- 데이터: `GET /api/v1/main/brand/list?lang=KO` → 테이블 표시(카테고리/브랜드명).
- 선택: 체크박스 다중 선택, 초기값 `selected` 동기화 및 `초기화` 버튼 제공.

---

### WhatsOnList.jsx

- 용도: **What’s On 콘텐츠 선택 모달**(단일 선택).
- 검색/필터: 메뉴 카테고리(`GET /api/v1/main/content/category`) + 타이틀.
- 데이터: `GET /api/v1/main/content/list?lang=KO` → 테이블(메뉴/타이틀/기간/사용여부).
- 선택: 체크 시 **단일 선택**으로 고정, 초기화/검색 제공.

---

### CompanySelectModal.jsx

- 용도: **입주사 선택 모달**(다중 선택).
- 데이터: `GET /api/v1/work/companyList?lang=KO` → 테이블(입주사명).
- 동작: 검색/초기화 제공, `추가` 시 체크 항목으로 **선택 목록을 새로 구성**하여 `onConfirm` 전달.

---

### PasswordResetModal.jsx

- 용도: **비밀번호 찾기** 모달.
- 검증: 이메일 형식 확인(미입력/오형식 안내).
- 전송: `POST /api/v1/user/find-password` 성공 시 발송 안내 후 닫기.

---

### SleepReservationDetail.jsx

- 용도: **수면실 예약 상세/수정/삭제** 모달.
- 조회: `GET /api/v1/sleep/reserve/detail/{id}` → 상세 표시, **동시간대 목록 조회**로 예약자명 보정(`GET /sleep/reserve/list/detail`).
- 기능: **수정**(내부에서 `SleepReservationForm` 오픈) / **삭제**(`DELETE /sleep/reserve/delete/{id}`).
- 표시: 시간대는 `시작~(시작+50분)` 형태로 가공 출력.

---

### SleepReservationForm.jsx

- 용도: **수면실(Relax Room) 예약 등록/수정** 폼.
- 주요 필드: 수면실/호실, 입주사/사용자, 날짜, 시작시간(09~17시), 종료시간(자동 1시간), 메모.
- 중복 방지: 선택된 호실·시간에 **기예약 존재 시 비활성화**(표시에 “(예약됨)”).
- 데이터 로딩: 방 상세(`GET /sleep/room/detail/{roomId}`), 입주사/사용자 목록, **해당 날짜 09~17시 전체 슬롯의 예약 현황**을 루프 호출해 캐시.
- 수정 모드: 기존 `roomNumberId/시간/회사/사용자` 등을 로드해 초기값 세팅.

---

### ReservationForm.jsx

- 용도: **회의실(일반/VIP) 예약 등록/수정** 폼.
- 주요 필드: 오피스/회의실, 결제유형(무료/유료), 날짜/시작/종료, 내용, 예약자 이름/연락처/이메일, 인원수, 비고.
- 방/용량: 오피스 변경 시 **룸 옵션 재로딩 + 수용인원(capacity) 반영**, 선택한 시간 가용성 검사.
- 일정 검증: 선택 시간이 점유되면 **가장 이른 가용 시간**으로 자동 보정, 종료시간도 자동 제안(+1h, 충돌 회피).
- 전송: `POST /api/v1/meeting/{insert|update}`; 특정 오류 메시지(수정불가/등록불가/3일 전 변경불가)별 안내 처리.

---

### VisitForm.jsx

- 용도: **방문 예약 등록/수정** 폼 + **추가 방문자 관리**.
- 방문 인원: **1~10명** 허용, 대표 1명 + 추가 방문자(N-1) 자동 제어.
- 전화번호 UX: 입력을 항상 `010-XXXX-XXXX`로 **자동 포맷팅**(백스페이스/비정상 입력/초기값 보정 포함).
- 한글 IME: 이름/이메일 입력 시 **조합 중에는 필터 미적용**, 조합 종료 후 정제.
- 건물/입주사: 건물 리스트(`GET /api/v1/visit/building-list`), 입주사(`GET /api/v1/sleep/reserve/company`), 총무 권한은 **자사만 노출**.
- 추가 방문자: 이름/이메일/연락처/카드번호, **불완전 항목은 제외**하여 `memberList` 구성.
- 전송/검증: `visitNumber`는 `memberList.length`와 **동일**하게 보내며(서버 요구), 이메일 형식/전화 길이/필수값 검증 후 `insert|update` 분기.

---

### UserDetailModal.jsx

- 용도: **입주사 상세 정보 뷰어**(읽기 전용).
- 표시: 사용 여부(라디오, 비활성), 오피스/층, 대표명/전화/이메일, 대표 이미지, 총무 담당자 리스트.
- 월별 어메니티 시간: **무료/유료** 사용시간을 동시 조회하여 상단 지표로 표시.

---

# src/pages/admin/adminpage 디렉토리 구조 및 컴포넌트 설명

`src/pages/admin/adminpage` 폴더는 해당 프로젝트에서 관리자 / 입주사 총무팀 계정을 관리하는 폴더입니다.  
관리자 / 입주사 총무팀 계정 리스트부터 등록 및 수정, 조회 기능을 담당하는 컴포넌트로 구성되어 있습니다.

---

## 디렉토리 구조

```bash
src/pages/admin/adminpage
├─ AdminLayout.jsx
├─ AdminListPage.jsx
├─ AdminRegist.jsx
├─ AdminDetailPage.jsx
├─ AffairListPage.jsx
├─ AffairRegist.jsx
└─ AffairDetailPage.jsx
```

## 컴포넌트 상세 설명

---

### AdminLayout.jsx

- 용도: 관리자 영역 공통 레이아웃. `Outlet` 렌더.

---

### AdminListPage.jsx

- 용도: **일반/콘텐츠/오피스 관리자** 목록/검색/삭제/등록 이동.
- 데이터: `GET /api/v1/user/admin?isManager=N` → 최신 등록순 정렬 → 30개/페이지.
- 검색 필터: 관리자 유형(셀렉트), 이름, 아이디, 사용 여부(사용/미사용). Enter 검색 및 URL 쿼리 동기화.
- 액션: **등록**(`/admin/list/regist`), **삭제**(선택 id 배열 전달 → `/user/admin/delete`).
- 표 컬럼: 번호, 유형, 이름, 아이디, 이메일, 사용 여부, 등록일시 등.

---

### AdminRegist.jsx

- 용도: **관리자 계정 등록**(NORMAL/CONTENTS/OFFICE).
- 입력: 이름/성별, 아이디(영소문자·숫자 4~16), 비밀번호·확인, 전화(010- + 8자리), 이메일, 사용 여부.
- 검증: 아이디/비밀번호 일치, 전화 8자리, 이메일 형식 등 모달 안내.
- 전송: `POST /api/v1/user/admin/insert` (payload에 `role`, `isUse`, `isManager:"N"`, `isReservation:"Y"` 포함) → 성공 시 목록으로 이동.

---

### AdminDetailPage.jsx

- 용도: **관리자 상세/수정**.
- 조회: `GET /api/v1/user/admin/{id}` → 폼 패치(이름, 성별, 아이디, 전화, 이메일, 사용 여부).
- 기능:
  - **수정**: 검증 후 `POST /api/v1/user/admin/update` (`isManager:"N"` 등 포함).
  - **계정 잠금 해제** 버튼(잠금 상태일 때만): `POST /api/v1/user/unlock`.
  - **임시 비밀번호 발급**: `POST /api/v1/user/temp-password`.
- 전화 UX: 입력은 8자리만 허용, 저장 시 `010-####-####`로 포맷.

---

### AffairListPage.jsx

- 용도: **입주사 총무팀(OFFICE_SECRETARY_ADMIN)** 목록/검색/삭제/등록 이동.
- 입주사 옵션: `GET /api/v1/user/company` 로드 → **중복 companyId 제거** 후 셀렉트 구성.
- 데이터: `GET /api/v1/user/admin?isManager=Y` → 최신 등록순 정렬 → 30개/페이지.
- 검색 필터: 입주사, 이름, 아이디, 사용 여부(사용/미사용). Enter 검색 및 URL 쿼리 동기화.
- 액션: **등록**(`/admin/affair/regist`), **삭제**(`/user/admin/delete`).
- 표 컬럼: 번호, 입주사, 유형, 이름, 아이디, 이메일, 사용 여부, 등록일 등.

---

### AffairRegist.jsx

- 용도: **입주사 총무팀 계정 등록**(role 고정: `OFFICE_SECRETARY_ADMIN`).
- 입력: 입주사(필수), 이름/성별, 아이디(영소문자·숫자 4~16), 비밀번호·확인, 전화(010- + 8자리), 이메일, 사용 여부, 어메니티 예약 가능(Y/N).
- 검증: 필수값·아이디 규칙·전화 8자리·이메일 형식·비밀번호 일치.
- 전송: `POST /api/v1/user/admin/insert` (payload에 `companyId`, `isManager:"Y"`, `isReservation` 포함) → 성공 시 총무 목록으로 이동.

---

### AffairDetailPage.jsx

- 용도: **입주사 총무팀 상세/수정**.
- 조회:
  - 상세: `GET /api/v1/user/admin/{id}` → 폼 패치(입주사, 이름, 성별, 아이디, 전화, 이메일, 사용 여부, 예약 가능 여부).
  - 입주사 목록: `GET /api/v1/user/company` → **중복 제거** 후 셀렉트 구성.
- 기능:
  - **수정**: 검증 후 `POST /api/v1/user/admin/update` (`isManager:"Y"`, `isReservation` 포함).
  - **계정 잠금 해제**: `POST /api/v1/user/unlock` (해제 시 안내 모달).
  - **임시 비밀번호 발급**(버튼 존재 가능, 구현 위치에 따라 상세는 코드 참고).
- 전화 UX: 입력 8자리 제한, 저장 시 `010-####-####` 포맷.

---

# src/pages/banner 디렉토리 구조 및 컴포넌트 설명

`src/pages/banner` 폴더는 해당 프로젝트에서 배너 영역을 관리하는 폴더입니다.  
메뉴별 배너 영역의 컨텐츠를 등록 및 수정 기능을 담당하는 컴포넌트로 구성되어 있습니다.

---

```bash
src/pages/banner
├─ BannerLayout.jsx
├─ MainBannerPage.jsx        # MENU: bn0101 (메인)
├─ WhatsonBannerPage.jsx     # MENU: bn0102 (What's On)
├─ LifeStyleBannerPage.jsx   # MENU: bn0103 (라이프스타일)
├─ WorkBannerPage.jsx        # MENU: bn0104 (워크)
├─ AboutBannerPage.jsx       # MENU: bn0105 (어바웃)
└─ component/
   └─ BannerForm.jsx         # 공통 폼 (국/영문 탭에서 공유)
```

### BannerLayout.jsx

- 용도: 하위 라우트 감싸는 레이아웃
- 동작: 내부 <Outlet /> 렌더

---

### BannerForm.jsx

- 용도: 배너 입력/검증/매핑 공통 폼(국문/영문 탭에서 재사용).
- 주요 필드: 배너타입(N=기본형, B=대형), 사용여부(Y/N), 타이틀/서브타이틀, URL, 이미지(PC/MO).
- 이미지 규격 안내: PC 1920×140, MO 720×264, 최대 20MB, JPG/JPEG/PNG.
- 필수 검증: `title`, `url`, `bannerType`, `displayYn`, `image1.path(PC)`, `image2.path(MO)`.
- props:
  - `data`: 현재 언어 데이터(초기값/재조회값).
  - `lang`: `"ko"` 또는 `"en"` (저장 시 `"KO"`/`"EN"`로 변환).
  - `menu`: 메뉴 코드(`bn0101` 등).
- 메서드(ref 노출): `submit(onError) → payload|null`
  - 누락 시 `onError(message)` 호출 후 `null` 반환.
  - 성공 시 서버 전송용 payload 반환.
- 이름 매핑(중요):
  - `subtitle → subTitle`
  - `bannerType → type`
  - `displayYn → showYn`
  - `image1 → pcImg`, `image2 → moImg`

---

### MainBannerPage.jsx

- 용도: **메인** 띠배너 관리(국문/영문 탭).
- 탭: `0=KO`, `1=EN`.
- 조회: `GET /api/v1/banner/bn0101/{KO|EN}` → 폼 `reset`.
- 저장: `ref.submit(onError)` → `POST /api/v1/banner/insert|update`(id 유무로 분기) → 성공 후 **재조회**.
- UI: 상단 탭, 우측 하단 정렬 저장 버튼.

※ 나머지 메뉴의 배너 영역은 메뉴별로 각각 관리되고있으나, 컴포넌트 구조는 메뉴 코드를 제외하면 동일합니다.

---

# src/pages/contents/whatson/event 디렉토리 구조 및 컴포넌트 설명

`src/pages/contents/whatson/event` 폴더는 해당 프로젝트에서 What's On 영역 중 Event&Promotion 영역을 관리하는 폴더입니다.  
Event&Promotion 영역의 콘텐츠를 등록 및 수정, 조회 등의 기능을 담당하는 컴포넌트로 구성되어 있습니다.

---

```bash
src/pages/contents/whatson/event
├─ EventLayout.jsx
├─ EventListPage.jsx
├─ EventRegist.jsx
├─ EventDetail.jsx
└─ components/
      └─ EventRegistForm.jsx  # 공통 폼 (국/영문 탭에서 공유)
```

---

### EventLayout.jsx

- 용도: 이벤트/프로모션 하위 화면을 감싸는 베이스 레이아웃.
- 동작: 내부에 `Outlet`만 렌더

---

### EventListPage.jsx

- 용도: 이벤트/프로모션 **목록/검색/일괄 삭제/등록 이동**.
- 검색 필터: 카테고리, 등록일(기간), 타이틀(입력/Enter), 노출 여부(Y/N).
- 테이블: 언어(ko/en), 타이틀(클릭 시 상세 페이지 이동), 진행 상태, 노출여부, 등록자, 등록일시.
- 정렬/페이징: 최신 등록일 기준 정렬 후 페이지네이션(30개/페이지).
- 액션: **등록**(신규 페이지로 이동), **삭제**(선택 후 `/item/delete` 호출).
- 데이터: `/api/v1/event-promotion/item` 조회 → 클라이언트 필터/정렬 후 렌더.

---

### EventRegist.jsx

- 용도: **신규 등록** (국문/영문 탭).
- 탭: `0=국문`, `1=영문`. 탭별 폼 ref 관리(ko/en).
- 저장: 현재 탭 폼의 `submit` → 유효성 통과 시 확인 모달 → `/item/insert` 호출 → 목록 이동.
- 상태 공유: 브랜드/카테고리 선택값은 탭 간 공유 가능.

---

### EventDetail.jsx

- 용도: **상세/수정** (국문/영문 탭).
- 초기 로딩: `emId`로 `/item/{emId}` 조회 → 언어별 데이터 분리(ko/en) → 폼 값 패치.
- 카테고리: `/item/category` 로드 후 코드/라벨 혼합 입력 보정(`resolveCategoryCode`).
- 이미지 패치: 누락된 `path/name/status` 보정 및 CDN 경로 기본값 적용.
- 저장: 탭별 `submit` 결과 → 파일 메타 정리(`toImageMeta`) → `/item/insert`(신규) 또는 `/item/update`(수정) 호출 → 목록 이동.
- 기타: 종료일 수동입력 플래그를 localStorage에 저장/정리.

---

### EventRegistForm.jsx

- 용도: 이벤트 등록/수정 **공통 폼**(국/영 재사용, `forwardRef`).
- 주요 입력
  - 카테고리(필수, API 옵션 로드), 노출 여부(active/inactive), 노출 순서(1~100), 제목(필수, 100자),  
    이미지: 썸네일/본문(PC, MO 각 1개씩 필수), 하단배너(PC/MO, 선택), 상세 내용(에디터, 필수),
    기간: 시작(날짜·시간), 종료(날짜·시간) **또는** 종료 수동입력(최대 10자),
    진행 상태(진행/종료), 노출 브랜드(모달 선택), 디스크립션(최대 250자).
- 검증: 카테고리/제목/필수 이미지(썸네일·본문 PC/MO)/상세 내용/기간 필수. 수동 종료 시 `endInput` 필수.
- ref 메서드: `submit(onError)` → 유효성 실패 시 콜백 호출, 성공 시 **payload 반환**.
- payload(예): `{ lang, showYn, sort?, category, title, thumbImg, imgBodyPc, imgBodyMo, imgPc?, imgMo?, content, description, startDate, endDate|null, endInput|null, manualEndInput, progressYn, brandId?, delYn:"N" }`
- 동작 보조: 브랜드 조회/세팅, 카테고리 코드 보정, 시작/종료 시간 문자열 조립.

---

# src/pages/contents/whatson/stories 디렉토리 구조 및 컴포넌트 설명

`src/pages/contents/whatson/stories` 폴더는 해당 프로젝트에서 What's On 영역 중 Stories of Onegrove 영역을 관리하는 폴더입니다.  
Stories of Onegrove 영역의 콘텐츠를 등록 및 수정, 조회 등의 기능을 담당하는 컴포넌트로 구성되어 있습니다.

---

```bash
src/pages/contents/whatson/stories
├─ StoriesLayout.jsx
├─ StoriesListPage.jsx
├─ StoriesRegist.jsx
├─ StoriesDetail.jsx
└─ components/
       └─ StoriesRegistForm.jsx  # 공통 폼 (국/영문 탭에서 공유)
```

---

### StoriesLayout.jsx

- 용도: Stories 하위 화면을 감싸는 레이아웃(`Outlet` 렌더).

---

### StoriesListPage.jsx

- 용도: 스토리 **목록/검색/삭제/등록 이동**.
- 검색: 카테고리(텍스트), 등록일 범위(기간 선택), 타이틀(Enter로 즉시 검색), 노출 여부(Y/N).
- 데이터 로딩: `GET /api/v1/stories` → `contentList`에서 **KO/EN 분리** 후 테이블 바인딩.
- 테이블: 노출순서(ko/en), 카테고리(ko/en), 타이틀(클릭 시 상세 이동 `...?lang=ko|en`), 상태, 노출여부, 등록자, 등록일시.
- 페이징: 30개/페이지, 검색 조건 반영하여 클라이언트 슬라이싱.
- 액션: **등록**(신규 페이지로 이동), **삭제**(선택행 확인 모달 → `POST /api/v1/stories/delete`에 ID 배열 전송).

---

### StoriesRegist.jsx

- 용도: **신규 등록** 탭 화면(국문/영문).
- 탭 & 상태: `0=국문`, `1=영문`; 탭별 폼 ref/상태 분리(`koFormRef`, `enFormRef`).
- 저장: 현재 탭 폼의 `submit(onError)` → 확인 모달 → `POST /api/v1/stories/insert` → 목록 이동(`/contents/whatson/stories/list`).
- 버튼: 저장 / 목록(이동 확인 모달).

---

### StoriesRegistForm.jsx

- 용도: 스토리 **공통 폼**(국/영 재사용, `forwardRef`).
- 주요 입력: 제목(필수, 100자), 디스크립션(필수, 200자), 카테고리(필수), 노출순서(1~100), 노출여부(사용/미사용), 노출기간(시작/종료 **날짜+시간**), 본문 에디터(필수), **추가 내용**(옵션 토글), 썸네일/패턴(상단·하단 PC·MO 각 1개 **필수**), **스와이프 이미지**(최소 3개, 최대 10개, 캡션 포함).
- 이미지 메타: 신규/유지/수정/삭제를 `status: "C"|"R"|"E"|"D"`로 생성(`toImageMeta`), 삭제/교체 이력 반영.
- 유효성: 카테고리/제목/디스크립션/본문/기간/필수 이미지 모두 확인, 스와이프 이미지는 **3개 이상**.
- 반환(payload 예):  
   `{
  id|null, lang:"ko|en", showYn:"Y|N", sort:"노출순서",
  category, title, description, content, addContent?,
  thumbImg, patternTopPc/Mo, patternBottomPc/Mo,
  storiesImgList: [{...meta, caption, sort, status}],
  startDt:"YYYY-MM-DD HH:mm", endDt:"YYYY-MM-DD HH:mm", delYn:"N"
}`
- 추가 기능: 스와이프 이미지 **추가/삭제/재정렬**, 추가 내용 토글 시 에디터 초기화 처리.

---

### StoriesDetail.jsx

- 용도: **상세/수정** 탭 화면(국문/영문).
- 조회: `GET /api/v1/stories/detail/{emId}/KO` & `/EN` → 폼 값 패치(이미지 경로/파일명/상태 보정 포함).
- 저장: 현재 탭 값으로 payload 빌드(삭제된 이미지 `status:"D"` 포함) → `POST /api/v1/stories/update`(id 존재) 또는 `insert`(신규) → 목록 이동.
- 부가 표시: 등록/수정 일시 및 사용자 정보 표.
- 탭 진입 파라미터: `?lang=ko|en`로 초기 탭 결정.

---

# src/pages/contents/whatson/press 디렉토리 구조 및 컴포넌트 설명

`src/pages/contents/whatson/press` 폴더는 해당 프로젝트에서 What's On 영역 중 Press & Media 영역을 관리하는 폴더입니다.  
Press & Media 영역의 콘텐츠를 등록 및 수정, 조회 등의 기능을 담당하는 컴포넌트로 구성되어 있습니다.

---

```bash
src/pages/contents/whatson/press
├─ PressListPage.jsx
├─ PressRegist.jsx
├─ PressDetail.jsx
└─ component/
      └─ PressRegistForm.jsx  # 공통 폼 (국/영문 탭에서 공유)
```

---

### PressListPage.jsx

- 용도: 프레스 콘텐츠 **목록/검색/삭제/등록 이동** 화면.
- 검색 필터: 카테고리(셀렉트), 등록일(기간), 타이틀(Enter 즉시검색), 노출여부(Y/N).
- 데이터 로딩: `GET /api/v1/press` → ko/en 항목 병합하여 한 행으로 표시(언어별 타이틀/노출여부 컬럼).
- 카테고리 옵션: `GET /api/v1/press/category` 사전 로딩.
- 정렬/페이징: 등록일 **최신순**, 30개/페이지.
- 이동: 타이틀 클릭 시 상세로 이동 `.../media/{pmId}?lang=ko|en` / 등록 버튼은 신규 페이지로 이동.
- 삭제: 선택 행 후 `POST /api/v1/press/delete`(ID 배열).
- URL 동기화: 검색·페이지 등 쿼리스트링 반영(`name, category, visibility, startDate, endDate, page`).

---

### PressRegist.jsx

- 용도: 프레스 **신규 등록** (국문/영문 탭).
- 탭: `0=국문`, `1=영문`; 탭별 폼 ref 분리(`koFormRef`, `enFormRef`).
- 저장: 현재 탭 `ref.submit(onError)` → 확인 모달 → `POST /api/v1/press/insert` → 목록 이동.
- 버튼: 저장 / 목록(이동 확인 모달).
- 상태: 탭별 `koData`, `enData` 보유(초기 빈 객체).

---

### PressDetail.jsx

- 용도: 프레스 **상세/수정** (국문/영문 탭).
- 조회: `GET /api/v1/press/{pmId}` → 응답 배열에서 `lang==="ko"|"en"` 분리 후 각 폼에 패치.
- 이미지 패치: 기존 이미지 `path` 있으면 `status:"R"`로 보정(유지), 삭제 시 `status:"D"` 처리.
- 저장: 현재 탭 `submit` 값 + 기존값 병합 → `thumbImgPc/Mo`를 **toImageMeta**로 정규화 →  
  `POST /api/v1/press/update`(id 존재) 또는 `insert`(신규) → 완료 모달 → 목록으로 이동(`?refresh=timestamp`).
- 메타 표: 등록/수정 일시·사용자 정보 테이블 제공(언어별).
- 초기 탭: `?lang=ko|en` 쿼리로 결정.

---

### PressRegistForm.jsx

- 용도: 프레스 등록/수정 **공통 폼**(`forwardRef`, 국/영 재사용).
- 입력: 카테고리(필수, 옵션은 `GET /api/v1/press/category`), 제목(필수, 최대 100자),  
  썸네일 이미지 PC/MO(둘 다 필수), 노출여부(노출/미노출), 내용(에디터, 필수), 발행일(단일 날짜).
- 기본값: `status:"inactive"`, `publishDate: 오늘(YYYY-MM-DD)`.
- 검증: 카테고리/제목/PC·MO 이미지/내용/발행일 **필수**(미입력 시 `onError(message)` 호출).
- 이미지 메타: 업로드 파일을 `{id,name,originalName,size,extension,mime,classification:"press-media",path,status}`로 변환.
- ref 메서드:
  - `submit(onError) → { id?, lang, category, title, thumbImgPc, thumbImgMo, showYn, content, publishDate } | null`
  - `setValue(key, value)`(에디터 포함 값 패치).
- 업로드 가이드: PC/MO 썸네일 **416×280px, 20MB 이하, JPG/JPEG/PNG 1개**.

---

# 그 외 주요 컴포넌트 설명

---

### src/pages/login/LoginPage.jsx

- 용도: **관리자 로그인** 화면(아이디/비밀번호 입력, 로그인, 비밀번호 찾기).
- 입력 UX
  - 아이디: 한글/영문/숫자만 허용, 공백 제거. **한글 조합 중(IMF/IME)**에는 필터 미적용 → 조합 종료 시 일괄 정제.
  - 비밀번호: `type="password"`, 클리어 버튼 제공.
- 로그인 처리
  - `getUserInfo(username, password)` 호출 성공 시  
    `accessToken/refreshToken` 상태(zustand) & `localStorage` 저장, `name/companyId` 상태 저장 → `/` 이동.
  - 실패 시 모달로 에러 표시(`extractErrorMessage`).
- 세션 초기화
  - 마운트 시 기존 `accessToken`, `refreshToken`, `auth-storage` **제거**(강제 로그아웃/깨끗한 시작).
- 보안/토큰
  - `jwtDecode`로 토큰 디버그(콘솔). 실제 화면 표시 없음.
  - 토큰은 zustand(`useAuthStore`)와 `localStorage`에 동시 보관.
- 보조 기능
  - **아이디 저장** 체크박스 UI만 존재(현재 코드상 _실제 저장/자동 입력은 미구현_).
  - **비밀번호 찾기**: 모달 오픈(`PasswordResetModal`).
- 레이아웃/스타일
  - 중앙 정렬 단일 카드, 상단 로고(`/img/ONE GROVE.png`).
  - 공통 컴포넌트: `Input`, `Button`, `Checkbox`, `useModal`.

---

### src/lib/apiClient.js

- 용도: **Axios 인스턴스** 구성 + 토큰 자동첨부 + 로딩 상태 처리 + **401 자동 리프레시**.
- 동작
  - `baseURL = import.meta.env.VITE_API_BASE_URL`로 생성, `withCredentials:true`.
  - 요청 인터셉터: `localStorage.accessToken` → `Authorization: Bearer ...`, `useLoadingStore.startLoading()`.
  - 응답 인터셉터: 성공/에러 모두 `endLoading()` 보장.
  - **401 처리(리프레시)**: `/api/v1/auth/refresh` 호출 → 새 `accessToken`을 `useAuthStore.setAccessToken` + `localStorage` 저장 후 원 요청 재시도.
  - 리프레시 실패 시: 토큰/스토리지 정리(주석으로 로그인 리다이렉트 옵션).

---

### src/lib/utils.js

- 용도: **UI/업무 공통 유틸** 모음.
- 포함 함수
  - `cn(...inputs)`: `clsx` + `tailwind-merge`로 클래스 안전 병합.
  - `isWeekend(date)`: 토/일 판별.
  - `isHoliday(date)`: 간단 공휴일(1/1, 3/1, 5/5, 8/15, 10/3, 12/25) 판별.
  - `getBusinessDaysDiff(from, to)`: 주말/공휴일 제외 **영업일 수** 계산.
  - `extractErrorMessage(error, defaultMsg)`: `"400 BAD_REQUEST \"실제메시지\""` 포맷 등에서 **가독성 있는 에러문구** 추출.
  - `extractSuccessMessage(response, defaultMsg)`: 성공 메시지 안전 추출.

---

### src/layouts/AuthLayout.jsx

- 용도: **인증 보호 레이아웃**(사이드바/헤더/푸터 + 권한 검사).
- 인증 흐름
  - 쿠키 `ACCESS_TOKEN` 존재 여부로 1차 검사 → 없으면 토큰/스토리지 정리 후 `/login` 이동.
  - 스토어에 `accessToken` 없으면 **쿠키 토큰으로 보강**.
  - 라우트 메타에서 `permissions` 확인 → 불일치 시 로그아웃 후 `/login`.
- UI: 사이드바 확장/축소, 모바일 토글 버튼, `Outlet` 영역에 페이지 출력.

---

### src/routes/index.jsx

- 용도: **라우트 메타(routeMeta)** 정의 + 접근권한 + 사이드바 데이터 + 매칭/빌드 유틸.
- 주요 항목
  - `routeMeta`: 레이아웃/페이지/아이콘/권한/숨김 여부를 포함한 트리.
  - `buildRoutes()`: `routeMeta` → React Router Routes로 변환.
  - `extractSidebarItems(items, role)`: 권한/hidden 반영해 **사이드바 메뉴** 생성.
  - `findMatchingRoute(pathname)`: 현재 경로에 매칭되는 라우트 메타 검색.

---

### src/api/user.js

- 용도: **인증 API** 래퍼.
- `getUserInfo(username, password)`
  - `POST {VITE_API_BASE_URL}/api/v1/auth/login` (쿠키 포함) → 유저/토큰 정보 반환.
- `getRefreshAccessToken()`
  - `POST {VITE_API_BASE_URL}/api/v1/auth/refresh` → 새 `accessToken`/`permission` 받아 `useAuthStore.setAccessToken`로 저장.

---

### src/store/authStore.js

- 용도: **인증 상태(Zustand + persist)** 관리.
- 상태: `accessToken`, `refreshToken`, `permission`, `name`, `companyId`, `companyName`.
- 메서드
  - `setAccessToken(token)`: `jwtDecode`로 **roles/id/company** 파싱 → 상태/로컬스토리지 저장 + 쿠키 `ACCESS_TOKEN`(12h, sameSite:strict, dev에서 secure).
  - `setRefreshToken(token)`: 상태/로컬스토리지 저장.
  - `removeAccessToken()`: 토큰/권한/회사 식별자 초기화 + 쿠키 제거.
  - `hasPermission(requiredPermission)`: 현재 권한 포함 여부 체크.
  - `setName(name)`, `setCompanyId(companyId)`: 보조 세터.

---

### Meeting.jsx

- 용도: **일반 회의실** 예약 캘린더(가예약/확정 표시, 상세·수정·취소).
- 오피스/회의실 선택: `/meeting/location-list`, `/meeting/room-list?isVip=N&location=...` 로드 후 첫 방 자동 선택.
- 설정/수용인원: `/meeting/setting?isVip=N` 기반으로 방별 `capacity` 매핑(useMemo).
- 일정 로딩: `/meeting?roomId={id}&isVip=N&lang=ko` → `CommonCalendar`에 이벤트 표시.
- 권한 처리: `OFFICE_SECRETARY_ADMIN`은 **본인 예약만 상세정보** 노출/클릭 가능.
- 상세 모달: 예약 종류/일정/상태/사용자·예약자 정보 테이블, **확정/취소/수정** 버튼(유·무료/예약일 임박 여부에 따른 제한 로직).
- 신규 예약: “예약하기” → `ReservationForm` 모달(초기값 전달, 저장 시 재조회).
- 경로 : src/pages/office/meeting/Meeting.jsx

---

### Viproom.jsx

- 용도: **Executive(VIP) 회의실** 예약 캘린더. 전체 흐름은 `Meeting.jsx`와 동일하되 `isVip=Y`, 용어만 Executive로 표기.
- 차이점
  - API: `/meeting/setting?isVip=Y`, `/meeting/room-list?isVip=Y&location=...`, `/meeting?roomId=...&isVip=Y`.
  - 기본 `capacity` 예외값 4, 모달 키/상태 유지를 위한 `currentStateRef`/고유 `modalKey` 사용.
  - 상세 모달 타이틀/버튼 라벨: “Executive Room …”.
  - 경로 : src/pages/office/viproom/Viproom.jsx

---

### ReserveHistory.jsx

- 용도: **회의실 예약 이력** 조회/검색/엑셀 다운로드 화면.
- 검색 필터: **Meeting Room**(이력에서 고유값 생성), **입주사**(GET `/api/v1/meeting/office-list?lang=ko`), **예약 종류**(전체/무료/유료), **예약 일정**(기간), **예약 상태**(전체/가예약/예약 확정/예약 취소).
- 데이터 로딩: **이력** `GET /api/v1/meeting/history` → 상태에 저장 후 **클라이언트 필터링** 적용.
- 목록 & 페이징: `DataTableSimple`로 표 렌더, **30개/페이지**(`Pagination`).
- 표 컬럼: 번호, 회의실, 입주사, 결제 유형, 예약 일정, **누적 무료 시간**, **누적 유료 시간**, 예약 상태, 실제 예약자, 연락처, 이메일, 등록일시, 등록자.
- 엑셀 다운로드: 필터 결과가 있을 때 **POST** `/api/v1/meeting/history-excel`(body: 현재 필터 결과) → **xlsx Blob** 저장(파일명: `회의실_예약_이력_YYYY-MM-DD-HH-MM-SS.xlsx`).
- 날짜 필터 로직: `resvDatetime`의 **시작 시각**만 파싱 후 일 단위로 정규화해 범위 비교.
- URL 동기화: `page`를 쿼리스트링으로 유지/초기화, **초기화 버튼**으로 필터 기본값 복원.
- 기타: `activeFilter` 변경 시 이력/입주사 목록 재조회, Meeting Room 드롭다운은 **이력 데이터의 고유 회의실명**으로 구성.
- 경로 : src/pages/office/ReserveHistory.jsx

---

### SleepReserve.jsx

- 용도: **Relax Room(수면실)** 시간대별 예약/상세/수정.
- 방 선택/상세: `/sleep/reserve/list/room`(목록), `/sleep/room/detail/{roomId}`(시간대/성별/침대 정보).
- 슬롯 생성: 시작~종료에서 **60분 간격 슬롯**, 각 슬롯 이용시간 **50분**(예: 10:00~10:50).
- 예약 현황: `/sleep/reserve/list/count`(슬롯별 카운트) + 슬롯 펼치기 시 `/sleep/reserve/list/detail`(개별 침대 예약내역).
- 수용 인원: `infoList.useYn==="Y"` 개수 기반, 성별에 따라 M=8 / W=7 / 기타=7로 상한.
- 날짜 이동: 오늘 기준 **지난 8일~오늘** 범위 내에서만 이전/다음 이동 가능.
- 모달
  - “예약하기”: `SleepReservationForm`(저장 후 카운트/상세 재로드)
  - 예약 클릭: `SleepReservationDetail`(수정/취소 후 목록 재로드)
- 경로 : src/pages/office/sleep/SleepReserve.jsx

---

### Visit.jsx

- 용도: **방문 예약** 목록/검색/대량 확정/단건 상세·수정·등록.
- 카테고리 로드: `/visit/category` → 입주사/상태/방문동 옵션 일괄 세팅.
- 검색 필터: 입주사/상태/방문 신청일(기간)/방문동/카드번호(3자리↑)/방문객명 → URL 쿼리(`page, companyId, …`)와 동기화.
- 목록/정렬: 클라이언트 필터 후 정렬(기준 컬럼 asc/desc, 동률 시 등록일시 보조정렬), 페이지 사이즈 30.
- 상세 모달: `/visit/detail/{id}` → 예약일시/상태/방문일·시간/입주사/방문동/목적/연락처/카드번호 표시 + **확정/취소/수정**.
- 대량 확정: 체크 선택 후 **가예약만** `/visit/confirm` 호출.
- 등록/수정: `VisitForm` 모달로 입력/검증 → 저장 후 재조회.
- 경로 : src/pages/office/visit/Visit.jsx

---

### src/pages/submain/work/component/CompanyList.jsx

- 용도: **Work 입주사 리스트** 관리(선택/정렬/삭제표시). 드래그앤드롭으로 노출 순서 지정.
- 선택 관리: `CompanySelectModal`로 선택 확정 시
  - 기존 목록과 신규 선택을 **companyId 기준 병합**.
  - 해제 항목은 `delYn:"Y"`로 표시(보존), 유지/신규는 `delYn:"N"`.
- 정렬/제한: `delYn!=="Y"` 항목만 **1~N 문자열 sort** 재부여, 화면엔 **최대 20개** 노출.
- DnD: `@hello-pangea/dnd`로 순서 변경 → 변경 즉시 sort 재계산.
- 삭제 버튼: 개별 항목 `delYn:"Y"` 마킹(리스트에선 숨김, 데이터는 유지).

---

## 참고

- 대부분의 컴포넌트는 **TailwindCSS**를 기반으로 스타일링 되어 있으며,
- 상태 관리에는 **Zustand**, 폼 관리에는 **React Hook Form**이 사용됩니다.
- Editor 관련 구성은 `BlockNote`를 기반으로 하고 있으며, 일부 커스텀 명령어 및 스타일이 적용되어 있습니다.

## 주요 라이브러리 및 역할

### React & Vite

- 빠른 개발 환경 제공
- `vite.config.js`에서 경로 alias 및 서버 설정 가능

### TailwindCSS + shadcn/ui

- 유틸리티 기반 CSS 프레임워크
- `components.json`을 통해 디자인 프리셋 및 경로 alias 설정

### Zustand

- 전역 상태 관리 (예: 로그인 상태, 모달 등)

### React Hook Form + Zod

- 강력하고 유연한 폼 처리 및 유효성 검사

### 캘린더 관련 라이브러리

- 다양한 캘린더 UI 구성 가능
  - `@fullcalendar/react`
  - `react-big-calendar`
  - `react-datepicker`
  - `tui-calendar`

### 인증/보안

- JWT를 사용한 인증 구조
- `js-cookie`로 토큰 저장 및 관리
- `jwt-decode`로 토큰 파싱

---

## Alias 설정

vite.config.js에서 다음과 같이 경로 설정되어 있습니다:

```js
resolve: {
  alias: {
    "@": path.resolve(__dirname, "src"),
  },
}
```

또한 `components.json`에는 아래와 같은 별칭이 존재합니다:

```json
{
  "components": "@/components",
  "utils": "@/lib/utils",
  "ui": "@/components/ui",
  "lib": "@/lib",
  "hooks": "@/hooks"
}
```

예시:

```tsx
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

---

## 스크립트 설명 (`package.json`)

| 명령어         | 설명                          |
| -------------- | ----------------------------- |
| `yarn dev`     | 개발 서버 실행                |
| `yarn build`   | 빌드 파일 생성                |
| `yarn start`   | 배포 서버 실행 (`server.cjs`) |
| `yarn lint`    | ESLint로 코드 검사            |
| `yarn preview` | Vite 빌드 결과 미리보기       |

---

## 코드 품질 도구

- **ESLint**: `yarn lint` 또는 `npm run lint`
- **Prettier**: 자동 코드 정리
- **prettier-plugin-tailwindcss**: Tailwind 클래스 자동 정렬

---

## 기타 정보

- `.env` 파일을 통해 환경변수 설정 가능
- console.log 제거 기능 사용 가능 (`vite.config.js` 내 `strip()` 플러그인 주석 해제 필요)

---

## 참고 및 외부 문서

- [Vite 공식 문서](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zustand 문서](https://docs.pmnd.rs/zustand)
- [GPT 활용 가이드: gptonline.ai/ko](https://gptonline.ai/ko)

---
