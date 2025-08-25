import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Datepicker from "@/components/common/Datepicker";
import Upload from "@/components/common/Upload";
import Button from "@/components/common/Button";
import { useForm, FormProvider, Controller } from "react-hook-form";

const PopupRegistForm = forwardRef(({ data, lang }, ref) => {
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      isVisible: "Y",
    },
  });
  const { register, setValue, watch, getValues, reset } = methods;

  const normalizeImage = (file, fallbackStatus = "C") => {
    if (!file) return null;
    const path =
      file.path ||
      file.url ||
      file.fileUrl ||
      file.file_path ||
      file.downloadUrl ||
      file.location ||
      file.filePath ||
      null;

    const name = file.name || file.fileName || file.originalName || null;
    const ext =
      file.extension ||
      (name && name.includes(".") ? name.slice(name.lastIndexOf(".")) : null);

    return {
      id: file.id ?? file.fileId ?? file.seq ?? null,
      originalName: file.originalName ?? name ?? "",
      name: name ?? "",
      size: file.size ?? file.fileSize ?? null,
      extension: ext,
      mime: file.mime ?? file.mimetype ?? file.contentType ?? null,
      classification: file.classification ?? null,
      path,
      status: file.status || fallbackStatus,
    };
  };

  useEffect(() => {
    if (!data) return;
    reset({
      title: data.title ?? "",
      isVisible: String(data.useYn ?? "Y"),
      url: data.landingUrl ?? "",
      period: {
        startDate: data.startDt ? new Date(data.startDt) : null,
        endDate: data.endDt ? new Date(data.endDt) : null,
      },
      pcImg: data.pcImg
        ? normalizeImage({ ...data.pcImg, status: "R" }, "R")
        : null,
      moImg: data.moImg
        ? normalizeImage({ ...data.moImg, status: "R" }, "R")
        : null,
    });
  }, [data, reset]);

  const handleImageChange = (field, incoming) => {
    const prev = getValues(field);

    // 상태 계산: 기존과 동일(R) / 변경(E) / 신규(C)
    const status =
      prev?.id && incoming?.id
        ? incoming.id === prev.id
          ? "R"
          : "E"
        : prev
          ? "E"
          : "C";

    // path 보장: 업로더가 url/filePath 등으로 줄 때도 path 생성
    const normalized = normalizeImage({ ...incoming, status }, status);

    if (!normalized?.path) {
      alert(
        "이미지 업로드가 완료되지 않았습니다. 업로드 완료 후 저장해주세요."
      );
      return;
    }

    // RHF에 '정규화된 메타'를 저장 (value로도 그대로 사용 가능)
    setValue(field, normalized, { shouldValidate: true });
  };

  useImperativeHandle(ref, () => ({
    submit: (onError) => {
      const values = getValues();

      if (!values.title) {
        onError?.("타이틀을 입력해주세요.");
        return null;
      }
      if (!values.period?.startDate || !values.period?.endDate) {
        onError?.("노출 기간을 선택해주세요.");
        return null;
      }

      // 혹시 이전 단계에서 path가 비었다면 한 번 더 정규화
      const pc = values.pcImg?.path
        ? values.pcImg
        : normalizeImage(values.pcImg, values.pcImg?.status ?? "C");
      const mo = values.moImg?.path
        ? values.moImg
        : normalizeImage(values.moImg, values.moImg?.status ?? "C");

      if (!pc?.path || !mo?.path) {
        onError?.(
          "이미지 업로드가 완료되지 않았습니다. 업로드 완료 후 저장해주세요."
        );
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

      const formatDate = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} 00:00:00`;

      return {
        lang: lang?.toUpperCase() || "KO",
        title: values.title,
        startDt: formatDate(values.period.startDate),
        endDt: formatDate(values.period.endDate),
        landingUrl: values.url,
        useYn: values.isVisible,
        pcImg: toImageMeta(pc), // ← 정규화된 객체 기반
        moImg: toImageMeta(mo),
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
                <div className="flex gap-4">
                  <Controller
                    name="isVisible"
                    control={methods.control}
                    render={({ field }) => (
                      <div className="flex gap-4">
                        <Radio
                          value="Y"
                          label="노출"
                          checked={field.value === "Y"}
                          onChange={() => field.onChange("Y")}
                        />
                        <Radio
                          value="N"
                          label="미노출"
                          checked={field.value === "N"}
                          onChange={() => field.onChange("N")}
                        />
                      </div>
                    )}
                  />
                </div>
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
            onChange={(file) => handleImageChange("pcImg", file)}
            required
          />
          <Upload
            name="ImgMo"
            label="모바일 팝업 이미지"
            value={watch("moImg")}
            onChange={(file) => handleImageChange("moImg", file)}
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
