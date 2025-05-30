import { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { forwardRef, useImperativeHandle, useRef } from "react";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Radio from "@/components/common/Radio";
import Upload from "@/components/common/Upload";
import Checkbox from "@/components/common/Checkbox";
import NewInput from "@/components/common/NewInput";
import Editor from "@/components/common/Editor";
import useModal from "@/hooks/useModal";
import api from "@/lib/apiClient";

const BrandRegistForm = forwardRef(({ lang, readOnly = false }, ref) => {
  const [categoryList, setCategoryList] = useState([]);
  const [keywordList, setKeywordList] = useState([]);
  const methods = useForm({
    mode: "onChange",
  });
  const { control, register, setValue, watch, getValues } = methods;

  const editorRef = useRef();
  const { showModal } = useModal();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get("/api/v1/brand/category");
        setCategoryList(res.data?.data || []);
        // console.log("카테고리 목록:", res.data?.data);
      } catch (err) {
        console.error("카테고리 목록 불러오기 실패:", err);
      }
    };
    fetchCategory();

    const fetchKeyword = async () => {
      try {
        const res = await api.get("/api/v1/brand/keyword");
        setKeywordList(res.data?.data || []);
        // console.log("키워드 목록:", res.data?.data);
      } catch (err) {
        console.error("키워드 목록 불러오기 실패:", err);
      }
    };
    fetchKeyword();
  }, []);

  useImperativeHandle(ref, () => ({
    submit: async (onError) => {
      const values = getValues();
      const content = await editorRef.current?.getContent?.();

      console.log("[submit] 수집된 값:", values);
      console.log("[submit] 에디터 내용:", content);
      console.log("폼 값:", values);
      console.log("에디터 내용:", content);

      if (!values.brandName?.trim()) {
        onError?.("브랜드명을 입력해주세요.");
        return null;
      }
      if (!values.office) {
        onError?.("카테고리를 선택해주세요.");
        return null;
      }
      if (!values.mainImage || !values.mainImage.path) {
        onError?.("리스트 이미지를 등록해주세요.");
        return null;
      }
      if (!values.thumbText?.trim()) {
        onError?.("리스트 Hover 텍스트를 입력해주세요.");
        return null;
      }
      if (!values.pcImage || !values.pcImage.path) {
        onError?.("PC 상세 KV 이미지를 등록해주세요.");
        return null;
      }
      if (!values.moImage || !values.moImage.path) {
        onError?.("MO 상세 KV 이미지를 등록해주세요.");
        return null;
      }
      if (!content || content.replace(/<[^>]+>/g, "").trim() === "") {
        onError?.("메인 내용을 입력해주세요.");
        return null;
      }
      for (let i = 1; i <= 5; i++) {
        const img = values[`contentImage${i}`];
        if (!img || !img.path) {
          onError?.(`본문 이미지 ${i}를/을 등록해주세요.`);
          return null;
        }
      }
      const openingDays = ["월", "화", "수", "목", "금", "토", "일"];
      let hasOpeningHours = false;
      for (const day of openingDays) {
        const time = values.openingHours?.[day]?.time;
        const holiday = values.openingHours?.[day]?.holiday;
        if (holiday !== true && time?.trim()) {
          hasOpeningHours = true;
          break;
        }
      }

      if (!hasOpeningHours) {
        onError?.("운영시간을 1일 이상 입력해주세요.");
        return null;
      }

      if (!values.storeLocation?.trim()) {
        onError?.("매장 위치를 입력해주세요.");
        return null;
      }
      // 이미지 메타데이터 변환 함수
      const toImageMeta = (file) => {
        if (!file || !file.name || !file.path) {
          console.warn("이미지 path 누락:", file);
          return null;
        }

        return {
          id: file.id ?? null,
          originalName: file.originalName || file.name,
          name: file.name,
          size: file.size,
          extension: "." + (file.originalName || file.name).split(".").pop(),
          mime: file.type || "image/png",
          classification: "brand",
          path: file.path,
          status: file.status ?? "C",
        };
      };

      return {
        ...values,
        description: content,
        mainImage: toImageMeta(values.mainImage),
        pcImage: toImageMeta(values.pcImage),
        moImage: toImageMeta(values.moImage),
        contentImage1: toImageMeta(values.contentImage1),
        contentImage2: toImageMeta(values.contentImage2),
        contentImage3: toImageMeta(values.contentImage3),
        contentImage4: toImageMeta(values.contentImage4),
        contentImage5: toImageMeta(values.contentImage5),
      };
    },
    setValue,
  }));

  return (
    <FormProvider {...methods}>
      <form className="space-y-6 p-6">
        {/* 브랜드명 + 사용 여부 */}
        <div className="flex items-end gap-8">
          {/* 브랜드명 입력 필드 */}
          <div className="w-1/2 min-w-[250px]">
            <Input
              label="브랜드명"
              maxLength={50}
              showDefaultInfo
              required
              {...register("brandName", { required: true })}
              disabled={readOnly}
            />
          </div>

          {/* 사용 여부 라디오 그룹 */}
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium">사용 여부</p>
            <Radio
              name="useStatus"
              value="active"
              label="사용"
              disabled={readOnly}
              checked={watch("useStatus") === "active"}
              onChange={() => setValue("useStatus", "active")}
            />
            <Radio
              name="useStatus"
              value="inactive"
              label="미사용"
              disabled={readOnly}
              checked={watch("useStatus") !== "active"}
              onChange={() => setValue("useStatus", "inactive")}
            />
          </div>
        </div>

        {/* 카테고리 */}
        <Controller
          name="office"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select label="카테고리" required {...field} disabled={readOnly}>
              <option value="">선택</option>
              {categoryList.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.value}
                </option>
              ))}
            </Select>
          )}
        />
        <div>
          <p className="mb-2 text-sm font-medium">검색 키워드</p>
          <Controller
            name="keywordList"
            control={control}
            defaultValue={[]}
            render={({ field }) => {
              const handleToggle = (keyword) => {
                const existing = field.value.find((item) => item.id === keyword.id);
                let newValue;

                if (existing) {
                  // delYn 토글
                  newValue = field.value.map((item) =>
                    item.id === keyword.id
                      ? { ...item, delYn: item.delYn === 'N' ? 'Y' : 'N' }
                      : item
                  );
                } else {
                  // 새 항목 추가
                  newValue = [...field.value, { keyword: keyword.code, delYn: 'N' }];
                }

                field.onChange(newValue);
              };

              const isChecked = (index) => {
                const id = index + 1;
                const item = field.value.find((item) => item.id === id);
                return item?.delYn === 'N';
              };

              return (
                <div className="flex flex-wrap gap-4">
                  {keywordList.map((keyword, index) => (
                    <Checkbox
                      key={keyword.code}
                      label={keyword.value}
                      checked={isChecked(index)}
                      onChange={() => handleToggle(keyword, index)}
                      disabled={readOnly}
                    />
                  ))}
                </div>
              );
            }}
          />
        </div>

        <Upload
          name="mainImage"
          label="리스트 이미지"
          required
          classification="brand"
          preview
          readOnly={readOnly}
        />
        <Input
          label="리스트 Hover 텍스트"
          maxLength={200}
          showDefaultInfo
          required
          {...register("thumbText", { required: true })}
          disabled={readOnly}
        />
        {/* <Input
          label="대타이틀"
          maxLength={50}
          showDefaultInfo
          required
          {...register("title", { required: true })}
          disabled={readOnly}
        />
        <Input
          label="서브타이틀"
          maxLength={500}
          showDefaultInfo
          required
          {...register("subTitle", { required: true })}
          disabled={readOnly}
        /> */}

        {/* 이미지 업로드 */}
        <Upload
          name="pcImage"
          label="PC 상세 KV 이미지"
          required
          classification="brand"
          readOnly={readOnly}
        />
        <Upload
          name="moImage"
          label="MO 상세 KV 이미지"
          required
          classification="brand"
          readOnly={readOnly}
        />

        {/* 에디터 */}
        <p className="text-sm font-medium">
          메인 내용<span className="text-red-500">*</span>
        </p>

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Editor
              ref={editorRef}
              readOnly={readOnly}
              initialContent={field.value}
              // initialContent={existingBrandData?.description} // HTML 형태의 string
            />
          )}
        />

        <Upload
          name="contentImage1"
          label="본문 이미지 1"
          required
          classification="brand"
          readOnly={readOnly}
        />
        <Upload
          name="contentImage2"
          label="본문 이미지 2"
          required
          classification="brand"
          readOnly={readOnly}
        />
        <Upload
          name="contentImage3"
          label="본문 이미지 3"
          required
          classification="brand"
          readOnly={readOnly}
        />
        <Upload
          name="contentImage4"
          label="본문 이미지 4"
          required
          classification="brand"
          readOnly={readOnly}
        />
        <Upload
          name="contentImage5"
          label="본문 이미지 5"
          required
          classification="brand"
          readOnly={readOnly}
        />

        {/* 홈페이지 URL */}
        <div className="flex items-center gap-4">
          <NewInput
            label="홈페이지 URL"
            disabled={readOnly}
            {...register("homepageUrl")}
            width="w-[550px]"
          />
        </div>

        {/* SNS URL */}
        <div className="w-[800px] space-y-3 rounded-md border border-black p-4">
          <p className="text-sm font-medium">SNS URL</p>
          {["instagram", "facebook", "youtube", "twitter", "blog"].map(
            (sns) => (
              <div key={sns} className="flex items-center gap-4">
                <NewInput
                  label={sns === "twitter" ? "X(twitter)" : sns}
                  disabled={readOnly}
                  {...register(`sns.${sns}.url`)}
                  width="w-[500px]"
                />
              </div>
            )
          )}
        </div>

        {/* 운영시간 */}
        <div className="w-[800px] space-y-3 rounded-md border border-black p-4">
          <p className="text-sm font-medium">
            운영시간<span className="text-red-500">*</span>
          </p>
          {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
            <div key={day} className="flex items-center gap-6">
              <NewInput
                label={day}
                {...register(`openingHours.${day}.time`)}
                width="w-[280px]"
                disabled={readOnly}
              />
              <Controller
                name={`openingHours.${day}.holiday`}
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="휴일"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={readOnly}
                  />
                )}
              />
            </div>
          ))}
          {/* 휴식시간 */}
          <div className="flex items-center gap-6">
            <NewInput
              label="휴식시간"
              {...register("openingHours.breakTime.time")}
              width="w-[280px]"
              disabled={readOnly}
            />
            <Controller
              name="openingHours.breakTime.none"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="없음"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        </div>

        <Input
          label="매장 전화번호"
          {...register("storePhone")}
          disabled={readOnly}
        />
        <Input
          label="매장 위치"
          required
          disabled={readOnly}
          {...register("storeLocation", { required: true })}
        />
      </form>
    </FormProvider>
  );
});

export default BrandRegistForm;
