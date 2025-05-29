import { Outlet } from "react-router-dom";

export default function BannerLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
