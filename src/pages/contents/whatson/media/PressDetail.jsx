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
        console.log("📡 API 응답 결과:", res.data);

        const list = Array.isArray(res.data?.data) ? res.data.data : [];

        const ko = list.find((item) => item.lang === "ko") || null;
        const en = list.find((item) => item.lang === "en") || null;

        console.log("✅ koData:", ko);
        console.log("✅ enData:", en);

        setKoData(ko);
        setEnData(en);
        setLoading(false);
      } catch (err) {
        console.error("📛 API 호출 실패:", err);
        setKoData(null);
        setEnData(null);
        setLoading(false);
      }
    };
    fetchData();
  }, [pmId]);

  useEffect(() => {
    if (!loading) {
      const patchForm = (formRef, data) => {
        if (!formRef || !data) return;
        formRef.setValue("category", data.categoryCode || "");
        formRef.setValue("title", data.title || "");
        formRef.setValue("status", data.showYn === "Y" ? "active" : "inactive");
        formRef.setValue("publish_date", data.publishDate || "");
        formRef.setValue("imgPc", data.thumbImgPc || null);
        formRef.setValue("imgMo", data.thumbImgMo || null);
        formRef.setValue("content1", data.content || "");
      };

      patchForm(koFormRef.current, koData);
      patchForm(enFormRef.current, enData);
    }
  }, [loading, koData, enData]);

  useEffect(() => {
    if (!loading) {
      console.log("🧩 koFormRef.current:", koFormRef.current);
      console.log("🧩 enFormRef.current:", enFormRef.current);
    }
  }, [loading]);

  useEffect(() => {
    console.log("📦 KO 데이터:", koData);
    console.log("📦 EN 데이터:", enData);
  }, [koData, enData]);

  const handleSave = async () => {
    try {
      const activeRef = currentLang === 0 ? koFormRef : enFormRef;
      const formValues = await activeRef.current?.submit?.();
      if (!formValues) return;

      const payload = {
        id: Number(pmId),
        title: formValues.title,
        thumbImg: formValues.imgPc,
        showYn: formValues.status === "active" ? "Y" : "N",
        content: formValues.content1,
        source: formValues.source,
        updateUser: 2,
        categoryCode: formValues.category,
        publishDate: formValues.publish_date,
      };

      await api.put(`/api/v1/press/update`, payload);

      alert("수정이 완료되었습니다.");
      setIsReadOnly(true);
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 중 오류가 발생했습니다.");
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
            <PressRegistForm
              ref={koFormRef}
              data={koData}
              lang="ko"
              readOnly={isReadOnly}
            />
          )}
        </TabPanel>
        <TabPanel>
          {!loading && (
            <PressRegistForm
              ref={enFormRef}
              data={enData}
              lang="en"
              readOnly={isReadOnly}
            />
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
