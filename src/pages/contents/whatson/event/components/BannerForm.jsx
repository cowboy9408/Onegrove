import Button from "@/components/common/Button";
import Upload from "@/components/common/Upload";
import FormInput from "@/components/form/FormInput";
import FormRadioGroup from "@/components/form/FormRadioGroup";
import Box from "@/components/layout/Box";
import Col from "@/components/layout/Col";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import { fileSchema } from "@/validation/schemas/fileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  banner: z.object({
    bannerNB: z
      .string()
      .nullable()
      .refine((val) => !!val, {
        message: "배너 타입을 선택해주세요.",
      }),
    displayYn: z
      .string()
      .nullable()
      .refine((val) => !!val, {
        message: "노출여부를 선택해주세요.",
      }),
    title: z
      .string()
      .min(1, "타이틀은 필수값입니다.")
      .max(50, "타이틀은 50자 이내여야 합니다."),
    subtitle: z.string().max(50, "서브타이틀은 150자 이내여야 합니다."),
    image: fileSchema,
    button: z
      .string()
      .min(1, "버튼명은 필수값입니다.")
      .max(100, "버튼명은 100자 이내여야 합니다."),
    bg: z
      .string()
      .min(1, "버튼배경색은 필수값입니다.")
      .length(6, "버튼배경색은 6자 여야 합니다."),
    color: z
      .string()
      .min(1, "버튼글자색은 필수값입니다.")
      .length(6, "버튼글자색은 6자 여야 합니다."),
    url: z.string().url("유효한 URL 이 아닙니다."),
  }),
});

export default function BannerForm({ data, setData }) {
  const titleId = useId();
  const subtitleId = useId();
  const urlId = useId();

  const methods = useForm({
    resolver: zodResolver(schema),
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

  const {
    formState: { errors },
    reset,
    resetField,
    register,
    handleSubmit,
  } = methods;

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
                  error={errors.banner?.type?.message}
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
                  error={errors.banner?.displayYn?.message}
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
              error={errors.banner?.title?.message}
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
              error={errors.banner?.subtitle?.message}
              onClear={() => resetField(`banner.subtitle`)}
            />
          </Row>
          <Row className="pb-4">
            <Upload
              name={`banner.image`}
              label={`이미지`}
              error={errors.banner?.image?.message}
            />
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
              error={errors.banner?.url?.message}
              onClear={() => resetField(`banner.url`)}
            />
          </Row>
        </Box>
      </form>
    </FormProvider>
  );
}
