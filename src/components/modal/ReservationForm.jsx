import React, { useState } from "react";
import api from "@/lib/apiClient";

export default function ReservationForm({
  room,
  roomList,
  meetingOptions,
  existingReservations = [],
  initialData = {},
  isEdit = false,
  onSubmit,
  closeModal,
}) {
  const [roomId, setRoomId] = useState(initialData.roomId || room || 1);
  const [companyId, setCompanyId] = useState(isEdit ? initialData.companyId || "" : "");
  const [numberVisitors, setNumberVisitors] = useState(isEdit ? initialData.numberVisitors || "" : "");
  const [paymentType, setPaymentType] = useState(isEdit ? initialData.paymentType || "" : "free");
  const [resveDate, setResveDate] = useState(initialData.resveDate || "");
  const [resveStartTime, setResveStartTime] = useState(initialData.resveStartTime || "09:00:00");
  const [resveEndTime, setResveEndTime] = useState(initialData.resveEndTime || "10:00:00");
  const [content, setContent] = useState(initialData.content || "");
  const [realUser, setRealUser] = useState(initialData.realUser || "");
  const [note, setNote] = useState(initialData.note || "");
  const [status, setStatus] = useState(initialData.status || "gs0101");

  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = async () => {
    if (
      !resveDate ||
      !resveStartTime ||
      !resveEndTime ||
      !content ||
      !realUser ||
      !numberVisitors ||
      !companyId
    ) {
      alert("모든 필수 입력 항목을 작성해 주세요.");
      return;
    }

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
      alert("필수 입력 내용을 확인해 주세요.");
    }
  };


  const generateTimeOptions = (startHour, endHour) => {
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      return `${String(hour).padStart(2, '0')}:00:00`;
    });
  };

  const getReservedTimes = () => {
    return existingReservations
      .filter((r) => r.resource.resveDate === resveDate)
      .map((r) => ({
        start: new Date(`${r.resource.resveDate}T${r.resource.resveStartTime}`),
        end: new Date(`${r.resource.resveDate}T${r.resource.resveEndTime}`),
      }));
  };

  const isTimeAvailable = (timeStr) => {
    const timeDate = new Date(`${resveDate}T${timeStr}`);
    const reserved = getReservedTimes();

    return reserved.every(({ start, end }) => {
      const beforeStart = new Date(start);
      beforeStart.setHours(beforeStart.getHours() - 1);

      const afterEnd = new Date(end);
      afterEnd.setHours(afterEnd.getHours() + 1);

      return timeDate < beforeStart || timeDate > afterEnd;
    });
  };

  const getEndOptions = () => {
    if (!resveDate || !resveStartTime) return [];

    const base = new Date(`${resveDate}T${resveStartTime}`);
    if (isNaN(base)) return [];

    const options = [];

    // 시작시간 +1 ~ 18:00 까지
    for (let hour = base.getHours() + 1; hour <= 18; hour++) {
      const timeStr = `${String(hour).padStart(2, '0')}:00:00`;
      options.push({
        value: timeStr,
        disabled: !isTimeAvailable(timeStr),
      });
    }

    return options;
  };

  const isFormValid =
    roomId &&
    companyId &&
    paymentType &&
    resveDate &&
    resveStartTime &&
    resveEndTime &&
    content.trim() !== "" &&
    realUser.trim() !== "" &&
    Number(numberVisitors) > 0 &&
    Number(numberVisitors) <= 99;


  return (
    <div className="space-y-5 text-left">
      <div>
        <label className="block mb-1">Meeting Room <span className="text-red-500">*</span></label>
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)}
          className="w-full border px-2 py-1 rounded"  
        >
          {roomList.map((r) => (
            <option key={r.id} value={r.id}>
              {r.roomName} ({r.location})
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
            {generateTimeOptions(9, 17).map((time) => (
              <option key={time} value={time} disabled={!isTimeAvailable(time)}>
                {time.slice(0, 5)} {isTimeAvailable(time) ? "" : "(불가)"}
              </option>
            ))}
          </select>
          <span>~</span>
          <select
            value={resveEndTime}
            onChange={(e) => setResveEndTime(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            {getEndOptions().length === 0 ? (
              <option disabled>날짜와 시작시간 선택</option>
            ) : (
              getEndOptions().map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.value.slice(0, 5)} {opt.disabled ? "(불가)" : ""}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div>
        <label className="block mb-1">회의 내용 <span className="text-red-500">*</span></label>
        <input value={content} onChange={(e) => setContent(e.target.value)} className="w-full border px-2 py-1 rounded" />
      </div>

      <div>
        <label className="block mb-1">참석인원 <span className="text-red-500">*</span></label>
        <input
          type="number"
          min={1}
          max={99}
          value={numberVisitors}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val <= 99) setNumberVisitors(val);
          }}
          className="w-full border px-2 py-1 rounded"
        />
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
          <option value="">입주사를 선택하세요</option>
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
          disabled={!isFormValid}
          className={`rounded px-4 py-2 cursor-pointer text-white ${
            isFormValid ? "bg-black hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"
          }`}
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