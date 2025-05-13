import { useEffect, useRef, useState } from "react";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import Section from "@/components/layout/Section";
import Button from "@/components/common/Button";
import BrandRegistForm from "./component/BrandRegistFom";
import { useNavigate } from "react-router-dom";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";

export default function BrandRegist() {
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState(0); // 0 = 국문, 1 = 영문
  const koFormRef = useRef();
  const enFormRef = useRef();
  const { showModal } = useModal();
  const [koData, setKoData] = useState({});
  const [enData, setEnData] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("brand");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setKoData(parsed.ko || {});
        setEnData(parsed.en || {});
      } catch (err) {
        console.warn("브랜드 저장 정보 파싱 실패:", err);
      }
    }
  }, []);

  const handleSave = async () => {
    try {
      const ref = currentLang === 0 ? koFormRef : enFormRef;
      const form = await ref.current?.submit();
      if (!form) return;

      const payload = {
        lang: currentLang === 0 ? "KO" : "EN",
        name: form.companyName,
        title: form.phone,
        subTitle: form.subtitle,
        thumbText: form.ceoName,
        content: form.description,

        // 공통 필드도 현재 탭에서 가져옵니다
        category: form.office,
        thumbImg: form.mainImage,
        mainPcImg: form.pcImage,
        mainMoImg: form.moImage,
        contentImg1: form.contentImage1,
        contentImg2: form.contentImage2,
        contentImg3: form.contentImage3,
        contentImg4: form.contentImage4,
        contentImg5: form.contentImage5,

        brandTel: form.storePhone,
        brandLocation: form.storeLocation,

        homeUrl: form.homepageUrl || "",
        homeUrlNew: form.homepageNewTab ? "Y" : "N",

        instagram: form.sns?.instagram?.url || "",
        instagramNew: form.sns?.instagram?.newWindow ? "Y" : "N",
        facebook: form.sns?.facebook?.url || "",
        facebookNew: form.sns?.facebook?.newWindow ? "Y" : "N",
        youtube: form.sns?.youtube?.url || "",
        youtubeNew: form.sns?.youtube?.newWindow ? "Y" : "N",
        twitter: form.sns?.twitter?.url || "",
        twitterNew: form.sns?.twitter?.newWindow ? "Y" : "N",

        mon: form.openingHours?.월?.time || "",
        tue: form.openingHours?.화?.time || "",
        wed: form.openingHours?.수?.time || "",
        thu: form.openingHours?.목?.time || "",
        fri: form.openingHours?.금?.time || "",
        sat: form.openingHours?.토?.time || "",
        sun: form.openingHours?.일?.time || "",

        monHoliday: form.openingHours?.월?.holiday ? "Y" : "",
        tueHoliday: form.openingHours?.화?.holiday ? "Y" : "",
        wedHoliday: form.openingHours?.수?.holiday ? "Y" : "",
        thuHoliday: form.openingHours?.목?.holiday ? "Y" : "",
        friHoliday: form.openingHours?.금?.holiday ? "Y" : "",
        satHoliday: form.openingHours?.토?.holiday ? "Y" : "",
        sunHoliday: form.openingHours?.일?.holiday ? "Y" : "",

        breakTime: form.openingHours?.breakTime?.time || "",
        breakYn: form.openingHours?.breakTime?.none ? "Y" : "N",

        useYn: form.useStatus === "active" ? "Y" : "N",
        keywordList: form.keywords?.map((k) => ({ keyword: k })) || [],
      };

      await api.post("/api/v1/brand/insert", payload);
      alert("브랜드 정보가 저장되었습니다.");
      navigate("/retail/brand");
    } catch (err) {
      console.error("저장 실패:", err);
      alert(
        "브랜드 등록 실패: " + (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <Section>
      <Tabs
        tabs={[
          { key: "kr", label: "국문" },
          { key: "en", label: "영문" },
        ]}
        defaultIndex={0}
        onTabChange={setCurrentLang}
      >
        <TabPanel>
          <BrandRegistForm ref={koFormRef} lang="ko" />
        </TabPanel>
        <TabPanel>
          <BrandRegistForm ref={enFormRef} lang="en" />
        </TabPanel>
      </Tabs>

      <div className="flex justify-end gap-4 px-6 pb-6">
        <Button
          onClick={() =>
            showModal({
              title: "저장 확인",
              message: "저장하시겠습니까?",
              showCancel: true,
              onConfirm: handleSave,
            })
          }
        >
          저장
        </Button>
        <Button
          type="button"
          className="bg-gray-200 text-black"
          onClick={() =>
            showModal({
              title: "이동 확인",
              message: "이전 페이지로 돌아갈 경우 입려한 정보가 사라집니다.",
              showCancel: true,
              onConfirm: () => navigate("/retail/brand"),
            })
          }
        >
          목록
        </Button>
      </div>
    </Section>
  );
}
