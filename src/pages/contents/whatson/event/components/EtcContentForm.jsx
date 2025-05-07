import Button from "@/components/common/Button";
import Upload from "@/components/common/Upload";
import FieldGroup from "@/components/form/FieldGroup";
import FormInput from "@/components/form/FormInput";
import FormRadioGroup from "@/components/form/FormRadioGroup";
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
  title: z.string().optional(),
  subtitle: z.string().optional(),
  detail: z.string().optional(),
  button: z.string().optional(),
});

const complexSchema = z.object({
  type: z.literal("complex"),
  image: fileSchema,
  url: z.string().url("유효한 URL 이 아닙니다."),
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

export default function EtcContentForm({ data }) {
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
    watch,
  } = methods;

  useEffect(() => {
    reset({ etc: data });
  }, [data, reset]);

  const onSubmit = (data) => {
    console.log(data);
  };
  const onInvalid = (errors) => {
    console.error(errors);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, onInvalid)}
        className="space-y-8 p-4"
      >
        <FieldGroup name="etc">
          {({ fields, field, index, register, append, remove }) => {
            const type = watch(`etc.${index}.type`);

            return (
              <Box key={`${field.id}-${index}`} className="mb-2 rounded-md border-2 border-gray-200">
                <Title title={`■ 연계 콘텐츠 영역 ${index + 1}`} />
                <Row className="pb-4">
                  <FormRadioGroup
                    name={`etc.${index}.type`}
                    label="콘텐츠 형식"
                    options={[
                      { label: "이미지", value: "simple" },
                      { label: "이미지+텍스트", value: "complex" },
                    ]}
                    required
                    error={errors.etc?.[index]?.type?.message}
                  />
                </Row>
                <Row className="pb-4">
                  <Upload
                    name={`etc.${index}.image`}
                    label={`이미지`}
                    error={errors.etc?.[index]?.image?.message}
                  />
                </Row>
                {type == "complex" && (
                  <Row className="pb-4">
                    <FormInput
                      id={`title-${field.id}`}
                      label="타이틀"
                      fieldName={`etc.${index}.title`}
                      maxLength={50}
                      showDefaultInfo={true}
                      required
                      placeholder="타이틀을 입력해주세요."
                      {...register(`etc.${index}.title`)}
                      error={errors.etc?.[index]?.title?.message}
                      onClear={() => resetField(`etc.${index}.title`)}
                    />
                  </Row>
                )}
                {type == "complex" && (
                  <Row className="pb-4">
                    <FormInput
                      id={`subtitle-${field.id}`}
                      label="서브타이틀"
                      fieldName={`etc.${index}.subtitle`}
                      maxLength={50}
                      showDefaultInfo={true}
                      required
                      placeholder="서브타이틀을 입력해주세요."
                      {...register(`etc.${index}.subtitle`)}
                      error={errors.etc?.[index]?.subtitle?.message}
                      onClear={() => resetField(`etc.${index}.subtitle`)}
                    />
                  </Row>
                )}
                {type == "complex" && (
                  <Row className="pb-4">
                    <FormTextarea
                      id={`detail-${field.id}`}
                      label="상세내용"
                      placeholder="상세내용을 입력해주세요"
                      maxLength={100}
                      {...register(`etc.${index}.detail`)}
                      error={errors.etc?.[index]?.detail?.message}
                    />
                  </Row>
                )}
                {type == "complex" && (
                  <Row className="pb-4">
                    <FormInput
                      id={`button-${field.id}`}
                      label="버튼명"
                      fieldName={`etc.${index}.button`}
                      maxLength={100}
                      showDefaultInfo={true}
                      required
                      placeholder="버튼명을 입력해주세요."
                      {...register(`etc.${index}.button`)}
                      error={errors.etc?.[index]?.button?.message}
                      onClear={() => resetField(`etc.${index}.button`)}
                    />
                  </Row>
                )}
                <Row className="pb-4">
                  <FormInput
                    id={`url-${field.id}`}
                    label="URL"
                    fieldName={`etc.${index}.url`}
                    maxLength={1000}
                    showDefaultInfo={true}
                    required
                    placeholder="URL을 입력해주세요"
                    {...register(`etc.${index}.url`)}
                    error={errors.etc?.[index]?.url?.message}
                    onClear={() => resetField(`etc.${index}.url`)}
                  />
                </Row>

                {fields.length == index + 1 && (
                  <Row className="flex justify-center">
                    {index + 1 < MAX_ETC_LENGTH && (
                      <Button
                        onClick={() =>
                          append({
                            type: "simple",
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
                    {index >= 1 && (
                      <Button onClick={() => remove(index)}>삭제</Button>
                    )}
                  </Row>
                )}
              </Box>
            );
          }}
        </FieldGroup>

        <Row className="justify-end">
          <Button type="submit">저장</Button>
        </Row>
      </form>
    </FormProvider>
  );
}
