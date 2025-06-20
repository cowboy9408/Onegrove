import { BellIcon } from "@/components/ui/bell";
import { CalendarDaysIcon } from "@/components/ui/calendar-days";
import { CartIcon } from "@/components/ui/cart";
import { CircleHelpIcon } from "@/components/ui/circle-help";
import { FileTextIcon } from "@/components/ui/file-text";
import { HomeIcon } from "@/components/ui/home";
import { LayoutPanelTopIcon } from "@/components/ui/layout-panel-top";
import { SettingsGearIcon } from "@/components/ui/settings-gear";
import { UsersIcon } from "@/components/ui/users";
import AuthLayout from "@/layouts/AuthLayout";
import RetailLayout from "@/pages/retail/RetailLayout";
import ContentsLayout from "@/pages/contents/ContentsLayout";
import WhatsonLayout from "@/pages/contents/whatson/WhatsonLayout";
import OfficeLayout from "@/pages/office/OfficeLayout";
import SystemLayout from "@/pages/system/SystemLayout";
import AdminLayout from "@/pages/admin/AdminLayout";
import Forbidden from "@/pages/403";
import NotFoundPage from "@/pages/404";
import AdminDetailPage from "@/pages/admin/adminpage/AdminDetailPage";
import AdminListPage from "@/pages/admin/adminpage/AdminListPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import LoginPage from "@/pages/login/LoginPage";
import MainPage from "@/pages/mainpage/MainPage";
import { matchPath } from "react-router-dom";
import UserListPage from "@/pages/user/UserListPage";
import OccupancyListPage from "@/pages/occupancy/OccupancyListPage";
import BrandListPage from "@/pages/retail/brand/BrandListPage";
import PopupListPage from "@/pages/popup/PopupListPage";
import EventListPage from "@/pages/contents/whatson/event/EventListPage";
import StoriesListPage from "@/pages/contents/whatson/stories/StoriesListPage";
import PressListPage from "@/pages/contents/whatson/media/PressListPage";
import Meeting from "@/pages/office/meeting/Meeting";
import Visit from "@/pages/office/visit/Visit";
import Sleep from "@/pages/office/sleep/Sleep";
import InquiryListPage from "@/pages/inquiry/client/InquiryListPage";
import MeetingListPage from "@/pages/system/meeting/MeetingListPage";
import EventRegist from "@/pages/contents/whatson/event/EventRegist";
import StoriesRegist from "@/pages/contents/whatson/stories/StoriesRegist";
import AdminRegist from "@/pages/admin/adminpage/AdminRegist";
import UserRegist from "@/pages/user/UserRegist";
import OccupancyRegist from "@/pages/occupancy/OccupancyRegist";
import BrandRegist from "@/pages/retail/brand/BrandRegist";
import PressRegist from "@/pages/contents/whatson/media/PressRegist";
import AffairListPage from "@/pages/admin/adminpage/AffairListPage";
import AffairRegist from "@/pages/admin/adminpage/AffairRegist";
import PopupRegist from "@/pages/popup/PopupRegist";
import BrandDetail from "@/pages/retail/brand/BrandDetail";
import PressDetail from "@/pages/contents/whatson/media/PressDetail";
import EventDetail from "@/pages/contents/whatson/event/EventDetail";
import StoriesDetail from "@/pages/contents/whatson/Stories/StoriesDetail";
import SubmainLayout from "@/pages/submain/SubmainLayout";
import LifeStylePage from "@/pages/submain/lifestyle/LifeStylePage";
import WhatsonPage from "@/pages/submain/whatson/WhatsonPage";
import WorkPage from "@/pages/submain/work/WorkPage";
import BannerLayout from "@/pages/banner/BannerLayout";
import OccupancyDetail from "@/pages/occupancy/OccupancyDetail";
import MainBannerPage from "@/pages/banner/MainBannerPage";
import WhatsonBannerPage from "@/pages/banner/WhatsonBannerPage";
import LifeStyleBannerPage from "@/pages/banner/LifeStyleBannerPage";
import WorkBannerPage from "@/pages/banner/WorkBannerPage";
import AboutBannerPage from "@/pages/banner/AboutBannerPage";
import UserDetailPage from "@/pages/user/UserDetailPage";
import AffairDetailPage from "@/pages/admin/adminpage/AffairDetailPage";

