import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import Section from "@/components/layout/Section";
import Button from "@/components/common/Button";
import PressRegistForm from "./component/PressRegistForm";
import api from "@/lib/apiClient";

export default function PressDetail() {
  const navigate = useNavigate();
  const { pmId } = useParams();

  const [currentLang, setCurrentLang] = useState(0); // 0 = 국문, 1 = 영문
  const koFormRef = useRef();
  const enFormRef = useRef();

  const [koData, setKoData] = useState({});
  const [enData, setEnData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(true);

  // 상세 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const koRes = await api.get(`/api/v1/press/${pmId}?lang=KO`);
        const enRes = await api.get(`/api/v1/press/${pmId}?lang=EN`);
        setKoData(koRes.data || {});
        setEnData(enRes.data || {});
        setLoading(false);
      } catch (err) {
        console.error("기사 상세 조회 실패:", err);
      }
    };
    fetchData();
  }, [pmId]);

  // 저장하기
  const handleSave = async () => {
    try {
      const activeRef = currentLang === 0 ? koFormRef : enFormRef;
      const langCode = currentLang === 0 ? "KO" : "EN";
      const formValues = await activeRef.current?.submit?.();
      if (!formValues) return;

      const payload = {
        ...formValues,
        id: pmId,
        lang: langCode,
        status: formValues.status === "active" ? "Y" : "N",
        startDate: formValues.startDate,
        content1: formValues.content1,
      };

      console.log(`[${langCode}] 저장할 데이터:`, payload);
      await api.put(`/api/v1/press/${pmId}`, payload);

      alert("저장 완료");
      setIsReadOnly(true);
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장 중 오류 발생");
    }
  };

  return (
    <Section>
      <Tabs
        tabs={[
          { key: "ko", label: "국문" },
          { key: "en", label: "영문" },
        ]}
        defaultIndex={0}
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
              setData={setKoData}
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
              setData={setEnData}
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
