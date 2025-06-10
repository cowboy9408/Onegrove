import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import KeyVisualForm from "./components/KeyVisualForm";
import api from "@/lib/apiClient";
import Button from "@/components/common/Button";

export default function LifeStylePage() {
  const krRef = useRef();
  const enRef = useRef();
  const emptyData = {
    keyVisual: [],
  };

  const [krData, setKrData] = useState(emptyData);
  const [enData, setEnData] = useState(emptyData);
  const [currentLang, setCurrentLang] = useState(0);
  const [krId, setKrId] = useState(null);
  const [enId, setEnId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const lang = currentLang === 0 ? "ko" : "en";
      const res = await api.get(`/api/v1/lifestyle?lang=${lang}`);
      const keyVisual = res.data?.data || [];

      console.log("Fetched Key Visual Data:", keyVisual);

      const mapped = keyVisual.map((item, index) => ({
        // ...item.keyVisual,
        id: item?.id || null,
        contentType: item?.keyVisual?.[0]?.contentType || "I",
        contentFilePc: item?.keyVisual?.[0]?.contentFilePc || null,
        contentFileMo: item?.keyVisual?.[0]?.contentFileMo || null,
        title: item?.keyVisual?.[0]?.title || "",
        subtitle: item?.keyVisual?.[0]?.subTitle || "",
        sort: (index+1) || 1,
        delYn: item?.keyVisual?.[0]?.delYn || "N",
        type: item.contentType === "V" ? "video" : "image",
      }));

      

      const id = res.data?.data?.id || 1;

      console.log("Mapped Key Visual Data:", mapped, id);

      if (lang === "ko") {
        setKrData({ keyVisual: mapped });
        setKrId(id);
      } else {
        setEnData({ keyVisual: mapped });
        setEnId(id);
      }
    };

    fetchData();
  }, [currentLang]);

  const handleSave = async () => {
    const isKorean = currentLang === 0;
    const ref = isKorean ? krRef : enRef;
    const lang = isKorean ? "ko" : "en";
    const id = isKorean ? krId : enId;

    const keyVisual = await ref.current?.submit();

    
    if (!keyVisual) return;

    const payload = {
      lifeId: id ?? 0,
      lang: lang,
      delYn: "N",
      keyVisual: keyVisual,
    };

    console.log("Key Visual to Save:", payload);

    try {
      await api.post("/api/v1/lifestyle/insert", payload);
      alert("저장 완료");

      //저장 후 새로고침 시 데이터를 다시 가져오기
      const res = await api.get(`/api/v1/lifestyle?lang=${lang}`);
      const newKeyVisual = res.data?.data || [];
      const newId = res.data?.data?.id;

      // const mapped = newKeyVisual.map((item) => ({
      //   ...item,
      //   contentFilePc: item.contentFilePc,
      //   contentFileMo: item.contentFileMo,
      // }));

      const mapped = newKeyVisual.map((item, index) => ({
        // ...item.keyVisual,
        id: item?.id || null,
        contentType: item?.keyVisual?.[0]?.contentType || "I",
        contentFilePc: item?.keyVisual?.[0]?.contentFilePc || null,
        contentFileMo: item?.keyVisual?.[0]?.contentFileMo || null,
        title: item?.keyVisual?.[0]?.title || "",
        subtitle: item?.keyVisual?.[0]?.subTitle || "",
        sort: (index+1) || 1,
        delYn: item?.keyVisual?.[0]?.delYn || "N",
        type: item.contentType === "V" ? "video" : "image",
      }));

      if (isKorean) {
        setKrData({ keyVisual: mapped });
        setKrId(newId);
      } else {
        setEnData({ keyVisual: mapped });
        setEnId(newId);
      }
    } catch (error) {
      console.error("저장 실패", error);
      alert("저장에 실패했습니다.");
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
          <KeyVisualForm ref={krRef} data={krData.keyVisual} />
        </TabPanel>

        <TabPanel>
          <KeyVisualForm ref={enRef} data={enData.keyVisual} />
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
