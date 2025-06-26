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

    const handleNavigate = (action) => {
      const newDate = moment(date);
      if (action === "PREV") newDate.subtract(1, "month");
      else if (action === "NEXT") newDate.add(1, "month");
      const newDateObj = newDate.toDate();
      if (newDateObj >= minDate && newDateObj <= maxDate) {
        setCurrentDate(newDateObj);
        onNavigate(action);
      }
    };

    return (
      <div className="rbc-toolbar flex justify-between items-center px-4 py-2">
        <button className="!border-0" onClick={() => handleNavigate("PREV")}>&lt;</button>
        <span className="text-lg font-bold text-themeBlack">{currentMonth}</span>
        <button className="!border-0" onClick={() => handleNavigate("NEXT")}>&gt;</button>
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
            backgroundColor: event.resource?.status === "예약 확정" ? "##00AAFF" : "#4CAF50",
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