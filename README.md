# Ongrove Admin CMS 구축 프로젝트

> 이 프로젝트는 React + Vite 기반으로 구축된 관리자 CMS입니다.  
> TailwindCSS, Zustand, 다양한 캘린더 및 폼 관리 라이브러리가 통합되어 있어 일정 관리, UI 구성, 상태 관리를 빠르고 유연하게 개발할 수 있도록 구성되어 있습니다.

---

## � 기본 정보

| 항목            | 설명                                |
| --------------- | ----------------------------------- |
| 프레임워크      | React 19, Vite, Node                |
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

로컬 서버는 기본적으로 **http://localhost:5173** 에서 실행됩니다.
개발(테스트) 서버는 **https://admin-dev.onegrove.kr/** 입니다.
운영 서버는 **https://cms.onegrove.kr/** 입니다.

---

### 3. 빌드

```bash
yarn build
```

---

### 4. 형상관리

형상관리 : GIT

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
├── Button.jsx #
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
├─ BrandList.jsx # 이벤트/프로모션 상품용 '브랜드' 단일 선택 리스트
├─ MainBrandList.jsx # 메인 화면용 '브랜드' 다중 선택 리스트(최대 20개)
├─ WhatsOnList.jsx # What's On(메인 콘텐츠) 단일 선택 리스트
├─ CompanySelectModal.jsx # 입주사 다중 선택 모달
├─ UserDetailModal.jsx # 입주사(회사) 상세 정보 조회 모달(읽기 전용)
├─ PasswordResetModal.jsx # 비밀번호 찾기(임시 비밀번호 발송) 모달
├─ ReservationForm.jsx # 회의실 예약 폼
├─ SleepReservationForm.jsx # 수면실 예약 폼
├─ SleepReservationDetail.jsx # 수면실 예약 상세/수정/삭제 모달
└─ VisitForm.jsx # 방문 예약 폼(추가 방문자 관리 포함)
```

## 컴포넌트 상세 설명

### BrandList.jsx

- 용도: 이벤트/프로모션 아이템 등록에서 브랜드를 하나만 선택하는 리스트.
- 주요 데이터
- 카테고리: /api/v1/event-promotion/item/category 로딩.
- 브랜드 목록(언어별): /api/v1/event-promotion/item/brand?lang=... 로딩 및 가공.
- 필터/검색: 카테고리+키워드 노멀라이즈 후 필터링.
- 선택 정책: 체크가 2개 이상이 되면 경고 모달로 단일 선택만 허용.
- 주요 Props: selected, onConfirm, closeModal, lang="ko".

---

### MainBrandList.jsx

- 용도: 메인 페이지 노출용 브랜드를 여러 개 선택. 컴포넌트명은 BrandList로 export 됩니다(파일명만 MainBrandList).
- 초기 체크 값: 외부 selected를 문자열 배열로 세팅.
- 선택 제한: 최대 20개 초과 시 경고 모달 표출.
- 주요 Props: selected, onConfirm, closeModal.

---

### WhatsOnList.jsx

- 용도: 메인 ‘What’s On’ 콘텐츠 1건 선택.
- 주요 데이터
- 카테고리: /api/v1/main/content/category 로딩.
- 콘텐츠 목록: /api/v1/main/content/list?lang=KO 로딩 후 테이블용 매핑.
- 필터/검색: 카테고리/키워드 노멀라이즈 후 필터링.
- 선택 정책: 체크 시 해당 ID만 유지(단일 선택).
- 주요 Props: selected, onConfirm, closeModal.

---

### CompanySelectModal.jsx

- 용도: 입주사(회사) 다중 선택 후 상위 폼에 반영.
- 데이터 소스: /api/v1/work/companyList?lang=KO 로 입주사 목록 로딩 및 매핑.
- 체크/선택: DataTable 체크박스 선택 상태를 checked로 관리.
- 확정 동작: 기존 selected를 유지하지 않고 체크된 항목만으로 덮어씀.
- 주요 Props: selected, onConfirm, closeModal.

---

### UserDetailModal.jsx

- 용도: 회사 기본정보와 월 무료/유료 어메니티 사용시간 조회 표시.
- 사용시간 조회: companyId 기준 무료/유료 시간을 병렬 조회.
- /api/v1/company/detail/time?companyId=<id>&type=free|paid 사용.
- 표시 항목: 회사명/사용여부/오피스/층/대표명/연락처/이메일 등 읽기전용 필드.
- 대표 이미지/총무 담당자 목록도 지원.
- 주요 Props: userData.

---

### PasswordResetModal.jsx

- 용도: 이메일 입력 → 임시 비밀번호 발급 요청.
- 검증/요청: 이메일 정규식 검증 후 /api/v1/user/find-password POST.
- 확인 버튼/닫기: 성공 시 안내 후 closeModal() 호출.
- 주요 Props: closeModal.

---

### ReservationForm.jsx

- 용도: 회의실/일정/인원/결제유형/실사용자 정보 등을 입력해서 예약 생성/수정.
- 핵심 상태/Props: 장소/룸 옵션, 기존 예약, 수정 여부, VIP 여부 등.
- VIP 제한: VIP일 경우 표시/최대 수용 인원 4명, 기본 64명.
- 룸 변경 시 처리: 룸 변경 후 현재 선택된 시간이 유효하지 않으면 자동 보정.
- 예약 데이터 변화 시 재검증: 사용 불가 시간이면 사용 가능한 첫 시간으로 자동 이동.
- 시간 옵션 생성: generateTimeOptions(9, 17) 등으로 정시 슬롯 구성.
- UI 예: Meeting Room 셀렉트 변경 시 예약 데이터 재조회 및 시간 보정.
- 초기값 세팅/포맷팅: 기존 전화번호가 010- 형식이 아니면 포맷팅.

---

### SleepReservationForm.jsx

- 용도: Relax Room, 좌석(호실), 날짜/시간, 회사/사용자 선택 후 저장/수정/삭제.
- 함수 시그니처/Props: room, roomList, initialData, isEdit, onSubmit, closeModal.
- 좌석/시간 충돌 방지
- 선택 좌석/시간이 이미 예약된 경우 옵션 비활성화.
- 특정 시간에 좌석 예약 여부 판단 로직 제공.
- 데이터 로딩
- 룸 상세/입주사/사용자 목록 API 로딩.
- 날짜별 전체 예약 스캔 후 상태에 반영.
- 검증 및 제출/삭제
- 필수값 검증 후 /api/v1/sleep/reserve/insert|update POST.
- 삭제 시 확인 및 API 호출.
- 주요 UI: 룸/좌석/일정/회사/아이디 선택 및 저장/수정/삭제 버튼.

---

### SleepReservationDetail.jsx

- 용도: 상세 조회 + 수정 폼 호출 + 삭제.
- 상세 조회: reservationId로 상세 조회 후, 같은 시간대/룸의 사용자 이름 별도 조회.
- 표시 항목: 룸/호실/예약시간 등 상세 정보.
- 시간 표현: 시작시간 + 50분을 종료로 계산해 범위를 표기.
- 수정/삭제: 내부에서 SleepReservationForm 모달로 열어 수정, 삭제 API 지원.
- 하단에 수정/삭제 버튼 노출.

---

### VisitForm.jsx

- 용도: 방문 날짜/시간/건물/입주사/방문자 정보 입력, 추가 방문자 관리.
- 방문 인원 범위: 1~10명만 허용.
- 전화번호 UX: 입력값을 자동으로 010-XXXX-XXXX 형식으로 포맷팅(백스페이스/비정상 입력 처리 포함).
- 기존 값이 있을 때도 초기 포맷 보정.
- 시간 선택: 09:00~18:00 범위에서, 예약 불가 시간은 (불가)로 비활성화.
- 추가 방문자: 이름/이메일/연락처/카드번호 입력, 불완전한 항목은 제외하여 memberList 구성.
- payload & 전송: visitNumber를 memberList.length와 맞춰 전송, insert/update 분기.
- 필수 검증: 이메일 형식/전화번호 길이/방문 인원 범위 등.
- 하단 고정 버튼: 저장 버튼을 아래 고정(sticky)하여 접근성 개선.

---

# src/pages/admin/adminpage 디렉토리 구조 및 컴포넌트 설명

`src/pages/admin/adminpage` 폴더는 해당 프로젝트에서 관리자 / 입주사 총무팀 계정을 관리하는 폴더입니다.  
관리자 / 입주사 총무팀 계정 리스트부터 등록 및 수정, 조회 기능을 담당하는 컴포넌트로 구성되어 있습니다.

---

## 디렉토리 구조

```bash
src/pages/admin/adminpage
├─ AdminLayout.jsx # 하위 라우트를 감싸는 레이아웃(패딩만 적용)
├─ AdminListPage.jsx # 관리자 목록/검색/삭제/페이징
├─ AdminRegist.jsx # 관리자 신규 등록(유효성 검사 포함)
├─ AdminDetailPage.jsx # 관리자 상세/수정/잠금 해제/임시비번 발급
├─ AffairListPage.jsx # 입주사 총무팀 목록/검색/삭제/페이징
├─ AffairRegist.jsx # 입주사 총무팀 신규 등록(입주사 선택/유효성)
└─ AffairDetailPage.jsx # 입주사 총무팀 상세/수정/잠금 해제/임시비번
```

## 컴포넌트 상세 설명

### AdminLayout.jsx

- 용도: 하위 라우트 감싸는 레이아웃
- 동작: 내부 <Outlet /> 렌더

---

### AdminListPage.jsx

- 용도: 관리자 목록/검색/삭제/페이징.
- 필터: 관리자 유형/이름/아이디/사용여부.
- 액션: 상세 이동(/admin/detail/:id), 등록 이동(/admin/list/regist), 선택 삭제.
- API: GET /api/v1/user/admin?isManager=N, POST /api/v1/user/admin/delete.

---

### AdminRegist.jsx

- 용도: 관리자 신규 등록.
- 기본값: role=NORMAL_ADMIN, status=active, gender=male.
- 유효성: 아이디(영소문자·숫자 최대 16자), 이메일 형식, 비밀번호 일치, 휴대폰 010- 뒤 8자리.
- 액션: 등록 → /admin/list, 목록 이동 시 확인 모달.
- API: POST /api/v1/user/admin/insert.

---

### AdminDetailPage.jsx

- 용도: 관리자 상세/수정/잠금해제/임시비번.
- 조회: GET /api/v1/user/admin/:id (아이디 수정 불가).
- 액션: 수정 POST /api/v1/user/admin/update, 잠금 해제 /api/v1/user/unlock, 임시 비번 /api/v1/user/temp-password.
- 표시: 유형/사용여부/성별/이름/연락처/이메일/잠금상태.

---

### AffairListPage.jsx

- 용도: 입주사 총무팀 목록/검색/삭제/페이징.
- 준비: GET /api/v1/user/company로 회사 목록 로드(중복 companyId 제거) → 셀렉트 옵션.
- 필터: 입주사/이름/아이디/사용여부.
- 액션: 상세 이동(/admin/affair/detail/:id), 등록 이동(/admin/affair/regist), 선택 삭제.
- API: GET /api/v1/user/admin?isManager=Y, POST /api/v1/user/admin/delete.

---

### AffairRegist.jsx

- 용도: 입주사 총무팀 신규 등록.
- 기본값: role=OFFICE_SECRETARY_ADMIN, status=active, isManager=Y, isReservation(Y/N), companyId 필수.
- 유효성: 이름(최대 10자), 아이디(영소문자·숫자 최대 16자), 휴대폰 8자리, 이메일 형식, 비밀번호 일치.
- 액션: 등록 → /admin/affair, 목록 이동 시 확인 모달.
- API: GET /api/v1/user/company, POST /api/v1/user/admin/insert.

---

### AffairDetailPage.jsx

- 용도: 입주사 총무팀 상세/수정/잠금해제/임시비밀번호.
- 조회: GET /api/v1/user/admin/:id + 회사 목록(GET /api/v1/user/company), 아이디 수정 불가.
- 액션: 수정 POST /api/v1/user/admin/update, 잠금 해제 /api/v1/user/unlock, 임시 비번 /api/v1/user/temp-password.
- 표시: 입주사/사용여부/성별/연락처/이메일/예약기능(Y/N)/잠금상태.

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

※ 나머지 메뉴의 배너 영역은 메뉴별로 각각 관리되고있으나, 컴포넌트 구조는 메뉴 코드 제외 동일합니다.

---

# src/pages/contents/whatson/event 디렉토리 구조 및 컴포넌트 설명

`src/pages/contents/whatson/event` 폴더는 해당 프로젝트에서 What's On 영역 중 Event&Promotion 영역을 관리하는 폴더입니다.  
Event&Promotion 영역의 컨텐츠를 등록 및 수정, 조회 등의 기능을 담당하는 컴포넌트로 구성되어 있습니다.

---

```bash
src/pages/contents/whatson/event
├─ EventLayout.jsx
├─ EventListPage.jsx
├─ EventRegist.jsx
├─ EventDetail.jsx
└─ components/
├─ EventRegistForm.jsx  # 공통 폼 (국/영문 탭에서 공유)
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

### components/EventRegistForm.jsx

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
