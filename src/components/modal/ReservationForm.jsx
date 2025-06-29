import React, { useState } from "react";
import api from "@/lib/apiClient";

export default function ReservationForm({
  room,
  roomList,
  meetingOptions,
  initialData = {},
  isEdit = false,
  onSubmit,
  closeModal,
}) {
  const [roomId, setRoomId] = useState(initialData.roomId || room || 1);
  const [companyId, setCompanyId] = useState(initialData.companyId || "");
  const [paymentType, setPaymentType] = useState(initialData.paymentType || "free");
  const [resveDate, setResveDate] = useState(initialData.resveDate || "");
  const [resveStartTime, setResveStartTime] = useState(initialData.resveStartTime || "09:00:00");
  const [resveEndTime, setResveEndTime] = useState(initialData.resveEndTime || "10:00:00");
  const [content, setContent] = useState(initialData.content || "");
  const [realUser, setRealUser] = useState(initialData.realUser || "");
  const [numberVisitors, setNumberVisitors] = useState(initialData.numberVisitors || 1);
  const [note, setNote] = useState(initialData.note || "");
  const [status, setStatus] = useState(initialData.status || "gs0101");

  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const startOptions = Array.from({ length: 19 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const min = i % 2 === 0 ? "00" : "30";
    return `${String(hour).padStart(2, '0')}:${min}:00`;
  });

  const endOptions = () => {
    const [hour, min] = resveStartTime.split(":");
    const baseHour = parseInt(hour, 10);
    const baseMin = parseInt(min, 10);

    const oneHourLater = new Date();
    oneHourLater.setHours(baseHour + 1);
    oneHourLater.setMinutes(baseMin);

    const twoHourLater = new Date();
    twoHourLater.setHours(baseHour + 2);
    twoHourLater.setMinutes(baseMin);

    const formatTime = (date) =>
      `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`;

    return [formatTime(oneHourLater), formatTime(twoHourLater)];
  };

  const handleSubmit = async () => {
    const payload = {
      roomId: Number(roomId),
      companyId: Number(companyId),
      paymentType,
      resveDate,
      resveStartTime,
      resveEndTime,
      content,
      realUser,
      numberVisitors: Number(numberVisitors),
      note,
      ...(isEdit && { id: initialData.id }),
      ...(!isEdit && { status }),
    };

    try {
      const res = await api.post(
        isEdit ? "/api/v1/meeting/update" : "/api/v1/meeting/insert",
        payload
      );
      if (res.data?.success) {
        alert(isEdit ? "수정 완료" : "등록 완료");
        onSubmit?.(payload);
        closeModal?.();
      } else alert("처리 실패");
    } catch (err) {
      console.error("예약 처리 실패:", err);
      alert("필수 입력 내용을 확인해 주세요.")
    }
  };

  return (
    <div className="space-y-5 text-left">
      <div>
        <label className="block mb-1">Meeting Room <span className="text-red-500">*</span></label>
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)}
          className="w-full border px-2 py-1 rounded"  
        >
          {roomList.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.location})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">예약 종류 <span className="text-red-500">*</span></label>
        <div className="flex gap-4">
          <label className="mb-1 w-[50%] flex gap-2 items-center">
            <input
              type="radio"
              value="free"
              checked={paymentType === "free"}
              onChange={() => setPaymentType("free")}
            /> 무료
          </label>
          <label className="mb-1 w-[50%] flex gap-2 items-center">
            <input
              type="radio"
              value="paid"
              checked={paymentType === "paid"}
              onChange={() => setPaymentType("paid")}
            /> 유료
          </label>
        </div>
      </div>

      <div>
        <label className="block mb-1">예약 일정 <span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          <input type="date" value={resveDate} min={getToday()} onChange={(e) => setResveDate(e.target.value)} className="border px-2 py-1 rounded" />
          <select value={resveStartTime} onChange={(e) => setResveStartTime(e.target.value)} className="border px-2 py-1 rounded">
            {startOptions.map((time) => (
              <option key={time} value={time}>{time.slice(0,5)}</option>
            ))}
          </select>
          <span>~</span>
          <select value={resveEndTime} onChange={(e) => setResveEndTime(e.target.value)} className="border px-2 py-1 rounded">
            {endOptions().map((time) => (
              <option key={time} value={time}>{time.slice(0,5)}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block mb-1">회의 내용 <span className="text-red-500">*</span></label>
        <input value={content} onChange={(e) => setContent(e.target.value)} className="w-full border px-2 py-1 rounded" />
      </div>

      <div>
        <label className="block mb-1">참석인원 <span className="text-red-500">*</span></label>
        <input type="number" value={numberVisitors} onChange={(e) => setNumberVisitors(e.target.value)} className="w-full border px-2 py-1 rounded" />
      </div>

      <div>
        <label className="block mb-1">사용자 <span className="text-red-500">*</span></label>
        <input value={realUser} onChange={(e) => setRealUser(e.target.value)} className="w-full border px-2 py-1 rounded" />
      </div>

      <div>
        <label className="block mb-1">입주사 <span className="text-red-500">*</span></label>
        <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}
          className="w-full border px-2 py-1 rounded"  
        >
          {meetingOptions?.visitCompanyListRes?.map((c) => (
            <option key={c.companyId} value={c.companyId}>
              {c.companyName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">비고</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border px-2 py-1 rounded" />
      </div>

      <div className="flex justify-between gap-3">
        <button
          onClick={handleSubmit}
          className="rounded bg-black text-white px-4 py-2 hover:bg-gray-800 cursor-pointer"
        >
          저장
        </button>
        <button
          onClick={closeModal}
          className="rounded border px-4 py-2 cursor-pointer"
        >
          취소
        </button>
      </div>
    </div>
  );
}