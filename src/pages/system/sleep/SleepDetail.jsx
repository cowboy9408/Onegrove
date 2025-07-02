import { useState, useEffect } from "react";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Select from "@/components/common/Select";
import Datepicker from "@/components/common/Datepicker";
import Checkbox from "@/components/common/Checkbox";
import { useNavigate } from "react-router-dom";
import useModal from "@/hooks/useModal";
import Button from "@/components/common/Button";
import api from "@/lib/apiClient";
import { useParams } from "react-router-dom";

export default function SleepDetail() {
  const [roomName, setRoomName] = useState("");
  const [useYn, setUseYn] = useState("사용");
  const [gender, setGender] = useState("남성");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [location, setLocation] = useState("");
  const [maxTime, setMaxTime] = useState("");
  const [checkedRooms, setCheckedRooms] = useState([]);
  const navigate = useNavigate();
  const { showModal } = useModal();
  const [locationOptions, setLocationOptions] = useState([]);
  const locationCodeMap = Object.fromEntries(
    locationOptions.map((item) => [item.value, item.code])
  );
  const [roomNumList, setRoomNumList] = useState([]);
  const { id } = useParams();
  const [roomInfoList, setRoomInfoList] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/api/v1/sleep/room/detail/${id}`);
        console.log(res.data.data.infoList);
        if (res.data.success) {
          const d = res.data.data;

          // locationOptions가 로드된 뒤에 실행될 수 있도록 체크
          if (locationOptions.length > 0) {
            const codeToValueMap = Object.fromEntries(
              locationOptions.map((item) => [item.code, item.value])
            );
            setLocation(codeToValueMap[d.location]); // "lc0102" → "EAST"
          }

          setRoomName(d.name);
          setMaxTime(d.maxHour);
          setStartDate(new Date(`2000-01-01T${d.startTime}`));
          setEndDate(new Date(`2000-01-01T${d.endTime}`));
          setGender(d.gender === "M" ? "남성" : "여성");
          setUseYn(d.useYn === "Y" ? "사용" : "미사용");
          setRoomInfoList(d.infoList || []);

          const checked = d.infoList
            .filter((room) => room.useYn === "N")
            .map((room) => room.roomNumId);
          setCheckedRooms(checked);
        }
      } catch (err) {
        console.error("상세 API 실패:", err);
      }
    };

    if (locationOptions.length > 0 && id) {
      fetchDetail();
    }
  }, [id, locationOptions]);

  const getRoomLabel = (num) => {
    const prefix = gender === "여성" ? "여자" : "남자";
    return `${prefix} ${num}호실`;
  };

  const genderRoomNumList = roomNumList
    .filter((room) => gender === "남성" || room.id <= 7)
    .map((room) => ({
      ...room,
      label: getRoomLabel(room.name.replace("호실", "")),
    }));

  const handleCheck = (room) => {
    setCheckedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );
  };

  useEffect(() => {
    const fetchRoomNums = async () => {
      try {
        const res = await api.get("/api/v1/sleep/room/number");
        if (res.data.success) {
          setRoomNumList(res.data.data); // ex: [{ id: 1, name: "1호실" }, ...]
        }
      } catch (err) {
        console.error("roomNumList 호출 실패:", err);
      }
    };

    fetchRoomNums();
  }, []);

  useEffect(() => {
    const fetchLocationOptions = async () => {
      try {
        const res = await api.get("/api/v1/sleep/location/code");
        if (res.data.success) {
          setLocationOptions(res.data.data); // [{ code: "lc0101", value: "WEST" }, ...]
        } else {
          console.error("위치 조회 실패:", res.data.message);
        }
      } catch (error) {
        console.error("위치 API 오류:", error);
      }
    };

    fetchLocationOptions();
  }, []);

  const handleSubmit = async () => {
    if (!roomName || !startDate || !endDate || !location || !maxTime) {
      showModal({
        title: "입력 확인",
        message: "필수 항목을 모두 입력해 주세요.",
      });
      return;
    }

    try {
      const genderCode = gender === "남성" ? "M" : "F";
      const useYnCode = useYn === "사용" ? "Y" : "N";
      const locationCode = locationCodeMap[location];

      const existingInfoMap = {}; // roomNumId → info.id
      roomNumList.forEach((room) => {
        const existing = roomInfoList.find(
          (info) => info.roomNumId === room.id
        );
        if (existing) {
          existingInfoMap[room.id] = existing.id;
        }
      });

      const infoList = roomNumList.map((room) => ({
        id: existingInfoMap[room.id], // 기존 ID (없을 수도 있음)
        roomNumId: room.id,
        useYn: checkedRooms.includes(room.id) ? "N" : "Y",
      }));

      const payload = {
        id: Number(id),
        name: roomName,
        location: locationCode,
        maxHour: Number(maxTime),
        startTime: startDate?.toTimeString().slice(0, 5),
        endTime: endDate?.toTimeString().slice(0, 5),
        gender: genderCode,
        useYn: useYnCode,
        infoList,
      };

      const res = await api.post("/api/v1/sleep/room/update", payload);

      if (res.data.success) {
        showModal({
          title: "수정 완료",
          message: "수면실이 성공적으로 수정되었습니다.",
          onConfirm: () => navigate("/system/sleep"),
        });
      } else {
        showModal({ title: "수정 실패", message: res.data.message });
      }
    } catch (error) {
      showModal({ title: "오류", message: "API 요청 중 문제가 발생했습니다." });
      console.error("Update API Error:", error);
    }
  };

  return (
    <div className="max-w mx-auto space-y-6 rounded-lg bg-white p-6 shadow-md">
      <div className="absolute top-14 -mt-3 w-full text-2xl font-bold">
        Relax Room 설정 상세
      </div>
      <div className="space-y-6 p-6">
        {/* Relax Room 이름 + 사용 여부 */}
        <div className="flex gap-6">
          <div className="flex-1">
            <Input
              label="Relax Room 이름"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              className="w-[400px]"
            />
          </div>
          <div className="w-[400px]">
            <p className="mb-2 text-sm font-medium">사용 여부</p>
            <div className="flex gap-4">
              <Radio
                name="useYn"
                value="사용"
                checked={useYn === "사용"}
                onChange={(e) => setUseYn(e.target.value)}
                label="사용"
              />
              <Radio
                name="useYn"
                value="미사용"
                checked={useYn === "미사용"}
                onChange={(e) => setUseYn(e.target.value)}
                label="미사용"
              />
            </div>
          </div>
        </div>

        {/* 성별 + 운영 시간 */}
        <div className="flex items-end gap-90">
          <div>
            <p className="mb-2 text-sm font-medium">성별</p>
            <div className="flex gap-4">
              <Radio
                name="gender"
                value="남성"
                checked={gender === "남성"}
                onChange={(e) => setGender(e.target.value)}
                label="남성"
              />
              <Radio
                name="gender"
                value="여성"
                checked={gender === "여성"}
                onChange={(e) => setGender(e.target.value)}
                label="여성"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">
              운영 시간<span className="text-red-500">*</span>
            </p>
            <Datepicker
              mode="range"
              timeOnly={true}
              startDate={startDate}
              endDate={endDate}
              onRangeChange={({ startDate, endDate }) => {
                setStartDate(startDate);
                setEndDate(endDate);
              }}
            />
          </div>
        </div>

        {/* 위치 + 최대 예약 시간 */}
        <div className="flex gap-6">
          <div className="flex-1">
            <Select
              label="위치"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="">선택</option>
              {locationOptions.map((item) => (
                <option key={item.code} value={item.value}>
                  {item.value}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <Input
              label="최대 예약 시간"
              value={maxTime}
              onChange={(e) => setMaxTime(e.target.value)}
              type="number"
              required
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">
            Relax Room - {gender} 호실 정보 (체크 시 사용불가)
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {genderRoomNumList.map((room) => (
              <Checkbox
                key={room.id}
                id={room.label}
                label={room.label}
                checked={checkedRooms.includes(room.id)}
                onChange={() => handleCheck(room.id)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4 px-6 pb-6">
        <Button onClick={handleSubmit}>수정</Button>
        <Button
          type="button"
          className="bg-gray-200"
          onClick={() =>
            showModal({
              title: "이동 확인",
              message:
                "목록으로 이동하면 작성한 정보가 사라집니다. 이동하시겠습니까?",
              showCancel: true,
              onConfirm: () => navigate("/system/sleep"),
            })
          }
        >
          목록
        </Button>
      </div>
    </div>
  );
}
