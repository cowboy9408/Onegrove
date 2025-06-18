import Button from "@/components/common/Button";
import Upload from "@/components/common/Upload";
import FieldGroup from "@/components/form/FieldGroup";
import FormInput from "@/components/form/FormInput";
import FormTextarea from "@/components/form/FormTextarea";
import Box from "@/components/layout/Box";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import WhatsOnList from "@/components/modal/WhatsOnList";
import useModal from "@/hooks/useModal";
import Col from "@/components/layout/Col";
import Input from "@/components/common/Input";

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";

const EtcContentForm = forwardRef(
  ({ data, lang = "KO", mainId = null }, ref) => {
    const { showModal } = useModal();
    const [selectedContents, setSelectedContents] = useState([]);

    const methods = useForm({
      defaultValues: {
        etc: [
          {
            imagePC: { name: "", url: "", size: 0 },
            imageMO: { name: "", url: "", size: 0 },
            url: "",
            title: "",
            subtitle: "",
            detail: "",
            button: "",
            contents: [],
          },
        ],
      },
    });

    const {
      formState: { errors },
      reset,
      resetField,
      setValue,
    } = methods;

    useEffect(() => {
      if (data && Array.isArray(data)) {
        reset({ etc: [data[0]] });
      }
    }, [data]);

    useEffect(() => {
      if (!data || !Array.isArray(data)) return;
      const raw = data[0];

      const content = raw.contents?.[0];
      const contentId = content?._id ?? raw.contentId;
      const categoryCode = content?.categoryCode ?? raw.contentCategoryCode;

      const title = content?.title || raw.contentTitle || "제목 없음";

      const selected = {
        _id: String(contentId),
        title,
        categoryCode,
      };

      setSelectedContents([selected]);

      reset({
        etc: {
          ...raw,
          contents: [selected],
        },
      });
    }, [data]);

    console.log("✔ selectedContents on load:", selectedContents);
    console.log("✔ form contents:", methods.getValues("etc.contents"));

    useImperativeHandle(ref, () => ({
      submit: async (onError) => {
        const values = methods.getValues("etc");
        const content = Array.isArray(values) ? values[0] : values;

        // 필수값 유효성 검사
        if (
          !content.title ||
          !content.subtitle ||
          !content.button ||
          !content.contents?.length
        ) {
          return onError?.("필수 입력값이 누락되었습니다.");
        }

        const first = content.contents[0];

        console.log("✔ payload:", {
          contentId: first._id,
          categoryCode: first?.categoryCode,
        });

        return {
          lang: lang.toUpperCase(),
          ...(mainId ? { mainId } : {}),
          mainLinkedContent: {
            id: data?.id ?? null,
            title: content.title,
            subTitle: content.subtitle,
            content: content.detail,
            btnName: content.button,
            contentId: first._id,
            contentCategoryCode: first?.categoryCode || "",
            pcImg: content.imagePC,
            moImg: content.imageMO,
          },
        };
      },
    }));

    return (
      <FormProvider {...methods}>
        <form className="space-y-8 p-4">
          <FieldGroup name="etc">
            {({ register }) => {
              return (
                <Box className="mb-2 rounded-md border-2 border-gray-200">
                  <Title title={`■ 연계 콘텐츠 영역 `} />
                  <Row className="pb-4"></Row>
                  <Row className="pb-4">
                    <Upload
                      name={`etc.imagePC`}
                      label={`PC 이미지`}
                      error={errors.etc?.image?.message}
                    />
                    <Upload
                      name={`etc.imageMO`}
                      label={`MO 이미지`}
                      error={errors.etc?.image?.message}
                    />
                  </Row>

                  <Row className="pb-4">
                    <FormInput
                      id={`title`}
                      label="타이틀"
                      fieldName={`etc.title`}
                      maxLength={50}
                      showDefaultInfo={true}
                      required
                      placeholder="타이틀을 입력해주세요."
                      {...register(`etc.title`)}
                      error={errors.etc?.title?.message}
                      onClear={() => resetField(`etc.title`)}
                    />
                  </Row>

                  <Row className="pb-4">
                    <FormInput
                      id={`subtitle`}
                      label="서브타이틀"
                      fieldName={`etc.subtitle`}
                      maxLength={100}
                      showDefaultInfo={true}
                      required
                      placeholder="서브타이틀을 입력해주세요."
                      {...register(`etc.subtitle`)}
                      error={errors.etc?.subtitle?.message}
                      onClear={() => resetField(`etc.subtitle`)}
                    />
                  </Row>

                  <Row className="pb-4">
                    <FormTextarea
                      id={`detail`}
                      label="상세내용"
                      placeholder="상세내용을 입력해주세요"
                      maxLength={200}
                      {...register(`etc.detail`)}
                      error={errors.etc?.detail?.message}
                    />
                  </Row>

                  <Row className="pb-4">
                    <FormInput
                      id={`button`}
                      label="버튼명"
                      fieldName={`etc.button`}
                      maxLength={100}
                      showDefaultInfo={true}
                      required
                      placeholder="버튼명을 입력해주세요."
                      {...register(`etc.button`)}
                      error={errors.etc?.button?.message}
                      onClear={() => resetField(`etc.button`)}
                    />
                  </Row>
                  <Row className="pb-4">
                    <Col className="flex-5">
                      <Input
                        label="콘텐츠 등록"
                        readOnly
                        required
                        value={
                          selectedContents.map((e) => e.title).join(", ") || ""
                        }
                      />
                      <input
                        type="hidden"
                        {...register("etc.contents", { required: true })}
                      />
                    </Col>
                    <Col className="flex self-end gap-2">
                      <Button
                        className="h-12 w-full"
                        onClick={() =>
                          showModal({
                            title: "콘텐츠 검색",
                            children: ({ closeModal }) => (
                              <WhatsOnList
                                selected={selectedContents.map((c) =>
                                  String(c._id)
                                )}
                                closeModal={closeModal}
                                onConfirm={(result) => {
                                  const unique = Array.from(
                                    new Map(
                                      result.map((b) => [
                                        String(b._id),
                                        { ...b, _id: String(b._id) },
                                      ])
                                    ).values()
                                  );

                                  setSelectedContents(unique);

                                  setValue(
                                    "etc.contents",
                                    unique.map((e) => ({
                                      _id: String(e._id),
                                      categoryCode: e.categoryCode,
                                      title: e.title,
                                    }))
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
                        콘텐츠 선택
                      </Button>
                    </Col>
                  </Row>
                </Box>
              );
            }}
          </FieldGroup>
        </form>
      </FormProvider>
    );
  }
);
export default EtcContentForm;
