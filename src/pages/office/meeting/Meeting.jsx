import React, { useState, useContext } from "react";
import CommonCalendar from "@/components/common/Calendar"; // 공통 캘린더 컴포넌트
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import { ModalContext } from "@/context/ModalContext";
import ReservationForm from "@/components/modal/ReservationForm";


export default function Meeting({
  scheduleListByRoom = {},
  onConfirm,
  closeModal,
}) {
  const defaultRooms = ["A", "B", "C"];
  const roomOptions = Object.keys(scheduleListByRoom).length
    ? Object.keys(scheduleListByRoom)
    : defaultRooms;

  const [selectedRoom, setSelectedRoom] = useState(roomOptions[0]);
  const scheduleList = scheduleListByRoom[selectedRoom] || [];
  const { showModal } = useContext(ModalContext);

  const handleDateClick = ({ start }) => {
    onConfirm?.({
      type: "date",
      date: start,
      room: selectedRoom,
    });
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
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="w-40"
        >
          {roomOptions.map((room) => (
            <option key={room} value={room}>
              회의실 {room}
            </option>
          ))}
        </Select>
        <Button
          onClick={() => {
            showModal({
              title: "회의실 에약하기",
              size: "lg",
              confirmButton: "저장",
              customButton: true,
              showCancel: true,
              children: ({ closeModal }) => (
                <ReservationForm
                  room={selectedRoom}
                  onSubmit={(newEvent) => {
                    onConfirm?.(newEvent); // 외부 처리기 전달
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
