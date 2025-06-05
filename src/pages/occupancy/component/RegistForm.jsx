import React, { forwardRef, useImperativeHandle, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Upload from "@/components/common/Upload";
import OfficeFloorForm from "@/components/common/OfficeFloorForm";

const RegistForm = forwardRef(
  ({ data, setData, lang, locations, setLocations, currentLang }, ref) => {
    const methods = useForm({
      defaultValues: {
        companyName: "",
        ceoName: "",
        phone: "",
        mail: "",
        time: "",
        useStatus: "active",
        mainImage: null,
        locations: [],
      },
    });
    const { register, getValues, watch, setValue } = methods;

    useEffect(() => {
      const isCurrentTab =
        (lang === "ko" && currentLang === 0) ||
        (lang === "en" && currentLang === 1);

      if (!isCurrentTab) return;

      const current = getValues("locations") || [];
      const next = locations || [];

      const isSame =
        current.length === next.length &&
        current.every((cur, i) => cur.id === next[i].id);

      if (!isSame) {
        console.log(`[${lang}] setValue로 locations 반영`);
        setValue("locations", next);
      }
    }, [locations]);

    const handleOfficeChange = (updatedList) => {
      setValue("locations", updatedList);

      const isCurrent =
        (lang === "ko" && currentLang === 0) ||
        (lang === "en" && currentLang === 1);

      if (isCurrent) {
        console.log(`[${lang}] setLocations 실행:`, updatedList);
        setLocations(updatedList);
      } else {
        console.log(`[${lang}] setLocations 생략됨 (비활성 탭)`);
      }
    };

    useEffect(() => {
      if (data) {
        setValue("companyName", data.name || "");
        setValue("ceoName", data.mainName || "");
        setValue("phone", data.tel || "");
        setValue("mail", data.email || "");
        setValue("time", data.freeHour || "");
        setValue("useStatus", data.useYn === "Y" ? "active" : "inactive");
        setValue(
          "mainImage",
          data.mainImg?.path
            ? {
                ...data.mainImg,
                name:
                  data.mainImg.name ??
                  data.mainImg.originalName ??
                  "이미지.jpg",
                status: "R",
              }
            : null
        );
      }
    }, [data]);

    useImperativeHandle(ref, () => ({
      submit: () => {
        const values = getValues();
        console.log("제출 값 확인:", values);
        console.log(`[${lang}] 제출값:`, getValues("locations"));
        if (
          !values.companyName ||
          !values.ceoName ||
          !values.phone ||
          !values.time
        ) {
          alert("필수 항목을 입력해주세요.");
          return null;
        }
        const toImageMeta = (file) => {
          if (!file || !file.name || !file.path) {
            console.warn("이미지 path 누락:", file); // 이 경고 꼭 확인!
            return null;
          }

          return {
            id: file.id ?? null,
            originalName: file.originalName || file.name,
            name: file.name,
            size: file.size,
            extension: "." + (file.originalName || file.name).split(".").pop(),
            mime: file.type || "image/png",
            classification: "company",
            path: file.path,
            status: file.status ?? "C",
          };
        };
        const sortedOfficeList = (values.locations || []).map((item, idx) => ({
          id: item.id ?? null,
          office: item.office,
          floor: item.floor,
          sort: idx + 1,
          delYn: (item.delYn ?? "N").toUpperCase() === "Y" ? "Y" : "N",
        }));

        return {
          id: data?.id,
          lang: lang === "ko" ? "KO" : "EN",
          name: values.companyName,
          mainName: values.ceoName,
          tel: values.phone,
          email: values.mail,
          freeHour: values.time,
          useYn: values.useStatus === "active" ? "Y" : "N",
          mainImg: toImageMeta(values.mainImage),
          officeList: sortedOfficeList,
        };
      },
      setValue: (name, value) => {
        setValue(name, value);
      },
    }));

    return (
      <FormProvider {...methods}>
        <form className="space-y-6 p-6">
          <div className="mx-auto max-w-3xl space-y-6 rounded-lg bg-white p-8">
            <Input label="입주사명" {...register("companyName")} required />
            <div>
              <p className="mb-2 text-sm font-medium text-gray-800">
                사용 여부
              </p>
              <Radio
                name="useStatus"
                value="active"
                label="사용"
                checked={watch("useStatus") === "active"}
                onChange={() => setValue("useStatus", "active")}
              />
              <Radio
                name="useStatus"
                value="inactive"
                label="미사용"
                checked={watch("useStatus") === "inactive"}
                onChange={() => setValue("useStatus", "inactive")}
              />
            </div>
            <p className="mb-2 text-sm font-medium text-gray-800">오피스</p>
            <OfficeFloorForm
              value={watch("locations") || []}
              onChange={handleOfficeChange}
            />
            <Input label="대표명" {...register("ceoName")} required />
            <Input label="전화번호" {...register("phone")} required />
            <Input label="대표 이메일" {...register("mail")} />

            <Upload
              name="mainImage"
              label="대표 이미지"
              value={watch("mainImage")}
              onChange={(file) => {
                file.changed = true; // 이 줄 추가!
                setValue("mainImage", file);
              }}
              classification="Company" // 대소문자도 맞춰주세요
              required
            />
            <Input label="회의실 무료 예약시간" {...register("time")} />
          </div>
        </form>
      </FormProvider>
    );
  }
);

export default RegistForm;
