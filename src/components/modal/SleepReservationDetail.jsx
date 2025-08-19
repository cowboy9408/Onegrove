import React, { useState, useEffect, useContext } from "react";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ModalContext } from "@/context/ModalContext";
import SleepReservationForm from "./SleepReservationForm";
import api from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/utils";

export default function SleepReservationDetail({
  reservationId,
  closeModal,
  onUpdate,
  room,
  meetingOptions,
  roomList,
}) {
  const { showModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(true);
  const [reservationData, setReservationData] = useState(null);
  const [userName, setUserName] = useState("");

  const fetchReservationDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/api/v1/sleep/reserve/detail/${reservationId}`
      );
      if (res.data.success) {
        setReservationData(res.data.data);
        // 예약 데이터를 가져온 후 userName을 별도로 조회
        if (
          res.data.data.roomId &&
          res.data.data.reserveDt &&
          res.data.data.reserveTime
        ) {
          await fetchUserName(
            res.data.data.roomId,
            res.data.data.reserveDt,
            res.data.data.reserveTime
          );
        }
      }
    } catch (error) {
      console.error("예약 상세 조회 실패:", error);
      alert(
        extractErrorMessage(
          error,
          "예약 상세 조회가 실패되었습니다. 다시 시도 해주세요."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUserName = async (roomId, reserveDt, reserveTime) => {
    try {
      const res = await api.get(`/api/v1/sleep/reserve/list/detail`, {
        params: {
          roomId,
          reserveDt,
          reserveTime,
        },
      });
      if (res.data.success && res.data.data) {
        // 현재 예약과 일치하는 데이터 찾기
        const currentReservation = res.data.data.find(
          (item) => item.id === reservationId
        );
        if (currentReservation && currentReservation.userName) {
          setUserName(currentReservation.userName);
        }
      }
    } catch (error) {
      console.error("사용자 이름 조회 실패:", error);
    }
  };

  const formatTimeRange = (timeStr) => {
    if (!timeStr) return "";

    // 시간 문자열을 파싱 (예: "09:00:00" -> [9, 0, 0])
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);

    // 시작 시간
    const startTime = timeStr;

    // 종료 시간 계산 (50분 추가)
    const totalMinutes = hours * 60 + minutes + 50;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    const endTime = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return `${startTime} ~ ${endTime}`;
  };

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await api.delete(
        `/api/v1/sleep/reserve/delete/${reservationId}`
      );
      if (res.data.success) {
        alert("예약이 삭제되었습니다.");
        onUpdate?.();
        closeModal();
      }
    } catch (error) {
      console.error("예약 삭제 실패:", error);
      alert(
        error?.response?.data?.message ||
          error?.data?.message ||
          "예약 삭제가 실패되었습니다. 다시시도 해주세요."
      );
    }
  };

  const handleEdit = () => {
    showModal({
      title: "수면실 예약 수정",
      size: "lg",
      customButton: true,
      showCancel: true,
      children: ({ closeModal: closeEditModal }) => (
        <SleepReservationForm
          room={room}
          meetingOptions={meetingOptions}
          roomList={roomList}
          initialData={reservationData}
          isEdit={true}
          closeModal={closeEditModal}
          onSubmit={() => {
            onUpdate?.();
            closeEditModal();
            closeModal();
          }}
        />
      ),
    });
  };

  useEffect(() => {
    if (reservationId) {
      fetchReservationDetail();
    }
  }, [reservationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!reservationData) {
    return (
      <div className="py-8 text-center">
        <p>예약 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-200 py-4">
          <div className="flex flex-row gap-3">
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Relax Room :
            </label>
            <p className="text-sm text-gray-900">
              {reservationData.roomName} ({reservationData.roomLocation})
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Relax Room 호실 :
            </label>
            <p className="text-sm text-gray-900">{reservationData.roomInfo}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-b border-gray-200 pb-4">
          <div className="flex flex-row gap-3">
            <label className="mb-1 block text-sm font-bold text-gray-700">
              예약시간 :
            </label>
            <p className="text-sm text-gray-900">
              {reservationData.reserveDt}{" "}
              {formatTimeRange(reservationData.reserveTime)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
          <div className="flex flex-row gap-3">
            <label className="mb-1 block text-sm font-bold text-gray-700">
              입주사명 :
            </label>
            <p className="text-sm text-gray-900">
              {reservationData.companyName}
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <label className="mb-1 block text-sm font-bold text-gray-700">
              아이디 :
            </label>
            <p className="text-sm text-gray-900">{reservationData.userName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
          <div className="flex flex-row gap-3">
            <label className="mb-1 block text-sm font-bold text-gray-700">
              이름 :
            </label>
            <p className="text-sm text-gray-900">{userName}</p>
          </div>
          <div className="flex flex-row gap-3">
            <label className="mb-1 block text-sm font-bold text-gray-700">
              전화번호 :
            </label>
            <p className="text-sm text-gray-900">{reservationData.userPhone}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleEdit}>
          수정
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          삭제
        </Button>
      </div>
    </div>
  );
}
