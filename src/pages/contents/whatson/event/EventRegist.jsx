import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import EventRegistForm from "./components/EventRegistForm";
import Button from "@/components/common/Button";
import { useNavigate } from "react-router-dom"; 

export default function EventRegist() {
  const [currentLang, setCurrentLang] = useState(0); // 0 = 국문, 1 = 영문
  const navigate = useNavigate(); 
  const koFormRef = useRef();
const enFormRef = useRef();

  
  // 국문 상태
  const [koData, setKoData] = useState({
    keyVisual: [],
    whatsOn: {},
    lifestyle: {},
    work: {},
    etc: [],
    banner: {},
  });
  // 영문 상태
  const [enData, setEnData] = useState({
    keyVisual: [],
    whatsOn: {},
    lifestyle: {},
    work: {},
    etc: [],
    banner: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const saved = localStorage.getItem("event");
        if (saved) {
          const parsed = JSON.parse(saved);
          setKoData(parsed.ko);
          setEnData(parsed.en);
        } else {
          // 백엔드 API 호출 or 목업 fallback
          const res = await api.get("/event");
          setKoData(res.data.ko);
          setEnData(res.data.en);
        }
      } catch (err) {
        console.warn("데이터 불러오기 실패 - mock 데이터로 대체");
  
        const mock = {
          keyVisual: [
            { type: "image", title: "title1", subtitle: "subtitle1" },
            { type: "image", title: "title2", subtitle: "subtitle2" },
          ],
          whatsOn: {
            subtitle: "샘플 서브타이틀",
            type: "image",
            url: "https://example.com",
            contents: [],
          },
          lifestyle: {
            subtitle1: "브랜드 소개",
            subtitle2: "브랜드 부제목",
            brand: [],
          },
          work: {
            subtitle1: "작업내용1",
            subtitle2: "작업내용2",
            file: [],
          },
          etc: [],
          banner: {
            displayYn: "Y",
            title: "배너 타이틀",
            subtitle: "배너 서브타이틀",
            image: { name: "", url: "", size: 0 },
            button: "자세히 보기",
            bg: "#FFFFFF",
            color: "#000000",
            url: "https://example.com",
          },
        };
  
        setKoData(mock);
        setEnData(mock);
      }
    };
  
    fetchData();
  }, []);

  const handleSave = async () => {
    const now = new Date().toISOString();
  
    if (currentLang === 0) {
      const ko = await koFormRef.current?.submit();
      if (!ko) return;
  
      const newEvent = { ko: { ...ko, created_at: now } };
  
      const existing = JSON.parse(localStorage.getItem("events") || "[]");
      const updated = [...existing, newEvent];
      localStorage.setItem("events", JSON.stringify(updated));
    } else {
      const en = await enFormRef.current?.submit();
      if (!en) return;
  
      const existing = JSON.parse(localStorage.getItem("events") || "[]");
  
      // 기존 이벤트 중 마지막 항목의 ko 데이터가 있는 경우, 덮어쓰기
      const lastEvent = existing[existing.length - 1];
      if (lastEvent?.ko && !lastEvent?.en) {
        lastEvent.en = { ...en };
        localStorage.setItem("events", JSON.stringify(existing));
      } else {
        const newEvent = { en: { ...en } };
        const updated = [...existing, newEvent];
        localStorage.setItem("events", JSON.stringify(updated));
      }
    }
  
    alert("저장되었습니다.");
    navigate("/contents/whatson/event/list");
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
      <EventRegistForm
    ref={koFormRef}
    data={koData}
    setData={setKoData}
    lang="ko"
  />
      </TabPanel>

      <TabPanel>
      <EventRegistForm
    ref={enFormRef}
    data={enData}
    setData={setEnData}
    lang="en"
  />
      </TabPanel>
    </Tabs>
    <div className="flex justify-end gap-4 px-6 pb-6">
  <Button onClick={handleSave} variant="default">
    저장
  </Button>
  <Button
            type="button"
            className="bg-gray-200"
            onClick={() => navigate("/contents/whatson/event/list")}
          >
            목록
          </Button>
</div>
  </Section>
  );
}
