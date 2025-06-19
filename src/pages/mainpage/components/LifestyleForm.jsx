import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import FormInput from "@/components/form/FormInput";
import FormTextarea from "@/components/form/FormTextarea";
import Box from "@/components/layout/Box";
import Col from "@/components/layout/Col";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import BrandList from "@/components/modal/MainBrandList";
import useModal from "@/hooks/useModal";
import {
  useEffect,
  useId,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { FormProvider, useForm } from "react-hook-form";

const LifestyleForm = forwardRef(
  ({ data, lang = "KO", mainId = null }, ref) => {
    const subtitleId1 = useId();
    const subtitleId2 = useId();

    const { showModal } = useModal();

    const methods = useForm({
      defaultValues: {
        lifestyle: {
          subtitle1: "",
          subtitle2: "",
          brand: [],
        },
      },
    });

    const {
      register,
      formState: { errors },
      setValue,
      reset,
      getValues,
    } = methods;

    const [brands, setBrands] = useState([]);

    useEffect(() => {
      reset({
        lifestyle: {
          subtitle1: data?.subTitle1 || "",
          subtitle2: data?.subTitle2 || "",
          brand: data?.brandList?.map((b) => b.brandId) || [],
        },
      });

      setBrands(
        data?.brandList?.map((b) => ({
          _id: String(b.brandId),
          brand: b.name,
        })) || []
      );
    }, [data, reset]);

    const onSubmit = (data) => {
      console.log(data);
    };

    useImperativeHandle(ref, () => ({
      submit: async (onError) => {
        const value = getValues("lifestyle");

        if (!value.subtitle1 || value.brand.length === 0) {
          return onError?.("필수 입력값을 모두 입력해주세요.");
        }

        const originalList = data?.brandList || [];

        const selectedIds = value.brand.map((id) => Number(id));

        const finalList = [
          // 유지 또는 새로 추가
          ...selectedIds.map((id, idx) => {
            const existing = originalList.find((b) => b.brandId === id);
            return {
              ...(existing?.id ? { id: existing.id } : {}),
              brandId: id,
              sort: idx + 1,
            };
          }),
          // 삭제 처리
          ...originalList
            .filter((b) => !selectedIds.includes(b.brandId))
            .map((b) => ({
              id: b.id,
              brandId: b.brandId,
              delYn: "Y",
              sort: b.sort || 1,
            })),
        ];

        return {
          ...(mainId ? { mainId } : {}),
          lang: lang.toUpperCase(),
          mainLife: {
            ...(data?.id ? { id: data.id } : {}),
            subTitle1: value.subtitle1,
            subTitle2: value.subtitle2 || "",
            brandList: finalList,
          },
        };
      },
    }));

    return (
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-8 p-4"
        >
          <Box className="mb-2 rounded-md border-2 border-gray-200">
            <Title title={`■ Lifestyle 영역`} />
            <Row className="pb-4">
              <FormTextarea
                id={subtitleId1}
                label="서브타이틀1"
                required
                placeholder="서브타이틀을 입력해주세요"
                maxLength={100}
                {...register("lifestyle.subtitle1")}
                error={errors.lifestyle?.subtitle1?.message}
              />
            </Row>
            <Row className="pb-4">
              <FormTextarea
                id={subtitleId2}
                label="서브타이틀2"
                placeholder="서브타이틀을 입력해주세요"
                maxLength={150}
                {...register("lifestyle.subtitle2")}
                error={errors.lifestyle?.subtitle2?.message}
              />
            </Row>
            <Row className="pb-4">
              <Col className="flex-5">
                <Input
                  label="브랜드 목록"
                  readOnly
                  required
                  value={brands.map((e) => e.brand).join(", ")}
                />
                <FormInput
                  className="hidden"
                  fieldName={`lifestyle.brand`}
                  {...register(`lifestyle.brand`)}
                />
              </Col>
              <Col className="flex gap-2 self-end">
                <Button
                  className="h-12 w-full"
                  onClick={() =>
                    showModal({
                      title: "콘텐츠 검색",
                      children: ({ closeModal }) => (
                        <BrandList
                          selected={brands.map((b) => Number(b._id))}
                          closeModal={closeModal}
                          onConfirm={(result) => {
                            const unique = Array.from(
                              new Map(result.map((b) => [b._id, b])).values()
                            );
                            setBrands(unique);
                            setValue(
                              "lifestyle.brand",
                              unique.map((e) => e._id)
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
        </form>
      </FormProvider>
    );
  }
);
export default LifestyleForm;
