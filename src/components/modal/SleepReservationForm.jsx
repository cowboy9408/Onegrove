import React, { useState, useEffect, useMemo } from "react";
import api from "@/lib/apiClient";
import { isWeekend, isHoliday, extractErrorMessage, extractSuccessMessage } from "@/lib/utils";

export default function SleepReservationForm({
  room,
  roomList,
  initialData = {},
  isEdit = false,
  onSubmit,
  closeModal,
}) {
  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [roomId, setRoomId] = useState(String(initialData.roomId || room || 1));
  const [roomDetailId, setRoomDetailId] = useState(String(initialData.roomInfoId || initialData.roomNumberId || initialData.roomId || room || 1));
  const [companyId, setCompanyId] = useState(String(initialData.companyId || ""));
  const [resveDate, setResveDate] = useState(initialData.reserveDt || initialData.resveDate || (!isEdit ? getToday() : ""));
  const [resveStartTime, setResveStartTime] = useState(
    initialData.reserveTime || initialData.resveStartTime || "09:00:00"
  );
  const [resveEndTime, setResveEndTime] = useState(
    initialData.resveEndTime || "10:00:00"
  );
  const [realUser, setRealUser] = useState(String(initialData.userId || initialData.realUser || ""));
  const [meetingList, setMeetingList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [allReservations, setAllReservations] = useState([]);

  // 특정 좌석이 특정 시간에 예약되었는지 확인하는 함수
  const isRoomReserved = (roomNumId, time) => {
    if (!allReservations?.length) return false;
    
    return allReservations.some(reservation => {
      // 수정모드일 때는 현재 수정 중인 예약은 제외
      if (isEdit && initialData?.id && reservation.id === initialData.id) {
        return false;
      }
      
      return reservation.roomNumberId === roomNumId && 
             reservation.reserveTime === time;
    });
  };

  // 특정 시간이 선택된 좌석에 예약되었는지 확인하는 함수
  const isTimeReserved = (time) => {
    if (!roomDetailId || !allReservations?.length) return false;
    
    const selectedRoom = meetingList?.infoList?.find(room => room.id === Number(roomDetailId));
    if (!selectedRoom) return false;
    
    return allReservations.some(reservation => {
      // 수정모드일 때는 현재 수정 중인 예약은 제외
      if (isEdit && initialData?.id && reservation.id === initialData.id) {
        return false;
      }
      
      return reservation.roomNumberId === selectedRoom.roomNumId && 
             reservation.reserveTime === time;
    });
  };

  const getStartOptions = useMemo(() => {
    const options = [];
    const todayStr = getToday();
    let startHour = 9;
    
    // 수정모드가 아니고 오늘 날짜인 경우에만 현재 시간 이후로 제한
    if (!isEdit && resveDate === todayStr) {
      // startHour = Math.max(9, now.getHours() + 1); // 현재 시간 이후
    }
    
    // startHour가 17을 초과하지 않도록 제한
    startHour = Math.min(startHour, 17);
    
    for (let hour = startHour; hour <= 17; hour++) {
      const timeStr = `${String(hour).padStart(2, "0")}:00:00`;
      const isReserved = roomDetailId && isTimeReserved(timeStr);
      
      options.push({
        value: timeStr,
        disabled: isReserved,
        label: `${timeStr.slice(0, 5)}${isReserved ? " (예약됨)" : ""}`
      });
    }
    
    // 수정모드에서 현재 설정된 시간이 옵션에 없으면 추가
    if (isEdit && resveStartTime && !options.some(opt => opt.value === resveStartTime)) {
      const isReserved = roomDetailId && isTimeReserved(resveStartTime);
      options.push({
        value: resveStartTime,
        disabled: isReserved,
        label: `${resveStartTime.slice(0, 5)}${isReserved ? " (예약됨)" : ""}`
      });
      options.sort((a, b) => a.value.localeCompare(b.value)); // 시간순으로 정렬
    }
    
    // 옵션이 비어있으면 최소한 9시는 포함
    if (options.length === 0) {
      options.push({
        value: "09:00:00",
        disabled: false,
        label: "09:00"
      });
    }
    
    return options;
  }, [roomDetailId, allReservations, resveDate, resveStartTime, isEdit, meetingList]);

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

  // 특정 날짜의 모든 예약 정보를 조회하는 함수
  const fetchAllReservations = async (roomId, date) => {
    if (!roomId || !date) return;
    
    try {
      const reservations = [];
      
      // 9시부터 17시까지 모든 시간대에 대해 예약 정보 조회
      for (let hour = 9; hour <= 17; hour++) {
        const timeStr = `${String(hour).padStart(2, "0")}:00:00`;
        
        try {
          const res = await api.get(`/api/v1/sleep/reserve/list/detail`, {
            params: {
              roomId,
              reserveDt: date,
              reserveTime: timeStr,
            },
          });
          
          if (res.data.success && res.data.data) {
            reservations.push(...res.data.data);
          }
        } catch (err) {
          console.error(`${timeStr} 예약 정보 조회 실패:`, err);
        }
      }
      
      setAllReservations(reservations);
    } catch (err) {
      console.error("전체 예약 정보 조회 실패:", err);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    const fetchRoomDetail = async () => {
      try {
        const res = await api.get(`/api/v1/sleep/room/detail/${roomId}`);
        if (res.data.success) {
          setMeetingList(res.data.data);
        }
      } catch (err) {
        console.error("방 상세 조회 실패:", err);
      }

      try {
        const res = await api.get(`/api/v1/sleep/reserve/company`);
        if (res.data.success) {
          setCompanyList(res.data.data);
        }
      } catch (err) {
        console.error("입주사 조회 실패:", err);
      }
    };
    fetchRoomDetail();
  }, [roomId]);

  useEffect(() => {
    if (!companyId) return;
    const fetchRoomDetail = async () => {
      try {
        const res = await api.get(`/api/v1/sleep/reserve/user?companyId=${companyId}`);
        if (res.data.success) {
          setUserList(res.data.data);
        }
      } catch (err) {
        console.error("유저 조회 실패:", err);
      }
    };
    fetchRoomDetail();
  }, [companyId]);

  // roomId와 resveDate가 변경될 때마다 예약 정보 조회
  useEffect(() => {
    if (roomId && resveDate) {
      fetchAllReservations(roomId, resveDate);
    }
  }, [roomId, resveDate]);

  // 수정모드일 때 즉시 설정 가능한 값들을 설정
  useEffect(() => {
    if (isEdit && initialData) {
      // 수면실 설정 (roomId)
      if (initialData.roomId) {
        setRoomId(String(initialData.roomId));
      }
      
      // 날짜 설정
      if (initialData.reserveDt) {
        setResveDate(initialData.reserveDt);
      }
      
      // 예약 시간 설정
      if (initialData.reserveTime) {
        setResveStartTime(initialData.reserveTime);
      }
      
      // 종료시간 설정 (수정모드에서만)
      if (initialData.resveEndTime) {
        setResveEndTime(initialData.resveEndTime);
      }
    }
  }, [isEdit, initialData]);

  // 수정모드에서 meetingList가 로드된 후 roomDetailId 설정
  useEffect(() => {
    if (isEdit && initialData?.roomNumberId && meetingList?.infoList) {
      // console.log("수정모드에서 호실 설정:", initialData.roomNumberId);
      const roomInfo = meetingList.infoList.find(room => room.roomNumId === initialData.roomNumberId);
      if (roomInfo) {
        setRoomDetailId(String(roomInfo.id));
        if (roomInfo.roomInfoId) {
          setRoomId(String(roomInfo.roomInfoId));
        }
      }
    }
  }, [isEdit, initialData, meetingList]);

  // 수정모드에서 companyList가 로드된 후 companyId 설정
  useEffect(() => {
    if (isEdit && initialData?.companyName && companyList?.length > 0) {
      // console.log("수정모드에서 입주사 설정:", initialData.companyName);
      const company = companyList.find(comp => comp.name === initialData.companyName);
      if (company) {
        setCompanyId(String(company.companyId));
      }
    }
  }, [isEdit, initialData, companyList]);

  // 수정모드에서 userList가 로드된 후 realUser 설정
  useEffect(() => {
    if (isEdit && initialData?.userName && userList?.length > 0) {
      console.log("수정모드에서 사용자 설정:", initialData);
      const user = userList.find(u => u.userName === initialData.userName);
      if (user) {
        setRealUser(String(user.userId));
      }
    }
  }, [isEdit, initialData, userList]);

  // roomDetailId가 변경될 때 해당 호실이 속한 수면실(roomId) 설정 (신규 등록 시에만)
  useEffect(() => {
    if (!isEdit && roomDetailId && meetingList?.infoList) {
      const roomInfo = meetingList.infoList.find(room => room.id === Number(roomDetailId));
      if (roomInfo && roomInfo.roomInfoId) {
        setRoomId(String(roomInfo.roomInfoId));
      }
    }
  }, [roomDetailId, meetingList, isEdit]);

  // 성별에 따른 사용자 필터링
  const getFilteredUserList = () => {
    if (!userList?.length) {
      return [];
    }
    
    // 모든 사용자를 반환하되, 성별 불일치 정보를 포함
    return userList.map(user => ({
      ...user,
      isDisabled: meetingList?.gender && user.gender !== meetingList.gender
    }));
  };

  // realUser가 현재 선택된 Relax Room의 성별과 맞지 않으면 초기화
  useEffect(() => {
    if (realUser && userList?.length > 0 && meetingList?.gender) {
      const selectedUser = userList.find(u => u.userId === Number(realUser));
      if (selectedUser && selectedUser.gender !== meetingList.gender) {
        setRealUser(""); // 성별이 맞지 않으면 초기화
      }
    }
  }, [realUser, userList, meetingList]);

  // 좌석이 변경되었을 때 선택된 시간이 해당 좌석에 예약되어 있으면 시간 초기화
  useEffect(() => {
    if (roomDetailId && resveStartTime && allReservations?.length > 0) {
      const selectedRoom = meetingList?.infoList?.find(room => room.id === Number(roomDetailId));
      if (selectedRoom && isTimeReserved(resveStartTime)) {
        // 수정모드가 아닐 때만 초기화
        if (!isEdit) {
          setResveStartTime("09:00:00"); // 기본 시간으로 초기화
        }
      }
    }
  }, [roomDetailId, allReservations, meetingList]);

  // 시간이 변경되었을 때 선택된 좌석이 해당 시간에 예약되어 있으면 좌석 초기화
  useEffect(() => {
    if (roomDetailId && resveStartTime && allReservations?.length > 0) {
      const selectedRoom = meetingList?.infoList?.find(room => room.id === Number(roomDetailId));
      if (selectedRoom && isRoomReserved(selectedRoom.roomNumId, resveStartTime)) {
        // 수정모드가 아닐 때만 초기화
        if (!isEdit) {
          setRoomDetailId(""); // 좌석 선택 초기화
        }
      }
    }
  }, [resveStartTime, allReservations, meetingList]);

  const handleSubmit = async () => {
    const payload = {
      roomInfoId: Number(roomDetailId),
      userId: Number(realUser),
      reserveDt: resveDate,
      reserveTime: resveStartTime,
      ...(isEdit && { id: initialData.id }),
    };

    console.log(payload);

    try {
      const res = await api.post(
        isEdit ? "/api/v1/sleep/reserve/update" : "/api/v1/sleep/reserve/insert",
        payload
      );
      if (res.data?.success) {
        alert(extractSuccessMessage(res, isEdit ? "수정 완료" : "등록 완료"));
        onSubmit?.(payload);
        closeModal?.();
      } else {
        alert(extractErrorMessage(res, "처리 실패"));
      }
    } catch (err) {
      console.error("예약 처리 실패:", err);

      if(err?.response?.data?.message === "400 BAD_REQUEST \"성별에 일치하는 수면실을 선택해주세요.\"") {
        alert("성별에 일치하는 수면실을 선택해주세요.");
      } else if(err?.response?.data?.message === "400 BAD_REQUEST \"예약 시간이 존재하지 않습니다.\"") {
        alert("예약 시간이 존재하지 않습니다.");
      } else if(err?.response?.data?.message === "400 BAD_REQUEST \"Relax Room은 1일 1회만 예약 가능합니다.\"") {  
        alert("Relax Room은 1일 1회만 예약 가능합니다.");
      } else if(err?.response?.data?.message === "400 BAD_REQUEST \"해당 수면실은 이미 예약된 수면실 입니다.\"") {
        alert("해당 수면실은 이미 예약된 수면실 입니다.");
      } else {
        alert(extractErrorMessage(err, "예약이 실패되었습니다. 다시시도 해주세요."));
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말로 삭제하시겠습니까?")) {
      return;
    }

    try {
      const res = await api.get(`/api/v1/sleep/reserve/delete?id=${initialData.id}`);
      if (res.data?.success) {
        alert(extractSuccessMessage(res, "삭제 완료"));
        onSubmit?.();
        closeModal?.();
      } else {
        alert(extractErrorMessage(res, "삭제 실패"));
      }
    } catch (err) {
      console.error("삭제 실패:", err);
      alert(extractErrorMessage(err, "삭제가 실패되었습니다. 다시시도 해주세요."));
    }
  };

  // 필수 입력 항목들이 모두 입력되었는지 확인
  const isFormValid = 
    roomId &&
    roomDetailId &&
    resveDate &&
    resveStartTime &&
    companyId &&
    realUser;

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
          Relax Room 좌석 선택 <span className="text-red-500">*</span>
        </label>
        <select
          value={roomDetailId}
          onChange={(e) => setRoomDetailId(e.target.value)}
          className="w-full rounded border px-2 py-1"
        >
          <option value="">좌석을 선택해 주세요</option>
          {meetingList?.infoList
            ?.slice(0, meetingList.gender === "M" ? 8 : meetingList.gender === "W" ? 7 : 7)
            .map((room) => {
              if (room?.useYn !== "Y") return null;
              
              const isReserved = resveStartTime && isRoomReserved(room.roomNumId, resveStartTime);
              
              return (
                <option 
                  key={room.id} 
                  value={room.id}
                  disabled={isReserved}
                  className={isReserved ? "text-gray-400" : ""}
                >
                  {room.roomNumId}호{isReserved ? " (예약됨)" : ""}
                </option>
              );
            })}
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
            onChange={(e) => {
              const val = e.target.value;
              if (isWeekend(val) || isHoliday(val)) {
                // alert("주말 및 공휴일은 선택할 수 없습니다.");
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
            {getStartOptions.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
                className={option.disabled ? "text-gray-400" : ""}
              >
                {option.label}
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
          <option value={''}>입주사를 선택하세요</option>
          {companyList?.map((c) => (
            <option key={c.companyId} value={c.companyId}>
              {c.name}
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
          {getFilteredUserList().map((user) => (
              <option 
                key={user.userId} 
                value={user.userId}
                disabled={user.isDisabled}
                className={user.isDisabled ? "text-gray-400" : ""}
              >
                {user.userName} ({user.gender === 'M' ? '남자' : user.gender === 'W' ? '여자' : '여자'})
                {user.isDisabled && " (성별 불일치)"}
              </option>
            ))}
        </select>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`cursor-pointer rounded px-4 py-2 text-white ${
            isFormValid
              ? "bg-black hover:bg-gray-800"
              : "cursor-not-allowed bg-gray-400"
          }`}
        >
          {isEdit ? "수정" : "저장"}
        </button>
        {isEdit && (
          <button
            onClick={handleDelete}
            className="cursor-pointer rounded border px-4 py-2"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
