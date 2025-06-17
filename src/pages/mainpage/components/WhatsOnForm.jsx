import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Upload from "@/components/common/Upload";
import FormInput from "@/components/form/FormInput";
import FormRadioGroup from "@/components/form/FormRadioGroup";
import FormTextarea from "@/components/form/FormTextarea";
import Box from "@/components/layout/Box";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import { FormProvider, useForm } from "react-hook-form";
import { forwardRef, useImperativeHandle, useId, useEffect } from "react";

const WhatsOnForm = forwardRef(({ data, mainId = null, lang = "KO" }, ref) => {
  const subtitleId = useId();
  const urlId = useId();

  const methods = useForm({
    defaultValues: {
      whatson: {
        subtitle: "",
        type: "image",
        url: "",
        image: null,
      },
    },
  });

  const {
    register,
    resetField,
    getValues,
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (data) {
      reset({
        whatson: {
          subtitle: data.subTitle || "",
          type: data.contentType === "V" ? "video" : "image",
          url: data.url || "",
          image: data.file || null,
        },
      });
    }
  }, [data, reset]);

  useImperativeHandle(ref, () => ({
    submit: async (onError) => {
      const value = getValues("whatson");

      const hadFileBefore = !!data?.file?.path;
      const hasFileNow = !!value?.image?.path;

      const isDeleted = hadFileBefore && !hasFileNow;

      if (!value.subtitle || !value.url || (!hasFileNow && !isDeleted)) {
        return onError?.("필수 값이 누락되었습니다.");
      }

      return {
        currentUser: 1,
        ...(mainId ? { mainId } : {}),
        lang: lang.toUpperCase(),
        mainWhat: {
          currentUser: 1,
          ...(mainId ? { mainId } : {}),
          id: data?.id ?? null,
          subTitle: value.subtitle,
          contentType: value.type === "image" ? "I" : "V",
          file: isDeleted ? null : value.image,
          url: value.url,
          delYn: isDeleted ? "Y" : null,
          embeded: value.type === "video" ? value.embeded || "" : "",
        },
      };
    },
  }));

  return (
    <FormProvider {...methods}>
      <form className="space-y-8 p-4">
        <Box className="mb-2 rounded-md border-2 border-gray-200">
          <Title title={`■ What's On 영역`} />
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
        </Box>
      </form>
    </FormProvider>
  );
});

export default WhatsOnForm;
