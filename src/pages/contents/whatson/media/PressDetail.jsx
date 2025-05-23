import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import Section from "@/components/layout/Section";
import Button from "@/components/common/Button";
import PressRegistForm from "./component/PressRegistForm";
import api from "@/lib/apiClient";

export default function PressDetail() {
  const navigate = useNavigate();
  const { pmId } = useParams();
  const [searchParams] = useSearchParams();
  const initialLang = searchParams.get("lang") || "ko";
  const [currentLang, setCurrentLang] = useState(initialLang === "ko" ? 0 : 1);
  const koFormRef = useRef();
  const enFormRef = useRef();

  const [koData, setKoData] = useState(null);
  const [enData, setEnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/v1/press/${pmId}`);
        console.log("API 응답 결과:", res.data);

        const list = Array.isArray(res.data?.data) ? res.data.data : [];

        const ko = list.find((item) => item.lang === "ko") || null;
        const en = list.find((item) => item.lang === "en") || null;

        console.log("koData:", ko);
        console.log("enData:", en);

        setKoData(ko);
        setEnData(en);
        setLoading(false);
      } catch (err) {
        console.error("API 호출 실패:", err);
        setKoData(null);
        setEnData(null);
        setLoading(false);
      }
    };
    fetchData();
  }, [pmId]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       //const res = await api.get(`/api/v1/press/${pmId}`);
  //       //       console.log("API 응답 결과:", res.data);
  //       const mockData = {
  //         success: true,
  //         message: "조회되었습니다.",
  //         data: [
  //           {
  //             id: 2,
  //             pressId: 3,
  //             lang: "ko",
  //             categoryCode: "pm0102",
  //             categoryValue: "Media",
  //             title: "123123",
  //             thumbImgPc: null,
  //             thumbImgMo: null,
  //             showYn: "Y",
  //             content: "에디터 내용",
  //             publishDate: "2025-05-20",
  //             createUser: "테스트",
  //             createDatetime: "2025-05-08",
  //             updateUser: null,
  //             updateDatetime: null,
  //           },
  //           {
  //             id: 3,
  //             pressId: 3,
  //             lang: "en",
  //             categoryCode: "pm0102",
  //             categoryValue: "Media",
  //             title: "제목 수정",
  //             thumbImgPc: null,
  //             thumbImgMo: null,
  //             showYn: "N",
  //             content: "내용~!@~!@~!@",
  //             publishDate: "2025-05-20",
  //             createUser: "테스트",
  //             createDatetime: "2025-05-08",
  //             updateUser: "테스트",
  //             updateDatetime: "2025-05-14",
  //           },
  //         ],
  //       };
  //       //const list = Array.isArray(res.data?.data) ? res.data.data : [];
  //       const list = mockData.data;
  //       const ko = list.find((item) => item.lang === "ko") || null;
  //       const en = list.find((item) => item.lang === "en") || null;

  //       console.log("koData:", ko);
  //       console.log("enData:", en);

  //       setKoData(ko);
  //       setEnData(en);
  //       setLoading(false);
  //     } catch (err) {
  //       console.error("테스트용 데이터 처리 실패:", err);
  //     }
  //   };

  //   fetchData();
  // }, [pmId]);

  useEffect(() => {
    if (!loading) {
      const patchForm = (formRef, data) => {
        if (!formRef || !data) return;
        // const patchImageMeta = (img) =>
        //   img?.path
        //     ? {
        //         ...img,
        //         status: "R",
        //       }
        //     : null;

        formRef.setValue("category", data.categoryCode || "");
        formRef.setValue("title", data.title || "");
        formRef.setValue("status", data.showYn === "Y" ? "active" : "inactive");
        formRef.setValue("publishDate", data.publishDate || "");
        formRef.setValue("imgPc", data.thumbImgPc);
        formRef.setValue("imgMo", data.thumbImgMo);
        formRef.setValue("content1", data.content || "");
      };

      patchForm(koFormRef.current, koData);
      patchForm(enFormRef.current, enData);
    }
  }, [loading, koData, enData]);

  useEffect(() => {
    if (!loading) {
      console.log("koFormRef.current:", koFormRef.current);
      console.log("enFormRef.current:", enFormRef.current);
    }
  }, [loading]);

  useEffect(() => {
    console.log(" KO 데이터:", koData);
    console.log(" EN 데이터:", enData);
  }, [koData, enData]);

  const toImageMeta = (file) => {
    if (!file || !file.name) return null;

    return {
      id: null,
      originalName: file.originalName || file.name,
      name: file.name,
      size: file.size,
      extension: "." + (file.originalName || file.name).split(".").pop(),
      mime: file.type || "image/png",
      classification: file.classification ?? "press-media",
      path: file.path,
      // status: file.status ?? "R",
      status: null,
    };
  };

  const handleSave = async () => {
    try {
      const saveOne = async (data) => {
        const payload = {
          id: data.id,
          category: data.category,
          title: data.title,
          thumbImgPc: toImageMeta(data.thumbImgPc),
          thumbImgMo: toImageMeta(data.thumbImgMo),
          showYn: data.showYn,
          content: data.content,
          publishDate: data.publishDate,
        };

        console.log(` 전송할 payload:`, payload);
        console.log("payload.thumbImgPc:", payload.thumbImgPc);

        const res = await api.post("/api/v1/press/update", payload);
        console.log(` 응답 결과:`, res.data);
        console.log("업데이트 응답:", res.data);
      };

      if (currentLang === 0) {
        const koValues = await koFormRef.current?.submit?.();
        console.log("KO 폼 데이터:", koValues);
        if (!koValues) return;
        await saveOne(koValues, "ko");
      } else {
        const enValues = await enFormRef.current?.submit?.();
        console.log("EN 폼 데이터:", enValues);
        if (!enValues) return;
        await saveOne(enValues, "en");
      }

      alert("저장 완료");
      setIsReadOnly(true);
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장 실패. 다시 시도해주세요.");
    }
  };

  return (
    <Section>
      <Tabs
        tabs={[
          { key: "ko", label: "국문" },
          { key: "en", label: "영문" },
        ]}
        defaultIndex={currentLang}
        onTabChange={(index) => {
          if (!loading) setCurrentLang(index);
        }}
        disabled={isReadOnly}
      >
        <TabPanel>
          {!loading && (
            <>
              {/* 썸네일 이미지 미리보기 */}
              {koData?.thumbImgPc?.path && (
                <div className="mb-4">
                  <p className="text-sm font-medium">PC 썸네일</p>
                  <img
                    src={encodeURI(koData.thumbImgPc.path)}
                    alt="PC 썸네일"
                    className="h-32 border object-contain"
                  />
                </div>
              )}
              {koData?.thumbImgMo?.path && (
                <div className="mb-4">
                  <p className="text-sm font-medium">모바일 썸네일</p>
                  <img
                    src={encodeURI(koData.thumbImgMo.path)}
                    alt="모바일 썸네일"
                    className="h-32 border object-contain"
                  />
                </div>
              )}

              <PressRegistForm
                ref={koFormRef}
                data={koData}
                lang="ko"
                readOnly={isReadOnly}
              />
            </>
          )}
        </TabPanel>

        <TabPanel>
          {!loading && (
            <>
              {/* 썸네일 이미지 미리보기 */}
              {enData?.thumbImgPc?.path && (
                <div className="mb-4">
                  <p className="text-sm font-medium">PC 썸네일</p>
                  <img
                    src={encodeURI(enData.thumbImgPc.path)}
                    alt="PC 썸네일"
                    className="h-32 border object-contain"
                  />
                </div>
              )}
              {enData?.thumbImgMo?.path && (
                <div className="mb-4">
                  <p className="text-sm font-medium">모바일 썸네일</p>
                  <img
                    src={encodeURI(enData.thumbImgMo.path)}
                    alt="모바일 썸네일"
                    className="h-32 border object-contain"
                  />
                </div>
              )}

              <PressRegistForm
                ref={enFormRef}
                data={enData}
                lang="en"
                readOnly={isReadOnly}
              />
            </>
          )}
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
        <Button onClick={() => navigate("/contents/whatson/media")}>
          목록
        </Button>
      </div>
    </Section>
  );
}
