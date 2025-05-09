import { useEffect, useRef, useState } from "react";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import Section from "@/components/layout/Section";
import Button from "@/components/common/Button";
import BrandRegistForm from "./component/BrandRegistFom"
import { useNavigate } from "react-router-dom";

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
    const now = new Date().toISOString();

    if (currentLang === 0) {
      const ko = await koFormRef.current?.submit();
      if (!ko) return;
      const newBrand = { ko: { ...ko, created_at: now } };
      const existing = JSON.parse(localStorage.getItem("brands") || "[]");
      const updated = [...existing, newBrand];
      localStorage.setItem("brands", JSON.stringify(updated));
    } else {
      const en = await enFormRef.current?.submit();
      if (!en) return;
      const existing = JSON.parse(localStorage.getItem("brands") || "[]");

      const lastBrand = existing[existing.length - 1];
      if (lastBrand?.ko && !lastBrand?.en) {
        lastBrand.en = { ...en };
        localStorage.setItem("brands", JSON.stringify(existing));
      } else {
        const newBrand = { en: { ...en } };
        const updated = [...existing, newBrand];
        localStorage.setItem("brands", JSON.stringify(updated));
      }
    }

    alert("저장되었습니다.");
    navigate("/retail/brand");
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
