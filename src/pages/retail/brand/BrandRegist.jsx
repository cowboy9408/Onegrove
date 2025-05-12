import { useEffect, useRef, useState } from "react";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import Section from "@/components/layout/Section";
import Button from "@/components/common/Button";
import BrandRegistForm from "./component/BrandRegistFom";
import { useNavigate } from "react-router-dom";
import api from "@/lib/apiClient";

export default function BrandRegist() {
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState(0); // 0 = 국문, 1 = 영문
  const koFormRef = useRef();
  const enFormRef = useRef();

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
      // 1. 폼 데이터 가져오기
      const ko = await koFormRef.current?.submit();
      const en = await enFormRef.current?.submit();
      if (!ko || !en) return;

      // 2. 공통 필드 정의 (카테고리, 운영시간 등)
      const sharedFields = {
        category: ko.office,
        thumbImg: ko.mainImage,
        mainPcImg: ko.pcImage,
        mainMoImg: ko.moImage,
        contentImg1: ko.contentImage1,
        contentImg2: ko.contentImage2,
        contentImg3: ko.contentImage3,
        contentImg4: ko.contentImage4,
        contentImg5: ko.contentImage5,

        brandTel: ko.storePhone,
        brandLocation: ko.storeLocation,

        homeUrl: ko.homepageUrl || "",
        homeUrlNew: ko.homepageNewTab ? "Y" : "N",

        instagram: ko.sns?.instagram?.url || "",
        instagramNew: ko.sns?.instagram?.newWindow ? "Y" : "N",
        facebook: ko.sns?.facebook?.url || "",
        facebookNew: ko.sns?.facebook?.newWindow ? "Y" : "N",
        youtube: ko.sns?.youtube?.url || "",
        youtubeNew: ko.sns?.youtube?.newWindow ? "Y" : "N",
        twitter: ko.sns?.twitter?.url || "",
        twitterNew: ko.sns?.twitter?.newWindow ? "Y" : "N",

        mon: ko.openingHours?.월?.time || "",
        tue: ko.openingHours?.화?.time || "",
        wed: ko.openingHours?.수?.time || "",
        thu: ko.openingHours?.목?.time || "",
        fri: ko.openingHours?.금?.time || "",
        sat: ko.openingHours?.토?.time || "",
        sun: ko.openingHours?.일?.time || "",

        monHoliday: ko.openingHours?.월?.holiday ? "Y" : "",
        tueHoliday: ko.openingHours?.화?.holiday ? "Y" : "",
        wedHoliday: ko.openingHours?.수?.holiday ? "Y" : "",
        thuHoliday: ko.openingHours?.목?.holiday ? "Y" : "",
        friHoliday: ko.openingHours?.금?.holiday ? "Y" : "",
        satHoliday: ko.openingHours?.토?.holiday ? "Y" : "",
        sunHoliday: ko.openingHours?.일?.holiday ? "Y" : "",

        breakTime: ko.openingHours?.breakTime?.time || "",
        breakYn: ko.openingHours?.breakTime?.none ? "Y" : "N",

        useYn: ko.useStatus === "active" ? "Y" : "N",
        keywordList: ko.keywords?.map((k) => ({ keyword: k })) || [],
      };

      // 3. 언어별 개별 필드
      const koFields = {
        lang: "KO",
        name: ko.companyName,
        title: ko.phone,
        subTitle: ko.subtitle,
        thumbText: ko.ceoName,
        content: ko.description,
      };

      const enFields = {
        lang: "EN",
        name: en.companyName,
        title: en.phone,
        subTitle: en.subtitle,
        thumbText: en.ceoName,
        content: en.description,
      };

      // 4. 각각 저장 요청
      await Promise.all([
        api.post("/api/v1/brand/insert", { ...sharedFields, ...koFields }),
        api.post("/api/v1/brand/insert", { ...sharedFields, ...enFields }),
      ]);

      alert("국문과 영문 브랜드 정보가 저장되었습니다.");
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
        <Button onClick={handleSave}>저장</Button>
        <Button
          type="button"
          className="bg-gray-200 text-black"
          onClick={() => navigate("/retail/brand")}
        >
          목록
        </Button>
      </div>
    </Section>
  );
}