export const routeMeta = [
  {
    uuid: "221bcab4-8a0a-4e63-9194-93f681a91f46",
    path: "/",
    element: <AuthLayout />,
    hidden: false,
    children: [
      {
        uuid: "9859df8e-e171-4d1e-9614-c494069399bb",
        path: "/",
        element: <DashboardPage />,
        title: "Dashboard",
        hidden: true,
        description: "Dashboard 입니다",
      },
      {
        uuid: "16671022-870d-44a8-83ca-3cb254ca6857",
        path: "/admin",
        element: <AdminLayout />,
        title: "관리자 관리",
        icon: <UsersIcon size={18} />,
        hidden: false,
        permissions: ["SUPER_ADMIN", "NORMAL_ADMIN", "OFFICE_ADMIN", "User"],
        children: [
          {
            uuid: "12b3ef89-1b74-450d-9f51-2888b953c1fd",
            path: "/admin/list",
            element: <AdminListPage />,
            title: "관리자 관리",
            hidden: false,
            permissions: ["SUPER_ADMIN", "NORMAL_ADMIN", "RETAIL_ADMIN"],
          },
          {
            uuid: "1e83ea43-0b00-4261-8c5a-a76102d971a0",
            path: "/admin/detail/:id",
            element: <AdminDetailPage />,
            title: "관리자 상세",
            hidden: true,
            permissions: ["SUPER_ADMIN", "NORMAL_ADMIN", "RETAIL_ADMIN"],
          },
          {
            uuid: "403ed52e-f0a2-4bdb-b1d5-e1c7cf542e1f",
            path: "/admin/list/regist",
            element: <AdminRegist />,
            title: "관리자 등록",
            hidden: true,
            permissions: ["SUPER_ADMIN", "NORMAL_ADMIN", "RETAIL_ADMIN"],
          },
          {
            uuid: "0a74902d-894e-421a-9471-2920c692e73a",
            path: "/admin/affair",
            element: <AffairListPage />,
            title: "입주사 총무팀",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "OFFICE_ADMIN",
              "RETAIL_ADMIN",
            ],
          },
          {
            uuid: "87046c63-2981-4c56-9e57-8c908ed82160",
            path: "/admin/affair/regist",
            element: <AffairRegist />,
            title: "입주사 총무팀 등록",
            hidden: true,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "OFFICE_ADMIN",
              "RETAIL_ADMIN",
            ],
          },
          {
            uuid: "d3487af9-b3eb-430c-887b-c599041597e7",
            path: "/admin/affair/detail/:id",
            element: <AffairDetailPage />,
            title: "입주사 총무팀 상세",
            hidden: true,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "OFFICE_ADMIN",
              "RETAIL_ADMIN",
            ],
          },
        ],
      },

      {
        uuid: "0c3eb744-5f42-4e6e-8107-43644c68647c",
        path: "/user",
        group: "/user",
        element: <UserListPage />,
        title: "회원 관리",
        icon: <UsersIcon size={18} />,
        hidden: false,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
          "OFFICE_SECRETARY_ADMIN",
          "MEMBER",
        ],
      },
      {
        uuid: "b269e884-b419-4961-9b85-144d20ff3b4d",
        path: "/user/regist",
        group: "/user",
        element: <UserRegist />,
        title: "회원 등록",
        icon: <UsersIcon size={18} />,
        hidden: true,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
          "OFFICE_SECRETARY_ADMIN",
          "MEMBER",
        ],
      },
      {
        uuid: "aeab286e-bb23-471f-a050-7b812fecf13a",
        path: "/user/detail/:id",
        group: "/user",
        element: <UserDetailPage />,
        title: "회원 상세",
        icon: <UsersIcon size={18} />,
        hidden: true,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
          "OFFICE_SECRETARY_ADMIN",
          "User",
        ],
      },

      {
        uuid: "dc861768-42d2-4b30-ac51-657ea9d3e408",
        path: "/occupancy",
        element: <OccupancyListPage />,
        title: "입주사 관리",
        icon: <HomeIcon size={18} />,
        hidden: false,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
          "User",
        ],
      },
      {
        uuid: "89309bbd-2edc-4cf0-8b6c-6960e023b340",
        path: "/occupancy/regist",
        element: <OccupancyRegist />,
        title: "입주사 등록",
        hidden: true,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
          "User",
        ],
      },
      {
        uuid: "6f56e1bc-b894-4403-8399-dd389d4540b6",
        path: "/occupancy/detail/:id",
        element: <OccupancyDetail />,
        title: "입주사 상세 페이지",
        hidden: true,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
          "User",
        ],
      },

      {
        uuid: "8f9c0fc2-72b3-4347-be97-6ca3f7030286",
        path: "/retail",
        element: <RetailLayout />,
        title: "리테일 관리",
        icon: <CartIcon size={18} />,
        hidden: false,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
          "User",
        ],
        children: [
          {
            uuid: "07dcc050-f903-402f-948f-2e38f7fb79cb",
            path: "/retail/brand",
            element: <BrandListPage />,
            title: "입점 브랜드 관리",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "User",
            ],
          },
          {
            uuid: "e002650c-3989-4441-81a8-32f69d76ecdb",
            path: "/retail/brand/regist",
            element: <BrandRegist />,
            title: "입점 브랜드 관리",
            hidden: true,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "User",
            ],
          },
          {
            uuid: "88722265-4bd6-4702-9dfd-07a9af8ac137",
            path: "/retail/brand/detail/:masterId",
            element: <BrandDetail />,
            title: "입점 브랜드 상세",
            hidden: true,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "User",
            ],
          },
        ],
      },
      {
        uuid: "5c70b017-35f2-441f-8ac4-dee0f6a9401f",
        path: "/popup",
        element: <PopupListPage />,
        title: "팝업 관리",
        icon: <BellIcon size={18} />,
        hidden: true,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
          "User",
        ],
      },
      {
        uuid: "05df59fa-6318-4b05-b325-590bfa1829d6",
        path: "/popup/regist",
        element: <PopupRegist />,
        title: "팝업 등록",
        hidden: true,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
          "User",
        ],
      },
      {
        uuid: "89708e74-e523-469d-a60d-67ce51f94959",
        path: "/mainpage",
        element: <MainPage />,
        title: "메인화면 관리",
        icon: <FileTextIcon size={18} />,
        hidden: false,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
          "User",
        ],
      },
      {
        uuid: "79d324e5-4e32-47e5-a372-fa5d58340aca",
        path: "/submain",
        element: <SubmainLayout />,
        title: "서브메인 관리",
        icon: <FileTextIcon size={18} />,
        hidden: false,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
          "User",
        ],
        children: [
          {
            uuid: "217c8074-622d-4ae1-a101-ad664b6c8615",
            path: "/submain/whatson",
            element: <WhatsonPage />,
            title: "What's On 관리",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "User",
            ],
          },
          {
            uuid: "9eb49204-b00e-4ac9-af35-0b4267c01f8f",
            path: "/submain/lifestyle",
            element: <LifeStylePage />,
            title: "LifeStyle 관리",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "User",
            ],
          },
          {
            uuid: "cfd16abc-83b1-4998-a32a-f77b2ac59ec3",
            path: "/submain/work",
            element: <WorkPage />,
            title: "Work 관리",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "User",
            ],
          },
        ],
      },
      {
        uuid: "8c3ff65d-9b00-466f-bdd6-ef0f7b3fe7af",
        path: "/banner",
        element: <BannerLayout />,
        title: "하단 배너 관리",
        icon: <LayoutPanelTopIcon size={18} />,
        hidden: false,
        permissions: ["SUPER_ADMIN", "NORMAL_ADMIN", "RETAIL_ADMIN", "User"],
        children: [
          {
            uuid: "3183d249-9f8e-42f9-9745-ab251a784135",
            path: "/banner/main",
            element: <MainBannerPage />,
            title: "Main 메뉴",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "User",
            ],
          },
          {
            uuid: "9d93fcbe-641f-42a6-98fd-b7ba93201834",
            path: "/banner/whatson",
            element: <WhatsonBannerPage />,
            title: "What's On 메뉴",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "User",
            ],
          },
          {
            uuid: "d4228ac7-87dd-48e1-9b5b-bacae5b367b9",
            path: "/banner/lifestyle",
            element: <LifeStyleBannerPage />,
            title: "LifeStyle 메뉴",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "User",
            ],
          },
          {
            uuid: "0c33961e-71d2-4cc0-a678-aaa9c5c11ecc",
            path: "/banner/work",
            element: <WorkBannerPage />,
            title: "Work 메뉴",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "User",
            ],
          },
          {
            uuid: "17020178-0250-4457-9d87-1bafe7375e05",
            path: "/banner/about",
            element: <AboutBannerPage />,
            title: "About 메뉴",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "User",
            ],
          },
        ],
      },

      {
        uuid: "4c15f65b-5154-48be-8d42-d373136c529f",
        path: "/contents",
        element: <ContentsLayout />,
        title: "콘텐츠 관리",
        icon: <FileTextIcon size={18} />,
        hidden: false,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
          "User",
        ],
        children: [
          {
            uuid: "952664cb-fbe1-4ecd-bb18-ca6aecead4d1",
            path: "/contents/whatson",
            element: <WhatsonLayout />,
            title: "What's On",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "User",
            ],
            children: [
              {
                uuid: "d37ccd54-b4bb-4980-b259-2905f47dcc3f",
                path: "/contents/whatson/event/list",
                element: <EventListPage />,
                title: "Event & Promotion",
                hidden: false,
                permissions: [
                  "SUPER_ADMIN",
                  "NORMAL_ADMIN",
                  "RETAIL_ADMIN",
                  "OFFICE_ADMIN",
                  "User",
                ],
              },
              {
                uuid: "335b31b2-0f7a-46f9-b4dd-1b2b92034be6",
                path: "/contents/whatson/event/regist",
                group: "/contents/whatson/event/list",
                element: <EventRegist />,
                title: "Event & Promotion 등록",
                hidden: true,
                permissions: [
                  "SUPER_ADMIN",
                  "NORMAL_ADMIN",
                  "RETAIL_ADMIN",
                  "OFFICE_ADMIN",
                  "User",
                ],
              },
              {
                uuid: "a3126b50-bd32-4d31-9241-b9a8a5ec6eb8",
                path: "/contents/whatson/event/list/:emId",
                group: "/contents/whatson/event/list/",
                element: <EventDetail />,
                title: "Event & Promotion 상세",
                hidden: true,
                permissions: [
                  "SUPER_ADMIN",
                  "NORMAL_ADMIN",
                  "RETAIL_ADMIN",
                  "OFFICE_ADMIN",
                  "User",
                ],
              },

              {
                uuid: "8275ec74-09ac-4b2a-9c65-78f5b75a06c7",
                path: "/contents/whatson/stories/list",

                element: <StoriesListPage />,
                title: "Stories of One Grove",
                hidden: false,
                permissions: [
                  "SUPER_ADMIN",
                  "NORMAL_ADMIN",
                  "RETAIL_ADMIN",
                  "OFFICE_ADMIN",
                  "User",
                ],
              },
              {
                uuid: "565c400a-1c08-46a9-ab0b-c28c05d543f4",
                path: "/contents/whatson/stories/regist",
                group: "/contents/whatson/stories/list",
                element: <StoriesRegist />,
                title: "Stories of One Grove 등록",
                hidden: true,
                permissions: [
                  "SUPER_ADMIN",
                  "NORMAL_ADMIN",
                  "RETAIL_ADMIN",
                  "OFFICE_ADMIN",
                  "User",
                ],
              },

              {
                uuid: "46c071e4-7aa9-43b4-85bb-b8d9406433f3",
                path: "/contents/whatson/stories/:emId",
                group: "/contents/whatson/stories/",
                element: <StoriesDetail />,
                title: "Stories of One Grove 상세",
                hidden: true,
                permissions: [
                  "SUPER_ADMIN",
                  "NORMAL_ADMIN",
                  "RETAIL_ADMIN",
                  "OFFICE_ADMIN",
                  "User",
                ],
              },

              {
                uuid: "b277e917-fa13-4827-be23-2e2ca4164853",
                path: "/contents/whatson/media",
                element: <PressListPage />,
                title: "Press & Media",
                hidden: false,
                permissions: [
                  "SUPER_ADMIN",
                  "NORMAL_ADMIN",
                  "RETAIL_ADMIN",
                  "OFFICE_ADMIN",
                  "User",
                ],
              },
              {
                uuid: "a87e5edb-3c21-4b02-8700-b7b31f31f1b8",
                path: "/contents/whatson/media/regist",
                element: <PressRegist />,
                title: "Press & Media 등록",
                hidden: true,
                permissions: [
                  "SUPER_ADMIN",
                  "NORMAL_ADMIN",
                  "RETAIL_ADMIN",
                  "OFFICE_ADMIN",
                  "User",
                ],
              },
              {
                uuid: "e026f9a6-7337-45c3-8140-71f673cca0f9",
                path: "/contents/whatson/media/:pmId",
                element: <PressDetail />,
                title: "Press & Media 상세",
                hidden: true,
                permissions: [
                  "SUPER_ADMIN",
                  "NORMAL_ADMIN",
                  "RETAIL_ADMIN",
                  "OFFICE_ADMIN",
                  "User",
                ],
              },
            ],
          },
          // {
          //   uuid: "88afdd08-b5f6-420a-bc03-28eb0f31d182",
          //   path: "/contents/lifestyle",
          //   element: <LifeStyleLayout />,
          //   title: "Lifestyle",
          //   hidden: false,
          //   permissions: ["Admin", "User"],
          //   children: [
          //     {
          //       uuid: "68f994c5-2dac-49cf-b30d-e7eae1b29b76",
          //       path: "/contents/lifestyle/all",
          //       element: <All />,
          //       title: "All",
          //       hidden: false,
          //       permissions: ["Admin", "User"],
          //     },
          //   ],
          // },
          {
            uuid: "cf1a5e95-944c-4a37-8333-1c7e89507f6e",
            path: "/contents/about",
            element: <></>,
            title: "About",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "User",
            ],
            children: [
              {
                uuid: "bf4a99a5-8e19-440e-823d-eb6f14cde19b",
                path: "/contents/about/faq",
                element: <></>,
                title: "FAQ",
                hidden: false,
                permissions: [
                  "SUPER_ADMIN",
                  "NORMAL_ADMIN",
                  "RETAIL_ADMIN",
                  "OFFICE_ADMIN",
                  "User",
                ],
              },
              {
                uuid: "848a9396-d84a-444f-825d-d1ec317096c8",
                path: "/contents/about/getting-here",
                element: <></>,
                title: "Getting Here",
                hidden: false,
                permissions: [
                  "SUPER_ADMIN",
                  "NORMAL_ADMIN",
                  "RETAIL_ADMIN",
                  "OFFICE_ADMIN",
                  "User",
                ],
              },
            ],
          },
        ],
      },
      {
        uuid: "b7bd1575-4a90-4c6c-8edd-a638d05fb371",
        path: "/office",
        element: <OfficeLayout />,
        title: "오피스 관리",
        icon: <CalendarDaysIcon size={18} />,
        hidden: true,
        permissions: ["SUPER_ADMIN", "NORMAL_ADMIN", "RETAIL_ADMIN", "MEMBER"],
        children: [
          {
            uuid: "b3c13f6a-0715-4199-b0bd-dcc163d4c89d",
            path: "/office/meeting",
            element: <Meeting />,
            title: "회의실 예약",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "OFFICE_SECRETARY_ADMIN",
              "MEMBER",
            ],
          },
          {
            uuid: "28f505be-2143-4fe3-bef3-3b7e031a8247",
            path: "/office/visit",
            element: <Visit />,
            title: "방문 예약",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "OFFICE_SECRETARY_ADMIN",
              "MEMBER",
            ],
          },
          {
            uuid: "95b2aae3-4ce2-4782-95ca-62c4111dcc17",
            path: "/office/sleep",
            element: <Sleep />,
            title: "수면실 예약",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
              "MEMBER",
            ],
          },
        ],
      },
      {
        uuid: "e1582c44-00e8-4667-8361-dff7da5d9964",
        path: "/inquiry",
        element: <InquiryListPage />,
        title: "고객 문의 관리",
        icon: <BellIcon size={18} />,
        hidden: true,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
          "User",
        ],
      },
      {
        uuid: "c9c84ed1-a896-4d9b-b659-cd6a43dc8cd2",
        path: "/system",
        element: <SystemLayout />,
        title: "시스템 관리",
        icon: <SettingsGearIcon size={18} />,
        hidden: true,
        permissions: [
          "SUPER_ADMIN",
          "NORMAL_ADMIN",
          "RETAIL_ADMIN",
          "OFFICE_ADMIN",
        ],
        children: [
          {
            uuid: "e59c7075-0b1c-4607-b548-c38fa7566532",
            path: "/system/meeting",
            element: <MeetingListPage />,
            title: "회의실 설정",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
            ],
          },
          {
            uuid: "4bd3ba77-798a-4466-bc3e-48fec787592a",
            path: "/system/sleep",
            element: <></>,
            title: "수면실 설정",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
            ],
          },
          {
            uuid: "bc71031e-1a66-410a-84ea-5db89fa8822f",
            path: "/system/client",
            element: <></>,
            title: "고객 문의 설정",
            hidden: false,
            permissions: [
              "SUPER_ADMIN",
              "NORMAL_ADMIN",
              "RETAIL_ADMIN",
              "OFFICE_ADMIN",
            ],
          },
        ],
      },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/403", element: <Forbidden /> },
  { path: "*", element: <NotFoundPage /> },
];

