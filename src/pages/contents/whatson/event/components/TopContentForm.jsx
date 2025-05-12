import Button from "@/components/common/Button";
import Upload from "@/components/common/Upload";
import FieldGroup from "@/components/form/FieldGroup";
import FormInput from "@/components/form/FormInput";
import FormTextarea from "@/components/form/FormTextarea";
import Box from "@/components/layout/Box";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import { fileSchema } from "@/validation/schemas/fileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const simpleSchema = z.object({
  type: z.literal("simple"),
  image: fileSchema,
  url: z.string().url("유효한 URL 이 아닙니다."),
  category: z
    .string()
    .min(1, "카테고리는 필수값입니다.")
    .max(30, "카테고리는 30자 이내여야 합니다."),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  detail: z.string().optional(),
  button: z.string().optional(),
});

const complexSchema = z.object({
  type: z.literal("complex"),
  image: fileSchema,
  url: z.string().url("유효한 URL 이 아닙니다."),
  category: z
    .string()
    .min(1, "카테고리는 필수값입니다.")
    .max(30, "카테고리는 30자 이내여야 합니다."),
  title: z
    .string()
    .min(1, "타이틀은 필수값입니다.")
    .max(50, "타이틀은 50자 이내여야 합니다."),
  subtitle: z
    .string()
    .min(1, "서브타이틀은 필수값입니다.")
    .max(50, "서브타이틀은 50자 이내여야 합니다."),
  detail: z.string().max(100, "상세내용은 100자 이내여야 합니다.").optional(),
  button: z
    .string()
    .min(1, "버튼명은 필수값입니다.")
    .max(100, "버튼명은 100자 이내여야 합니다."),
});

const schema = z.object({
  etc: z
    .array(z.discriminatedUnion("type", [simpleSchema, complexSchema]))
    .max(5, "최대 5개까지 입력할 수 있습니다."),
});

const MAX_ETC_LENGTH = 5;

export default function TopContentForm({ data, setData }) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      etc: [
        {
          type: "simple",
          image: { name: "", url: "", size: 0 },
          url: "",
          title: "",
          subtitle: "",
          detail: "",
          button: "",
        },
      ],
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
    reset({ etc: data });
  }, [data, reset]);

  const onSubmit = (formValues) => {
    setData(formValues.etc); // 이 줄이 없으면 오류 뜹니다!
  };

  return (
    <FormProvider {...methods}>
      <form onBlur={handleSubmit(onSubmit)} className="space-y-8 p-4">
        <FieldGroup name="etc">
          {({ fields, field, index, append, remove }) => (
            <Box
              key={`${field.id}-${index}`}
              className="mb-2 rounded-md border-2 border-gray-200"
            >
              <Title title={`■ 상단 콘텐츠 영역 ${index + 1}`} />

              <Row className="pb-4">
                <FormInput
                  label="카테고리"
                  fieldName={`etc.${index}.category`}
                  maxLength={30}
                  required
                  placeholder="카테고리를 입력해주세요."
                  {...register(`etc.${index}.category`)}
                  error={errors.etc?.[index]?.category?.message}
                  onClear={() => resetField(`etc.${index}.category`)}
                />
              </Row>
              <Row className="pb-4">
                <FormInput
                  label="타이틀"
                  fieldName={`etc.${index}.title`}
                  required
                  {...register(`etc.${index}.title`)}
                  error={errors.etc?.[index]?.title?.message}
                  onClear={() => resetField(`etc.${index}.title`)}
                  placeholder="타이틀을 입력해주세요."
                />
              </Row>

              {/* 서브타이틀 */}
              <Row className="pb-4">
                <FormInput
                  id={`subtitle-${field.id}`}
                  label="서브타이틀"
                  fieldName={`etc.${index}.subtitle`}
                  maxLength={50}
                  required
                  placeholder="서브타이틀을 입력해주세요."
                  {...register(`etc.${index}.subtitle`)}
                  error={errors.etc?.[index]?.subtitle?.message}
                  onClear={() => resetField(`etc.${index}.subtitle`)}
                />
              </Row>
              {/* 이미지 업로드 */}
              <Row className="pb-4">
                <Upload
                  name={`etc.${index}.image`}
                  label="이미지"
                  error={errors.etc?.[index]?.image?.message}
                />
              </Row>

              {/* 버튼명 */}
              <Row className="pb-4">
                <FormInput
                  id={`button-${field.id}`}
                  label="버튼명"
                  fieldName={`etc.${index}.button`}
                  maxLength={100}
                  required
                  placeholder="버튼명을 입력해주세요."
                  {...register(`etc.${index}.button`)}
                  error={errors.etc?.[index]?.button?.message}
                  onClear={() => resetField(`etc.${index}.button`)}
                />
              </Row>

              {/* URL */}
              <Row className="pb-4">
                <FormInput
                  id={`url-${field.id}`}
                  label="URL"
                  fieldName={`etc.${index}.url`}
                  maxLength={1000}
                  required
                  placeholder="URL을 입력해주세요"
                  {...register(`etc.${index}.url`)}
                  error={errors.etc?.[index]?.url?.message}
                  onClear={() => resetField(`etc.${index}.url`)}
                />
              </Row>

              {/* 추가/삭제 버튼 */}
              <Row className="flex justify-center gap-2">
                {index === fields.length - 1 &&
                  fields.length < MAX_ETC_LENGTH && (
                    <Button
                      type="button"
                      onClick={() =>
                        append({
                          type: "complex",
                          image: { name: "", url: "", size: 0 },
                          url: "",
                          title: "",
                          subtitle: "",
                          detail: "",
                          button: "",
                        })
                      }
                    >
                      추가
                    </Button>
                  )}
                {index > 0 && (
                  <Button
                    type="button"
                    color="red"
                    onClick={() => remove(index)}
                  >
                    삭제
                  </Button>
                )}
              </Row>
            </Box>
          )}
        </FieldGroup>
      </form>
    </FormProvider>
  );
}
