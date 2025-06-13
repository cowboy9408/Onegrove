import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import KeyVisualForm from "./components/KeyVisualForm";
import WhatsOnForm from "./components/WhatsOnForm";
import LifestyleForm from "./components/LifestyleForm";
import WorkForm from "./components/WorkForm";
import EtcContentForm from "./components/EtcContentForm";
import WhatsonContent from "./components/WhatsonContent";
import { useForm, FormProvider } from "react-hook-form";
import api from "@/lib/apiClient";
import Button from "@/components/common/Button";

export default function MainPage() {
  const keyVisualKRRef = useRef();
  const keyVisualENRef = useRef();
  const [keyVisuals, setKeyVisuals] = useState({
    ko: [],
    en: [],
  });

  const [whatsOn, setWhatsOn] = useState({});
  const [lifestyle, setLifestyle] = useState({});
  const [work, setWork] = useState({});
  const [etc, setEtc] = useState([]);
  const methods = useForm({
    defaultValues: {
      contents: [
        {
          ids: [],
          selectedTitles: "",
          uploadFile: null,
        },
      ],
    },
  });

  const fetchMainData = async (lang) => {
    try {
      const res = await api.get(`/api/v1/main/${lang}`);
      const data = res?.data?.data;

      if (!res.data?.success) {
        console.error(`${lang} 응답 실패`, res.data);
        return;
      }

      if (!data || !Array.isArray(data.keyVisualList)) {
        console.warn(`${lang} 데이터 없음`, data);
        setKeyVisuals((prev) => ({ ...prev, [lang]: [] }));
        return;
      }

      const list = data.keyVisualList.map((item) => ({
        id: item.id,
        type: item.contentType === "I" ? "image" : "video",
        title: item.title,
        subtitle: item.subTitle,
        file1: item.pcImg,
        file2: item.moImg,
      }));

      setKeyVisuals((prev) => ({
        ...prev,
        [lang]: list,
      }));
    } catch (err) {
      console.error(`${lang} 데이터 조회 실패`, err);
    }
  };

  useEffect(() => {
    fetchMainData("ko");
    fetchMainData("en");
  }, []);

  const handleSaveKeyVisual = async (lang) => {
    const ref = lang === "ko" ? keyVisualKRRef : keyVisualENRef;
    const payload = await ref.current?.submit((msg) => alert(msg));
    if (!payload) return;

    try {
      const res = await api.post("/api/v1/main/insert/keyVisual", payload);
      if (res.data?.success) {
        alert(`${lang.toUpperCase()} 저장 완료`);
        await fetchMainData(lang); // 다시 조회해서 반영
      } else {
        alert("저장 실패: " + res.data?.message);
      }
    } catch (e) {
      alert("저장 중 오류 발생");
      console.error(e);
    }
  };

  return (
    <FormProvider {...methods}>
      <Section>
        <Tabs
          tabs={[
            { key: "kr", label: "국문" },
            { key: "en", label: "영문" },
          ]}
        >
          <TabPanel>
            {/* 국문 폼 */}
            <KeyVisualForm
              ref={keyVisualKRRef}
              data={keyVisuals.ko}
              lang="ko"
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveKeyVisual("ko")}>저장</Button>
            </div>
            <WhatsOnForm data={whatsOn} />
            <WhatsonContent />
            <LifestyleForm data={lifestyle} />
            <WorkForm data={work} />
            <EtcContentForm data={etc} />
          </TabPanel>

          <TabPanel>
            {/* 영문 폼 */}
            <KeyVisualForm
              ref={keyVisualENRef}
              data={keyVisuals.en}
              lang="en"
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveKeyVisual("en")}>저장</Button>
            </div>
            <WhatsOnForm data={whatsOn} />
            <WhatsonContent />
            <LifestyleForm data={lifestyle} />
            <WorkForm data={work} />
            <EtcContentForm data={etc} />
          </TabPanel>
        </Tabs>
      </Section>
    </FormProvider>
  );
}
