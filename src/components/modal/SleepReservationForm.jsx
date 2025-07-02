import React, { useState, useEffect } from "react";
import api from "@/lib/apiClient";

export default function SleepReservationForm({
  room,
  roomList,
  meetingOptions,
  initialData = {},
  isEdit = false,
  onSubmit,
  closeModal,
}) {
  const [roomId, setRoomId] = useState(initialData.roomId || room || 1);
  const [roomDetailId, setRoomDetailId] = useState(initialData.roomId || room || 1);
  const [companyId, setCompanyId] = useState(initialData.companyId || "");
  const [paymentType, setPaymentType] = useState(
    initialData.paymentType || "free"
  );
  const [resveDate, setResveDate] = useState(initialData.resveDate || "");
  const [resveStartTime, setResveStartTime] = useState(
    initialData.resveStartTime || "09:00:00"
  );
  const [resveEndTime, setResveEndTime] = useState(
    initialData.resveEndTime || "10:00:00"
  );
  const [content, setContent] = useState(initialData.content || "");
  const [realUser, setRealUser] = useState(initialData.realUser || "");
  const [numberVisitors, setNumberVisitors] = useState(
    initialData.numberVisitors || 1
  );
  const [note, setNote] = useState(initialData.note || "");
  const [status, setStatus] = useState(initialData.status || "gs0101");
  const [meetingList, setMeetingList] = useState([]);

  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const startOptions = Array.from({ length: 9 }, (_, i) => {
    const hour = 9 + i; // 9시부터 17시까지
    return `${String(hour).padStart(2, "0")}:00:00`;
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
      `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:00`;

    return [formatTime(oneHourLater)];
  };

  useEffect(() => {
    if (!roomId) return;
    const fetchRoomDetail = async () => {
      try {
        const res = await api.get(`/api/v1/sleep/room/detail/${roomId}`);
        if (res.data.success) {
          // console.log('abdsdfdfdf', res.data.data);
          setMeetingList(res.data.data);
        }
      } catch (err) {
        console.error("방 상세 조회 실패:", err);
      }
    };
    fetchRoomDetail();
  }, [roomId]);

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
      alert("필수 입력 내용을 확인해 주세요.");
    }
  };

  return (
    <div className="space-y-5 text-left">
      <div>
        <label className="mb-1 block">
          Relax Room <span className="text-red-500">*</span>
        </label>
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full rounded border px-2 py-1"
        >
          <option value="">수면실을 선택해 주세요</option>
          {roomList.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.location})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block">
          Relax Room 호실 선택 <span className="text-red-500">*</span>
        </label>
        <select
          value={roomDetailId}
          onChange={(e) => setRoomDetailId(e.target.value)}
          className="w-full rounded border px-2 py-1"
        >
          <option value="">호실을 선택해 주세요</option>
          {meetingList?.infoList?.map((room, index) => (
            <>
              {room?.useYn === "Y" && !(meetingList?.gender !== "M" && index === 7) && (
                <option key={room.id} value={room.id}>
                  {room.roomNumId}호실
                </option>
              )}
            </>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block">
          예약 일정 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            value={resveDate}
            min={getToday()}
            onChange={(e) => setResveDate(e.target.value)}
            className="rounded border px-2 py-1"
          />
          <select
            value={resveStartTime}
            onChange={(e) => setResveStartTime(e.target.value)}
            className="rounded border px-2 py-1"
          >
            {startOptions.map((time) => (
              <option key={time} value={time}>
                {time.slice(0, 5)}
              </option>
            ))}
          </select>
          <span>~</span>
          <select
            value={resveEndTime}
            onChange={(e) => setResveEndTime(e.target.value)}
            className="rounded border px-2 py-1"
          >
            {endOptions().map((time) => (
              <option key={time} value={time}>
                {time.slice(0, 5)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div></div>

      <div>
        <label className="mb-1 block">
          입주사 <span className="text-red-500">*</span>
        </label>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="w-full rounded border px-2 py-1"
        >
          {meetingOptions?.visitCompanyListRes?.map((c) => (
            <option key={c.companyId} value={c.companyId}>
              {c.companyName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block">
          아이디 <span className="text-red-500">*</span>
        </label>
        <select
          value={realUser}
          onChange={(e) => setRealUser(e.target.value)}
          className="w-full rounded border px-2 py-1"
        >
          <option value="">아이디를 선택하세요</option>
          {meetingOptions?.visitCompanyListRes
            ?.find((c) => String(c.companyId) === String(companyId))
            ?.users?.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.userName} ({user.userId})
              </option>
            ))}
        </select>
      </div>

      <div className="flex justify-between gap-3">
        <button
          onClick={handleSubmit}
          className="cursor-pointer rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          저장
        </button>
        <button
          onClick={closeModal}
          className="cursor-pointer rounded border px-4 py-2"
        >
          취소
        </button>
      </div>
    </div>
  );
}
