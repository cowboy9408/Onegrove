import React, { useState, useEffect } from "react";
import api from "@/lib/apiClient";
import { isWeekend, isHoliday } from "@/lib/utils";
import dayjs from "dayjs";

export default function ReservationForm({
  locationOptions = [],
  roomOptions = [],
  selectedLocation: propSelectedLocation,
  selectedRoom: propSelectedRoom,
  setSelectedLocation: propSetSelectedLocation,
  setSelectedRoom: propSetSelectedRoom,
  meetingOptions,
  existingReservations = [],
  initialData = {},
  isEdit = false,
  onSubmit,
  closeModal,
}) {
  const [selectedLocation, setSelectedLocation] = useState(propSelectedLocation || (locationOptions[0]?.code ?? ""));
  const [roomId, setRoomId] = useState(initialData.roomId || propSelectedRoom || (roomOptions[0]?.id ?? ""));
  const [companyId, setCompanyId] = useState(isEdit ? initialData.companyId || "" : "");
  const [numberVisitors, setNumberVisitors] = useState(isEdit ? initialData.numberVisitors || "" : "");
  const [paymentType, setPaymentType] = useState(isEdit ? (initialData.paymentType === "유료 예약") ? "paid" : "free" : "free");
  const [resveDate, setResveDate] = useState(initialData.resveDate || "");
  const [resveStartTime, setResveStartTime] = useState(initialData.resveStartTime && initialData.resveStartTime + ":00" || "09:00:00");
  const [resveEndTime, setResveEndTime] = useState("");
  const [content, setContent] = useState(initialData.content || "");
  const [realUser, setRealUser] = useState(initialData.realUser || "");
  const [note, setNote] = useState(initialData.note || "");
  const [status] = useState(initialData.status || "gs0101");
  const [remainingTime, setRemainingTime] = useState(null);



  

  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getMaxDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const yyyy = nextMonth.getFullYear();
    const mm = String(nextMonth.getMonth() + 1).padStart(2, "0");
    const dd = String(nextMonth.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    if (!isEdit && roomOptions.length > 0) {
      setRoomId(roomOptions[0].id);
      if (propSetSelectedRoom) propSetSelectedRoom(roomOptions[0].id);
    }
  }, [selectedLocation, roomOptions]);

  useEffect(() => {
    if (!isEdit && locationOptions.length > 0 && !selectedLocation) {
      setSelectedLocation(locationOptions[0].code);
      if (propSetSelectedLocation) propSetSelectedLocation(locationOptions[0].code);
    }
  }, [locationOptions]);

  useEffect(() => {
    if (propSelectedLocation) setSelectedLocation(propSelectedLocation);
  }, [propSelectedLocation]);
  useEffect(() => {
    if (propSelectedRoom) {
      setRoomId(propSelectedRoom);
    }
  }, [propSelectedRoom]);

  useEffect(() => {
    if (meetingOptions) {
      console.log(meetingOptions);
    }
  }, [meetingOptions]);

  // resveStartTime 변경 시 resveEndTime 자동 업데이트
  useEffect(() => {
    if (resveStartTime && (!resveEndTime || resveEndTime === "10:00:00")) {
      const startHour = parseInt(resveStartTime.split(':')[0]);
      const endHour = startHour + 1;
      if (endHour <= 18) {
        const newEndTime = `${String(endHour).padStart(2, "0")}:00:00`;
        setResveEndTime(newEndTime);
      }
    }

    if (resveStartTime) {
      const threeDaysAgo = dayjs().add(3, "day");
      const resveDate = dayjs(resveStartTime);
      const _isAfterThreeDaysAgo = resveDate.isAfter(threeDaysAgo);
      // setIsThreeDay(_isAfterThreeDaysAgo);
    }
  }, [resveStartTime, resveEndTime]);

  useEffect(() => {
    if (initialData.resveDate) setResveDate(initialData.resveDate);
    if (initialData.resveStartTime) setResveStartTime(initialData.resveStartTime + ":00");
    if (initialData.resveEndTime) {
      const end = initialData.resveEndTime;
      const formattedEnd = end.length === 8 ? end : end + ":00";
      setResveEndTime(formattedEnd);
    }
    if (initialData.content) setContent(initialData.content);
    if (initialData.realUser) setRealUser(initialData.realUser);
    if (initialData.numberVisitors) setNumberVisitors(initialData.numberVisitors);
    if (initialData.companyId) setCompanyId(initialData.companyId);
    if (initialData.note) setNote(initialData.note);
  }, [initialData]);

  // 잔여 시간 조회 API 호출
  useEffect(() => {
    if (roomId && resveDate && companyId) {
      const fetchRemainingTime = async () => {
        try {
          const res = await api.get(`/api/v1/meeting/remaining-time?companyId=${companyId}&resvDate=${resveDate}&roomId=${roomId}`);
          if (res.data?.success) {
            setRemainingTime(res.data.data.remainingTime);
          }
        } catch (err) {
          console.error("잔여 시간 조회 실패:", err);
          setRemainingTime(null);
        }
      };
      fetchRemainingTime();
    } else {
      setRemainingTime(null);
    }
  }, [roomId, resveDate, companyId]);

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
    console.log(payload)

    try {
      const res = await api.post(
        isEdit ? "/api/v1/meeting/update" : "/api/v1/meeting/insert",
        payload
      );
      if (res.data?.success) {
        if(res.data?.message) {
          alert(res.data?.message);
        } else {
          alert(isEdit ? "수정 완료" : "등록 완료");
        }
        onSubmit?.(payload);
        closeModal?.();
      } else {
        if(res.data?.message) {
          alert(res.data?.message);
        } else {
          alert("처리 실패");
        }
      }
    } catch (err) {
      console.error("예약 처리 실패:", err);
      alert(err?.response?.data?.message || err?.data?.message || "예약이 실패되었습니다. 다시시도 해주세요.");
    }
  };

  const generateTimeOptions = (startHour, endHour) => {
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      return `${String(hour).padStart(2, "0")}:00:00`;
    });
  };

  const getReservedTimes = () => {
    return existingReservations
      .filter((r) => 
        r.resource.resveDate === resveDate &&
        (!isEdit || r.resource.id !== initialData.id) // 본인 예약은 제외
      )
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

    const reserved = getReservedTimes();
    const baseStart = new Date(`${resveDate}T${resveStartTime}`);

    const options = [];

    for (let hour = baseStart.getHours() + 1; hour <= 18; hour++) {
      const endTimeStr = `${String(hour).padStart(2, "0")}:00:00`;
      const endTime = new Date(`${resveDate}T${endTimeStr}`);

      // 회의 종료 후 1시간 버퍼까지 포함한 시간
      const bufferEnd = new Date(endTime);
      bufferEnd.setHours(bufferEnd.getHours() + 1);

      // 예약된 구간과 겹치는지 확인 (버퍼 시간 포함)
      const overlaps = reserved.some(({ start, end }) => {
        return (
          (baseStart >= start && baseStart < end) || // 시작이 중간에 겹침
          (bufferEnd > start && baseStart < end) || // 종료 + 1시간이 다른 예약과 겹침
          (baseStart <= start && bufferEnd > start) // 전체 덮는 경우
        );
      });

      if (overlaps) break;

      options.push({
        value: endTimeStr,
        disabled: false,
      });
    }

    return options;
  };

  // 현재 선택된 회의실의 최대 수용인원 구하기
  const selectedRoomObj = roomOptions.find(r => String(r.id) === String(roomId));
  const maxCapacity = selectedRoomObj?.capacity || 64;

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
        <label className="mb-1 block">
          오피스/지점 <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedLocation}
          onChange={e => {
            setSelectedLocation(e.target.value);
            if (propSetSelectedLocation) propSetSelectedLocation(e.target.value);
          }}
          className="w-full rounded border px-2 py-1"
          disabled={isEdit}
        >
          {locationOptions.map(loc => (
            <option key={loc.code} value={loc.code}>{loc.location}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block">
          Meeting Room <span className="text-red-500">*</span>
        </label>
        <select
          value={roomId}
          onChange={e => {
            setRoomId(e.target.value);
            if (propSetSelectedRoom) propSetSelectedRoom(e.target.value);
          }}
          className="w-full rounded border px-2 py-1"
        >
          {roomOptions.map(r => (
            <option key={r.id} value={r.id}>{r.roomName}</option>
          ))}
        </select>

        
        
      </div>

      <div>
        <label className="mb-1 block">
          예약 종류 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="mb-1 flex w-[50%] items-center gap-2">
            <input
              type="radio"
              value="free"
              checked={paymentType === "free"}
              onChange={() => setPaymentType("free")}
            />{" "}
            무료
            {remainingTime !== null && (
              <span className="text-sm text-gray-600 ml-1">
                (잔여 시간: {remainingTime}시간)
              </span>
            )}
          </label>
          <label className="mb-1 flex w-[50%] items-center gap-2">
            <input
              type="radio"
              value="paid"
              checked={paymentType === "paid"}
              onChange={() => setPaymentType("paid")}
            />{" "}
            유료
          </label>
        </div>
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
            max={getMaxDate()}
            onChange={(e) => {
              const val = e.target.value;
              if (isWeekend(val) || isHoliday(val)) {
                alert("주말 및 공휴일은 선택할 수 없습니다.");
                return;
              }
              setResveDate(val);
            }}
            className="rounded border px-2 py-1"
          />
          <select
            value={resveStartTime}
            onChange={(e) => setResveStartTime(e.target.value)}
            className="rounded border px-2 py-1"
          >
            {generateTimeOptions(9, 17).map((time) => (
              <option key={time} value={time} disabled={!isTimeAvailable(time)}>
                {time.slice(0, 5)} {isTimeAvailable(time) ? "" : "(불가)"}
              </option>
            ))}
          </select>
          <span>~</span>
          {/* {console.log("resveEndTime selectbox 렌더링:", { resveEndTime, getEndOptions: getEndOptions().length })} */}
          <select
            value={resveEndTime}
            onChange={(e) => {
              console.log("resveEndTime 수동 변경:", e.target.value);
              setResveEndTime(e.target.value);
            }}
            className="rounded border px-2 py-1"
          >
            {!resveDate || !resveStartTime ? (
              <option value="" disabled>날짜와 시작시간 선택</option>
            ) : getEndOptions().length === 0 ? (
              <option value="" disabled>사용 가능한 종료시간 없음</option>
            ) : (
              getEndOptions().map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.value.slice(0, 5)} {opt.disabled ? "(불가)" : ""}
                </option>
              ))
            )}
          </select>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          * 주말 및 공휴일은 선택할 수 없습니다.
        </p>
        {/* {(!isThreeDay && paymentType === "paid") && (<p>유료 예약 시 오늘 기준 영업일 3일 이내<br />수정 및 삭제 불가하며 별도의 수수료가 발생됩니다.</p>)} */}
      </div>

      <div>
        <label className="mb-1 block">
          입주사 <span className="text-red-500">*</span>
        </label>
        
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="w-full rounded border px-2 py-1"
        >
          <option value="">입주사를 선택하세요</option>
          {meetingOptions?.map((c) => (
            <option key={c.companyId} value={c.companyId}>
              {c.companyName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block">
          회의명 <span className="text-red-500">*</span>
        </label>
        <input
          value={content}
          maxLength={200}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded border px-2 py-1"
        />
      </div>

      <div>
        <label className="mb-1 block">
          참석인원 (최대 수용인원: {maxCapacity}명) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={numberVisitors}
          maxLength={2}
          onChange={(e) => {
            const input = e.target.value;
            if (input === "") {
              setNumberVisitors("");
              return;
            }
            if (!/^\d+$/.test(input)) return;
            const val = Number(input);
            if (val > maxCapacity) {
              alert(`최대 수용 인원은 ${maxCapacity}명입니다.`);
              setNumberVisitors("");
            } else {
              setNumberVisitors(val);
            }
          }}
          max={maxCapacity}
          className="w-full rounded border px-2 py-1"
        />
      </div>

      <div>
        <label className="mb-1 block">
          사용자 <span className="text-red-500">*</span>
        </label>
        <input
          value={realUser}
          maxLength={20}
          onChange={(e) => setRealUser(e.target.value)}
          className="w-full rounded border px-2 py-1"
        />
      </div>

      

      <div>
        <label className="mb-1 block">비고</label>
        <input
          value={note}
          maxLength={50}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded border px-2 py-1"
        />
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
          className="cursor-pointer rounded border px-4 py-2"
        >
          취소
        </button>
      </div>
    </div>
  );
}
