import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";

const localizer = momentLocalizer(moment);

export default function CommonCalendar({
  events = [],
  onSelectEvent,
  onSelectSlot,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const minDate = moment().subtract(1, "month").startOf("month").toDate();
  const maxDate = moment().add(1, "month").endOf("month").toDate();

  const CustomToolbar = ({ date, onNavigate }) => {
    const currentMonth = moment(date).format("YYYY.MM");

    const prevDate = moment(date).subtract(1, "month").toDate();
    const nextDate = moment(date).add(1, "month").toDate();

    const canNavigatePrev = prevDate >= minDate;
    const canNavigateNext = nextDate <= maxDate;

    const handleNavigate = (action) => {
      const newDate = moment(date);
      if (action === "PREV" && canNavigatePrev) newDate.subtract(1, "month");
      else if (action === "NEXT" && canNavigateNext) newDate.add(1, "month");
      const newDateObj = newDate.toDate();
      if (newDateObj >= minDate && newDateObj <= maxDate) {
        setCurrentDate(newDateObj);
        onNavigate(action);
      }
    };

    return (
      <div className="rbc-toolbar flex justify-between items-center px-4 py-2">
        <button
          onClick={() => handleNavigate("PREV")}
          className={`!border-0 px-2 py-1 ${!canNavigatePrev ? "opacity-30 cursor-not-allowed" : ""}`}
          disabled={!canNavigatePrev}
        >
          &lt;
        </button>
        <span className="text-lg font-bold text-themeBlack">{currentMonth}</span>
        <button
          onClick={() => handleNavigate("NEXT")}
          className={`!border-0 px-2 py-1 ${!canNavigateNext ? "opacity-30 cursor-not-allowed" : ""}`}
          disabled={!canNavigateNext}
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        date={currentDate}
        defaultView="month"
        views={["month"]}
        popup
        dayLayoutAlgorithm="no-overlap"
        eventPropGetter={(event) => ({
          style: {
            whiteSpace: "normal",
            overflow: "visible",
            textOverflow: "clip",
            fontSize: "12px",
            padding: "2px 4px",
            backgroundColor: event.resource?.status === "예약 확정" ? "#00AAFF" : "#4CAF50",
            color: "white",
          },
        })}
        messages={{
          next: "다음",
          previous: "이전",
          today: "오늘",
          month: "월",
        }}
        components={{ toolbar: CustomToolbar }}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
      />
    </div>
  );
}