import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState } from "react";
import KeyVisualForm from "../../lifestyle/all/components/KeyVisualForm";
import TopContentForm from "./components/TopContentForm";
import BannerForm from "./components/BannerForm";
import api from "@/lib/apiClient";
import Button from "@/components/common/Button";

export default function WhatsOnRegist() {
  const [krData, setKrData] = useState({ keyVisual: [], etc: [], banner: {} });
  const [enData, setEnData] = useState({ keyVisual: [], etc: [], banner: {} });
  const [currentLang, setCurrentLang] = useState(0);

  // 실제 연동 구조에 맞춘 mock 기반 개발
  useEffect(() => {
    const fetchData = async () => {
      try {
// 로컬스토리지에 mock 데이터가 있으면 우선 사용
const local = localStorage.getItem("whatson");
if (local) {  
  const parsed = JSON.parse(local);
  setKrData(parsed.kr);
  setEnData(parsed.en);
  return; // 실제 API 호출 생략
}
        const res = await api.get("/whatson"); // 실제 백엔드 연동 시도
        setKrData(res.data.kr);
        setEnData(res.data.en);
      } catch (error) {
        console.warn("백엔드 연결 실패 - mock 데이터로 대체");
        setKrData({
          keyVisual: [{ type: "image", title: "제목1", subtitle: "부제목1" }],
          etc: [
            {
              type: "complex",
              image: { name: "", url: "", size: 0 },
              url: "",
              title: "",
              subtitle: "",
              detail: "",
              button: "",
            },
          ],
          banner: {},
        });

        setEnData({
          keyVisual: [{ type: "image", title: "Title1", subtitle: "Subtitle1" }],
          etc: [
            {
              type: "complex",
              image: { name: "", url: "", size: 0 },
              url: "",
              title: "",
              subtitle: "",
              detail: "",
              button: "",
            },
          ],
          banner: {},
        });
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    const payload = {
      kr: krData,
      en: enData,
    };
    localStorage.setItem("whatson", JSON.stringify(payload));
    

    try {
      await api.post("/whatson", payload);
      alert("저장되었습니다.");
      window.location.reload();
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
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
        onTabChange={(index) => setCurrentLang(index)}
      >
        <TabPanel>
          <KeyVisualForm
            data={krData.keyVisual}
            setData={(newVal) => setKrData((prev) => ({ ...prev, keyVisual: newVal }))}
          />
          <TopContentForm
            data={krData.etc}
            setData={(newVal) => setKrData((prev) => ({ ...prev, etc: newVal }))}
          />
          <BannerForm
            data={krData.banner}
            setData={(newVal) => setKrData((prev) => ({ ...prev, banner: newVal }))}
          />
        </TabPanel>

        <TabPanel>
          <KeyVisualForm
            data={enData.keyVisual}
            setData={(newVal) => setEnData((prev) => ({ ...prev, keyVisual: newVal }))}
          />
          <TopContentForm
            data={enData.etc}
            setData={(newVal) => setEnData((prev) => ({ ...prev, etc: newVal }))}
          />
          <BannerForm
            data={enData.banner}
            setData={(newVal) => setEnData((prev) => ({ ...prev, banner: newVal }))}
          />
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
