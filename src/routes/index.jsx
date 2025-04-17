import { BellIcon } from "@/components/ui/bell";
import { CalendarDaysIcon } from "@/components/ui/calendar-days";
import { CartIcon } from "@/components/ui/cart";
import { CircleHelpIcon } from "@/components/ui/circle-help";
import { FileTextIcon } from "@/components/ui/file-text";
import { HomeIcon } from "@/components/ui/home";
import { LayoutPanelTopIcon } from "@/components/ui/layout-panel-top";
import { SettingsGearIcon } from "@/components/ui/settings-gear";
import { UserIcon } from "@/components/ui/user";
import { UsersIcon } from "@/components/ui/users";
import AuthLayout from "@/layouts/AuthLayout";
import Forbidden from "@/pages/403";
import NotFoundPage from "@/pages/404";
import AdminDetailPage from "@/pages/admin/AdminDetailPage";
import AdminListPage from "@/pages/admin/AdminListPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import LoginPage from "@/pages/login/LoginPage";
import MainPage from "@/pages/mainpage/MainPage";
import UserCreatePage from "@/pages/user/UserCreatePage";
import UserDetailPage from "@/pages/user/UserDetailPage";
import UserListPage from "@/pages/user/UserListPage";
import { matchPath } from "react-router-dom";

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
        uuid: "12b3ef89-1b74-450d-9f51-2888b953c1fd",
        path: "/admin",
        group: "/admin",
        element: <AdminListPage />,
        title: "관리자 관리",
        icon: <UserIcon size={18} className="hover:bg-transparent" />,
        hidden: false,
        permissions: ["Admin"],
      },
      {
        uuid: "1e83ea43-0b00-4261-8c5a-a76102d971a0",
        path: "/admin/:id",
        group: "/admin",
        element: <AdminDetailPage />,
        title: "관리자 상세",
        icon: <UserIcon size={18} className="hover:bg-transparent" />,
        hidden: true,
        permissions: ["Admin"],
      },
      {
        uuid: "0c3eb744-5f42-4e6e-8107-43644c68647c",
        path: "/user",
        group: "/user",
        element: <UserListPage />,
        title: "회원 관리",
        icon: <UsersIcon size={18} className="hover:bg-transparent" />,
        hidden: false,
        permissions: ["Admin", "User"],
      },
      {
        uuid: "b08ac13a-d0f2-4eaf-87a6-41be2ec1ca19",
        path: "/user/create",
        group: "/user",
        element: <UserCreatePage />,
        title: "회원 등록",
        hidden: true,
        permissions: ["Admin", "User"],
      },
      {
        uuid: "9f4398bc-b8b1-47e4-bf39-77acecbf415e",
        path: "/user/:id",
        group: "/user",
        element: <UserDetailPage />,
        title: "회원 상세",
        hidden: true,
        permissions: ["Admin", "User"],
      },
      {
        uuid: "dc861768-42d2-4b30-ac51-657ea9d3e408",
        path: "/occupancy",
        element: <></>,
        title: "입주사 관리",
        icon: <HomeIcon size={18} className="hover:bg-transparent" />,
        hidden: false,
        permissions: ["Admin", "User"],
      },
      {
        uuid: "8f9c0fc2-72b3-4347-be97-6ca3f7030286",
        path: "/retail",
        element: <></>,
        title: "리테일 관리",
        icon: <CartIcon size={18} className="hover:bg-transparent" />,
        hidden: false,
        permissions: ["Admin", "User"],
      },
      {
        uuid: "5c70b017-35f2-441f-8ac4-dee0f6a9401f",
        path: "/popup",
        element: <></>,
        title: "팝업 관리",
        icon: <BellIcon size={18} className="hover:bg-transparent" />,
        hidden: false,
        permissions: ["Admin", "User"],
      },
      {
        uuid: "89708e74-e523-469d-a60d-67ce51f94959",
        path: "/mainpage",
        element: <MainPage />,
        title: "메인화면 관리",
        icon: <LayoutPanelTopIcon size={18} className="hover:bg-transparent" />,
        hidden: false,
        permissions: ["Admin", "User"],
      },
      {
        uuid: "4c15f65b-5154-48be-8d42-d373136c529f",
        path: "/contents",
        element: <></>,
        title: "콘텐츠 관리",
        icon: <FileTextIcon size={18} className="hover:bg-transparent" />,
        hidden: false,
        permissions: ["Admin", "User"],
        children: [
          {
            uuid: "952664cb-fbe1-4ecd-bb18-ca6aecead4d1",
            path: "/contents/wathson",
            element: <></>,
            title: "Wath`s On",
            hidden: false,
            permissions: ["Admin", "User"],
            children: [
              {
                uuid: "d37ccd54-b4bb-4980-b259-2905f47dcc3f",
                path: "/contents/wathson/event",
                group: "/contents/wathson/event",
                element: <></>,
                title: "Event & Promotion",
                hidden: false,
                permissions: ["Admin", "User"],
              },
              {
                uuid: "02a4628c-ae19-4574-a39e-eec25a7e0138",
                path: "/contents/wathson/event/:id",
                group: "/contents/wathson/event",
                element: <></>,
                title: "Event & Promotion",
                hidden: true,
                permissions: ["Admin", "User"],
              },
              {
                uuid: "5bca7eb5-7483-43a2-89da-7f71b78ea41c",
                path: "/contents/wathson/stories",
                element: <></>,
                title: "Stories of One Grove",
                hidden: false,
                permissions: ["Admin", "User"],
              },
              {
                uuid: "b4b2c8b4-a2ba-4d6c-9379-d0b0ef21698a",
                path: "/contents/wathson/neighborhood",
                element: <></>,
                title: "Neighborhood",
                hidden: false,
                permissions: ["Admin", "User"],
              },
              {
                uuid: "b277e917-fa13-4827-be23-2e2ca4164853",
                path: "/contents/wathson/media",
                element: <></>,
                title: "Press & Media",
                hidden: false,
                permissions: ["Admin", "User"],
              },
            ],
          },
          {
            uuid: "88afdd08-b5f6-420a-bc03-28eb0f31d182",
            path: "/contents/lifestyle",
            element: <></>,
            title: "Lifestyle",
            hidden: false,
            permissions: ["Admin", "User"],
            children: [
              {
                uuid: "68f994c5-2dac-49cf-b30d-e7eae1b29b76",
                path: "/contents/lifestyle/all",
                element: <></>,
                title: "All",
                hidden: false,
                permissions: ["Admin", "User"],
              },
            ],
          },
          {
            uuid: "87072701-2246-4ec6-8e76-e50906be08b2",
            path: "/contents/work",
            element: <></>,
            title: "Work",
            hidden: false,
            permissions: ["Admin", "User"],
            children: [
              {
                uuid: "acb6ea73-0a9f-4cff-9839-04b432f90d02",
                path: "/contents/work/life",
                element: <></>,
                title: "Life in One Grove",
                hidden: false,
                permissions: ["Admin", "User"],
              },
              {
                uuid: "a79c9432-b510-4a3e-aa63-21046b90d625",
                path: "/contents/work/guest",
                element: <></>,
                title: "Guest Services",
                hidden: false,
                permissions: ["Admin", "User"],
              },
              {
                uuid: "cec9322a-ffe0-4ffd-9dff-976c4df6cbc2",
                path: "/contents/work/leasing",
                element: <></>,
                title: "Leasing",
                hidden: false,
                permissions: ["Admin", "User"],
              },
            ],
          },
          {
            uuid: "cf1a5e95-944c-4a37-8333-1c7e89507f6e",
            path: "/contents/about",
            element: <></>,
            title: "About",
            hidden: false,
            permissions: ["Admin", "User"],
            children: [
              {
                uuid: "92e469cd-6c94-417e-a444-32d0a1c036d1",
                path: "/contents/about/onegrove",
                element: <></>,
                title: "Building of One Grove",
                hidden: false,
                permissions: ["Admin", "User"],
              },
              {
                uuid: "bf4a99a5-8e19-440e-823d-eb6f14cde19b",
                path: "/contents/about/faq",
                element: <></>,
                title: "FAQ",
                hidden: false,
                permissions: ["Admin", "User"],
              },
              {
                uuid: "848a9396-d84a-444f-825d-d1ec317096c8",
                path: "/contents/about/getting-here",
                element: <></>,
                title: "Getting Here",
                hidden: false,
                permissions: ["Admin", "User"],
              },
              {
                uuid: "6f09d485-a971-45c8-9d1b-db783a496a7e",
                path: "/contents/about/contact",
                element: <></>,
                title: "Contact Us",
                hidden: false,
                permissions: ["Admin", "User"],
              },
            ],
          },
        ],
      },
      {
        uuid: "b7bd1575-4a90-4c6c-8edd-a638d05fb371",
        path: "/office",
        element: <></>,
        title: "오피스 관리",
        icon: <CalendarDaysIcon size={18} className="hover:bg-transparent" />,
        hidden: false,
        permissions: ["Admin", "User"],
        children: [
          {
            uuid: "b3c13f6a-0715-4199-b0bd-dcc163d4c89d",
            path: "/office/meeting",
            element: <></>,
            title: "회의실 예약",
            hidden: false,
            permissions: ["Admin", "User"],
          },
          {
            uuid: "28f505be-2143-4fe3-bef3-3b7e031a8247",
            path: "/office/visit",
            element: <></>,
            title: "방문 예약",
            hidden: false,
            permissions: ["Admin", "User"],
          },
          {
            uuid: "44587fea-8381-417e-b9e2-b217f8a98d37",
            path: "/office/parking",
            element: <></>,
            title: "주차 예약",
            hidden: false,
            permissions: ["Admin", "User"],
          },
          {
            uuid: "95b2aae3-4ce2-4782-95ca-62c4111dcc17",
            path: "/office/sleep",
            element: <></>,
            title: "수면실 예약",
            hidden: false,
            permissions: ["Admin", "User"],
          },
        ],
      },
      {
        uuid: "1ba90607-e1b4-4075-9b2d-c28a56559cb1",
        path: "/inquiry",
        element: <></>,
        title: "고객 문의",
        icon: <CircleHelpIcon size={18} className="hover:bg-transparent" />,
        hidden: false,
        permissions: ["Admin", "User"],
        children: [
          {
            uuid: "e1582c44-00e8-4667-8361-dff7da5d9964",
            path: "/inquiry/general",
            element: <></>,
            title: "일반문의",
            hidden: false,
            permissions: ["Admin", "User"],
          },
          {
            uuid: "b1210eab-7dc2-4f26-a977-bd600766ac96",
            path: "/inquiry/lease",
            element: <></>,
            title: "임대문의",
            hidden: false,
            permissions: ["Admin", "User"],
          },
          {
            uuid: "57b157b9-8c5d-4206-9491-caca5eb9c17e",
            path: "/inquiry/complaint",
            element: <></>,
            title: "불편접수",
            hidden: false,
            permissions: ["Admin", "User"],
          },
          {
            uuid: "e1fbb18e-2765-4d59-a154-1e915a9e35c2",
            path: "/inquiry/facility",
            element: <></>,
            title: "시설문의",
            hidden: false,
            permissions: ["Admin", "User"],
          },
        ],
      },
      {
        uuid: "c9c84ed1-a896-4d9b-b659-cd6a43dc8cd2",
        path: "/system",
        element: <></>,
        title: "시스템 관리",
        icon: <SettingsGearIcon size={18} className="hover:bg-transparent" />,
        hidden: false,
        permissions: ["Admin"],
        children: [
          {
            uuid: "6db9f018-f5d8-4d8b-a2f1-7cf2f841a86d",
            path: "/system/code",
            element: <></>,
            title: "공통코드 관리",
            hidden: false,
            permissions: ["Admin"],
          },
          {
            uuid: "e59c7075-0b1c-4607-b548-c38fa7566532",
            path: "/system/meeting",
            element: <></>,
            title: "회의실 설정",
            hidden: false,
            permissions: ["Admin"],
          },
          {
            uuid: "bc71031e-1a66-410a-84ea-5db89fa8822f",
            path: "/system/parking",
            element: <></>,
            title: "주차 설정",
            hidden: false,
            permissions: ["Admin"],
          },
          {
            uuid: "4bd3ba77-798a-4466-bc3e-48fec787592a",
            path: "/system/sleep",
            element: <></>,
            title: "수면실 설정",
            hidden: false,
            permissions: ["Admin"],
          },
        ],
      },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/403", element: <Forbidden /> },
  { path: "*", element: <NotFoundPage /> },
];

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
