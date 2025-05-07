import React, { useState } from "react";

export default function ReservationForm({ room, onSubmit }) {
  const [selectedRoom, setSelectedRoom] = useState(room || "A");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isAllDay, setIsAllDay] = useState(false);

  const handleSubmit = () => {
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    onSubmit({
      title,
      start: isAllDay ? new Date(date) : start,
      end: isAllDay ? new Date(date) : end,
      room: selectedRoom,
      allDay: isAllDay,
    });
  };

  return (
    <div className="space-y-5 text-left">
      {/* 회의실 선택 */}
      <div>
        <label className="block mb-1">회의실</label>
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="w-full border px-2 py-1 rounded"
        >
          {["A", "B", "C"].map((r) => (
            <option key={r} value={r}>
              회의실 {r}
            </option>
          ))}
        </select>
      </div>

      {/* 회의 제목 */}
      <div>
        <label className="block mb-1">회의 제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>

      {/* 회의 시간 */}
      <div>
        <label className="block mb-1">회의 시간</label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={isAllDay}
            className="border px-2 py-1 rounded"
          />
          <span>~</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={isAllDay}
            className="border px-2 py-1 rounded"
          />
          <label className="ml-4 flex items-center whitespace-nowrap text-xs">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="mr-1"
            />
            종일
          </label>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="relative h-[40px] top-100px">
  <div className="absolute -bottom-4 right-0 flex justify-end gap-3">
    <button
      onClick={handleSubmit}
      className="rounded bg-black text-white px-4 py-2 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300"
    >
      저장
    </button>
    <button
      onClick={handleSubmit}
      className="rounded bg-black text-white px-4 py-2 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300"
    >
      취소
    </button>
  </div>
</div>
    </div>
  );
}
