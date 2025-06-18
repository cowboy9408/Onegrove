import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import FormInput from "@/components/form/FormInput";
import FormTextarea from "@/components/form/FormTextarea";
import Box from "@/components/layout/Box";
import Col from "@/components/layout/Col";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";
import BrandList from "@/components/modal/BrandList";
import useModal from "@/hooks/useModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  lifestyle: z.object({
    subtitle1: z
      .string()
      .min(1, "서브타이틀은 필수값입니다.")
      .max(100, "서브타이틀은 200자 이내여야 합니다."),
    subtitle2: z.string().max(150, "서브타이틀은 150자 이내여야 합니다."),
    brand: z.array(z.number()),
  }),
});

export default function LifestyleForm({ data }) {
  const subtitleId1 = useId();
  const subtitleId2 = useId();

  const { showModal } = useModal();

  const methods = useForm({
    resolver: zodResolver(schema),
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
  } = methods;

  const [brands, setBrands] = useState([]);

  useEffect(() => {
    reset({ lifestyle: data });
  }, [data, reset]);

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8 p-4">
      <Box key={`${field.id}-${index}`} className="mb-2 rounded-md border-2 border-gray-200">
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
            <Col className="flex self-end gap-2">
              <Button
                className="h-12 w-full"
                onClick={() =>
                  showModal({
                    title: "콘텐츠 검색",
                    children: ({ closeModal }) => (
                      <BrandList
                        selected={[1, 2]}
                        closeModal={closeModal}
                        onConfirm={(result) => {
                          setBrands(result);
                          setValue(
                            "lifestyle.brand",
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
