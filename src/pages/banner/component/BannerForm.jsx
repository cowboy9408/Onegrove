import { useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Input from "@/components/common/Input";
import Radio from "@/components/common/Radio";
import Upload from "@/components/common/Upload";
import Box from "@/components/layout/Box";
import Row from "@/components/layout/Row";
import Title from "@/components/layout/Title";

const BannerForm = forwardRef(({ data, lang, menu }, ref) => {
  const methods = useForm();
  const {
    register,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    reset(data);
  }, [data]);

  const banner = watch();

  useImperativeHandle(ref, () => ({
    submit: async (onError) => {
      const getCleanedImage = (img) => {
        if (img?.status === "D") return null;
        return img;
      };

      const values = getValues();

      const reject = (msg) => {
        setTimeout(() => onError?.(msg), 0);
        return null;
      };

      if (!values.title) return reject("타이틀을 입력해주세요.");
      if (!values.url) return reject("URL을 입력해주세요.");
      if (!values.bannerType) return reject("배너 타입을 선택해주세요.");
      if (!values.displayYn) return reject("사용 여부를 선택해주세요.");
      if (!values.image1?.path) return reject("PC 이미지를 등록해주세요.");
      if (!values.image2?.path) return reject("MO 이미지를 등록해주세요.");

      return {
        id: values.id,
        menu,
        lang: lang.toUpperCase(),
        type: values.bannerType,
        title: values.title,
        subTitle: values.subtitle,
        url: values.url,
        showYn: values.displayYn,
        pcImg: values.image1,
        moImg: values.image2,
      };
    },
  }));

  return (
    <FormProvider {...methods}>
      <form className="space-y-8 p-4">
        <Box className="mb-2 rounded-md border-gray-200">
          <Title title="■ 띠배너 영역" />

          {/* 배너 타입 */}
          <Row className="pb-4">
            <p className="mb-2 text-sm font-medium text-gray-800">배너타입</p>
            <div className="flex gap-4">
              <Radio
                name="banner.bannerType"
                value="N"
                label="기본형"
                checked={banner?.bannerType === "N"}
                onChange={() => setValue("bannerType", "N")}
              />
              <Radio
                name="banner.bannerType"
                value="B"
                label="대형"
                checked={banner?.bannerType === "B"}
                onChange={() => setValue("bannerType", "B")}
              />
            </div>
          </Row>

          {/* 사용여부 */}
          <Row className="pb-4">
            <p className="mb-2 text-sm font-medium text-gray-800">사용여부</p>
            <div className="flex gap-4">
              <Radio
                name="banner.displayYn"
                value="Y"
                label="사용"
                checked={banner?.displayYn === "Y"}
                onChange={() => setValue("displayYn", "Y")}
              />
              <Radio
                name="banner.displayYn"
                value="N"
                label="미사용"
                checked={banner?.displayYn === "N"}
                onChange={() => setValue("displayYn", "N")}
              />
            </div>
          </Row>

          {/* 타이틀 */}
          <Row className="pb-4">
            <Input
              id="title"
              label="타이틀"
              placeholder="타이틀을 입력해주세요."
              maxLength={50}
              value={banner?.title || ""}
              onChange={(e) => setValue("title", e.target.value)}
              showDefaultInfo
              required
              error={errors.title?.message}
            />
          </Row>

          {/* 서브타이틀 */}
          <Row className="pb-4">
            <Input
              id="subtitle"
              label="서브타이틀"
              placeholder="서브타이틀을 입력해주세요."
              maxLength={50}
              value={banner?.subtitle || ""}
              onChange={(e) => setValue("subtitle", e.target.value)}
              showDefaultInfo
              error={errors.banner?.subtitle?.message}
            />
          </Row>

          {/* PC 이미지 */}
          <Row className="pb-4">
            <Upload
              name="banner.image1"
              label="PC 이미지"
              value={banner?.image1}
              onChange={(file) => setValue("image1", file)}
              required
            />
          </Row>

          {/* MO 이미지 */}
          <Row className="pb-4">
            <Upload
              name="banner.image2"
              label="MO 이미지"
              value={banner?.image2}
              onChange={(file) => setValue("image2", file)}
              required
            />
          </Row>

          {/* URL */}
          <Row className="pb-4">
            <Input
              id="url"
              label="URL"
              placeholder="URL을 입력해주세요."
              value={banner?.url || ""}
              onChange={(e) => setValue("url", e.target.value)}
              required
              error={errors.banner?.url?.message}
            />
          </Row>
        </Box>
      </form>
    </FormProvider>
  );
});

export default BannerForm;
