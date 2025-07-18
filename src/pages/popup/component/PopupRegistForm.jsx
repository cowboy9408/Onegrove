import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Datepicker from "@/components/common/Datepicker";
import Upload from "@/components/common/Upload";
import Button from "@/components/common/Button";
import { useForm, FormProvider } from "react-hook-form";

const PopupRegistForm = forwardRef(({ data, lang }, ref) => {
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      isVisible: "Y",
    },
  });
  const { register, setValue, watch, getValues } = methods;

  const [form, setForm] = useState({
    title: "",
    isVisible: "Y",
    menu: "",
    language: "ko",
    period: { startDate: null, endDate: null },
    pcImg: null,
    moImg: null,
    url: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    if (data) {
      setValue("title", data.title || "");
      setValue("isVisible", data.useYn || "Y"); // 핵심
      setValue("url", data.landingUrl || "");
      setValue("period", {
        startDate: data.startDt ? new Date(data.startDt) : null,
        endDate: data.endDt ? new Date(data.endDt) : null,
      });
      setValue("pcImg", data.pcImg || null);
      setValue("moImg", data.moImg || null);
    }
  }, [data, setValue]);

  useImperativeHandle(ref, () => ({
    submit: (onError) => {
      if (!form.title) {
        onError?.("타이틀을 입력해주세요.");
        return null;
      }

      if (!form.period.startDate || !form.period.endDate) {
        onError?.("노출 기간을 선택해주세요.");
        return null;
      }

      if (!form.image) {
        onError?.("이미지를 등록해주세요.");
        return null;
      }

      const toImageMeta = (file) => ({
        id: file.id ?? null,
        originalName: file.originalName || file.name,
        name: file.name,
        size: file.size,
        extension: "." + (file.originalName || file.name).split(".").pop(),
        mime: file.type || "image/png",
        classification: file.classification ?? null,
        path: file.path,
        status: file.status ?? "C",
      });

      return {
        lang: lang?.toUpperCase() || "KO",
        title: form.title,
        startDt: form.period.startDate.toISOString().split("T")[0],
        endDt: form.period.endDate.toISOString().split("T")[0],
        landingUrl: form.url,
        useYn: form.isVisible,
        pcImg: toImageMeta(form.pcImg),
        moImg: toImageMeta(form.moImg),
      };
    },
  }));

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-4xl space-y-6 rounded-lg">
        <div className="mx-auto max-w-3xl space-y-6 p-6">
          <div className="flex items-start gap-6">
            {/* 타이틀 */}
            <div className="flex-1">
              <Input
                label="타이틀"
                {...register("title", { required: true })}
                required
              />
            </div>

            {/* 노출 여부 */}
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium">노출 여부</p>
              <div className="flex gap-4">
                <Radio
                  name="isVisible"
                  value="Y"
                  label="노출"
                  checked={watch("isVisible") === "Y"}
                  onChange={() => setValue("isVisible", "Y")}
                />
                <Radio
                  name="isVisible"
                  value="N"
                  label="미노출"
                  checked={watch("isVisible") === "N"}
                  onChange={() => setValue("isVisible", "N")}
                />
              </div>
            </div>
          </div>

          {/* 메뉴 선택 */}

          {/* 노출 기간 */}
          <div>
            <p className="mb-2 text-sm font-medium">
              노출 기간<span className="ml-1 text-red-500">*</span>
            </p>
            <Datepicker
              mode="range"
              startDate={watch("period")?.startDate}
              endDate={watch("period")?.endDate}
              onRangeChange={(range) => setValue("period", range)}
            />
          </div>

          {/* 팝업 이미지 업로드 */}
          <Upload
            name="ImgPc"
            label="PC 팝업 이미지"
            value={watch("pcImg")}
            onChange={(file) => setValue("pcImg", file)}
            required
          />
          <Upload
            name="ImgMo"
            label="모바일 팝업 이미지"
            value={watch("moImg")}
            onChange={(file) => setValue("moImg", file)}
            required
          />

          {/* URL, 버튼 텍스트, 색상 */}
          <Input
            label="랜딩 URL"
            {...register("url", { required: true })}
            placeholder="https://example.com"
            required
          />

          {/* 하단 버튼 */}
        </div>
      </div>
    </FormProvider>
  );
});

export default PopupRegistForm;
