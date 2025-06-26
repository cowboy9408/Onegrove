import React, { useState, useContext, useEffect } from "react";
import CommonCalendar from "@/components/common/Calendar";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import { ModalContext } from "@/context/ModalContext";
import ReservationForm from "@/components/modal/ReservationForm";
import api from "@/lib/apiClient";

export default function Meeting({ scheduleListByRoom = {}, onConfirm, closeModal }) {
  const [selectedRoom, setSelectedRoom] = useState(1);
  const { showModal } = useContext(ModalContext);
  const [officeOptions, setOfficeOptions] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);

  useEffect(() => {
    const fetchOfficeList = async () => {
      try {
        const res = await api.get(`/api/v1/meeting?roomId=${selectedRoom}&isVip=N&lang=ko`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          const mappedEvents = res.data.data.map((item) => ({
            id: item.id,
            title: `${item.paymentType}예약 ${item.resveStartTime} ~ ${item.resveEndTime} ${item.reserver} (${item.companyName})`,
            start: new Date(`${item.resveDate}T${item.resveStartTime}`),
            end: new Date(`${item.resveDate}T${item.resveEndTime}`),
            resource: item,
          }));
          setScheduleList(mappedEvents);
        }
      } catch (err) {
        console.error("회의실예약 리스트 호출 실패:", err);
      }
    };
    fetchOfficeList();
  }, [selectedRoom]);

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const res = await api.get(`/api/v1/meeting/setting`);
        if (res.data.success && res.data.data) {
          setOfficeOptions(res.data.data);
        }
      } catch (err) {
        console.error("상세 정보 조회 실패:", err);
      }
    };
    fetchSetting();
  }, []);

  const handleDateClick = ({ start }) => {
    onConfirm?.({ type: "date", date: start, room: selectedRoom });
    closeModal?.();
  };

  const handleEventClick = (event) => {
    onConfirm?.({ ...event, room: selectedRoom });
    closeModal?.();
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-4">
        <Select
          label="회의실 선택"
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(Number(e.target.value))}
          className="w-40"
        >
          {officeOptions.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} {room.location}
            </option>
          ))}
        </Select>
        <Button
          onClick={() => {
            showModal({
              title: "회의실 예약하기",
              size: "lg",
              confirmButton: "저장",
              customButton: true,
              showCancel: true,
              children: ({ closeModal }) => (
                <ReservationForm
                  room={selectedRoom}
                  onSubmit={(newEvent) => {
                    onConfirm?.(newEvent);
                    closeModal();
                  }}
                />
              ),
            });
          }}
        >
          예약하기
        </Button>
      </div>

      <div className="overflow-hidden bg-white p-4 rounded-xl shadow-md space-y-4">
        <CommonCalendar
          events={scheduleList}
          onSelectSlot={handleDateClick}
          onSelectEvent={handleEventClick}
        />
      </div>
    </div>
  );
}