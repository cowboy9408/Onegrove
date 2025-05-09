import {  useForm,  FormProvider, Controller, } from "react-hook-form";
  import { forwardRef, useImperativeHandle, useRef } from "react";
  import Input from "@/components/common/Input";
  import Select from "@/components/common/Select";
  import Radio from "@/components/common/Radio";
  import Upload from "@/components/common/Upload";
  import Checkbox from "@/components/common/Checkbox";
  import NewInput from "@/components/common/NewInput";
  import Editor from "@/components/common/Editor";
  import api from "@/lib/apiClient";
  
  const BrandRegistForm = forwardRef(({ lang }, ref) => {
    const methods = useForm();
    const { control, register, setValue, watch, trigger, getValues } = methods;
    const editorRef = useRef();
  
    useImperativeHandle(ref, () => ({
      submit: async () => {
        const valid = await trigger();
        if (!valid) return null;
        const values = getValues();
        const content = await editorRef.current?.getContent?.();
        return { ...values, description: content };
      },
    }));
  
    return (
      <FormProvider {...methods}>
        <form className="space-y-6 p-6">
          {/* 브랜드명 + 사용 여부 */}
          <div className="flex items-end gap-8">
  {/* 브랜드명 입력 필드 */}
  <div className="w-1/2 min-w-[250px]">
    <Input label="브랜드명" {...register("companyName", { required: true })} />
  </div>

  {/* 사용 여부 라디오 그룹 */}
  <div className="flex items-center gap-4">
    <p className="text-sm font-medium">사용 여부</p>
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
</div>
  
          {/* 카테고리 */}
          <Controller
  name="office"
  control={control}
  rules={{ required: true }}
  render={({ field }) => (
    <Select label="카테고리" {...field}>
      <option value="">선택</option>
      <option value="office1">카테고리1</option>
      <option value="office2">카테고리2</option>
      <option value="office3">카테고리3</option>
      <option value="office4">카테고리4</option>
    </Select>
  )}
/>
<div>
  <p className="text-sm font-medium mb-2">검색 키워드</p>
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
        "man", "woman", "lifewear", "street",
        "fashion", "sportswear", "spa", "luxury",
        "kids", "beauty"
      ];

      return (
        <div className="flex flex-wrap gap-4">
          {options.map((keyword) => (
            <Checkbox
              key={keyword}
              label={keyword}
              checked={field.value.includes(keyword)}
              onChange={() => handleToggle(keyword)}
            />
          ))}
        </div>
      );
    }}
  />
</div>
  
          <Upload name="mainImage" label="썸네일 이미지" preview />
          <Input label="썸네일 텍스트" {...register("ceoName", { required: true })} />
          <Input label="대타이틀" {...register("phone", { required: true })} />
          <Input label="서브타이틀" {...register("subtitle", { required: true })} />
  
          {/* 이미지 업로드 */}
          <Upload name="pcImage" label="PC 본문 이미지" />
          <Upload name="moImage" label="MO 본문 이미지" />
  
          {/* 에디터 */}
          <p className="text-sm font-medium">메인 내용</p>
          <Editor ref={editorRef} />
  
          <Upload name="contentImage1" label="본문 이미지 1" />
          <Upload name="contentImage2" label="본문 이미지 2" />
          <Upload name="contentImage3" label="본문 이미지 3" />
          <Upload name="contentImage4" label="본문 이미지 4" />
          <Upload name="contentImage5" label="본문 이미지 5" />
          <Upload name="pcBodyImage" label="PC 본문 이미지" />
          <Upload name="moBodyImage" label="MO 본문 이미지" />
  
          {/* 홈페이지 URL */}
          <div className="flex items-center gap-4">
            <NewInput
              label="홈페이지 URL"
              {...register("homepageUrl")}
              width="w-[550px]"
            />
            <Controller
              name="homepageNewTab"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="새 창"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          </div>
  
          {/* SNS URL */}
          <p className="text-sm font-medium">SNS URL</p>
          {["instagram", "facebook", "youtube", "twitter"].map((sns) => (
            <div key={sns} className="flex items-center gap-4">
              <NewInput
                label={sns}
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
                  />
                )}
              />
            </div>
          ))}
  
          {/* 운영시간 */}
          <p className="text-sm font-medium">운영시간</p>
          {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
            <div key={day} className="flex items-center gap-6">
              <NewInput
                label={day}
                {...register(`openingHours.${day}.time`)}
                width="w-[280px]"
              />
              <Controller
                name={`openingHours.${day}.holiday`}
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="휴일"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
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
            />
            <Controller
              name="openingHours.breakTime.none"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="없음"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          </div>
  
          <Input label="매장 전화번호" {...register("storePhone")} />
          <Input label="매장 위치" {...register("storeLocation", { required: true })} />
        </form>
      </FormProvider>
    );
  });
  
  export default BrandRegistForm;
  