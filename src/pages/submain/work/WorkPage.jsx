import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import KeyVisualForm from "./components/KeyVisualForm";
import api from "@/lib/apiClient";
import Button from "@/components/common/Button";
import WorkForm from "./components/WorkForm";

export default function WorkPage() {
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
    const langCode = currentLang === 0 ? "KO" : "EN";
    const langKey = langCode.toLowerCase();

    const fetchData = async () => {
      try {
        const res = await api.get(`/api/v1/work/${langCode}`, {
          withCredentials: true,
        });

        const item = res.data;

        const mergedKV = item?.keyVisualList?.map((v) => ({
          id: v.id,
          type: v.type === "V" ? "video" : "image",
          title: v.title ?? "",
          subtitle: v.subTitle ?? "",
          file1: v.pcImg ? { ...v.pcImg, status: "R" } : null, // status를 명시
          file2: v.moImg ? { ...v.moImg, status: "R" } : null,
        }));

        setKeyVisuals((prev) => {
          if (JSON.stringify(prev[langKey]) === JSON.stringify(mergedKV))
            return prev;
          return { ...prev, [langKey]: mergedKV };
        });

        setIds((prev) => {
          if (prev[langKey] === item?.id) return prev;
          return { ...prev, [langKey]: item?.id ?? null };
        });
      } catch (err) {
        console.error("조회 실패:", err);
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

      await api.post("/api/v1/work/update", result);
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
          <WorkForm />
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
          <WorkForm />
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
