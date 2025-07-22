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

  useEffect(() => {
    if (data) {
      reset({
        title: data.title || "",
        isVisible: String(data.useYn ?? "Y"),
        url: data.landingUrl || "",
        period: {
          startDate: data.startDt ? new Date(data.startDt) : null,
          endDate: data.endDt ? new Date(data.endDt) : null,
        },
        pcImg: data.pcImg ? { ...data.pcImg, status: "R" } : null,
        moImg: data.moImg ? { ...data.moImg, status: "R" } : null,
      });
    }
  }, [data, reset]);

  const handleImageChange = (field, newFile) => {
    const prevFile = getValues(field);
    let status = "C"; // 기본값: 신규 등록

    if (prevFile && prevFile.id && newFile.id === prevFile.id) {
      status = "R"; // 기존 이미지와 동일
    } else if (prevFile && prevFile.id && newFile.id !== prevFile.id) {
      status = "E"; // 기존 이미지에서 수정됨
    }

    const updatedFile = {
      ...newFile,
      status,
    };

    setValue(field, updatedFile);
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

      if (!values.pcImg || !values.moImg) {
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

      const formatDate = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} 00:00:00`;

      return {
        lang: lang?.toUpperCase() || "KO",
        title: values.title,
        startDt: formatDate(values.period.startDate),
        endDt: formatDate(values.period.endDate),
        landingUrl: values.url,
        useYn: values.isVisible,
        pcImg: toImageMeta(values.pcImg),
        moImg: toImageMeta(values.moImg),
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
