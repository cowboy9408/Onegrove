import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import Section from "@/components/layout/Section";
import Button from "@/components/common/Button";
import BrandRegistForm from "./component/BrandRegistForm";
import api from "@/lib/apiClient";

export default function BrandDetail() {
  const navigate = useNavigate();
  const { masterId } = useParams(); // /:id
  const [searchParams] = useSearchParams();
  const initialLang = searchParams.get("lang") || "ko";
  const [currentLang, setCurrentLang] = useState(initialLang === "ko" ? 0 : 1);
  const koFormRef = useRef();
  const enFormRef = useRef();
  const [koData, setKoData] = useState({});
  const [enData, setEnData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(true); // 읽기 전용
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get("/api/v1/brand/category");
        setCategoryList(res.data?.data || []);
        // console.log("카테고리 목록:", res.data?.data);
      } catch (err) {
        console.error("카테고리 목록 불러오기 실패:", err);
      }
    };
    fetchCategory();
    const fetchData = async () => {
      try {
        const koRes = await api.get(`/api/v1/brand/detail/${masterId}/KO`);
        const enRes = await api.get(`/api/v1/brand/detail/${masterId}/EN`);

        const koData = koRes.data;
        const enData = enRes.data;
        setKoData(koData);
        setEnData(enData);
        setLoading(false);
      } catch (err) {
        console.error("브랜드 상세 로딩 실패:", err);
      }
    };
    fetchData();
  }, [masterId]);

  useEffect(() => {
    if (!loading) {
      const patchForm = (locale, data) => {
        const matchedCategory = categoryList.find(
          (item) => item.value === data.category
        );

        const formValues = {
          brandName: data.name,
          thumbText: data.thumbTxt || data.thumbText || "",
          // title: data.title,
          // subTitle: data.subTitle,
          office: matchedCategory.code || "",
          useStatus: data.useYn === "Y" ? "active" : "inactive",
          description: data.content,
          keywords: data.keywordList?.map((k) => k.keyword) || [],
          mainImage: data.thumbImg,
          pcImage: data.mainPcImg,
          moImage: data.mainMoImg,
          contentImage1: data.contentImg1,
          contentImage2: data.contentImg2,
          contentImage3: data.contentImg3,
          contentImage4: data.contentImg4,
          contentImage5: data.contentImg5,
          storePhone: data.brandTel,
          storeLocation: data.brandLocation,
          homepageUrl: data.homeUrl,
          homepageNewTab: data.homeUrlNew === "Y",
          sns: {
            instagram: {
              url: data.instagram,
              newWindow: data.instagramNew === "Y",
            },
            facebook: {
              url: data.facebook,
              newWindow: data.facebookNew === "Y",
            },
            youtube: {
              url: data.youtube,
              newWindow: data.youtubeNew === "Y",
            },
            twitter: {
              url: data.twitter,
              newWindow: data.twitterNew === "Y",
            },
          },
          openingHours: {
            월: { time: data.mon, holiday: data.monHoliday === "Y" },
            화: { time: data.tue, holiday: data.tueHoliday === "Y" },
            수: { time: data.wed, holiday: data.wedHoliday === "Y" },
            목: { time: data.thu, holiday: data.thuHoliday === "Y" },
            금: { time: data.fri, holiday: data.friHoliday === "Y" },
            토: { time: data.sat, holiday: data.satHoliday === "Y" },
            일: { time: data.sun, holiday: data.sunHoliday === "Y" },
            breakTime: {
              time: data.breakTime,
              none: data.breakYn === "Y",
            },
          },
        };

        console.log("폼에 설정할 데이터:", locale, formValues);
        // Object.entries(formValues).forEach(([key, value]) => {
        //   if (locale === "ko") {
        //     koFormRef.current?.setValue?.(key, value);
        //   }
        //   if (locale === "en") {
        //     enFormRef.current?.setValue?.(key, value);
        //   }
        // });
        const formRef = locale === "ko" ? koFormRef.current : enFormRef.current;
        Object.entries(formValues).forEach(([key, value]) => {
          formRef?.setValue?.(key, value);
        });
      };

      if (koFormRef.current && koData?.data) {
        patchForm("ko", koData.data);
      }
      if (enFormRef.current && enData?.data) {
        patchForm("en", enData.data);
      }

      console.log("koFormRef.current:", koFormRef.current);
      console.log("enFormRef.current:", enFormRef.current);
    }
  }, [currentLang, koData, enData]);

  const handleSave = async () => {
    try {
      const koValues = await koFormRef.current?.submit?.();
      const enValues = await enFormRef.current?.submit?.();
      console.log("KO 폼 데이터:", koValues);
      console.log("EN 폼 데이터:", enValues);

      console.log("return test:", !koValues && !enValues);

      if (!koValues && !enValues) return;

      const saveOne = async (data, lang) => {
        const payload = {
          ...data,
          lang,
          id: masterId,
          name: data.brandName,
          category: data.office,
          contentId: masterId,
          content: data.description,
          title: data.title,
          subTitle: data.subTitle,
          thumbText: data.thumbTxt || data.thumbText || "",
          thumbImg: data.mainImage,
          mainPcImg: data.pcImage,
          mainMoImg: data.moImage,
          contentImg1: data.contentImage1,
          contentImg2: data.contentImage2,
          contentImg3: data.contentImage3,
          contentImg4: data.contentImage4,
          contentImg5: data.contentImage5,
          pcBodyImage: data.pcBodyImage,
          moBodyImage: data.moBodyImage,
          brandTel: data.storePhone,
          brandLocation: data.storeLocation,
          homeUrl: data.homepageUrl || "",
          mainImg: data.mainImage,
          useYn: data.useStatus === "active" ? "Y" : "N",
          homeUrlNew: data.homepageNewTab ? "Y" : "N",
          instagramNew: data.sns?.instagram?.newWindow ? "Y" : "N",
          facebookNew: data.sns?.facebook?.newWindow ? "Y" : "N",
          youtubeNew: data.sns?.youtube?.newWindow ? "Y" : "N",
          twitterNew: data.sns?.twitter?.newWindow ? "Y" : "N",
          instagram: data.sns?.instagram?.url || "",
          facebook: data.sns?.facebook?.url || "",
          youtube: data.sns?.youtube?.url || "",
          twitter: data.sns?.twitter?.url || "",
          mon: data.openingHours?.월?.time,
          tue: data.openingHours?.화?.time,
          wed: data.openingHours?.수?.time,
          thu: data.openingHours?.목?.time,
          fri: data.openingHours?.금?.time,
          sat: data.openingHours?.토?.time,
          sun: data.openingHours?.일?.time,
          monHoliday: data.openingHours?.월?.holiday ? "Y" : "N",
          tueHoliday: data.openingHours?.화?.holiday ? "Y" : "N",
          wedHoliday: data.openingHours?.수?.holiday ? "Y" : "N",
          thuHoliday: data.openingHours?.목?.holiday ? "Y" : "N",
          friHoliday: data.openingHours?.금?.holiday ? "Y" : "N",
          satHoliday: data.openingHours?.토?.holiday ? "Y" : "N",
          sunHoliday: data.openingHours?.일?.holiday ? "Y" : "N",
          breakTime: data.openingHours?.breakTime?.time,
          breakYn: data.openingHours?.breakTime?.none ? "Y" : "N",
          keywordList: (data.keywords || []).map((keyword) => ({
            id: null,
            keyword,
            delYn: "N",
          })),
        };
        console.log(`[${lang}] 서버에 보낼 데이터:`, payload);

        const res = await api.post("/api/v1/brand/update", payload);
        console.log("응답 결과:", res.data);
      };

      if (currentLang === 0) {
        const koValues = await koFormRef.current?.submit?.();
        if (!koValues) return;
        console.log("KO 폼 데이터:", koValues);
        await saveOne(koValues, "KO");
      } else {
        const enValues = await enFormRef.current?.submit?.();
        if (!enValues) return;
        console.log("EN 폼 데이터:", enValues);
        await saveOne(enValues, "EN");
      }

      alert("브랜드 정보가 수정되었습니다.");
      setIsReadOnly(true); // 다시 읽기 전용으로 전환
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장 실패. 다시 시도해주세요.");
    }
  };

  return (
    <Section>
      <Tabs
        tabs={[
          { key: "kr", label: "국문" },
          { key: "en", label: "영문" },
        ]}
        defaultIndex={currentLang}
        onTabChange={(index) => {
          // 탭 비활성화: 클릭 무시
          if (!loading) setCurrentLang(index);
        }}
        // disabled={isReadOnly}
      >
        <TabPanel>
          <BrandRegistForm ref={koFormRef} lang="ko" readOnly={isReadOnly} />
        </TabPanel>
        <TabPanel>
          <BrandRegistForm ref={enFormRef} lang="en" readOnly={isReadOnly} />
        </TabPanel>
      </Tabs>

      <div className="flex justify-end gap-4 px-6 pb-6">
        {isReadOnly ? (
          <Button onClick={() => setIsReadOnly(false)} theme="primary">
            수정
          </Button>
        ) : (
          <Button onClick={handleSave} theme="primary">
            저장
          </Button>
        )}
        <Button onClick={() => navigate("/retail/brand")}>목록</Button>
      </div>
    </Section>
  );
}
