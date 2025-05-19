import Button from "@/components/common/Button";
import Upload from "@/components/common/Upload";
import FormInput from "@/components/form/FormInput";
import FormRadioGroup from "@/components/form/FormRadioGroup";
import Box from "@/components/layout/Box";
import Col from "@/components/layout/Col";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import { useEffect, useId } from "react";
import { FormProvider, useForm } from "react-hook-form";

export default function BannerForm({ data, setData }) {
  const titleId = useId();
  const subtitleId = useId();
  const urlId = useId();

  const methods = useForm({
    defaultValues: {
      banner: {
        displayYn: "Y",
        title: "",
        subtitle: "",
        image: { name: "", url: "", size: 0 },
        button: "",
        bg: "",
        color: "",
        url: "",
      },
    },
  });

  const { reset, resetField, register, handleSubmit } = methods;

  useEffect(() => {
    reset({ banner: data });
  }, [data, reset]);

  const onSubmit = (formValues) => {
    setData(formValues.banner); // 상위로 전달
  };

  return (
    <FormProvider {...methods}>
      {/* 변경 시점에만 실행되도록 onBlur 사용 */}
      <form onBlur={handleSubmit(onSubmit)} className="space-y-8 p-4">
        <Box className="mb-2 rounded-md border-2 border-gray-200">
          <Title title={`■ 띠배너 영역`} />
          <Row className="pb-4">
            <div className="flex w-full gap-8">
              <div className="flex-1">
                <FormRadioGroup
                  name={`banner.bannerNB`}
                  label="배너타입"
                  options={[
                    { label: "기본형", value: "N" },
                    { label: "대형", value: "B" },
                  ]}
                  required
                />
              </div>
              <div className="flex-1">
                <FormRadioGroup
                  name={`banner.displayYn`}
                  label="노출여부"
                  options={[
                    { label: "노출", value: "Y" },
                    { label: "미노출", value: "N" },
                  ]}
                  required
                />
              </div>
            </div>
          </Row>
          <Row className="pb-4">
            <FormInput
              id={titleId}
              label="타이틀"
              fieldName={`banner.title`}
              maxLength={50}
              showDefaultInfo={true}
              required
              placeholder="타이틀을 입력해주세요."
              {...register(`banner.title`)}
              onClear={() => resetField(`banner.title`)}
            />
          </Row>
          <Row className="pb-4">
            <FormInput
              id={subtitleId}
              label="서브타이틀"
              fieldName={`banner.subtitle`}
              maxLength={50}
              showDefaultInfo={true}
              required
              placeholder="서브타이틀을 입력해주세요."
              {...register(`banner.subtitle`)}
              onClear={() => resetField(`banner.subtitle`)}
            />
          </Row>
          <Row className="pb-4">
            <Upload name={`banner.image`} label={`이미지`} />
          </Row>

          <Row className="pb-4">
            <FormInput
              id={urlId}
              label="URL"
              fieldName={`banner.url`}
              maxLength={1000}
              showDefaultInfo={true}
              required
              placeholder="URL을 입력해주세요."
              {...register(`banner.url`)}
              onClear={() => resetField(`banner.url`)}
            />
          </Row>
        </Box>
      </form>
    </FormProvider>
  );
}
