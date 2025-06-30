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
        videoType: "file",
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
    watch,
    formState: { errors },
  } = methods;

  const type = watch("whatson.type");
  const videoType = watch("whatson.videoType");
  const isVideo = data.contentType === "V";
  const isEmbed = isVideo && data.embeded && data.embeded !== "";

  useEffect(() => {
    if (data) {
      reset({
        whatson: {
          subtitle: data.subTitle || "",
          type: isVideo ? "video" : "image",
          videoType: isVideo ? (isEmbed ? "embed" : "file") : undefined,
          url: isEmbed ? data.embeded : data.url || "",
          image: data.file || null,
        },
      });
    }
  }, [data, reset]);

  useEffect(() => {
    if (type === "video" && !videoType) {
      methods.setValue("whatson.videoType", "file");
    }
  }, [type, videoType, methods]);

  useEffect(() => {
    if (type === "image") {
      methods.setValue("whatson.url", data?.url || "");
    } else if (type === "video") {
      if (videoType === "file") {
        methods.setValue("whatson.url", data?.url || "");
      } else if (videoType === "embed") {
        methods.setValue("whatson.url", data?.embeded || "");
      }
    }
  }, [type, videoType]);

  useImperativeHandle(ref, () => ({
    submit: async (onError) => {
      const value = getValues("whatson");

      const hadFileBefore = !!data?.file?.path;
      const hasFileNow =
        !!value?.image &&
        (value?.image instanceof File ||
          !!value?.image?.path ||
          !!value?.image?.name);

      const isImage = value.type === "image";

      const isDeleted = hadFileBefore && !hasFileNow;

      const isVideoEmbed =
        value.type === "video" && value.videoType === "embed";
      const isVideoFile = value.type === "video" && value.videoType === "file";

      if (
        !value.subtitle ||
        ((isImage || isVideoEmbed) && !value.url) ||
        ((isImage || isVideoFile) && !hasFileNow)
      ) {
        return onError?.("필수 항목을 확인해주세요.");
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
          file:
            value.type === "video" && value.videoType === "embed"
              ? null
              : isDeleted
                ? null
                : value.image,
          url:
            value.type === "video" && value.videoType === "embed"
              ? ""
              : value.url,

          embeded:
            value.type === "video" && value.videoType === "embed"
              ? value.url
              : "",
          delYn: isDeleted ? "Y" : null,
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
              showDefaultInfo
              {...register("whatson.subtitle")}
              error={errors.whatson?.subtitle?.message}
              required
            />
          </Row>

          <Row className="pb-4">
            <FormRadioGroup
              name={`whatson.type`}
              label="강조 콘텐츠 요소"
              options={[
                { label: "이미지", value: "image" },
                // { label: "영상", value: "video" },
              ]}
              error={errors.whatson?.type?.message}
            />
          </Row>
          {type === "image" && (
            <>
              <Row className="pb-4">
                <Upload
                  name={`whatson.image`}
                  label="이미지"
                  error={errors.whatson?.image?.message}
                  required
                />
              </Row>
              <Row className="pb-4">
                <FormInput
                  id={urlId}
                  label="URL"
                  fieldName={`whatson.url`}
                  maxLength={300}
                  required
                  placeholder="이미지 클릭 시 이동되는 URL 입력해주세요."
                  {...register(`whatson.url`)}
                  error={errors.whatson?.url?.message}
                  onClear={() => resetField(`whatson.url`)}
                />
              </Row>
            </>
          )}
          {type === "video" && (
            <>
              <Row className="pb-4">
                <FormRadioGroup
                  name={`whatson.videoType`}
                  label="영상 형식"
                  options={[
                    { label: "영상 업로드", value: "file" },
                    { label: "YouTube 임베드", value: "embed" },
                  ]}
                  error={errors.whatson?.videoType?.message}
                />
              </Row>

              {/* {videoType === "file" && (
                <Row className="pb-4">
                  <Upload
                    name={`whatson.image`}
                    label="영상 파일"
                    error={errors.whatson?.image?.message}
                    required
                  />
                </Row>
              )} */}

              {videoType === "embed" && (
                <Row className="pb-4">
                  <FormInput
                    id={urlId}
                    label="YouTube URL"
                    fieldName={`whatson.url`}
                    maxLength={300}
                    required
                    placeholder="임베드용 url로 입력 (유튜브 공유 > 퍼가기 >src의 'https://' 부터 url값 전체 복사 후 붙여넣기)"
                    {...register(`whatson.url`)}
                    error={errors.whatson?.url?.message}
                    onClear={() => resetField(`whatson.url`)}
                  />
                </Row>
              )}
            </>
          )}
        </Box>
      </form>
    </FormProvider>
  );
});

export default WhatsOnForm;
