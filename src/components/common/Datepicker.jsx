import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { useRef } from "react";

export default function Datepicker({
  mode = "range", // "single" or "range"
  timeOnly = false,
  selectedDate,
  onSingleChange,
  startDate,
  endDate,
  onRangeChange,
  disabled = false,
}) {
  const datepickerRef = useRef(null);

  const commonProps = {
    showTimeSelect: timeOnly,
    showTimeSelectOnly: timeOnly,
    timeIntervals: 30,
    timeCaption: "시간",
    dateFormat: timeOnly ? "HH:mm" : "yyyy-MM-dd HH:mm",
  };

  if (mode === "icon-only") {
    return (
      <div className="relative">
        {/* 숨겨진 DatePicker */}
        <DatePicker
          ref={datepickerRef}
          selected={selectedDate}
          onChange={onSingleChange}
          minDate={startDate}
          maxDate={endDate}
          {...commonProps}
          customInput={<div />} // 시각적으로 보이지 않게 함
        />
        <button
          type="button"
          onClick={() => datepickerRef.current.setOpen(true)}
          className="p-2"
        >
          <FaCalendarAlt className="text-xl text-gray-600" />
        </button>
      </div>
    );
  }

  if (mode === "single") {
    // 단일 날짜 선택기
    return (
      <div className="relative w-32">
        <DatePicker
          selected={selectedDate}
          onChange={onSingleChange}
          minDate={startDate}
          dateFormat="yyyy-MM-dd"
          placeholderText="날짜 선택"
          disabled={disabled}
          {...commonProps}
          className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none ${
            disabled ? "cursor-not-allowed bg-gray-100 text-gray-500" : ""
          }`}
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
          placeholderText={timeOnly ? "시작 시간" : "시작일"}
          disabled={disabled}
          {...commonProps}
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
          placeholderText={timeOnly ? "종료 시간" : "종료일"}
          disabled={disabled}
          {...commonProps}
          className="w-32 rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none"
        />
        <FaCalendarAlt className="pointer-events-none absolute top-3 right-2 text-gray-400" />
      </div>
    </div>
  );
}
