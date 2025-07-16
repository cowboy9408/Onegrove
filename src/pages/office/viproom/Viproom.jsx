import React, { useState, useContext, useEffect, useMemo, useRef } from "react";
import CommonCalendar from "@/components/common/Calendar";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import { ModalContext } from "@/context/ModalContext";
import ReservationForm from "@/components/modal/ReservationForm";
import api from "@/lib/apiClient";
import dayjs from "dayjs";
import { useAuthStore } from "@/store/authStore";

export default function Meeting() {
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const { showModal } = useContext(ModalContext);
  
  // 모달 닫기를 위한 ref
  const currentModalCloseRef = useRef(null);
  
  // 현재 상태를 항상 최신으로 유지하는 ref
  const currentStateRef = useRef({ selectedOffice, selectedRoom });
  
  // 상태가 변경될 때마다 ref 업데이트
  useEffect(() => {
    currentStateRef.current = { selectedOffice, selectedRoom };
  }, [selectedOffice, selectedRoom]);
  
  const [meetingOptions, setMeetingOptions] = useState({});
  const [locationOptions, setLocationOptions] = useState([]);
  const [officeOptions, setOfficeOptions] = useState([]);
  const [settingOptions, setSettingOptions] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const [initialData] = useState({});
  const [resveDate, setResveDate] = useState("");
  const [resveStartTime, setResveStartTime] = useState("");
  const [content, setContent] = useState("");
  const [realUser, setRealUser] = useState("");
  const [numberVisitors, setNumberVisitors] = useState("");
  const [companyId, setCompanyId] = useState("");
  const { permission, id: userId } = useAuthStore();

  const fetchSchedules = async () => {
    try {
      let apiUrl = `/api/v1/meeting?roomId=${selectedRoom}&isVip=Y&lang=ko`;


      
      const res = await api.get(apiUrl);
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map((item) => {
          // OFFICE_SECRETARY_ADMIN 계정일 때 본인이 예약한 것만 상세 정보 표시
          const isOwnReservation = permission === 'OFFICE_SECRETARY_ADMIN' ? item.userId === userId : true;
          
          return {
            id: item.id,
            title: isOwnReservation 
              ? `${item.paymentType}예약 ${item.resveStartTime} ~ ${item.resveEndTime} ${item.reserver} (${item.companyName})`
              : `${item.resveStartTime} ~ ${item.resveEndTime} 예약됨`,
            start: new Date(`${item.resveDate}T${item.resveStartTime}`),
            end: new Date(`${item.resveDate}T${item.resveEndTime}`),
            resource: { ...item, isOwnReservation },
          };
        });
        setScheduleList(mapped);
      }
    } catch (err) {
      console.error("회의실 예약 조회 실패:", err);
    }
  };

  const selectedData = officeOptions.find(i => i.id === selectedRoom) || null;

  // API에서 가져온 settingOptions를 기반으로 capacity 매핑 (useMemo로 최적화)
  const mappedRoomOptions = useMemo(() => {
    if (locationOptions.length === 0) return [];
    
    const mapped = locationOptions.map(room => {
      // settingOptions에서 해당 룸의 capacity 찾기 (id로 매칭)
      const settingRoom = settingOptions.find(setting => 
        setting.id === room.id
      );
      
      return {
        ...room,
        capacity: settingRoom?.capacity || 4, // API에서 capacity 가져오거나 기본값 4
      };
    });
    
    return mapped;
  }, [locationOptions, settingOptions]);
  
  useEffect(() => {
    if(selectedRoom) {
      fetchSchedules();
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (officeOptions.length > 0 && !selectedOffice) {
      setSelectedOffice(officeOptions[0].code);
    }
  }, [officeOptions]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const locationRes = await api.get(`/api/v1/meeting/location-list`);
        if (locationRes.data.success) setOfficeOptions(locationRes.data.data);
        const settingRes = await api.get(`/api/v1/meeting/setting?isVip=Y`);
        if (settingRes.data.success) {
          setSettingOptions(settingRes.data.data);
        }
      } catch (err) {
        console.error("세팅 정보 조회 실패:", err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const settingRes = await api.get(`/api/v1/meeting/room-list?isVip=Y&location=${selectedOffice}`);
        if (settingRes.data.success) {
          setLocationOptions(settingRes.data.data);
          
          if (settingRes.data.data.length > 0) {
            const newRoomId = settingRes.data.data[0].id;
            setSelectedRoom(newRoomId);
          }
        }
      } catch (err) {
        console.error("메타 정보 조회 실패:", err);
      }
    };
    if(selectedOffice) fetchOffice();
  }, [selectedOffice]);

  useEffect(() => {
    const fetchMeetingOptions = async () => {
      try {
        const categoryRes = await api.get(`/api/v1/meeting/office-list?lang=ko`);
        if (categoryRes.data.success) setMeetingOptions(categoryRes.data.data);
      } catch (err) {
        console.error("입주사 정보 조회 실패:", err);
      }
    };
    fetchMeetingOptions();
  }, []);

  useEffect(() => {
    if (initialData.resveDate) setResveDate(initialData.resveDate);
    if (initialData.resveStartTime) setResveStartTime(initialData.resveStartTime + ":00");
    if (initialData.content) setContent(initialData.content);
    if (initialData.realUser) setRealUser(initialData.realUser);
    if (initialData.numberVisitors) setNumberVisitors(initialData.numberVisitors);
    if (initialData.companyId) setCompanyId(initialData.companyId);
  }, [initialData]);

  const handleEventClick = async (event) => {
    try {
      // OFFICE_SECRETARY_ADMIN 계정일 때 본인 예약이 아니면 클릭 불가능
      if (permission === 'OFFICE_SECRETARY_ADMIN' && !event.resource.isOwnReservation) {
        return;
      }

      // console.log('이벤트 클릭됨, ID:', event.id);
      const res = await api.get(`/api/v1/meeting/${event.id}`);
      // console.log('API 응답:', res);
      if (!res.data.success) return;
      const detail = res.data.data;
      // console.log('상세 데이터:', detail);

      // 수정/삭제 가능 여부 확인
      const isModifiable = () => {
        const reservationDate = dayjs(detail.resveDate);
        const today = dayjs();
        
        if (detail.paymentType === '유료예약' && permission === 'OFFICE_SECRETARY_ADMIN') {
          // 유료예약: 예약일이 당일이 아닌 경우에만 수정/삭제 가능 (하루 전부터 가능)
          return reservationDate.diff(today, 'day') >= 1;
        } else if ( permission === 'OFFICE_SECRETARY_ADMIN') {
          // 무료예약: 예약일이 당일인 경우에만 수정/삭제 가능
          return reservationDate.diff(today, 'day') === 0;
        }
      };

      showModal({
        title: "Executive Room 상세",
        size: "lg",
        customButton: true,
        showCancel: true,
        children: ({ closeModal }) => (
          <div className="space-y-5 text-sm text-gray-700">
            <table className="w-full border text-left">
              <tbody>
                <tr><th className="p-2 border min-w-[80px]">회의실</th><td className="p-2 border">{detail.roomName} ({detail.location})</td></tr>
                <tr><th className="p-2 border">예약 종류</th><td className="p-2 border">{detail.paymentType}</td></tr>
                <tr><th className="p-2 border">일정</th><td className="p-2 border">{detail.resveDate} {detail.resveStartTime} ~ {detail.resveEndTime}</td></tr>
                <tr><th className="p-2 border">상태</th><td className="p-2 border">{detail.status}</td></tr>
                <tr><th className="p-2 border">내용</th><td className="p-2 border break-all">{detail.content}</td></tr>
                <tr><th className="p-2 border">사용자</th><td className="p-2 border">{detail.realUser}</td></tr>
                <tr><th className="p-2 border">참석인원</th><td className="p-2 border">{detail.numberVisitors}</td></tr>
                <tr><th className="p-2 border">입주사</th><td className="p-2 border">{detail.companyName}</td></tr>
                <tr><th className="p-2 border">예약자</th><td className="p-2 border">{detail.reserver}</td></tr>
                <tr><th className="p-2 border">전화번호</th><td className="p-2 border">{detail.reserverTel}</td></tr>
                <tr><th className="p-2 border">이메일</th><td className="p-2 border">{detail.reserverEmail}</td></tr>
                <tr><th className="p-2 border">비고</th><td className="p-2 border break-all">{detail.note}</td></tr>
                <tr><th className="p-2 border">예약 등록 일시</th><td className="p-2 border break-all">{detail.createDatetime}</td></tr>
              </tbody>
            </table>

            <div className="flex justify-between gap-3">
              <div className="flex gap-3">
                {(detail.status === '가예약' && permission !== 'OFFICE_SECRETARY_ADMIN') && (
                  <Button
                    theme="danger"
                    onClick={async () => {
                      if (confirm("예약을 확정하겠습니까?")) {
                        try {
                          const res = await api.post("/api/v1/meeting/confirm", { id: detail.id });
                          if (res.data?.success) {
                            alert("예약 확정 완료");
                            fetchSchedules();
                            closeModal();
                          } else alert("예약 확정 실패");
                        } catch (err) {
                          console.error("예약 확정 오류:", err);
                          alert(err?.response?.data?.message || err?.data?.message || "예약 확정이 실패되었습니다. 다시시도 해주세요.");
                        }
                      }
                    }}
                  >예약 확정</Button>
                )}
                
                {!isModifiable() && (
                  <Button
                    theme="danger"
                    onClick={async () => {
                      if (confirm("예약을 취소하겠습니까?")) {
                        try {
                          const res = await api.post("/api/v1/meeting/cancel", { id: detail.id });
                          if (res.data?.success) {
                            alert("취소 완료");
                            fetchSchedules();
                            closeModal();
                          } else alert("취소 실패");
                        } catch (err) {
                          console.error("취소 오류:", err);
                          alert(err?.response?.data?.message || err?.data?.message || "예약 취소가 실패되었습니다. 다시시도 해주세요.");
                        }
                      }
                    }}
                  >예약 취소</Button>
                )}
              </div>
              <div>
                {!isModifiable() && (
                  <Button
                    onClick={() => {
                      // console.log(
                      //   detail,
                      //   selectedRoom
                      // )
                      closeModal();
                      showModal({
                        title: "Executive Room 수정",
                        size: "lg",
                        customButton: true,
                        showCancel: true,
                        children: ({ closeModal }) => {
                          // 모달 닫기 함수를 ref에 저장
                          currentModalCloseRef.current = closeModal;
                          
                          // 현재 상태값을 모달 생성 시점에 캡처
                          const currentOffice = selectedOffice;
                          const currentRoom = selectedRoom;
                          const modalKey = `edit-${detail.id}-${currentOffice}-${currentRoom}-${Date.now()}`;
                          
                          return (
                            <ReservationForm
                              key={modalKey}
                              locationOptions={officeOptions}
                              roomOptions={mappedRoomOptions}
                              selectedLocation={currentOffice}
                              selectedRoom={currentRoom}
                              setSelectedLocation={setSelectedOffice}
                              setSelectedRoom={setSelectedRoom}
                              setRoomOptions={setLocationOptions}
                              settingOptions={settingOptions}
                              selectData={selectedData}
                              meetingOptions={meetingOptions}
                              existingReservations={scheduleList}
                              initialData={detail}
                              isEdit={true}
                              isVip="Y"
                              closeModal={() => {
                                currentModalCloseRef.current = null;
                                closeModal();
                              }}
                              onSubmit={() => {
                                fetchSchedules();
                                currentModalCloseRef.current = null;
                                closeModal();
                              }}
                            />
                          );
                        },
                      });
                    }}
                  >수정</Button>
                )}
              </div>
            </div>
          </div>
        ),
      });
    } catch (err) {
      console.error("상세 조회 실패:", err);
      console.error("에러 응답:", err.response);
      alert("상세 정보를 불러올 수 없습니다.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Select
            label="오피스 선택"
            value={selectedOffice}
            onChange={(e) => {
              const newOffice = e.target.value;
              
              // 현재 열린 모달이 있다면 닫기
              if (currentModalCloseRef.current) {
                currentModalCloseRef.current();
                currentModalCloseRef.current = null;
                
                // 약간의 지연 후 오피스 변경 (모달이 완전히 닫힌 후)
                setTimeout(() => {
                  setSelectedOffice(newOffice);
                }, 100);
              } else {
                setSelectedOffice(newOffice);
              }
            }}
            className="w-[8em]"
          >
            {officeOptions.map((room) => (
              <option key={room.code} value={room.code}>
                {room.location}
              </option>
            ))}
          </Select>
          <Select
            label="회의실 선택"
            value={selectedRoom}
            onChange={(e) => {
              setSelectedRoom(Number(e.target.value));
            }}
            className="w-[16em]"
          >
            {locationOptions.map((room) => (
              <option key={room.id} value={room.id}>
                {room.roomName}
              </option>
            ))}
          </Select>
        </div>
        

        <Button
          onClick={() => {
            const modalKey = `${selectedOffice}-${selectedRoom}-${Date.now()}-new`;
            
            showModal({
              title: "회의실 예약",
              size: "lg",
              customButton: true,
              showCancel: true,
              children: ({ closeModal }) => {
                // 모달 닫기 함수를 ref에 저장
                currentModalCloseRef.current = closeModal;
                
                return (
                  <ReservationForm
                    key={modalKey}
                    locationOptions={officeOptions}
                    roomOptions={mappedRoomOptions}
                    selectedLocation={selectedOffice}
                    selectedRoom={selectedRoom}
                    setSelectedLocation={setSelectedOffice}
                    setSelectedRoom={setSelectedRoom}
                    setRoomOptions={setLocationOptions}
                    settingOptions={settingOptions}
                    selectData={selectedData}
                    meetingOptions={meetingOptions}
                    existingReservations={scheduleList}
                    initialData={{ resveDate, resveStartTime, content, realUser, numberVisitors, companyId }}
                    isVip="Y"
                    closeModal={() => {
                      currentModalCloseRef.current = null;
                      closeModal();
                    }}
                    onSubmit={() => {
                      fetchSchedules();
                      currentModalCloseRef.current = null;
                      closeModal();
                    }}
                  />
                );
              },
            });
          }}
        >예약하기</Button>
      </div>

      <div className="relative overflow-hidden bg-white p-4 rounded-xl shadow-md space-y-4">
        <div className="absolute top-6 right-6">
          <ul className="flex gap-2">
            <li className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded-2xl bg-[#4CAF50]"></span> 가예약</li>
            <li className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded-2xl bg-[#00AAFF]"></span> 예약 확정</li>
          </ul>
        </div>
        <CommonCalendar
          events={scheduleList}
          onSelectEvent={handleEventClick}
          onSelectSlot={(slotInfo) => {
            const resveDate = dayjs(slotInfo.start).format("YYYY-MM-DD");
            showModal({
              title: "회의실 예약",
              size: "lg",
              customButton: true,
              showCancel: true,
              children: ({ closeModal }) => {
                // 모달 닫기 함수를 ref에 저장
                currentModalCloseRef.current = closeModal;
                
                return (
                  <ReservationForm
                    key={`${selectedOffice}-${selectedRoom}-slot`}
                    locationOptions={officeOptions}
                    roomOptions={mappedRoomOptions}
                    selectedLocation={selectedOffice}
                    selectedRoom={selectedRoom}
                    setSelectedLocation={setSelectedOffice}
                    setSelectedRoom={setSelectedRoom}
                    setRoomOptions={setLocationOptions}
                    settingOptions={settingOptions}
                    selectData={selectedData}
                    meetingOptions={meetingOptions}
                    existingReservations={scheduleList}
                    initialData={{ resveDate }}
                    isVip="Y"
                    closeModal={() => {
                      currentModalCloseRef.current = null;
                      closeModal();
                    }}
                    onSubmit={() => {
                      fetchSchedules();
                      currentModalCloseRef.current = null;
                      closeModal();
                    }}
                  />
                );
              },
            });
          }}
        />
      </div>
    </div>
  );
}
