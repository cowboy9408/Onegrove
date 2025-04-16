import Button from "@/components/common/Button";
import Upload from "@/components/common/Upload";
import FieldGroup from "@/components/form/FieldGroup";
import FormInput from "@/components/form/FormInput";
import FormRadioGroup from "@/components/form/FormRadioGroup";
import Box from "@/components/layout/Box";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  kv: z
    .array(
      z.object({
        type: z
          .string()
          .nullable()
          .refine((val) => !!val, {
            message: "콘텐츠 형식을 선택해주세요.",
          }),
        // file: z
        //   .object({
        //     name: z.string(),
        //     url: z.string().url(),
        //     size: z.number(),
        //   })
        //   .nullable()
        //   .refine((val) => !!val?.url, {
        //     message: "파일을 업로드해주세요",
        //   }),
        title: z
          .string()
          .min(1, "타이틀은 필수값입니다.")
          .max(50, "타이틀은 50자 이내여야 합니다."),
        subtitle: z
          .string()
          .min(1, "서브타이틀은 필수값입니다.")
          .max(100, "서브타이틀은 100자 이내여야 합니다."),
      })
    )
    .min(1, "최소 1개는 입력해야 합니다")
    .max(4, "최대 4개까지만 입력 가능합니다"),
});

const MAX_KV_LENGTH = 4;

export default function KeyVisualForm({ data }) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      kv: [{ type: "image", title: "", subtitle: "" }],
    },
  });

  const {
    resetField,
    formState: { errors },
    reset,
  } = methods;

  const onSubmit = (data) => {
    console.log(data);
  };

  useEffect(() => {
    reset({ kv: data });
  }, [data, reset]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8 p-4">
        <FieldGroup name="kv">
          {({ fields, field, index, register, append, remove }) => {
            const idTitle = `title-${field.id}`;
            const idSubtitle = `subtitle-${field.id}`;

            return (
              <Box className="mb-2 rounded-md border-2 border-gray-200">
                <Title title={`■ Key Visual 이미지 ${index + 1}`} />
                <Row className="pb-4">
                  <FormRadioGroup
                    name={`kv.${index}.type`}
                    label="콘텐츠 형식"
                    options={[
                      { label: "이미지", value: "image" },
                      { label: "영상", value: "video" },
                    ]}
                    required
                    error={errors.kv?.[index]?.type?.message}
                  />
                </Row>
                <Row className="pb-4">
                  <Upload
                    name={`kv.${index}.file`}
                    label="파일"
                    acceptWith={`kv.${index}.type`}
                    error={errors.kv?.[index]?.file?.message}
                  />
                </Row>
                <Row className="pb-4">
                  <FormInput
                    id={idTitle}
                    label="타이틀"
                    fieldName={`kv.${index}.title`}
                    maxLength={50}
                    showDefaultInfo={true}
                    required
                    placeholder="타이틀을 입력해주세요"
                    {...register(`kv.${index}.title`)}
                    error={errors.kv?.[index]?.title?.message}
                    onClear={() => resetField(`kv.${index}.title`)}
                  />
                </Row>
                <Row className="pb-4">
                  <FormInput
                    id={idSubtitle}
                    label="서브타이틀"
                    fieldName={`kv.${index}.subtitle`}
                    maxLength={100}
                    showDefaultInfo={true}
                    required
                    placeholder="서브타이틀을 입력해주세요."
                    {...register(`kv.${index}.subtitle`)}
                    error={errors.kv?.[index]?.subtitle?.message}
                    onClear={() => resetField(`kv.${index}.subtitle`)}
                  />
                </Row>
                {fields.length == index + 1 && (
                  <Row className="flex justify-center">
                    {index < MAX_KV_LENGTH && (
                      <Button onClick={() => append({ type: "image" })}>
                        추가
                      </Button>
                    )}
                    <Button onClick={() => remove(index)}>삭제</Button>
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
