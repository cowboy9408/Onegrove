# Ongrove Admin CMS 구축 프로젝트

> 이 프로젝트는 React + Vite 기반으로 구축된 관리자 CMS압니다.  
> TailwindCSS, Zustand, 다양한 캘린더 및 폼 관리 라이브러리가 통합되어 있어 일정 관리, UI 구성, 상태 관리를 빠르고 유연하게 개발할 수 있도록 구성되어 있습니다.

---

## � 기본 정보

| 항목            | 설명                                |
| --------------- | ----------------------------------- |
| 프레임워크      | React 19, Vite                      |
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


```plaintext
components/common/
├── Button.jsx #
├── Calendar.jsx
├── CalendarToolbar.jsx #
├── calendar.css
├── Checkbox.jsx
├── CustomToolbar.jsx #
├── DataTable.jsx
├── DataTableSimple.jsx #
├── Datepicker.jsx
├── Editor.jsx
├── Input.jsx
├── LoadingSpinner.jsx #
├── Modal.jsx
├── NewInput.jsx
├── NewTab.jsx
├── OfficeFloorForm.jsx #
├── Pagination.jsx
├── Radio.jsx
├── RadioGroup.jsx
├── ResultSummary.jsx #
├── Select.jsx
├── SelectInput.jsx #
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
