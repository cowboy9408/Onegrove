import React, { forwardRef, useImperativeHandle, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Upload from "@/components/common/Upload";
import OfficeFloorForm from "@/components/common/OfficeFloorForm";

const RegistForm = forwardRef(
  (
    {
      data,
      setData,
      lang,
      locations,
      setLocations,
      currentLang,
      readOnlyOffice = false,
    },
    ref
  ) => {
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

      // 이미 설정한 값이면 더 이상 반영하지 않음
      const current = getValues("locations") || [];
      const next = locations || [];

      const isSame =
        current.length === next.length &&
        current.every((cur, i) => cur.id === next[i].id);

      if (!isSame) {
        console.log(`[${lang}] setValue로 locations 반영`);
        setValue("locations", next);
      }
    }, [currentLang]);

    const handleOfficeChange = (updatedList) => {
      const prevList = getValues("locations") || [];

      const deletedItems = prevList
        .filter((prev) => !updatedList.some((u) => u.id === prev.id))
        .map((item) => ({ ...item, delYn: "Y" }));

      const finalList = [...updatedList, ...deletedItems];

      // 현재 폼 내부 값 설정
      setValue("locations", finalList);

      //
      setLocations(finalList);
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
      submit: async (onError) => {
        const values = getValues();
        const locations = values.locations || [];
        const isValid = await methods.trigger();

        if (!isValid) {
          const errors = methods.formState.errors;

          const firstErrorField = [
            "companyName",
            "ceoName",
            "phone",
            "mail",
            "time",
          ].find((field) => errors[field]);

          if (firstErrorField) {
            const message =
              errors[firstErrorField]?.message || "입력값을 다시 확인해주세요.";
            onError?.(message);
          } else {
            onError?.("입력값을 다시 확인해주세요.");
          }

          return null;
        }

        console.log("제출 값 확인:", values);
        console.log(`[${lang}] 제출값:`, getValues("locations"));

        if (!values.companyName) {
          setTimeout(() => onError?.("입주사명을 입력해주세요."), 0);
          return null;
        }
        const activeLocations = locations.filter((loc) => loc.delYn !== "Y");

        // 둘 중 하나라도 입력 안 됐으면 오류 반환
        const hasInvalid = activeLocations.some(
          (loc) => !loc.office?.trim() || !loc.floor?.trim()
        );
        if (hasInvalid) {
          setTimeout(() => onError?.("오피스와 층 수를 모두 입력해주세요."), 0);
          return null;
        }

        if (activeLocations.length === 0) {
          setTimeout(() => onError?.("오피스를 1개 이상 등록해주세요."), 0);
          return null;
        }

        if (!values.ceoName) {
          setTimeout(() => onError?.("대표명을 입력해주세요."), 0);
          return null;
        }
        if (!values.mainImage || !values.mainImage.path) {
          onError?.("대표 이미지를 등록해주세요.");
          return null;
        }
        if (!values.phone) {
          setTimeout(() => onError?.("전화번호를 입력해주세요."), 0);
          return null;
        }
        // if (!values.mail) {
        //   setTimeout(() => onError?.("대표 이메일을 입력해주세요."), 0);
        //   return null;
        // }
        if (!values.mainImage || !values.mainImage.path) {
          setTimeout(() => onError?.("대표 이미지를 등록해주세요."), 0);
          return null;
        }
        if (!values.time) {
          setTimeout(
            () => onError?.("회의실 무료 예약시간을 입력해주세요."),
            0
          );
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
          office: item.office?.trim(),
          floor: item.floor?.trim(),
          sort: idx + 1,
          delYn: item.delYn ?? "N", // 삭제 여부 반드시 포함
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
            <Input
              label="입주사명"
              required
              {...register("companyName", {
                required: "입주사명을 입력해주세요.",
                validate: (value) =>
                  value.trim() !== "" || "입주사명을 입력해주세요.",
                maxLength: {
                  value: 100,
                  message: "제목은 공백 포함 100자 이하로 입력해주세요.",
                },
              })}
              maxLength={100}
              showDefaultInfo={true}
            />
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
            <p className="mb-2 text-sm font-medium text-gray-800">
              오피스<span className="text-red-500">*</span>
            </p>
            <OfficeFloorForm
              value={watch("locations") || []}
              onChange={handleOfficeChange}
              readOnly={readOnlyOffice}
            />
            <Input
              label="대표명"
              required
              {...register("ceoName", {
                required: "대표명을 입력해주세요.",
                validate: (value) =>
                  value.trim() !== "" || "대표명을 입력해주세요.",
                maxLength: {
                  value: 30,
                  message: "제목은 공백 포함 30자 이하로 입력해주세요.",
                },
              })}
              maxLength={30}
              showDefaultInfo={true}
            />
            <Input
              label="전화번호"
              required
              placeholder="ex) 010-1234-5678 형식으로 입력해주세요."
              topLabel={true}
              {...register("phone", {
                required: "전화번호를 입력해주세요.",
                validate: (value) =>
                  value.trim() !== "" || "전화번호를 입력해주세요.",
                pattern: {
                  value: /^01[0|1|6|7|8|9]-\d{3,4}-\d{4}$/,
                  message: "올바른 전화번호 형식을 입력해주세요.",
                },

                maxLength: {
                  value: 20,
                  message: "제목은 공백 포함 20자 이하로 입력해주세요.",
                },
              })}
              maxLength={20}
              showDefaultInfo={true}
            />
            <Input
              label="대표 이메일"
              {...register("mail", {
                validate: (value) =>
                  value.trim() === "" ||
                  /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/.test(
                    value
                  ) ||
                  "올바른 이메일 형식을 입력해주세요.",
                maxLength: {
                  value: 50,
                  message: "제목은 공백 포함 50자 이하로 입력해주세요.",
                },
              })}
              maxLength={50}
              showDefaultInfo={true}
            />

            <Upload
              name="mainImage"
              label="대표 이미지"
              value={watch("mainImage")}
              onChange={(file) => {
                file.changed = true;
                setValue("mainImage", file);
              }}
              classification="Company"
              required
              // showDefaultInfo={true}
              // info="416x280px 사이즈, 20MB 이하의 JPG,JPEG,PNG 파일 1개"
            />
            <Input
              label="회의실 무료 예약시간"
              type="text"
              required
              inputMode="numeric"
              pattern="[0-9]*"
              onInput={(e) => {
                // 숫자 외 제거 + 127 초과 시 자르기
                let value = e.target.value.replace(/[^0-9]/g, "");
                if (parseInt(value, 10) > 127) {
                  value = "127";
                }
                e.target.value = value;
              }}
              {...register("time", {
                required: "회의실 무료 예약시간을 입력해주세요.",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "숫자만 입력해주세요.",
                },
                max: {
                  value: 127,
                  // message: "127 이하의 숫자만 입력 가능합니다.",
                },
              })}
              info="예약시간은 127시간까지만 입력 가능"
            />
          </div>
        </form>
      </FormProvider>
    );
  }
);

export default RegistForm;
