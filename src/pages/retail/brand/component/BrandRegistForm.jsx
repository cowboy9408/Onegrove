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
        console.log("키워드 목록:", res.data?.data);
      } catch (err) {
        console.error("키워드 목록 불러오기 실패:", err);
      }
    };
    // fetchKeyword();
  }, []);

  const validateRequiredFields = () => {
    return null;
  };

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const values = getValues();
      const content = await editorRef.current?.getContent?.();

      console.log("[submit] 수집된 값:", values);
      console.log("[submit] 에디터 내용:", content);
      console.log("폼 값:", values);
      console.log("에디터 내용:", content);

      const message = validateRequiredFields(values, content);
      if (message) {
        return null;
      }

      // 이미지 메타데이터 변환 함수
      const toImageMeta = (file) => {
        console.log("toImageMeta file:", file);
        if (!file || !file.name) return null;

        return {
          originalName: file.originalName || file.name,
          name: file.name,
          size: file.size,
          extension: "." + (file.originalName || file.name).split(".").pop(),
          mime: file.type || "image/png",
          classification: file.classification ?? "brand",
          path: file.path,
          // status: file.status ?? "R",
          status: null,
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
              checked={watch("useStatus") === "inactive"}
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
            name="keywords"
            control={control}
            defaultValue={[]}
            render={({ field }) => {
              const handleToggle = (value) => {
                const newValue = field.value.includes(value)
                  ? field.value.filter((v) => v !== value)
                  : [...field.value, value];
                field.onChange(newValue);
              };

              const options = [
                {
                  code: "key0101",
                  value: "Man",
                },
                {
                  code: "key0102",
                  value: "Woman",
                },
                {
                  code: "key0103",
                  value: "Lifewear",
                },
                {
                  code: "key0104",
                  value: "Street Fashion",
                },
                {
                  code: "key0105",
                  value: "Sportswear",
                },
                {
                  code: "key0106",
                  value: "SPA",
                },
                {
                  code: "key0107",
                  value: "Luxury",
                },
                {
                  code: "key0108",
                  value: "Kids",
                },
                {
                  code: "key0109",
                  value: "Beauty",
                },
              ];

              return (
                <div className="flex flex-wrap gap-4">
                  {options.map((keyword) => (
                    <Checkbox
                      key={keyword.code}
                      label={keyword.value}
                      checked={field.value.includes(keyword.code)}
                      onChange={() => handleToggle(keyword.code)}
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
          label="썸네일 이미지"
          required
          preview
          readOnly={readOnly}
        />
        <Input
          label="썸네일 텍스트"
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
          label="PC 본문 이미지"
          required
          readOnly={readOnly}
        />
        <Upload
          name="moImage"
          label="MO 본문 이미지"
          required
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
          readOnly={readOnly}
        />
        <Upload
          name="contentImage2"
          label="본문 이미지 2"
          required
          readOnly={readOnly}
        />
        <Upload
          name="contentImage3"
          label="본문 이미지 3"
          required
          readOnly={readOnly}
        />
        <Upload
          name="contentImage4"
          label="본문 이미지 4"
          required
          readOnly={readOnly}
        />
        <Upload
          name="contentImage5"
          label="본문 이미지 5"
          required
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
          <Controller
            name="homepageNewTab"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="새 창"
                disabled={readOnly}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
        </div>

        {/* SNS URL */}
        <div className="w-[800px] space-y-3 rounded-md border border-black p-4">
          <p className="text-sm font-medium">SNS URL</p>
          {["instagram", "facebook", "youtube", "twitter"].map((sns) => (
            <div key={sns} className="flex items-center gap-4">
              <NewInput
                label={sns}
                disabled={readOnly}
                {...register(`sns.${sns}.url`)}
                width="w-[500px]"
              />
              <Controller
                name={`sns.${sns}.newWindow`}
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="새 창"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={readOnly}
                  />
                )}
              />
            </div>
          ))}
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
