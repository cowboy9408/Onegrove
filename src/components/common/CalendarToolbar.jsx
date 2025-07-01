import React from "react";
import moment from "moment";

export default function CalendarToolbar({
  currentDate,
  minDate,
  maxDate,
  onChangeMonth,
  selectedDate,
}) {
  const currentMonth = moment(selectedDate).format("YYYY년 M월 D일");

  const prevDate = moment(currentDate).subtract(1, "month").toDate();
  const nextDate = moment(currentDate).add(1, "month").toDate();

  const canNavigatePrev = prevDate >= minDate;
  const canNavigateNext = nextDate <= maxDate;

  const handleNavigate = (action) => {
    let newDate = moment(currentDate);
    if (action === "PREV" && canNavigatePrev)
      newDate = newDate.subtract(1, "month");
    else if (action === "NEXT" && canNavigateNext)
      newDate = newDate.add(1, "month");

    const newDateObj = newDate.toDate();
    if (newDateObj >= minDate && newDateObj <= maxDate) {
      onChangeMonth(newDateObj);
    }
  };

  return (
    <div className="rbc-toolbar flex items-center justify-between px-4 py-2">
      <button
        onClick={() => handleNavigate("PREV")}
        className={`!border-0 px-2 py-1 ${!canNavigatePrev ? "cursor-not-allowed opacity-30" : ""}`}
        disabled={!canNavigatePrev}
      >
        &lt;
      </button>
      <span className="text-themeBlack text-lg font-bold">{currentMonth}</span>
      <button
        onClick={() => handleNavigate("NEXT")}
        className={`!border-0 px-2 py-1 ${!canNavigateNext ? "cursor-not-allowed opacity-30" : ""}`}
        disabled={!canNavigateNext}
      >
        &gt;
      </button>
    </div>
  );
}
