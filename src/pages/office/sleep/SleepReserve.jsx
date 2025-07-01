import React, { useState, useContext, useEffect } from "react";
import CalendarToolbar from "@/components/common/CalendarToolbar";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import { ModalContext } from "@/context/ModalContext";
import SleepReservationForm from "@/components/modal/SleepReservationForm";
import api from "@/lib/apiClient";
import { ArrowDownIcon } from "@/components/ui/arrow-down";

export default function SleepReserve() {
  const [selectedRoom, setSelectedRoom] = useState(1);
  const { showModal } = useContext(ModalContext);
  const [meetingOptions, setMeetingOptions] = useState({});
  const [officeOptions, setOfficeOptions] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);

  const add50Min = (timeStr) => {
    const [hour, minute] = timeStr.split(":").map(Number);
    const date = new Date(0, 0, 0, hour, minute + 50);
    const newHour = date.getHours().toString().padStart(2, "0");
    const newMinute = date.getMinutes().toString().padStart(2, "0");
    return `${newHour}:${newMinute}`;
  };

  const fetchSchedules = async () => {
    try {
      const res = await api.get(
        `/api/v1/meeting?roomId=${selectedRoom}&isVip=N&lang=ko`
      );
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

  useEffect(() => {
    fetchSchedules();
  }, [selectedRoom]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const settingRes = await api.get(`/api/v1/meeting/setting`);
        if (settingRes.data.success) setOfficeOptions(settingRes.data.data);

        const categoryRes = await api.get(`/api/v1/visit/category`);
        if (categoryRes.data.success) setMeetingOptions(categoryRes.data.data);
      } catch (err) {
        console.error("메타 정보 조회 실패:", err);
      }
    };
    fetchMeta();
  }, []);

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
                <tr>
                  <th className="border p-2">회의실</th>
                  <td className="border p-2">
                    {detail.roomName} ({detail.location})
                  </td>
                </tr>
                <tr>
                  <th className="border p-2">예약 종류</th>
                  <td className="border p-2">{detail.paymentType}</td>
                </tr>
                <tr>
                  <th className="border p-2">일정</th>
                  <td className="border p-2">
                    {detail.resveDate} {detail.resveStartTime} ~{" "}
                    {detail.resveEndTime}
                  </td>
                </tr>
                <tr>
                  <th className="border p-2">상태</th>
                  <td className="border p-2">{detail.status}</td>
                </tr>
                <tr>
                  <th className="border p-2">내용</th>
                  <td className="border p-2">{detail.content}</td>
                </tr>
                <tr>
                  <th className="border p-2">사용자</th>
                  <td className="border p-2">{detail.realUser}</td>
                </tr>
                <tr>
                  <th className="border p-2">참석인원</th>
                  <td className="border p-2">{detail.numberVisitors}</td>
                </tr>
                <tr>
                  <th className="border p-2">입주사</th>
                  <td className="border p-2">{detail.companyName}</td>
                </tr>
                <tr>
                  <th className="border p-2">예약자</th>
                  <td className="border p-2">{detail.reserver}</td>
                </tr>
                <tr>
                  <th className="border p-2">전화번호</th>
                  <td className="border p-2">{detail.reserverTel}</td>
                </tr>
                <tr>
                  <th className="border p-2">이메일</th>
                  <td className="border p-2">{detail.reserverEmail}</td>
                </tr>
                <tr>
                  <th className="border p-2">비고</th>
                  <td className="border p-2">{detail.note}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between gap-3">
              <div className="flex gap-3">
                <Button
                  theme="danger"
                  onClick={async () => {
                    if (confirm("예약을 확정하겠습니까?")) {
                      try {
                        const res = await api.post("/api/v1/meeting/confirm", {
                          id: detail.id,
                        });
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
                >
                  예약 확정
                </Button>
                <Button
                  theme="danger"
                  onClick={async () => {
                    if (confirm("예약을 취소하겠습니까?")) {
                      try {
                        const res = await api.post("/api/v1/meeting/cancel", {
                          id: detail.id,
                        });
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
                >
                  예약 취소
                </Button>
              </div>
              <div>
                <Button
                  onClick={() => {
                    closeModal();
                    showModal({
                      title: "Meeting Room 수정",
                      size: "lg",
                      customButton: true,
                      showCancel: true,
                      children: ({ closeModal }) => (
                        <ReservationForm
                          isEdit
                          initialData={detail}
                          meetingOptions={meetingOptions}
                          roomList={officeOptions}
                          closeModal={closeModal}
                          onSubmit={() => {
                            fetchSchedules();
                            closeModal();
                          }}
                        />
                      ),
                    });
                  }}
                >
                  수정
                </Button>
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
      <div className="mb-4 flex items-center justify-between">
        <Select
          label="회의실 선택"
          value={selectedRoom}
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
              title: "회의실 예약",
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
                    fetchSchedules();
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

      <div className="relative space-y-4 overflow-hidden rounded-xl bg-white p-4 shadow-md">
        <div className="absolute top-6 right-6">
          <ul className="flex gap-2"></ul>
        </div>
        <CalendarToolbar
          events={scheduleList}
          onSelectEvent={handleEventClick}
        />
        <div className="mt-6 flex justify-center">
          <div className="grid max-w-fit grid-cols-2 gap-30">
            {/* 오전 시간대 */}
            <div className="space-y-4">
              {["09:00", "10:00", "11:00", "12:00", "13:00"].map((time) => (
                <div key={time}>
                  <p className="mb-1 text-sm font-semibold">
                    {time} ~ {add50Min(time)}
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">
                      잔여 Relax Room 수 : "-"
                    </label>
                    <div className="relative inline-block">
                      <select
                        value=""
                        onChange={() => {}}
                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      >
                        <option value="1">옵션 1</option>
                        <option value="2">옵션 2</option>
                      </select>
                      <ArrowDownIcon className="h-8 w-8 bg-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 오후 시간대 */}
            <div className="space-y-4">
              {["14:00", "15:00", "16:00", "17:00"].map((time) => (
                <div key={time}>
                  <p className="mb-1 text-sm font-semibold">
                    {time} ~ {add50Min(time)}
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">
                      잔여 Relax Room 수 : "-"
                    </label>
                    <div className="relative inline-block">
                      <select
                        value=""
                        onChange={() => {}}
                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      >
                        <option value="1">옵션 1</option>
                        <option value="2">옵션 2</option>
                      </select>
                      <ArrowDownIcon className="h-8 w-8 bg-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
