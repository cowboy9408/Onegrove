import { useEffect, useState } from "react";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Select from "@/components/common/Select";
import Datepicker from "@/components/common/Datepicker";
import Upload from "@/components/common/Upload";
import Button from "@/components/common/Button";
import api from "@/lib/apiClient";
import { useNavigate } from "react-router-dom";
import useModal from "@/hooks/useModal";
import { useForm, FormProvider, Controller } from "react-hook-form";

export default function MeetingSetting() {
  const navigate = useNavigate();
  const { showModal } = useModal();
  const [locationOptions, setLocationOptions] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const methods = useForm({
    defaultValues: {
      name: "",
      useYn: "사용",
      isVip: "일반",
      roomNumber: "",
      location: "",
      capacity: "",
      startTime: startDate?.toTimeString().slice(0, 5),
      endTime: endDate?.toTimeString().slice(0, 5),
      file: null,
      freeTime: "",
      pricePerHour: "",
    },
  });
  const { control, watch, setValue, handleSubmit } = methods;

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get("/api/v1/meeting/setting/location");
        if (res.data.success) {
          setLocationOptions(res.data.data);
          // 기본값 설정 (예: 첫 번째 옵션)
          if (res.data.data.length > 0) {
            setValue("location", res.data.data[0].code); // value → code
          }
        } else {
          console.error("위치 조회 실패:", res.data.message);
        }
      } catch (err) {
        console.error("위치 API 오류:", err);
      }
    };

    fetchLocations();
  }, [setValue]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (form) => {
    if (
      !form.name ||
      !form.roomNumber ||
      !form.location ||
      !form.capacity ||
      !form.timeRange?.startDate ||
      !form.timeRange?.endDate ||
      !form.file ||
      !form.freeTime ||
      !form.pricePerHour
    ) {
      showModal({
        title: "입력 확인",
        message: "필수 항목을 모두 입력해 주세요.",
      });
      return;
    }

    try {
      const payload = {
        name: form.name,
        useYn: form.useYn === "사용" ? "Y" : "N",
        isVip: form.isVip === "VIP" ? "Y" : "N",
        roomNumber: form.roomNumber,
        location: form.location, // code 전송
        capacity: Number(form.capacity),
        startTime: form.timeRange?.startDate
          ? new Date(form.timeRange.startDate).toTimeString().slice(0, 8)
          : null,
        endTime: form.timeRange?.endDate
          ? new Date(form.timeRange.endDate).toTimeString().slice(0, 8)
          : null,
        img: form.file,
        freeHour: Number(form.freeTime),
        hourlyCost: Number(form.pricePerHour),
      };

      const res = await api.post("/api/v1/meeting/setting/insert", payload);

      if (res.data.success) {
        showModal({
          title: "추가 완료",
          message: "회의실이 성공적으로 추가되었습니다.",
          onConfirm: () => navigate("/system/meeting"),
        });
      } else {
        showModal({ title: "등록 실패", message: res.data.message });
      }
    } catch (error) {
      showModal({ title: "오류", message: "API 요청 중 문제가 발생했습니다." });
      console.error("Insert API Error:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w mx-auto space-y-6 rounded-lg bg-white p-6 shadow-md">
          <div className="flex gap-4">
            {/* 회의실 이름 */}
            <div className="w-2/3">
              <Input
                label="회의실 이름"
                {...methods.register("name")}
                required
                className="w-[600px]"
              />
            </div>

            {/* 사용 여부 */}
            <div className="w-2/3">
              <p className="mb-2 text-sm font-medium text-gray-700">
                사용 여부
              </p>
              <div className="flex gap-3">
                <Radio
                  name="useYn"
                  value="사용"
                  checked={watch("useYn") === "사용"}
                  onChange={() => setValue("useYn", "사용")}
                  label="사용"
                />
                <Radio
                  name="useYn"
                  value="미사용"
                  checked={watch("useYn") === "미사용"}
                  onChange={() => setValue("useYn", "미사용")}
                  label="미사용"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                회의실 유형
              </p>
              <div className="flex gap-3">
                <Radio
                  name="isVip"
                  value="일반"
                  checked={watch("isVip") === "일반"}
                  onChange={() => setValue("isVip", "일반")}
                  label="일반"
                />
                <Radio
                  name="isVip"
                  value="VIP"
                  checked={watch("isVip") === "VIP"}
                  onChange={() => setValue("isVip", "VIP")}
                  label="VIP"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="호실" {...methods.register("roomNumber")} required />
            <Controller
              control={control}
              name="location"
              rules={{ required: true }}
              render={({ field }) => (
                <Select label="위치" {...field} required>
                  {locationOptions.map((loc) => (
                    <option key={loc.code} value={loc.code}>
                      {loc.value}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="수용 가능 인원"
              type="number"
              {...methods.register("capacity")}
              required
            />
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                운영 시간
                <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-4">
                <Datepicker
                  mode="time-only"
                  selectedDate={startDate}
                  onSingleChange={(date) => {
                    setStartDate(date);
                    setValue("startTime", date); // 유지
                    setValue("timeRange", {
                      ...watch("timeRange"),
                      startDate: date,
                    });
                  }}
                />
                <span>~</span>
                <Datepicker
                  mode="time-only"
                  selectedDate={endDate}
                  onSingleChange={(date) => {
                    setEndDate(date);
                    setValue("endTime", date); // 유지
                    setValue("timeRange", {
                      ...watch("timeRange"),
                      endDate: date,
                    });
                  }}
                />
              </div>
            </div>
          </div>

          <Upload
            label="회의실 대표 이미지"
            name="file"
            value={watch("file")}
            onChange={(file) => setValue("file", file)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="무료 차감 시간"
              type="number"
              {...methods.register("freeTime")}
              required
            />
            <Input
              label="시간 당 요금 (VAT 별도)"
              type="number"
              {...methods.register("pricePerHour")}
              required
            />
          </div>

          <div className="flex justify-end gap-4 px-6 pb-6">
            <Button onClick={handleSubmit(onSubmit)}>추가</Button>

            <Button
              type="button"
              className="bg-gray-200"
              onClick={() =>
                showModal({
                  title: "이동 확인",
                  message:
                    "목록으로 이동하면 작성한 정보가 사라집니다. 이동하시겠습니까?",
                  showCancel: true,
                  onConfirm: () => navigate("/system/meeting"),
                })
              }
            >
              목록
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
