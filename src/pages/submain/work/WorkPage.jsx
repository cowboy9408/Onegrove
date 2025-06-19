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

  const workKRRef = useRef();
  const workENRef = useRef();
  const [workContents, setWorkContents] = useState({
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
        const res = await api.get(`/api/v1/work/${lang}`, {
          withCredentials: true,
        });

        const item = res.data?.data;

        if (!item || item.lang?.toLowerCase() !== lang) {
          setKeyVisuals((prev) => ({ ...prev, [lang]: [] }));
          setWorkContents((prev) => ({ ...prev, [lang]: [] }));
          setIds((prev) => ({ ...prev, [lang]: null }));
          return;
        }

        const mergedKV = (item.keyVisualList || []).map((v) => ({
          id: v.id,
          type: v.type === "V" ? "video" : "image",
          file1: v.pcImg ?? null,
          file2: v.moImg ?? null,
          title: v.title ?? "",
          subtitle: v.subTitle ?? "",
        }));

        const mergedWork = (item.contentList || []).map((v) => ({
          id: v.id,
          title: v.title ?? "",
          subtitle: v.subTitle ?? "",
          file1: v.pcImg ?? null,
          file2: v.moImg ?? null,
        }));

        setKeyVisuals((prev) => ({ ...prev, [lang]: mergedKV }));
        setWorkContents((prev) => ({ ...prev, [lang]: mergedWork }));
        setIds((prev) => ({ ...prev, [lang]: item.id || null }));
      } catch (err) {
        console.error("조회 실패:", err);
        setKeyVisuals((prev) => ({ ...prev, [lang]: [] }));
        setWorkContents((prev) => ({ ...prev, [lang]: [] }));
        setIds((prev) => ({ ...prev, [lang]: null }));
      }
    };

    fetchData();
  }, [currentLang]);

  const handleSave = async () => {
    const lang = currentLang === 0 ? "ko" : "en";
    const kvRef = currentLang === 0 ? keyVisualKRRef : keyVisualENRef;
    const workRef = currentLang === 0 ? workKRRef : workENRef;

    try {
      const kvResult = await kvRef.current.submit((err) => alert(err));
      const contentList = await workRef.current.submit((err) => alert(err));
      if (!kvResult || !contentList) return;

      const payload = {
        id: kvResult.mainId || null,
        lang: lang.toUpperCase(),
        keyVisualList: kvResult.keyVisualList,
        contentList: contentList,
      };

      await api.post("/api/v1/work/update", payload);
      alert(lang === "ko" ? "저장 완료 (국문)" : "저장 완료 (영문)");
      window.location.reload();
    } catch (err) {
      console.error("저장 오류:", err);
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
          <WorkForm
            ref={workKRRef}
            data={workContents.ko}
            setData={(newVal) =>
              setWorkContents((prev) => ({ ...prev, ko: newVal }))
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
          <WorkForm
            ref={workENRef}
            data={workContents.en}
            setData={(newVal) =>
              setWorkContents((prev) => ({ ...prev, en: newVal }))
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
