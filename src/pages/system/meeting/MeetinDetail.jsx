import { useEffect, useState } from "react";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Select from "@/components/common/Select";
import Datepicker from "@/components/common/Datepicker";
import Upload from "@/components/common/Upload";
import Button from "@/components/common/Button";
import api from "@/lib/apiClient";
import { useNavigate, useParams } from "react-router-dom";
import useModal from "@/hooks/useModal";
import { useForm, FormProvider } from "react-hook-form";

export default function MeetingDetail() {
  const navigate = useNavigate();
  const { showModal } = useModal();
  const [locationOptions, setLocationOptions] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { id } = useParams();
  const [originImage, setOriginImage] = useState(null);

  const toImageMeta = (file, original) => {
    if (!file && original) {
      return {
        id: original.id ?? null,
        originalName: original.originalName ?? "",
        name: original.name ?? original.originalName ?? "",
        size: original.size ?? 0,
        extension:
          original.extension ||
          "." + (original.originalName || "").split(".").pop(),
        mime: original.mime || "image/jpeg",
        classification: original.classification || "meeting",
        path: original.path || null,
        status: "R", // 기존 이미지 유지
      };
    }

    if (!file || file.status === "D" || !file.path) {
      return {
        id: null,
        name: null,
        originalName: file?.originalName || "",
        size: null,
        extension: null,
        mime: null,
        classification: "meeting",
        path: null,
        status: "D",
      };
    }

    const base = file || original;
    const originalName = base.originalName || base.name || "";
    const extension = base.extension || "." + originalName.split(".").pop();
    const isNew = !base.id && !original?.id;

    return {
      id: base.id ?? null,
      originalName: originalName,
      name: base.name ?? originalName,
      size: base.size ?? 0,
      extension: extension,
      mime: base.mime || "image/jpeg",
      classification: base.classification || "meeting",
      path: base.path || null,
      status: isNew
        ? "C"
        : file?.changed
          ? "E"
          : original?.path !== file?.path
            ? "E"
            : file?.status || "R",
    };
  };

  const methods = useForm({
    defaultValues: {
      name: "",
      useYn: "",
      isVip: "",
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
  const { register, watch, setValue, handleSubmit } = methods;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const locRes = await api.get("/api/v1/meeting/setting/location");
        if (!locRes.data.success) throw new Error("위치 옵션 조회 실패");

        const options = locRes.data.data;
        setLocationOptions(options);

        if (id) {
          const res = await api.get(`/api/v1/meeting/setting/detail/${id}`);
          if (res.data.success) {
            const d = res.data.data;

            const s = new Date(`1970-01-01T${d.startTime}`);
            const e = new Date(`1970-01-01T${d.endTime}`);
            setStartDate(s);
            setEndDate(e);

            setValue("name", d.name);
            setValue("useYn", d.useYn === "Y" ? "사용" : "미사용");
            setValue("isVip", d.isVip === "Y" ? "VIP" : "일반");
            setValue("roomNumber", d.roomNumber);
            setValue("capacity", d.capacity);
            setValue("timeRange", { startDate: s, endDate: e });
            setValue("file", {
              name: d.originalName,
              path: d.imgPath,
              originalName: d.originalName,
              id: d.fileId,
              size: null,
            });
            setOriginImage({
              name: d.originalName,
              path: d.imgPath,
              originalName: d.originalName,
              id: d.fileId,
            });
            setValue("freeTime", d.freeHour);
            setValue("pricePerHour", d.hourlyCost);
            s;
            // 코드 → value로 매핑
            const selectedLoc = options.find((loc) => loc.value === d.location);
            if (selectedLoc) {
              setValue("location", selectedLoc.code); // 코드값 설정
            }
          }
        }
      } catch (err) {
        console.error("데이터 조회 중 오류:", err);
      }
    };

    fetchData();
  }, [id, setValue]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (form) => {
    if (
      !form.name ||
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
        id: Number(id), // 반드시 포함
        name: form.name,
        useYn: form.useYn === "사용" ? "Y" : "N",
        isVip: form.isVip === "VIP" ? "Y" : "N",
        roomNumber: form.roomNumber,
        location: form.location,
        capacity: Number(form.capacity),
        startTime: form.timeRange?.startDate
          ? new Date(form.timeRange.startDate).toTimeString().slice(0, 8)
          : null,
        endTime: form.timeRange?.endDate
          ? new Date(form.timeRange.endDate).toTimeString().slice(0, 8)
          : null,
        img: toImageMeta(form.file, originImage),

        freeHour: Number(form.freeTime),
        hourlyCost: Number(form.pricePerHour),
      };

      const res = await api.post("/api/v1/meeting/setting/update", payload);

      if (res.data.success) {
        showModal({
          title: "수정 완료",
          message: "회의실 정보가 성공적으로 수정되었습니다.",
          onConfirm: () => navigate("/system/meeting"),
        });
      } else {
        showModal({ title: "수정 실패", message: res.data.message });
      }
    } catch (error) {
      showModal({
        title: "오류",
        message: "API 요청 중 문제가 발생했습니다.",
      });
      console.error("Update API Error:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="absolute top-14 -mt-3 w-full text-2xl font-bold">
        어메니티 설정 상세 정보
      </div>
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
            {/* 호실 입력란 */}
            <Input label="호실" {...methods.register("roomNumber")} />

            {/* 위치 선택란 */}
            <div>
              <p className="mb-1 text-sm font-medium text-gray-800 dark:text-gray-100">
                위치<span className="text-red-500">*</span>
              </p>
              <select
                {...register("location")}
                className="peer h-12 w-full appearance-none rounded-md border border-gray-300 bg-white px-4 text-sm text-gray-800 focus:ring-2 focus:ring-gray-800 focus:outline-none disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-gray-600 dark:disabled:bg-gray-800"
                required
              >
                {locationOptions.map((loc) => (
                  <option key={loc.code} value={loc.code}>
                    {loc.value}
                  </option>
                ))}
              </select>
            </div>
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
                    setValue("startTime", date);
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
                    setValue("endTime", date);
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
            <Button type="submit">수정</Button>
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
