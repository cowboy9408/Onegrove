import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

export default function DateRangePicker({ startDate, endDate, onChange }) {
  return (
    <div className="flex items-center space-x-2">
      {/* 시작일 */}
      <div className="relative">
        <DatePicker
          selected={startDate}
          onChange={(date) => onChange({ startDate: date, endDate })}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="시작일"
          className="w-32 rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none"
        />
        <FaCalendarAlt className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
      </div>

      <span className="text-gray-500">~</span>

      {/* 종료일 */}
      <div className="relative">
        <DatePicker
          selected={endDate}
          onChange={(date) => onChange({ startDate, endDate: date })}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="종료일"
          className="w-32 rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none"
        />
        <FaCalendarAlt className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
