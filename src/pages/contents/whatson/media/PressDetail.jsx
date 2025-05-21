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

  const [koData, setKoData] = useState({});
  const [enData, setEnData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(true);

  // 상세 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/v1/press/${pmId}`);
        console.log("API 응답 전체:", res);

        const items = res.data?.data;
        if (!Array.isArray(items)) {
          console.warn("데이터 배열이 아님:", res.data);
          return;
        }

        const ko = items.find((item) => item.lang === "ko");
        const en = items.find((item) => item.lang === "en");

        console.log("ko:", ko);
        console.log("en:", en);

        setKoData(ko || {});
        setEnData(en || {});
        setLoading(false);
      } catch (err) {
        console.error("데이터 불러오기 오류:", err);
      }
    };
    fetchData();
  }, [pmId]);

  // 저장하기
  const handleSave = async () => {
    try {
      const activeRef = currentLang === 0 ? koFormRef : enFormRef;
      const formValues = await activeRef.current?.submit?.();
      if (!formValues) return;

      const payload = {
        id: Number(pmId),
        category: formValues.category,
        title: formValues.title,
        thumbImgPc: formValues.imgPc?.path || null,
        thumbImgMo: formValues.imgMo?.path || null,
        showYn: formValues.status === "active" ? "Y" : "N",
        content: formValues.content1,
        publish_date: formValues.publish_date,
      };

      console.log(
        `[${currentLang === 0 ? "KO" : "EN"}] 수정 요청 데이터:`,
        payload
      );
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
