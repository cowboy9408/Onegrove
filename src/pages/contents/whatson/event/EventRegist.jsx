import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import EventRegistForm from "./components/EventRegistForm";
import Button from "@/components/common/Button";
import { useNavigate } from "react-router-dom";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";

export default function EventRegist() {
  const [currentLang, setCurrentLang] = useState(0); // 0 = 국문, 1 = 영문
  const navigate = useNavigate();
  const koFormRef = useRef();
  const enFormRef = useRef();
  const { showModal } = useModal();

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
    const ref = currentLang === 0 ? koFormRef : enFormRef;
    const form = await ref.current?.submit();
    if (!form) return;

    const payload = {
      eventId: null,
      showYn: form.status === "active" ? "Y" : "N",
      sort: Number(form.order),
      lang: currentLang === 0 ? "ko" : "en",
      category: form.category || "ep0101",
      title: form.title,
      thumbImg: form.thumbImg,
      imgBodyPc: form.imgBodyPc,
      imgBodyMo: form.imgBodyMo,
      imgPc: form.imgPc,
      imgMo: form.imgMo,
      content: form.content1,
      description: form.content2,
      startDate: form.startDate,
      endDate: form.endDate,
      brandId: form.lifestyle?.brand?.[0],
      delYn: "N",
    };

    try {
      await api.post("/api/v1/event-promotion/item/insert", payload);
      alert("저장되었습니다.");
      navigate("/contents/whatson/event/list");
    } catch (err) {
      console.error("저장 실패", err);
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
        <Button
          onClick={() =>
            showModal({
              title: "저장 확인",
              message: "저장하시겠습니까?",
              showCancel: true,
              onConfirm: handleSave,
            })
          }
        >
          저장
        </Button>
        <Button
          type="button"
          className="bg-gray-200"
          onClick={() =>
            showModal({
              title: "이동 확인",
              message: "이전 페이지로 돌아갈 경우 입려한 정보가 사라집니다.",
              showCancel: true,
              onConfirm: () => navigate("/contents/whatson/event/list"),
            })
          }
        >
          목록
        </Button>
      </div>
    </Section>
  );
}
