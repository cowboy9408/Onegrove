import React, { useState, useContext, useEffect } from "react";
import CommonCalendar from "@/components/common/Calendar";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import { ModalContext } from "@/context/ModalContext";
import ReservationForm from "@/components/modal/ReservationForm";
import api from "@/lib/apiClient";
import dayjs from "dayjs";
import { useAuthStore } from "@/store/authStore";

export default function Viproom() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const { showModal } = useContext(ModalContext);
  const [meetingOptions, setMeetingOptions] = useState({});
  const [locationOptions, setLocationOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const { permission, companyId: userCompanyId } = useAuthStore();

  const fetchSchedules = async () => {
    try {
      let apiUrl = `/api/v1/meeting?roomId=${selectedRoom}&isVip=Y&lang=ko`;

      console.log(permission, userCompanyId);
      
      // OFFICE_SECRETARY_ADMIN 계정일 때 본인이 속한 입주사의 일정만 필터링
      if (permission === 'OFFICE_SECRETARY_ADMIN' && userCompanyId) {
        apiUrl += `&companyId=${userCompanyId}`;
      }
      
      const res = await api.get(apiUrl);
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map((item) => ({
          id: item.id,
          title: `${item.paymentType}예약 ${item.resveStartTime} ~ ${item.resveEndTime} ${item.reserver} (${item.companyName})`,
          start: new Date(`${item.resveDate}T${item.resveStartTime}`),
          end: new Date(`${item.resveDate}T${item.resveEndTime}`),
          resource: item,
        }));
        setScheduleList(mapped);
      }
    } catch (err) {
      console.error("회의실 예약 조회 실패:", err);
    }
  };

  const selectedData = roomOptions.find(i => i.id === selectedRoom) || null;

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get(`/api/v1/meeting/location-list`);
        if (res.data.success) setLocationOptions(res.data.data);
      } catch (err) {
        console.error("오피스 정보 조회 실패:", err);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (locationOptions.length > 0 && !selectedLocation) {
      setSelectedLocation(locationOptions[0].code);
    }
  }, [locationOptions]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get(`/api/v1/meeting/room-list?isVip=Y&location=${selectedLocation}`);
        if (res.data.success) {
          setRoomOptions(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedRoom(res.data.data[0].id);
          }
        }
        const categoryRes = await api.get(`/api/v1/meeting/office-list?lang=ko`);
        if (categoryRes.data.success) setMeetingOptions(categoryRes.data.data);
      } catch (err) {
        console.error("메타 정보 조회 실패:", err);
      }
    };
    if(selectedLocation) fetchRooms();
  }, [selectedLocation]);

  useEffect(() => {
    if(selectedRoom) {
      fetchSchedules();
    }
  }, [selectedRoom]);


  const mappedRoomOptions = roomOptions.map(room => ({
    ...room,
    capacity: 4,
  }));

  // 디버깅용 로그
  useEffect(() => {
    if (roomOptions.length > 0) {
      console.log("Viproom.jsx - 회의실 목록:", roomOptions.map(r => ({ name: r.roomName, capacity: 4 })));
    }
  }, [roomOptions]);

  const handleEventClick = async (event) => {
    try {
      const res = await api.get(`/api/v1/meeting/${event.id}`);
      if (!res.data.success) return;
      const detail = res.data.data;

      // 수정/삭제 가능 여부 확인
      const isModifiable = () => {
        const reservationDate = dayjs(detail.resveDate);
        const today = dayjs();
        
        if (detail.paymentType === '유료예약') {
          // 유료예약: 예약일이 오늘로부터 3일 이상 차이나는 경우에만 수정/삭제 가능
          return reservationDate.diff(today, 'day') >= 3;
        } else {
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
              </tbody>
            </table>

            <div className="flex justify-between gap-3">
              <div className="flex gap-3">
                {detail.status === '가예약' && permission !== 'OFFICE_SECRETARY_ADMIN' && (
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
                
                {isModifiable() && (
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
                {isModifiable() && (
                  <Button
                    onClick={() => {
                      closeModal();
                      showModal({
                        title: "Executive Room 수정",
                        size: "lg",
                        customButton: true,
                        showCancel: true,
                        children: ({ closeModal }) => (
                          <ReservationForm
                            locationOptions={locationOptions}
                            roomOptions={mappedRoomOptions}
                            selectedLocation={selectedLocation}
                            selectedRoom={selectedRoom}
                            setSelectedLocation={setSelectedLocation}
                            setSelectedRoom={setSelectedRoom}
                            selectData={selectedData}
                            meetingOptions={meetingOptions}
                            existingReservations={scheduleList}
                            initialData={detail}
                            isEdit={true}
                            isVip={true}
                            closeModal={closeModal}
                            onSubmit={() => {
                              fetchSchedules();
                              closeModal();
                            }}
                          />
                        ),
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
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Select
            label="오피스 선택"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
            }}
            className="w-[8em]"
          >
            {locationOptions.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.location}
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
            {roomOptions.map((room) => (
              <option key={room.id} value={room.id}>
                {room.roomName}
              </option>
            ))}
          </Select>
        </div>

        <Button
          onClick={() => {
            showModal({
              title: "회의실 예약",
              size: "lg",
              customButton: true,
              showCancel: true,
              children: ({ closeModal }) => (
                <ReservationForm
                  locationOptions={locationOptions}
                  roomOptions={mappedRoomOptions}
                  selectedLocation={selectedLocation}
                  selectedRoom={selectedRoom}
                  setSelectedLocation={setSelectedLocation}
                  setSelectedRoom={setSelectedRoom}
                  selectData={selectedData}
                  meetingOptions={meetingOptions}
                  existingReservations={scheduleList}
                  initialData={{ resveDate: dayjs().format("YYYY-MM-DD") }}
                  isVip={true}
                  closeModal={closeModal}
                  onSubmit={() => {
                    fetchSchedules();
                    closeModal();
                  }}
                />
              ),
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
              children: ({ closeModal }) => (
                <ReservationForm
                  locationOptions={locationOptions}
                  roomOptions={mappedRoomOptions}
                  selectedLocation={selectedLocation}
                  selectedRoom={selectedRoom}
                  setSelectedLocation={setSelectedLocation}
                  setSelectedRoom={setSelectedRoom}
                  selectData={selectedData}
                  meetingOptions={meetingOptions}
                  existingReservations={scheduleList}
                  initialData={{ resveDate }}
                  isVip={true}
                  closeModal={closeModal}
                  onSubmit={() => {
                    fetchSchedules();
                    closeModal();
                  }}
                />
              ),
            });
          }}
        />
      </div>
    </div>
  );
}
