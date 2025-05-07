import React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function CustomToolbar({ label, onNavigate, date }) {
  const year = format(date, "yyyy", { locale: ko });
  const month = format(date, "MM", { locale: ko });

  return (
    <div className="flex items-center justify-center mb-4 gap-4 text-lg font-semibold">
      <button onClick={() => onNavigate("PREV")} className="text-xl px-2">{"<"}</button>
      <span>{`${year}년 ${month}월`}</span>
      <button onClick={() => onNavigate("NEXT")} className="text-xl px-2">{">"}</button>
    </div>
  );
}
