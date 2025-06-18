import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import KeyVisualForm from "./components/KeyVisualForm";

import api from "@/lib/apiClient";
import Button from "@/components/common/Button";

export default function LifeStylePage() {
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
        const res = await api.get("/api/v1/lifestyle", {
          params: { lang },
          withCredentials: true,
        });

        // 같은 언어(lang)의 keyVisual 항목들을 모두 병합
        const items = res.data.data?.filter((item) => item.lang === lang) || [];
        const mergedKV = items.flatMap((item) =>
          item?.keyVisual?.map((v) => ({
            id: v.id,
            type: v.contentType === "V" ? "video" : "image",
            file1: v.contentFilePc ? { ...v.contentFilePc } : null,
            file2: v.contentFileMo ? { ...v.contentFileMo } : null,
            title: v.title ?? "",
            subtitle: v.subTitle ?? "",
          }))
        );

        // 최신 아이템 ID 하나만 대표로 사용 (예: 가장 마지막 ID)
        const latestItem = items[items.length - 1];
        setKeyVisuals((prev) => ({ ...prev, [lang]: mergedKV }));
        setIds((prev) => ({ ...prev, [lang]: latestItem?.id || null }));
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

      await api.post("/api/v1/lifestyle/insert", result);
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
