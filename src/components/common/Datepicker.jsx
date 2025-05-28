import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

export default function Datepicker({
  mode = "range", // "single" or "range"
  selectedDate,
  onSingleChange,
  startDate,
  endDate,
  onRangeChange,
  disabled = false,
}) {
  if (mode === "single") {
    // 단일 날짜 선택기
    return (
      <div className="relative w-32">
        <DatePicker
          selected={selectedDate}
          onChange={onSingleChange}
          dateFormat="yyyy-MM-dd"
          placeholderText="날짜 선택"
          disabled={disabled}
          className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none"
        />

        <FaCalendarAlt className="pointer-events-none absolute top-3 right-2 text-gray-400" />
      </div>
    );
  }

  // 날짜 범위 선택기
  return (
    <div className="flex items-center space-x-2">
      {/* 시작일 */}
      <div className="relative">
        <DatePicker
          selected={startDate}
          onChange={(date) => {
            if (typeof onRangeChange === "function") {
              onRangeChange({ startDate: date, endDate });
            }
          }}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="yyyy-MM-dd"
          placeholderText="시작일"
          disabled={disabled}
          className="w-32 rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none"
        />
        <FaCalendarAlt className="pointer-events-none absolute top-3 right-2 text-gray-400" />
      </div>

      <span className="text-gray-500">~</span>

      {/* 종료일 */}
      <div className="relative">
        <DatePicker
          selected={endDate}
          onChange={(date) => {
            if (typeof onRangeChange === "function") {
              onRangeChange({ startDate, endDate: date });
            }
          }}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate} // 종료일은 시작일보다 뒤여야 함
          dateFormat="yyyy-MM-dd"
          placeholderText="종료일"
          disabled={disabled}
          className="w-32 rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none"
        />
        <FaCalendarAlt className="pointer-events-none absolute top-3 right-2 text-gray-400" />
      </div>
    </div>
  );
}
