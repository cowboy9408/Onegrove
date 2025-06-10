import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState } from "react";
import KeyVisualForm from "./components/KeyVisualForm";
import TopContentForm from "./components/TopContentForm";
import api from "@/lib/apiClient";
import Button from "@/components/common/Button";

function mapResponseToFormData(resData) {

  const toImageMeta = (file) => {
    if (!file || !file.name || !file.path) {
      console.warn("이미지 path 누락:", file);
      return null;
    }

    return {
      id: file.id ?? null,
      originalName: file.originalName || file.name,
      name: file.name,
      size: file.size,
      extension: "." + (file.originalName || file.name).split(".").pop(),
      mime: file.type || "image/png",
      classification: "brand",
      path: file.path,
      status: file.status ?? "C",
    };
  };
  const kv =
    resData.keyVisual?.map((item) => ({
      type: item.contentType === "V" ? "video" : "image",
      file: toImageMeta(item.contentFilePc),
      title: item.title || "",
      subtitle: item.subTitle || "",
    })) || [];

  const keyVisual =
    kv.length > 0
      ? kv
      : [
          {
            type: "image",
            file: { name: "", url: "", size: 0 },
            title: "",
            subtitle: "",
          },
        ];

  const etc =
    resData.topContents?.map((item) => ({
      type: item.type || "simple",
      image: {
        name: "",
        url: item.imgPc?.url || "",
        size: 0,
      },
    })) || [];

  return { keyVisual, etc };
}

function mapFormDataToRequest(formData, lang, id = null) {
  return {
    id: id ?? 1,
    lang,
    delYn: "N",

    keyVisual: formData.keyVisual.map((item, index) => ({
      id: null,
      contentType: item.type === "video" ? "V" : "I",
      contentFilePc: item.file?.url ? { url: item.file.url } : null,
      contentFileMo: item.file?.url ? { url: item.file.url } : null,
      title: item.title || "",
      subTitle: item.subtitle || "",
      sort: index + 1,
      delYn: "N",
    })),

    topContents: formData.etc.map((item, index) => ({
      id: null,
      type: item.type,
      imgPc: item.image?.url ? { url: item.image.url } : null,
      imgMo: item.image?.url ? { url: item.image.url } : null,
      sort: index + 1,
      delYn: "N",
    })),
  };
}

export default function WhatsonPage() {
  const emptyData = {
    keyVisual: [],
    etc: [],
  };

  const [krData, setKrData] = useState(emptyData);
  const [enData, setEnData] = useState(emptyData);
  const [currentLang, setCurrentLang] = useState(0);
  const [krId, setKrId] = useState(null);
  const [enId, setEnId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const lang = currentLang === 0 ? "ko" : "en";

      try {
        const res = await api.get(
          "/api/v1/event-promotion/contents",
          {
            params: { lang },
          },
          {
            withCredentials: true,
          }
        );

        const mapped = mapResponseToFormData(res.data.data);


        console.log("Response Data:", currentLang, lang, res.data.data.id, mapped);

        if (lang === "ko") {
          setKrId(res.data.data.id);
          setKrData(mapped);
        } else {
          setEnId(res.data.data.id);
          setEnData(mapped);
        }
      } catch {
        console.log("error nothing reset:", currentLang, lang, emptyData);
        if (lang === "ko") {
          setKrData(emptyData);
        } else {
          setEnData(emptyData);
        }
      }
    };

    fetchData();
  }, [currentLang]);

  const handleSave = async () => {
    try {
      if (currentLang === 0) {
        const krPayload = mapFormDataToRequest(krData, "ko", krId);
        await api.post("/api/v1/event-promotion/contents/insert", krPayload);
        alert("국문 저장 완료");
      } else {
        const enPayload = mapFormDataToRequest(enData, "en", enId);
        await api.post("/api/v1/event-promotion/contents/insert", enPayload);
        alert("영문 저장 완료");
      }
      window.location.reload();
    } catch (error) {
      console.error("저장 오류:", error);
      alert("필수입력 내용을 다시 확인해 주세요.");
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
            data={krData.keyVisual || []}
            setData={(newVal) =>
              setKrData((prev) => ({ ...prev, keyVisual: newVal }))
            }
          />
          <TopContentForm
            data={krData.etc}
            setData={(newVal) =>
              setKrData((prev) => ({ ...prev, etc: newVal }))
            }
          />
        </TabPanel>

        <TabPanel>
          <KeyVisualForm
            data={krData.keyVisual || []}
            setData={(newVal) =>
              setEnData((prev) => ({ ...prev, keyVisual: newVal }))
            }
          />
          <TopContentForm
            data={enData.etc}
            setData={(newVal) =>
              setEnData((prev) => ({ ...prev, etc: newVal }))
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
