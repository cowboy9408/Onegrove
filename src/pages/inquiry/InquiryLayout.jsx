// 📁 src/pages/retail/RetailLayout.jsx
import { Outlet } from "react-router-dom";

export default function OfficeLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
