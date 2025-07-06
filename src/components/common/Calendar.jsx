import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import { isWeekend, isHoliday } from "@/lib/utils";

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
      <div className="rbc-toolbar flex items-center justify-between px-4 py-2">
        <button
          onClick={() => handleNavigate("PREV")}
          className={`!border-0 px-2 py-1 ${!canNavigatePrev ? "cursor-not-allowed opacity-30" : ""}`}
          disabled={!canNavigatePrev}
        >
          &lt;
        </button>
        <span className="text-themeBlack text-lg font-bold">
          {currentMonth}
        </span>
        <button
          onClick={() => handleNavigate("NEXT")}
          className={`!border-0 px-2 py-1 ${!canNavigateNext ? "cursor-not-allowed opacity-30" : ""}`}
          disabled={!canNavigateNext}
        >
          &gt;
        </button>
      </div>
    );
  };

  const CustomPopup = ({ events, date, onSelectEvent, onClose }) => {
    const formattedDate = moment(date).format('YYYY년 MM월 DD일');
    
    return (
      <div className="rbc-overlay" role="dialog" tabIndex="-1">
        <div className="rbc-overlay-header">
          <h6>{formattedDate}</h6>
          <button
            className="rbc-overlay-close"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>
        <div className="rbc-overlay-body">
          {events.map((event, idx) => (
            <div
              key={idx}
              className="rbc-event cursor-pointer hover:bg-gray-100 p-2 rounded mb-1"
              onClick={() => {
                onSelectEvent(event);
                onClose();
              }}
            >
              <div className="font-medium text-sm">{event.title}</div>
              <div className="text-xs text-gray-600">
                {moment(event.start).format('HH:mm')} ~ {moment(event.end).format('HH:mm')}
              </div>
            </div>
          ))}
        </div>
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
        popup={true}
        length={3}
        dayLayoutAlgorithm="no-overlap"
        step={60}
        timeslots={1}
        showMultiDayTimes={false}
        eventPropGetter={(event) => ({
          style: {
            whiteSpace: "normal",
            overflow: "visible",
            textOverflow: "clip",
            fontSize: "12px",
            padding: "2px 4px",
            backgroundColor:
              event.resource?.status === "예약 확정" ? "#00AAFF" : "#4CAF50",
            color: "white",
          },
        })}
        messages={{
          next: "다음",
          previous: "이전",
          today: "오늘",
          month: "월",
          more: "더보기",
        }}
        components={{ 
          toolbar: CustomToolbar,
          popup: CustomPopup
        }}
        onSelectEvent={onSelectEvent}
        onSelectSlot={(slotInfo) => {
          const selectedDate = new Date(slotInfo.start);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          if (
            selectedDate >= tomorrow &&
            !isWeekend(selectedDate) &&
            !isHoliday(selectedDate)
          ) {
            onSelectSlot?.(slotInfo);
          }
        }}
      />
    </div>
  );
}
