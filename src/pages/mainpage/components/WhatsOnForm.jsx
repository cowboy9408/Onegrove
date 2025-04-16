import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Upload from "@/components/common/Upload";
import FormInput from "@/components/form/FormInput";
import FormRadioGroup from "@/components/form/FormRadioGroup";
import FormTextarea from "@/components/form/FormTextarea";
import Box from "@/components/layout/Box";
import Col from "@/components/layout/Col";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import WhatsOnList from "@/components/modal/WhatsOnList";
import useModal from "@/hooks/useModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  whatson: z.object({
    subtitle: z
      .string()
      .min(1, "서브타이틀은 필수값입니다.")
      .max(200, "서브타이틀은 200자 이내여야 합니다."),
    type: z
      .string()
      .nullable()
      .refine((val) => !!val, {
        message: "강조 콘텐츠 요소를 선택해주세요.",
      }),
    // image: z
    //   .object({
    //     name: z.string(),
    //     url: z.string().url(),
    //     size: z.number(),
    //   })
    //   .nullable()
    //   .refine((val) => !!val?.url, {
    //     message: "파일을 업로드해주세요",
    //   }),
    url: z.string().url("유효한 URL 이 아닙니다."),
    contents: z.array(z.number()),
  }),
});

export default function WhatsOnForm({ data }) {
  const subtitleId = useId();
  const urlId = useId();

  const { showModal } = useModal();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      whatson: {
        subtitle: "",
        type: "image",
        url: "",
        contents: [],
      },
    },
  });

  const {
    register,
    resetField,
    formState: { errors },
    setValue,
    reset,
  } = methods;

  const [contents, setContents] = useState([]);

  useEffect(() => {
    reset({ whatson: data });
  }, [data, reset]);

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8 p-4">
        <Box className="mb-2 rounded-md border-2 border-gray-200">
          <Title title={`■ What\`s On 영역`} />
          <Row className="pb-4">
            <FormTextarea
              id={subtitleId}
              label="서브타이틀"
              placeholder="서브타이틀을 입력해주세요"
              maxLength={200}
              {...register("whatson.subtitle")}
              error={errors.whatson?.subtitle?.message}
            />
          </Row>

          <Row className="pb-4">
            <FormRadioGroup
              name={`whatson.type`}
              label="강조 콘텐츠 요소"
              options={[
                { label: "이미지", value: "image" },
                { label: "영상", value: "video" },
              ]}
              required
              error={errors.whatson?.type?.message}
            />
          </Row>
          <Row className="pb-4">
            <Upload
              name={`whatson.image`}
              label="이미지"
              error={errors.whatson?.image?.message}
            />
          </Row>
          <Row className="pb-4">
            <FormInput
              id={urlId}
              label="URL"
              fieldName={`whatson.url`}
              maxLength={300}
              required
              placeholder="https://www.onegrove.kr"
              {...register(`whatson.url`)}
              error={errors.whatson?.url?.message}
              onClear={() => resetField(`whatson.url`)}
            />
          </Row>
          <Row className="pb-4">
            <Col className="flex-5">
              <Input
                label="콘텐츠 등록"
                readOnly
                required
                value={contents.map((e) => e.title).join(", ")}
              />
              <FormInput
                className="hidden"
                fieldName={`whatson.contents`}
                {...register(`whatson.contents`)}
              />
            </Col>
            <Col className="self-end">
              <Button
                className="h-12 w-full"
                onClick={() =>
                  showModal({
                    title: "콘텐츠 검색",
                    children: ({ closeModal }) => (
                      <WhatsOnList
                        selected={[1, 2]}
                        closeModal={closeModal}
                        onConfirm={(result) => {
                          setContents(result);
                          setValue(
                            "whatson.contents",
                            result.map((e) => e._id)
                          );
                        }}
                      />
                    ),
                    showCancel: true,
                    customButton: true,
                    size: "5xl",
                  })
                }
              >
                관리
              </Button>
            </Col>
          </Row>
        </Box>

        <Row className="justify-end">
          <Button type="submit">저장</Button>
        </Row>
      </form>
    </FormProvider>
  );
}
