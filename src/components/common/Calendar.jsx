import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CustomToolbar from "./CustomToolbar";




// Moment 로컬라이저 설정
const localizer = momentLocalizer(moment);

/**
 * 공통 캘린더 컴포넌트 (React Big Calendar 기반)
 *
 * @param {Array} events - 일정 목록
 * @param {Function} onSelectEvent - 이벤트 클릭 시 처리
 * @param {Function} onSelectSlot - 날짜 클릭/범위 선택 시 처리
 */
export default function CommonCalendar({
  events = [],
  onSelectEvent,
  onSelectSlot,
}) {
  return (
    <div className="p-4 rounded-xl shadow-md bg-white dark:bg-gray-900">
    <Calendar
  localizer={localizer}
  events={events}
  startAccessor="start"
  endAccessor="end"
  selectable
  style={{ height: 600 }}
  onSelectEvent={onSelectEvent}
  onSelectSlot={onSelectSlot}
  popup
  views={["month", "week", "day"]}
  messages={{
    next: "다음",
    previous: "이전",
    today: "오늘",
    month: "월",
    week: "주",
    day: "일",
  }}
  components={{
    toolbar: CustomToolbar,
  }}
  timeslots={2}
  step={30}
/>
    </div>
  );
}