export function findRouteMeta(pathname, items = routeMeta, parents = []) {
  for (const item of items) {
    if (pathname === item.path && !item.children) {
      return item;
    }

    if (item.children) {
      const found = findRouteMeta(pathname, item.children, [...parents, item]);
      if (found) return found;
    }
  }

  return null;
}

export function buildRoutes(items = routeMeta) {
  return items.map((item) => {
    const route = {
      path: item.path,
      element: item.element,
    };
    if (item.index) route.index = true;
    if (item.children) {
      route.children = buildRoutes(item.children);
    }
    return route;
  });
}

export function extractSidebarItems(items, role) {
  return items
    .filter((item) => !item.permissions || item.permissions.includes(role))
    .filter((item) => item.title && (item.path || item.index) && !item.hidden)
    .map((item) => {
      return {
        uuid: item.uuid,
        label: item.title,
        path: item.path || "/",
        icon: item.icon,
        children: item.children
          ? extractSidebarItems(item.children, role)
          : undefined,
      };
    });
}

export function findMatchingRoute(pathname, routes = routeMeta) {
  for (const route of routes) {
    const matched = matchPath({ path: route.path, end: true }, pathname);

    if (matched) {
      return route;
    }

    if (route.children) {
      const found = findMatchingRoute(pathname, route.children);
      if (found) return found;
    }
  }

  return null;
}

export const appRoutes = buildRoutes(routeMeta);
