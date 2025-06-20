import Button from "@/components/common/Button";
import Upload from "@/components/common/Upload";
import FieldGroup from "@/components/form/FieldGroup";
import FormTextarea from "@/components/form/FormTextarea";
import Box from "@/components/layout/Box";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import { Info } from "lucide-react";
import { useEffect, useId, useImperativeHandle, forwardRef } from "react";
import { FormProvider, useForm } from "react-hook-form";

const MAX_WORK_IMAGE_LENGTH = 10;

const WorkForm = forwardRef(
  ({ data = {}, lang = "KO", mainId = null }, ref) => {
    const subtitleId1 = useId();
    const subtitleId2 = useId();

    const methods = useForm({
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
      getValues,
    } = methods;

    useEffect(() => {
      reset({
        work: {
          subtitle1: data?.subTitle1 || "",
          subtitle2: data?.subTitle2 || "",
          id: data?.id ?? null,
          file: Array.from(
            { length: Math.max(data?.file?.length || 0, 3) },
            (_, i) => data?.file?.[i] || { name: "", url: "", size: 0 }
          ),
        },
      });
    }, [data, reset]);

    useImperativeHandle(ref, () => ({
      submit: async (onError) => {
        const values = getValues();
        const work = values.work || {};
        const fileList = work.file || [];

        const hasValidImage = fileList.some(
          (img) => !img?.isDeleted && img?.path
        );
        if (!work.subtitle1 || !hasValidImage) {
          return onError?.("필수 항목을 확인해주세요.");
        }

        // 1. 기존 이미지 ID 목록
        const previousIds = (data?.file || [])
          .map((item) => item.id)
          .filter(Boolean);

        // 2. 현재 유효한 이미지
        const currentImages = fileList.filter(
          (img) => !img?.isDeleted && img?.path
        );
        const currentIds = currentImages.map((img) => img.id).filter(Boolean);

        // 3. 삭제된 이미지 ID 추출
        const deletedIds = previousIds.filter((id) => !currentIds.includes(id));

        // 4. 최종 workImgList 생성
        const workImgList = [
          ...currentImages.map((img, index) => ({
            currentUser: 1,
            mainWorkId: data?.id ?? null,
            id: img?.id ?? null,
            sort: index + 1,
            delYn: null,
            img: {
              id: img?.fileId ?? img?.id ?? null,
              originalName: img.originalName,
              name: img.name,
              path: img.path,
              size: img.size,
              extension: img.extension,
              mime: img.mime,
              classification: img.classification ?? null,
              status: img.status ?? "R",
            },
          })),
          ...deletedIds.map((id) => ({
            currentUser: 1,
            mainWorkId: data?.id ?? null,
            id,
            delYn: "Y",
          })),
        ];

        return {
          mainId,
          lang: lang?.toUpperCase() ?? "KO",
          mainWork: {
            currentUser: 1,
            id: data?.id ?? work?.id ?? null,
            subTitle1: work.subtitle1,
            subTitle2: work.subtitle2,
            workImgList,
          },
        };
      },
    }));

    return (
      <FormProvider {...methods}>
        <form className="space-y-8 p-4">
          <Box className="mb-2 rounded-md border-2 border-gray-200">
            <Title title={`■ Work 영역`} />
            <Row className="pb-4">
              <FormTextarea
                id={subtitleId1}
                label="서브타이틀1"
                required
                placeholder="서브타이틀을 입력해주세요"
                maxLength={50}
                {...register("work.subtitle1")}
                error={errors.work?.subtitle1?.message}
              />
            </Row>
            <Row className="pb-4">
              <FormTextarea
                id={subtitleId2}
                label="서브타이틀2"
                placeholder="서브타이틀을 입력해주세요"
                maxLength={50}
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
                    {fields.length == index + 1 &&
                      errors.work?.file?.message && (
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
        </form>
      </FormProvider>
    );
  }
);

export default WorkForm;
