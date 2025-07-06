import React, { useState, useContext, useEffect } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import { ModalContext } from "@/context/ModalContext";
import SleepReservationForm from "@/components/modal/SleepReservationForm";
import api from "@/lib/apiClient";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export default function SleepReserve() {
  const { showModal } = useContext(ModalContext);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [officeOptions, setOfficeOptions] = useState([]);
  const [meetingOptions, setMeetingOptions] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [timeSlots, setTimeSlots] = useState([]);
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [reservationDetails, setReservationDetails] = useState({});
  const [reservationCounts, setReservationCounts] = useState({});

  const fetchMeta = async () => {
    const res = await api.get(`/api/v1/sleep/reserve/list/room`);
    if (res.data.success) setOfficeOptions(res.data.data);
  };

  const fetchRoomDetail = async (roomId) => {
    const res = await api.get(`/api/v1/sleep/room/detail/${roomId}`);
    if (res.data.success) setMeetingOptions(res.data.data);
  };

  const fetchReservations = async (roomId, time) => {
    const res = await api.get(`/api/v1/sleep/reserve/list/detail`, {
      params: {
        roomId,
        reserveDt: selectedDate,
        reserveTime: time,
      },
    });
    if (res.data.success) {
      setReservationDetails((prev) => ({
        ...prev,
        [time]: res.data.data,
      }));
    }
  };

  const fetchReservationCounts = async (roomId) => {
    const res = await api.get(`/api/v1/sleep/reserve/list/count`, {
      params: {
        roomId,
        reserveDt: selectedDate,
      },
    });
    if (res.data.success) {
      const countsMap = {};
      res.data.data.forEach((item) => {
        const key = item.reserveTime?.substring(0, 5); // "10:00:00" → "10:00"
        if (key) countsMap[key] = item.reserveCount;
      });
      setReservationCounts(countsMap);
    }
  };

  const generateTimeSlots = (start, end) => {
    const slots = [];
    let current = dayjs(`2020-01-01T${start}`);
    const endTime = dayjs(`2020-01-01T${end}`);
    while (current.add(60, "minute").isSameOrBefore(endTime)) {
      slots.push({
        start: current.format("HH:mm"),
        end: current.add(50, "minute").format("HH:mm"),
      });
      current = current.add(60, "minute");
    }
    return slots;
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    if (officeOptions.length > 0 && selectedRoom === null) {
      setSelectedRoom(officeOptions[0].id);
    }
  }, [officeOptions]);

  useEffect(() => {
    if (selectedRoom) {
      fetchRoomDetail(selectedRoom);
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (meetingOptions.startTime && meetingOptions.endTime) {
      const slots = generateTimeSlots(
        meetingOptions.startTime,
        meetingOptions.endTime
      );
      setTimeSlots(slots);
    }
  }, [meetingOptions, selectedDate]);

  useEffect(() => {
    if (selectedRoom && selectedDate && meetingOptions.startTime) {
      fetchReservationCounts(selectedRoom);
    }
  }, [selectedRoom, selectedDate, meetingOptions.startTime]);

  const handleSlotToggle = (time) => {
    if (expandedSlot === time) {
      setExpandedSlot(null);
    } else {
      setExpandedSlot(time);
      fetchReservations(selectedRoom, time);
    }
  };

  const handleDateChange = (direction) => {
    const today = dayjs();
    const sevenDaysAgo = today.subtract(7, "day");
    const sevenDaysLater = today.add(7, "day");
    const newDate =
      direction === "prev"
        ? dayjs(selectedDate).subtract(1, "day")
        : dayjs(selectedDate).add(1, "day");

    if (newDate.isSameOrAfter(sevenDaysAgo) && newDate.isSameOrBefore(sevenDaysLater)) {
      setSelectedDate(newDate.format("YYYY-MM-DD"));
    }
  };

  // 날짜 이동 버튼 활성화 상태 확인
  const canGoPrev = () => {
    const sevenDaysAgo = dayjs().subtract(7, "day");
    return dayjs(selectedDate).subtract(1, "day").isSameOrAfter(sevenDaysAgo);
  };

  const canGoNext = () => {
    const sevenDaysLater = dayjs().add(7, "day");
    return dayjs(selectedDate).add(1, "day").isSameOrBefore(sevenDaysLater);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Select
          label="Relax Room 선택"
          value={selectedRoom ?? ""}
          className="w-sm"
          onChange={(e) => setSelectedRoom(Number(e.target.value))}
        >
          {officeOptions.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} ({room.location})
            </option>
          ))}
        </Select>

        <Button
          onClick={() => {
            showModal({
              title: "수면실 예약",
              size: "lg",
              customButton: true,
              showCancel: true,
              children: ({ closeModal }) => (
                <SleepReservationForm
                  room={selectedRoom}
                  meetingOptions={meetingOptions}
                  roomList={officeOptions}
                  closeModal={closeModal}
                  onSubmit={() => {
                    fetchRoomDetail(selectedRoom);
                    fetchReservationCounts(selectedRoom);
                    // 현재 확장된 시간 슬롯이 있다면 해당 상세 정보도 다시 가져오기
                    if (expandedSlot) {
                      fetchReservations(selectedRoom, expandedSlot);
                    }
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

      <div className="mb-4 flex items-center justify-center gap-4 text-sm">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleDateChange("prev")}
          disabled={!canGoPrev()}
          className={!canGoPrev() ? "opacity-50 cursor-not-allowed" : ""}
        >
          &lt;
        </Button>
        <div className="text-[20px] font-bold">{selectedDate}</div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleDateChange("next")}
          disabled={!canGoNext()}
          className={!canGoNext() ? "opacity-50 cursor-not-allowed" : ""}
        >
          &gt;
        </Button>
      </div>

      <div className="mx-auto mt-6 w-[50%] space-y-3">
        {timeSlots.map((slot) => {
          const time = slot.start;
          const reserveList = reservationDetails[time] || [];
          const reserveCount = reservationCounts[time] || 0;
          const totalCount = Math.min(
            (meetingOptions.infoList || []).filter((info) => info.useYn === "Y").length,
            meetingOptions.gender === "M" ? 8 : 7
          );

          return (
            <div key={time} className="rounded border shadow-sm">
              <button
                onClick={() => handleSlotToggle(time)}
                className="flex w-full items-center justify-between bg-gray-50 px-4 py-2 text-sm font-medium hover:bg-gray-100"
              >
                <span>
                  <span className="mr-2 font-bold">
                    {slot.start} ~ {slot.end}
                  </span>{" "}
                  - 예약된 수: {reserveCount} / {totalCount}
                </span>
                <span>{expandedSlot === time ? "▲" : "▼"}</span>
              </button>

              {expandedSlot === time && (
                <div className="space-y-2 bg-gray-100 p-3">
                  {(meetingOptions.infoList || [])
                    .filter((info) => info.useYn === "Y")
                    .slice(0, meetingOptions.gender === "M" ? 8 : 7)
                    .map((info) => {
                      const reservation = reserveList.find(
                        (r) => r.roomNumberId === info.roomNumId
                      );
                      return (
                        <div 
                          key={info.id} 
                          className={`border-b pb-2 text-sm ${reservation ? 'cursor-pointer hover:bg-gray-200' : ''}`}
                          onClick={() => {
                            if (reservation) {
                              showModal({
                                title: "수면실 수정",
                                size: "lg",
                                customButton: true,
                                showCancel: true,
                                children: ({ closeModal }) => (
                                  <SleepReservationForm
                                    room={selectedRoom}
                                    meetingOptions={meetingOptions}
                                    roomList={officeOptions}
                                    initialData={reservation}
                                    isEdit={true}
                                    closeModal={closeModal}
                                    onSubmit={() => {
                                      fetchRoomDetail(selectedRoom);
                                      fetchReservationCounts(selectedRoom);
                                      // 현재 확장된 시간 슬롯이 있다면 해당 상세 정보도 다시 가져오기
                                      if (expandedSlot) {
                                        fetchReservations(selectedRoom, expandedSlot);
                                      }
                                      closeModal();
                                    }}
                                  />
                                ),
                              });
                            }
                          }}
                        >
                          <strong>
                            {meetingOptions.name} {info.roomNumId}호
                          </strong>{" "}
                          |{" "}
                          {reservation
                            ? `${reservation.userName} (${reservation.companyName})`
                            : "예약자 없음"}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
