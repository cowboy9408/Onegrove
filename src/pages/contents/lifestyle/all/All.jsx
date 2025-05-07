import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState } from "react";
import KeyVisualForm from "./components/KeyVisualForm";
import BannerForm from "./components/BannerForm";
import BrandForm from "./components/BrandForm"
import Button from "@/components/common/Button";
import api from "@/lib/apiClient";

export default function All() {
  const [krData, setKrData] = useState({ keyVisual: [], etc: [], banner: {} });
  const [enData, setEnData] = useState({ keyVisual: [], etc: [], banner: {} });
  const [currentLang, setCurrentLang] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const local = localStorage.getItem("lifestyle");
        if (local) {
          const parsed = JSON.parse(local);
          setKrData(parsed.kr);
          setEnData(parsed.en);
          return;
        }
  
        const res = await api.get("/lifestyle");
        setKrData(res.data.kr);
        setEnData(res.data.en);
      } catch (error) {
        console.warn("백엔드 연결 실패 - mock 데이터로 대체");
        setKrData({
          keyVisual: [{ type: "image", title: "제목1", subtitle: "부제목1" }],
          lifestyle: {},
          banner: {},
        });
        setEnData({
          keyVisual: [{ type: "image", title: "Title1", subtitle: "Subtitle1" }],
          lifestyle: {},
          banner: {},
        });
      }
    };
  
    fetchData();
  }, []);

  const handleSave = () => {
    const payload = {
      kr: krData,
      en: enData,
    };
  
    localStorage.setItem("lifestyle", JSON.stringify(payload));
    alert("저장되었습니다.");
    location.reload(); // 
  };

  return (
    <Section>
      <Tabs
        tabs={[
          { key: "kr", label: "국문" },
          { key: "en", label: "영문" },
        ]}
        defaultIndex={0}
  onTabChange={(index) => setCurrentLang(index)}
      >
        <TabPanel>
    <KeyVisualForm data={krData.keyVisual} setData={(v) => setKrData(p => ({ ...p, keyVisual: v }))} />
    <BrandForm data={krData.lifestyle} setData={(v) => setKrData(p => ({ ...p, lifestyle: v }))} />
    <BannerForm data={krData.banner} setData={(v) => setKrData(p => ({ ...p, banner: v }))} />
  </TabPanel>

  <TabPanel>
    <KeyVisualForm data={enData.keyVisual} setData={(v) => setEnData(p => ({ ...p, keyVisual: v }))} />
    <BrandForm data={enData.lifestyle} setData={(v) => setEnData(p => ({ ...p, lifestyle: v }))} />
    <BannerForm data={enData.banner} setData={(v) => setEnData(p => ({ ...p, banner: v }))} />
  </TabPanel>
      </Tabs>
      <div className="mt-8 flex justify-end">
              <Button onClick={handleSave} variant="default">
                저장
              </Button>
            </div>
    </Section>
  );
}
