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
  const [isReadOnly, setIsReadOnly] = useState(false); // 읽기 전용
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
          sns: {
            instagram: {
              url: data.instagram,
            },
            facebook: {
              url: data.facebook,
            },
            youtube: {
              url: data.youtube,
            },
            twitter: {
              url: data.twitter,
            },
            blog: {
              url: data.blog,
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

        // bcId가 있는 경우에만 contentId 추가
        if (data.bcId !== undefined && data.bcId !== null) {
          formValues.bcId = data.bcId;
        }

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

        const patchImageMeta = (img) =>
          img?.path
            ? {
                ...img,
                status: "R",
              }
            : null;
        Object.entries(formValues).forEach(([key, value]) => {
          if (key.includes("Image")) {
            formRef?.setValue?.(key, patchImageMeta(value));
          } else {
            formRef?.setValue?.(key, value);
          }
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

  const toImageMeta = (file, original) => {
    const base = file || original;
    if (!base) return null;

    const originalName = base.originalName || base.name || "";
    const extension = base.extension || "." + originalName.split(".").pop();

    return {
      id: base.id ?? null,
      originalName: originalName,
      name: base.name ?? originalName,
      size: base.size ?? 0,
      extension: extension,
      mime: base.mime || "image/jpeg",
      classification: base.classification || "press-media",
      path: base.path || null,
      status:
        base.status !== undefined && base.status !== null
          ? base.status
          : file?.changed
            ? "E"
            : "R", // 수정 안 하면 R
    };
  };

  const handleSave = async () => {
    try {
      const koValues = await koFormRef.current?.submit?.();
      const enValues = await enFormRef.current?.submit?.();
      console.log("KO 폼 데이터:", koValues);
      console.log("EN 폼 데이터:", enValues);

      console.log("return test:", !koValues && !enValues);

      if (!koValues && !enValues) return;

      const saveOne = async (data, lang, original) => {
        const payload = {
          ...data,
          lang: lang,
          id: masterId,
          name: data.brandName,
          category: data.office,
          content: data.description,
          title: data.title,
          subTitle: data.subTitle,
          thumbText: data.thumbTxt || data.thumbText || "",
          thumbImg: toImageMeta(data.mainImage, original.mainImage),
          mainPcImg: toImageMeta(data.pcImage, original.pcImage),
          mainMoImg: toImageMeta(data.moImage, original.moImage),
          contentImg1: toImageMeta(data.contentImage1, original.contentImage1),
          contentImg2: toImageMeta(data.contentImage2, original.contentImage2),
          contentImg3: toImageMeta(data.contentImage3, original.contentImage3),
          contentImg4: toImageMeta(data.contentImage4, original.contentImage4),
          contentImg5: toImageMeta(data.contentImage5, original.contentImage5),
          pcBodyImage: toImageMeta(data.pcBodyImage, original.pcBodyImage),
          moBodyImage: toImageMeta(data.moBodyImage, original.moBodyImage),
          brandTel: data.storePhone,
          brandLocation: data.storeLocation,
          homeUrl: data.homepageUrl || "",
          mainImg: toImageMeta(data.mainImage, original.mainImage),
          useYn: data.useStatus === "active" ? "Y" : "N",
          homeUrlNew: data.homepageNewTab ? "Y" : "N",
          instagram: data.sns?.instagram?.url || "",
          facebook: data.sns?.facebook?.url || "",
          youtube: data.sns?.youtube?.url || "",
          twitter: data.sns?.twitter?.url || "",
          blog: data.sns?.blog?.url || "",
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

        // bcId가 있는 경우에만 contentId 추가
        if (data.bcId !== undefined && data.bcId !== null) {
          payload.contentId = data.bcId;
        }

        try {
          const checkRes = await api.get(`/api/v1/brand/detail/${masterId}/${lang}`);
          if (checkRes.data?.data?.bcId) {
            payload.contentId = checkRes.data.data.bcId; // 기존 bcId가 있다면 사용
          }
          setLoading(false);

          console.log(`[${lang}] 서버에 보낼 데이터:`, lang, payload);

          const apiUrl = (payload.contentId !== undefined && payload.contentId !== null)
            ? "/api/v1/brand/update"
            : "/api/v1/brand/insert";
          const res = await api.post(apiUrl, payload);
          
          console.log("응답 결과:", res.data);
        } catch (err) {
          console.error("브랜드 상세 로딩 실패:", err);
        }

        
      };

      if (currentLang === 0) {
        const koValues = await koFormRef.current?.submit?.();
        if (!koValues) return;
        console.log("KO 폼 데이터:", koValues);
        await saveOne(koValues, "KO", koData.data);
      } else {
        const enValues = await enFormRef.current?.submit?.();
        if (!enValues) return;
        console.log("EN 폼 데이터:", enValues, "EN", enData.data);
        await saveOne(enValues, "EN", enData.data);
      }

      alert("브랜드 정보가 수정되었습니다.");
      navigate("/retail/brand/?refresh=" + Date.now());
      // setIsReadOnly(true); // 다시 읽기 전용으로 전환
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
            수정
          </Button>
        )}
        <Button onClick={() => navigate("/retail/brand")}>목록</Button>
      </div>
    </Section>
  );
}
