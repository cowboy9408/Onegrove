import React, { useState, useContext, useEffect } from "react";
import CommonCalendar from "@/components/common/Calendar";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import { ModalContext } from "@/context/ModalContext";
import ReservationForm from "@/components/modal/ReservationForm";
import api from "@/lib/apiClient";
import dayjs from "dayjs";

export default function Meeting() {
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const { showModal } = useContext(ModalContext);
  const [meetingOptions, setMeetingOptions] = useState({});
  const [locationOptions, setLocationOptions] = useState([]);
  const [officeOptions, setOfficeOptions] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);

  const fetchSchedules = async () => {
    try {
      const res = await api.get(`/api/v1/meeting?roomId=${selectedRoom}&isVip=N&lang=ko`);
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

  const selectedData = officeOptions.find(i => i.id === selectedRoom) || null;


  useEffect(() => {
    if(selectedRoom) {
      console.log(selectedRoom);
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
        const settingRes = await api.get(`/api/v1/meeting/location-list`);
        if (settingRes.data.success) setOfficeOptions(settingRes.data.data);
      } catch (err) {
        console.error("오피스 정보 조회 실패:", err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const settingRes = await api.get(`/api/v1/meeting/room-list?isVip=N&location=${selectedOffice}`);
        if (settingRes.data.success) {
          setLocationOptions(settingRes.data.data);
          if (settingRes.data.data.length > 0) {
            setSelectedRoom(settingRes.data.data[0].id);
          }
        }

        const categoryRes = await api.get(`/api/v1/meeting/office-list?lang=ko`);
        if (categoryRes.data.success) setMeetingOptions(categoryRes.data.data);
      } catch (err) {
        console.error("메타 정보 조회 실패:", err);
      }
    };
    if(selectedOffice) fetchOffice();
  }, [selectedOffice]);



  

  const handleEventClick = async (event) => {
    try {
      const res = await api.get(`/api/v1/meeting/${event.id}`);
      if (!res.data.success) return;
      const detail = res.data.data;

      showModal({
        title: "Meeting Room 상세",
        size: "lg",
        customButton: true,
        showCancel: true,
        children: ({ closeModal }) => (
          <div className="space-y-5 text-sm text-gray-700">
            <table className="w-full border text-left">
              <tbody>
                <tr><th className="p-2 border">회의실</th><td className="p-2 border">{detail.roomName} ({detail.location})</td></tr>
                <tr><th className="p-2 border">예약 종류</th><td className="p-2 border">{detail.paymentType}</td></tr>
                <tr><th className="p-2 border">일정</th><td className="p-2 border">{detail.resveDate} {detail.resveStartTime} ~ {detail.resveEndTime}</td></tr>
                <tr><th className="p-2 border">상태</th><td className="p-2 border">{detail.status}</td></tr>
                <tr><th className="p-2 border">내용</th><td className="p-2 border">{detail.content}</td></tr>
                <tr><th className="p-2 border">사용자</th><td className="p-2 border">{detail.realUser}</td></tr>
                <tr><th className="p-2 border">참석인원</th><td className="p-2 border">{detail.numberVisitors}</td></tr>
                <tr><th className="p-2 border">입주사</th><td className="p-2 border">{detail.companyName}</td></tr>
                <tr><th className="p-2 border">예약자</th><td className="p-2 border">{detail.reserver}</td></tr>
                <tr><th className="p-2 border">전화번호</th><td className="p-2 border">{detail.reserverTel}</td></tr>
                <tr><th className="p-2 border">이메일</th><td className="p-2 border">{detail.reserverEmail}</td></tr>
                <tr><th className="p-2 border">비고</th><td className="p-2 border">{detail.note}</td></tr>
              </tbody>
            </table>

            <div className="flex justify-between gap-3">
              <div className="flex gap-3">
                {detail.status === '가예약' && (
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
                        }
                      }
                    }}
                  >예약 확정</Button>
                )}
                
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
                      }
                    }
                  }}
                >예약 취소</Button>
              </div>
              <div>
                <Button
                  onClick={() => {
                    // console.log(
                    //   detail,
                    //   selectedRoom
                    // )
                    closeModal();
                    showModal({
                      title: "Meeting Room 수정",
                      size: "lg",
                      customButton: true,
                      showCancel: true,
                      children: ({ closeModal }) => (
                        <ReservationForm
                          locationOptions={officeOptions}
                          roomOptions={locationOptions}
                          selectedLocation={selectedOffice}
                          selectedRoom={selectedRoom}
                          setSelectedLocation={setSelectedOffice}
                          setSelectedRoom={setSelectedRoom}
                          selectData={selectedData}
                          meetingOptions={meetingOptions}
                          existingReservations={scheduleList}
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
            value={selectedOffice}
            onChange={(e) => {
              setSelectedOffice(e.target.value);
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
            showModal({
              title: "회의실 예약",
              size: "lg",
              customButton: true,
              showCancel: true,
              children: ({ closeModal }) => (
                <ReservationForm
                  locationOptions={officeOptions}
                  roomOptions={locationOptions}
                  selectedLocation={selectedOffice}
                  selectedRoom={selectedRoom}
                  setSelectedLocation={setSelectedOffice}
                  setSelectedRoom={setSelectedRoom}
                  selectData={selectedData}
                  meetingOptions={meetingOptions}
                  existingReservations={scheduleList}
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
                  locationOptions={officeOptions}
                  roomOptions={locationOptions}
                  selectedLocation={selectedOffice}
                  selectedRoom={selectedRoom}
                  setSelectedLocation={setSelectedOffice}
                  setSelectedRoom={setSelectedRoom}
                  selectData={selectedData}
                  meetingOptions={meetingOptions}
                  existingReservations={scheduleList}
                  initialData={{ resveDate }}
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
