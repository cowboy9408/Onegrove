import Button from "@/components/common/Button";
import Upload from "@/components/common/Upload";
import FieldGroup from "@/components/form/FieldGroup";
import FormTextarea from "@/components/form/FormTextarea";
import Box from "@/components/layout/Box";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import { fileSchema } from "@/validation/schemas/fileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useEffect, useId } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  work: z.object({
    subtitle1: z
      .string()
      .min(1, "서브타이틀은 필수값입니다.")
      .max(50, "서브타이틀은 50자 이내여야 합니다."),
    subtitle2: z.string().max(50, "서브타이틀은 150자 이내여야 합니다."),
    file: z
      .array(fileSchema)
      .min(3, "이미지는 최소 3개를 등록해야 합니다.")
      .refine(
        (files) => {
          return files
            .slice(0, 3)
            .every(
              (file) => file.name && file.url && typeof file.size === "number"
            );
        },
        {
          message: "최소 3개의 이미지 정보는 필수입니다.",
          path: ["file"],
        }
      ),
  }),
});

const MAX_WORK_IMAGE_LENGTH = 10;

export default function WorkForm({ data }) {
  const subtitleId1 = useId();
  const subtitleId2 = useId();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      work: {
        subtitle1: "",
        subtitle2: "",
        file: [
          { name: "", url: "", size: 0 },
          { name: "", url: "", size: 0 },
          { name: "", url: "", size: 0 },
        ],
      },
    },
  });

  const {
    register,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    reset({ work: data });
  }, [data, reset]);

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8 p-4">
      <Box key={`${field.id}-${index}`} className="mb-2 rounded-md border-2 border-gray-200">
          <Title title={`■ Work 영역`} />
          <Row className="pb-4">
            <FormTextarea
              id={subtitleId1}
              label="서브타이틀1"
              required
              placeholder="서브타이틀을 입력해주세요"
              maxLength={100}
              {...register("work.subtitle1")}
              error={errors.work?.subtitle1?.message}
            />
          </Row>
          <Row className="pb-4">
            <FormTextarea
              id={subtitleId2}
              label="서브타이틀2"
              placeholder="서브타이틀을 입력해주세요"
              maxLength={150}
              {...register("work.subtitle2")}
              error={errors.work?.subtitle2?.message}
            />
          </Row>

          <FieldGroup name="work.file">
            {({ fields, index, append, remove }) => {
              return (
                <>
                  <Row className="pb-4">
                    <Upload
                      name={`work.file.${index}`}
                      label={`이미지 ${index + 1}`}
                      error={errors.work?.file?.[index]?.message}
                    />
                  </Row>
                  {fields.length == index + 1 && errors.work?.file?.message && (
                    <span className="mt-1 mb-4 flex items-center gap-1 pl-1 text-xs text-red-500">
                      <Info size={14} />
                      {errors.work?.file?.message}
                    </span>
                  )}
                  {fields.length == index + 1 && (
                    <Row className="flex justify-center">
                      {index + 1 < MAX_WORK_IMAGE_LENGTH && (
                        <Button onClick={() => append({ type: "image" })}>
                          추가
                        </Button>
                      )}
                      {index >= 3 && (
                        <Button onClick={() => remove(index)}>삭제</Button>
                      )}
                    </Row>
                  )}
                </>
              );
            }}
          </FieldGroup>
        </Box>

        <Row className="justify-end">
          <Button type="submit">저장</Button>
        </Row>
      </form>
    </FormProvider>
  );
}
