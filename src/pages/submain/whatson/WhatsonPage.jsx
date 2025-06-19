import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import KeyVisualForm from "./components/KeyVisualForm";
import api from "@/lib/apiClient";
import Button from "@/components/common/Button";
import TopContentForm from "./components/TopContentForm";

export default function WhatsonPage() {
  const emptyData = {
    keyVisual: [],
    etc: [],
  };

  const keyVisualKRRef = useRef();
  const keyVisualENRef = useRef();

  const [keyVisuals, setKeyVisuals] = useState({
    ko: [],
    en: [],
  });

  const [ids, setIds] = useState({
    ko: null,
    en: null,
  });

  const [currentLang, setCurrentLang] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const lang = currentLang === 0 ? "ko" : "en";

      try {
        const res = await api.get("/api/v1/event-promotion/contents", {
          params: { lang },
          withCredentials: true,
        });

        const item = res.data?.data;

        if (!item || item.lang !== lang) {
          setKeyVisuals((prev) => ({ ...prev, [lang]: [] }));
          setIds((prev) => ({ ...prev, [lang]: null }));
          return;
        }

        const mergedKV = (item.keyVisual || []).map((v) => ({
          id: v.id,
          type: v.contentType === "V" ? "video" : "image",
          file1: v.contentFilePc ?? null,
          file2: v.contentFileMo ?? null,
          title: v.title ?? "",
          subtitle: v.subTitle ?? "",
        }));

        setKeyVisuals((prev) => ({ ...prev, [lang]: mergedKV }));
        setIds((prev) => ({ ...prev, [lang]: item.id || null }));
      } catch (err) {
        console.error("조회 실패:", err);
        setKeyVisuals((prev) => ({ ...prev, [lang]: [] }));
        setIds((prev) => ({ ...prev, [lang]: null }));
      }
    };

    fetchData();
  }, [currentLang]);

  const handleSave = async () => {
    const lang = currentLang === 0 ? "ko" : "en";
    const ref = currentLang === 0 ? keyVisualKRRef : keyVisualENRef;

    try {
      const result = await ref.current.submit((err) => alert(err));
      if (!result) return;

      console.log("전송 데이터 확인:", result);
      await api.post("/api/v1/event-promotion/contents/insert", result);
      alert(lang === "ko" ? "국문 저장 완료" : "영문 저장 완료");
      window.location.reload();
    } catch (error) {
      console.error("저장 오류:", error);
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
            ref={keyVisualKRRef}
            lang="ko"
            mainId={ids.ko}
            data={keyVisuals.ko}
            setData={(newVal) =>
              setKeyVisuals((prev) => ({ ...prev, ko: newVal }))
            }
          />
          <TopContentForm />
        </TabPanel>

        <TabPanel>
          <KeyVisualForm
            ref={keyVisualENRef}
            lang="en"
            mainId={ids.en}
            data={keyVisuals.en}
            setData={(newVal) =>
              setKeyVisuals((prev) => ({ ...prev, en: newVal }))
            }
          />
          <TopContentForm />
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
