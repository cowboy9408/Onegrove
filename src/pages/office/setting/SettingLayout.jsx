import { Outlet } from "react-router-dom";

export default function SettingLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
