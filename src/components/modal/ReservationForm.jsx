import React, { useState, useEffect, useMemo } from "react";
import api from "@/lib/apiClient";
import { isWeekend, isHoliday, extractErrorMessage, extractSuccessMessage } from "@/lib/utils";

export default function ReservationForm({
  locationOptions = [],
  roomOptions = [],
  selectedLocation: propSelectedLocation,
  selectedRoom: propSelectedRoom,
  setSelectedLocation: propSetSelectedLocation,
  setSelectedRoom: propSetSelectedRoom,
  setRoomOptions: propSetRoomOptions, // 룸 옵션 업데이트를 위한 새로운 prop
  settingOptions = [], // capacity 정보를 위한 prop
  meetingOptions,
  existingReservations = [],
  initialData = {},
  isEdit = false,
  isVip = "N", // VIP 룸 여부 (기본값: N)
  onSubmit,
  closeModal,
}) {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return propSelectedLocation || (locationOptions[0]?.code ?? "");
  });
  
  const [roomId, setRoomId] = useState(() => {
    return initialData.roomId || propSelectedRoom || (roomOptions[0]?.id ?? "");
  });

  const [companyId, setCompanyId] = useState(isEdit ? initialData.companyId || "" : "");
  const [numberVisitors, setNumberVisitors] = useState(isEdit ? initialData.numberVisitors || "" : "");
  const [paymentType, setPaymentType] = useState(isEdit ? (initialData.paymentType === "유료 예약") ? "paid" : "free" : "free");
  const [resveDate, setResveDate] = useState(initialData.resveDate || "");
  const [resveStartTime, setResveStartTime] = useState(initialData.resveStartTime && initialData.resveStartTime + ":00" || "09:00:00");
  const [resveEndTime, setResveEndTime] = useState("");
  const [content, setContent] = useState(initialData.content || "");
  const [realUser, setRealUser] = useState(initialData.realUser || "");
  const [phone, setPhone] = useState(initialData.realUserTel || "");
  const [email, setEmail] = useState(initialData.realUserEmail || "");
  const [note, setNote] = useState(initialData.note || "");
  const [status] = useState(initialData.status || "gs0101");
  const [remainingTime, setRemainingTime] = useState(null);// 현재 선택된 회의실의 최대 수용인원 구하기
  const [maxCapacity, setMaxCapacity] = useState(isVip === "Y" ? 4 : 64);
  const [displayCapacity, setDisplayCapacity] = useState(isVip === "Y" ? 4 : 64);

  // 예약 데이터 및 로딩 상태
  const [currentReservations, setCurrentReservations] = useState(existingReservations);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    if (isComposing) {
      // 조합 중에는 그대로 입력
      setRealUser(value);
    } else {
      // 조합이 끝난 후에만 필터 적용
      setRealUser(value.replace(/[^가-힣a-zA-Z0-9\s]/g, ""));
    }
  };

  const handleChangeEmail = (e) => {
    const value = e.target.value;
    if (isComposing) {
      // 조합 중에는 그대로 입력
      setEmail(value);
    } else {
      // 조합이 끝난 후에만 필터 적용
      setEmail(value.replace(/[^가-힣a-zA-Z0-9@._-]/g, ""));
    }
  };

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

  // 특정 룸의 예약 데이터를 API로 직접 가져오는 함수
  const fetchReservationsForRoom = async (roomIdToFetch) => {
    if (!roomIdToFetch) return;
    
    try {
      setIsLoadingReservations(true);
      const apiUrl = `/api/v1/meeting?roomId=${roomIdToFetch}&isVip=${isVip}&lang=ko`;
      
      const res = await api.get(apiUrl);
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map((item) => ({
          id: item.id,
          title: `${item.paymentType}예약 ${item.resveStartTime} ~ ${item.resveEndTime} ${item.reserver} (${item.companyName})`,
          start: new Date(`${item.resveDate}T${item.resveStartTime}`),
          end: new Date(`${item.resveDate}T${item.resveEndTime}`),
          resource: item,
        }));
        
        setCurrentReservations(mapped);
      }
    } catch (err) {
      console.error("예약 데이터 조회 실패:", err);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  // 오피스 변경에 따른 룸 옵션 업데이트 및 API 호출
  const fetchRoomOptionsAndReservations = async (officeCode) => {
    try {
      setIsLoadingReservations(true);
      
      // 1. 해당 오피스의 룸 목록 가져오기
      const roomRes = await api.get(`/api/v1/meeting/room-list?isVip=${isVip}&location=${officeCode}`);
      if (roomRes.data?.success && roomRes.data.data.length > 0) {
        const newRooms = roomRes.data.data;
        const firstRoomId = newRooms[0].id;
        
        // 2. 부모 컴포넌트의 roomOptions 업데이트 (capacity 정보와 함께)
        if (propSetRoomOptions) {
          // capacity 정보를 포함하여 roomOptions 매핑
          const mappedRooms = newRooms.map(room => {
            const settingRoom = settingOptions.find(setting => setting.id === room.id);
            return {
              ...room,
              capacity: settingRoom?.capacity || (isVip === "Y" ? 4 : 64), // VIP룸 기본값 4, 일반룸 기본값 64
            };
          });
          propSetRoomOptions(mappedRooms);
        }
        
        // 3. 룸 ID 업데이트
        setRoomId(firstRoomId);
        
        // 4. 부모에게도 알림
        if (propSetSelectedRoom) {
          propSetSelectedRoom(firstRoomId);
        }
        
        // 5. 새 룸의 예약 데이터 가져오기
        await fetchReservationsForRoom(firstRoomId);
        
        // 6. 오피스 변경 시 현재 선택된 시간이 유효하지 않으면 초기화
        setTimeout(() => {
          if (resveStartTime && resveDate) {
            const isCurrentTimeValid = isTimeAvailable(resveStartTime);
            if (!isCurrentTimeValid) {
              // 사용 가능한 첫 번째 시간 찾기
              const availableTime = generateTimeOptions(9, 17).find(time => isTimeAvailable(time));
              if (availableTime) {
                setResveStartTime(availableTime);
              } else {
                // 사용 가능한 시간이 없으면 초기화
                setResveStartTime("09:00:00");
                setResveEndTime("");
              }
            }
          }
        }, 200); // 예약 데이터 로딩 완료 후 시간 검증
      }
    } catch (err) {
      console.error("오피스 변경 처리 실패:", err);
      setIsLoadingReservations(false);
    }
  };

  // 초기 설정
  useEffect(() => {
    if (roomOptions.length > 0 && !roomId) {
      const firstRoomId = roomOptions[0].id;
      setRoomId(firstRoomId);
    }
  }, [roomOptions]);

  // roomId 또는 resveDate 변경 시 예약 데이터 새로고침
  useEffect(() => {
    if (roomId && resveDate) {
      fetchReservationsForRoom(roomId);
    }
  }, [roomId, resveDate, isVip]);

  // 초기 데이터 설정
  useEffect(() => {
    setCurrentReservations(existingReservations);
  }, [existingReservations]);

  // 예약 데이터 변경 시 현재 선택된 시간 유효성 검증
  useEffect(() => {
    if (!isLoadingReservations && resveStartTime && resveDate && roomId) {
      const timeoutId = setTimeout(() => {
        const isCurrentTimeValid = isTimeAvailable(resveStartTime);
        if (!isCurrentTimeValid) {
          // 사용 가능한 첫 번째 시간 찾기
          const availableTime = generateTimeOptions(9, 17).find(time => isTimeAvailable(time));
          if (availableTime) {
            setResveStartTime(availableTime);
          } else {
            // 사용 가능한 시간이 없으면 기본값으로 설정하되 종료시간은 초기화
            setResveStartTime("09:00:00");
            setResveEndTime("");
          }
        }
      }, 100); // 상태 업데이트 완료 후 검증
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentReservations, isLoadingReservations, resveDate, roomId]);

  // 초기 데이터 설정
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
    if (initialData.reserverTel) setPhone(initialData.realUserTel);
    if (initialData.reserverEmail) setEmail(initialData.realUserEmail);
    if (initialData.numberVisitors) setNumberVisitors(initialData.numberVisitors);
    if (initialData.companyId) setCompanyId(initialData.companyId);
    if (initialData.note) setNote(initialData.note);
  }, [initialData]);

  // resveStartTime 변경 시 resveEndTime 자동 업데이트
  useEffect(() => {
    if (resveStartTime && resveDate) {
      // 사용 가능한 종료 시간 옵션을 가져와서 첫 번째 값으로 설정
      const timeoutId = setTimeout(() => {
        try {
          const reserved = getReservedTimes;
          const proposedStartTime = new Date(`${resveDate}T${resveStartTime}`);
          
          if (!isNaN(proposedStartTime.getTime())) {
            // 가능한 종료 시간 중 첫 번째 옵션 찾기
            let foundValidEndTime = false;
            
            for (let hour = proposedStartTime.getHours() + 1; hour <= 18; hour++) {
              const endTimeStr = `${String(hour).padStart(2, "0")}:00:00`;
              const proposedEndTime = new Date(`${resveDate}T${endTimeStr}`);
              
              if (!isNaN(proposedEndTime.getTime())) {
                const overlaps = reserved.some(({ start, end }) => {
                  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    return false;
                  }
                  
                  // 제안된 예약과 기존 예약 사이에 1시간 버퍼가 있는지 확인
                  const hasOverlap = !(
                    // 제안된 예약이 기존 예약 시작 1시간 전에 끝남
                    proposedEndTime <= new Date(start.getTime() - 60 * 60 * 1000) ||
                    // 제안된 예약이 기존 예약 종료 1시간 후에 시작됨
                    proposedStartTime >= new Date(end.getTime() + 60 * 60 * 1000)
                  );

                  return hasOverlap;
                });

                // 시작시간이 사용 가능한지도 확인 (중요: 이 부분이 추가됨)
                const isStartTimeValid = isTimeAvailable(resveStartTime);
                
                if (!overlaps && isStartTimeValid) {
                  setResveEndTime(endTimeStr);
                  foundValidEndTime = true;
                  break;
                }
              }
            }
            
            // 유효한 종료시간을 찾지 못한 경우 기존 로직 사용
            if (!foundValidEndTime) {
              // 기본적으로 +1시간으로 설정하되, 시작시간이 유효한 경우에만
              const isStartTimeValid = isTimeAvailable(resveStartTime);
              if (isStartTimeValid) {
                const startHour = parseInt(resveStartTime.split(':')[0]);
                const endHour = startHour + 1;
                if (endHour <= 18) {
                  const newEndTime = `${String(endHour).padStart(2, "0")}:00:00`;
                  setResveEndTime(newEndTime);
                }
              } else {
                // 시작시간이 유효하지 않으면 종료시간도 초기화
                setResveEndTime("");
              }
            }
          }
        } catch (error) {
          console.error("자동 종료시간 설정 에러:", error);
          // 에러 발생 시에도 시작시간 유효성 확인 후 설정
          const isStartTimeValid = isTimeAvailable(resveStartTime);
          if (isStartTimeValid) {
            const startHour = parseInt(resveStartTime.split(':')[0]);
            const endHour = startHour + 1;
            if (endHour <= 18) {
              const newEndTime = `${String(endHour).padStart(2, "0")}:00:00`;
              setResveEndTime(newEndTime);
            }
          } else {
            setResveEndTime("");
          }
        }
      }, 100); // 약간의 지연을 주어 상태 업데이트 완료 후 실행

      return () => clearTimeout(timeoutId);
    }
  }, [resveStartTime, resveDate, roomId, currentReservations, isLoadingReservations]);

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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식 검사

  const handleSubmit = async () => {
    if (
      !resveDate ||
      !resveStartTime ||
      !resveEndTime ||
      !content ||
      !realUser ||
      !phone ||
      !email ||
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
      realUserTel: phone,
      realUserEmail: email,
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
        const successMessage = res.data?.message 
          ? extractSuccessMessage(res, isEdit ? "수정 완료" : "등록 완료")
          : isEdit ? "수정 완료" : "등록 완료";
        alert(successMessage);
        onSubmit?.(payload);
        closeModal?.();
      } else {
        const errorMessage = res.data?.message 
          ? extractErrorMessage(res, "처리 실패")
          : "처리 실패";
        alert(errorMessage);
      }
    } catch (err) {
      console.log("예약 처리 실패:", err.response?.data?.message );
      if(err.response?.data?.message === "400 BAD_REQUEST \"예약을 수정할 수 없습니다.\"") {
        alert("해당 날짜와 시간으로는 예약을 수정할 수 없습니다.");
        return;
      } else if(err.response?.data?.message === "400 BAD_REQUEST \"예약을 등록할 수 없습니다.\"") {
        alert("해당 날짜와 시간으로는 예약을 등록할 수 없습니다.");
        return;
      } else if(err.response?.data?.message === "400 BAD_REQUEST \"예약일 3일 전부터는 변경할 수 없습니다.\"") {
        alert("예약일 3일 전부터는 변경할 수 없습니다.");
        return;
      } else {
        alert(extractErrorMessage(err, "예약이 실패되었습니다. 다시시도 해주세요."));
      }
    }
  };

  const generateTimeOptions = (startHour, endHour) => {
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      return `${String(hour).padStart(2, "0")}:00:00`;
    });
  };

  const getReservedTimes = useMemo(() => {
    if (!resveDate || !roomId) {
      return [];
    }
    
    const filtered = currentReservations
      .filter((r) => {
        const dateMatch = r.resource.resveDate === resveDate;
        const roomMatch = r.resource.roomId === Number(roomId);
        const isCurrentEdit = isEdit && r.resource.id === initialData.id;
        const editExclude = !isCurrentEdit;
        
        return dateMatch && roomMatch && editExclude;
      })
      .map((r) => {
        try {
          const startDateTime = `${r.resource.resveDate}T${r.resource.resveStartTime}`;
          const endDateTime = `${r.resource.resveDate}T${r.resource.resveEndTime}`;
          
          const [startDate, startTime] = startDateTime.split('T');
          const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
          const startTimeParts = startTime.split(':').map(Number);
          const startHour = startTimeParts[0] || 0;
          const startMin = startTimeParts[1] || 0;
          const startSec = startTimeParts[2] || 0;
          
          const [endDate, endTime] = endDateTime.split('T');
          const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
          const endTimeParts = endTime.split(':').map(Number);
          const endHour = endTimeParts[0] || 0;
          const endMin = endTimeParts[1] || 0;
          const endSec = endTimeParts[2] || 0;
          
          const start = new Date(startYear, startMonth - 1, startDay, startHour, startMin, startSec);
          const end = new Date(endYear, endMonth - 1, endDay, endHour, endMin, endSec);
          
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return null;
          }
          
          return { start, end };
        } catch (error) {
          console.error("예약 시간 변환 에러:", error);
          return null;
        }
      })
      .filter(Boolean);
    
    return filtered;
  }, [resveDate, roomId, currentReservations, isEdit, initialData.id]);


  const isTimeAvailable = (timeStr) => {
    if (isLoadingReservations || !resveDate) return false;
    
    try {
      const timeDateTime = `${resveDate}T${timeStr}`;
      const [checkDate, checkTime] = timeDateTime.split('T');
      const [checkYear, checkMonth, checkDay] = checkDate.split('-').map(Number);
      const [checkHour, checkMin, checkSec] = checkTime.split(':').map(Number);
      
      const proposedStartTime = new Date(checkYear, checkMonth - 1, checkDay, checkHour, checkMin, checkSec);
      
      if (isNaN(proposedStartTime.getTime())) {
        return false;
      }
      
      // 제안된 예약 시간 (최소 1시간)
      const proposedEndTime = new Date(proposedStartTime);
      proposedEndTime.setHours(proposedEndTime.getHours() + 1);
      
      const reserved = getReservedTimes;

      const isAvailable = reserved.every(({ start, end }) => {
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return true;
        }
        
        // 제안된 예약과 기존 예약 사이에 1시간 버퍼가 있는지 확인
        const noOverlap = (
          // 제안된 예약이 기존 예약 시작 1시간 전에 끝남
          proposedEndTime <= new Date(start.getTime() - 60 * 60 * 1000) ||
          // 제안된 예약이 기존 예약 종료 1시간 후에 시작됨
          proposedStartTime >= new Date(end.getTime() + 60 * 60 * 1000)
        );

        return noOverlap;
      });

      return isAvailable;
    } catch (error) {
      console.error("시간 체크 에러:", error);
      return false;
    }
  };

  const getEndOptions = () => {
    if (!resveDate || !resveStartTime) return [];

    try {
      const reserved = getReservedTimes;
      const proposedStartTime = new Date(`${resveDate}T${resveStartTime}`);
      
      if (isNaN(proposedStartTime.getTime())) {
        return [];
      }

      const options = [];

      for (let hour = proposedStartTime.getHours() + 1; hour <= 18; hour++) {
        const endTimeStr = `${String(hour).padStart(2, "0")}:00:00`;
        const proposedEndTime = new Date(`${resveDate}T${endTimeStr}`);
        
        if (isNaN(proposedEndTime.getTime())) {
          continue;
        }



        const overlaps = reserved.some(({ start, end }) => {
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return false;
          }
          
          // 제안된 예약과 기존 예약 사이에 1시간 버퍼가 있는지 확인
          const hasOverlap = !(
            // 제안된 예약이 기존 예약 시작 1시간 전에 끝남
            proposedEndTime <= new Date(start.getTime() - 60 * 60 * 1000) ||
            // 제안된 예약이 기존 예약 종료 1시간 후에 시작됨
            proposedStartTime >= new Date(end.getTime() + 60 * 60 * 1000)
          );

          return hasOverlap;
        });

        if (overlaps) break;

        options.push({
          value: endTimeStr,
          disabled: false,
        });
      }

      return options;
    } catch (error) {
      console.error("종료시간 옵션 에러:", error);
      return [];
    }
  };

  
  
  // roomId 변경 시 maxCapacity 업데이트
  useEffect(() => {
    if (roomOptions.length > 0 && roomId) {
      const selectedRoomObj = roomOptions.find(r => String(r.id) === String(roomId));
      const newMaxCapacity = selectedRoomObj?.capacity || (isVip === "Y" ? 4 : 64);
      // console.log(roomOptions, propSetRoomOptions, roomId, selectedRoomObj);
      setMaxCapacity(newMaxCapacity);
      if (selectedRoomObj?.roomName === "Meeting Room 2") {
        setDisplayCapacity(14);
      } else {
        setDisplayCapacity(newMaxCapacity);
      }
    }
  }, [roomId, roomOptions, propSetRoomOptions]);

  // numberVisitors 변경 시 maxCapacity 체크
  useEffect(() => {
    if (numberVisitors && Number(numberVisitors) > maxCapacity) {
      setNumberVisitors("");
      alert(`선택한 회의실의 최대 수용 인원은 ${maxCapacity}명입니다.`);
    }
  }, [numberVisitors, maxCapacity]);

  const isFormValid =
    roomId &&
    companyId &&
    paymentType &&
    resveDate &&
    resveStartTime &&
    resveEndTime &&
    emailRegex.test(email) &&
    phone.length === 13 &&
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
          onChange={async (e) => {
            const newLocation = e.target.value;
            
            setSelectedLocation(newLocation);
            
            // 부모에게 변경사항 알림
            if (propSetSelectedLocation) {
              propSetSelectedLocation(newLocation);
            }
            
            // 새 오피스의 룸 목록과 예약 데이터를 직접 가져오기
            await fetchRoomOptionsAndReservations(newLocation);
          }}
          className="w-full rounded border px-2 py-1"
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
          value={roomId || ""}
          onChange={async (e) => {
            const newRoomId = e.target.value;
            
            setRoomId(newRoomId);
            if (propSetSelectedRoom) {
              propSetSelectedRoom(Number(newRoomId));
            }
            
            // 새 룸의 예약 데이터 가져오기
            if (newRoomId && resveDate) {
              await fetchReservationsForRoom(newRoomId);
              
              // 룸 변경 시 현재 선택된 시간이 유효하지 않으면 초기화
              setTimeout(() => {
                if (resveStartTime && resveDate) {
                  const isCurrentTimeValid = isTimeAvailable(resveStartTime);
                  if (!isCurrentTimeValid) {
                    // 사용 가능한 첫 번째 시간 찾기
                    const availableTime = generateTimeOptions(9, 17).find(time => isTimeAvailable(time));
                    if (availableTime) {
                      setResveStartTime(availableTime);
                    } else {
                      // 사용 가능한 시간이 없으면 초기화
                      setResveStartTime("09:00:00");
                      setResveEndTime("");
                    }
                  }
                }
              }, 200); // 예약 데이터 로딩 완료 후 시간 검증
            }
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
            onChange={async (e) => {
              const val = e.target.value;
              
              if (isWeekend(val) || isHoliday(val)) {
                alert("주말 및 공휴일은 선택할 수 없습니다.");
                return;
              }
              
              setResveDate(val);
              
              // 날짜 변경 시에도 예약 데이터 새로고침
              if (roomId && val) {
                await fetchReservationsForRoom(roomId);
                
                // 날짜 변경 시 현재 선택된 시간이 유효하지 않으면 초기화
                setTimeout(() => {
                  if (resveStartTime) {
                    const isCurrentTimeValid = isTimeAvailable(resveStartTime);
                    if (!isCurrentTimeValid) {
                      // 사용 가능한 첫 번째 시간 찾기
                      const availableTime = generateTimeOptions(9, 17).find(time => isTimeAvailable(time));
                      if (availableTime) {
                        setResveStartTime(availableTime);
                      } else {
                        // 사용 가능한 시간이 없으면 초기화
                        setResveStartTime("09:00:00");
                        setResveEndTime("");
                      }
                    }
                  }
                }, 200); // 예약 데이터 로딩 완료 후 시간 검증
              }
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
          <select
            value={resveEndTime}
            onChange={(e) => {
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
          참석인원 (최대 수용인원: {displayCapacity}명) <span className="text-red-500">*</span>
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
          onChange={handleChange}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={(e) => {
            setIsComposing(false);
            // 조합 끝난 값도 정제
            setRealUser(e.target.value.replace(/[^가-힣a-zA-Z0-9\s]/g, ""))
          }}
          className="w-full rounded border px-2 py-1"
        />
      </div>

      <div>
        <label className="mb-1 block">
          사용자 전화번호 <span className="text-red-500">*</span>
        </label>
        <input
          value={phone}
          maxLength={20}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded border px-2 py-1"
        />
      </div>

      <div>
        <label className="mb-1 block">
          사용자 이메일 <span className="text-red-500">*</span>
        </label>
        <input
          value={email}
          maxLength={50}
          onChange={handleChangeEmail}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={(e) => {
            setIsComposing(false);
            setEmail(e.target.value.replace(/[^가-힣a-zA-Z0-9@._-]/g, "").replace(/\s/g, ""));
          }}
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