import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState } from "react";
import KeyVisualForm from "../../lifestyle/all/components/KeyVisualForm";
import TopContentForm from "./components/TopContentForm";
import BannerForm from "./components/BannerForm";
import api from "@/lib/apiClient";
import Button from "@/components/common/Button";

function mapResponseToFormData(resData) {
  const kv =
    resData.keyVisual?.map((item) => ({
      type: item.contentType === "V" ? "video" : "image",
      file: { name: "", url: "", size: 0 },
      title: item.title || "",
      subtitle: item.subTitle || "",
    })) || [];

  const etc =
    resData.topContents?.map((item) => ({
      type: "complex",
      image: { name: "", url: "", size: 0 },
      category: item.category || "",
      title: item.mainTitle || "",
      subtitle: item.subTitle || "",
      detail: "",
      button: item.btnName || "",
      url: item.url || "",
    })) || [];

  const banner = {
    bannerNB: resData.banner?.bannerType || "",
    displayYn: resData.banner?.bannerShowYn || "",
    title: resData.banner?.bannerTitle || "",
    subtitle: resData.banner?.bannerSubTitle || "",
    image: { name: "", url: "", size: 0 },
    button: resData.banner?.bannerBtnName || "",
    bg: resData.banner?.bannerBtnBackground || "",
    color: resData.banner?.bannerBtnColor || "",
    url: resData.banner?.bannerUrl || "",
  };

  return { keyVisual: kv, etc, banner };
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
      category: item.category || "",
      mainTitle: item.title || "",
      subTitle: item.subtitle || "",
      imgPc: item.image?.url ? { url: item.image.url } : null,
      imgMo: item.image?.url ? { url: item.image.url } : null,
      btnName: item.button || "",
      url: item.url || "",
      sort: index + 1,
      delYn: "N",
    })),

    banner: {
      bannerType: formData.banner?.bannerNB || "",
      bannerShowYn: formData.banner?.displayYn || "",
      bannerTitle: formData.banner?.title || "",
      bannerSubTitle: formData.banner?.subtitle || "",
      bannerImgPc: formData.banner?.image?.url
        ? { url: formData.banner.image.url }
        : null,
      bannerImgMo: formData.banner?.image?.url
        ? { url: formData.banner.image.url }
        : null,
      bannerBtnName: formData.banner?.button || "",
      bannerBtnBackground: formData.banner?.bg || "",
      bannerBtnColor: formData.banner?.color || "",
      bannerUrl: formData.banner?.url || "",
    },
  };
}

export default function WhatsOnRegist() {
  const [krData, setKrData] = useState({ keyVisual: [], etc: [], banner: {} });
  const [enData, setEnData] = useState({ keyVisual: [], etc: [], banner: {} });
  const [currentLang, setCurrentLang] = useState(0);
  const [krId, setKrId] = useState(null);
  const [enId, setEnId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lang = currentLang === 0 ? "ko" : "en";

        const res = await api.get("/api/v1/event-promotion/contents", {
          params: { lang },
        });

        const mapped = mapResponseToFormData(res.data.data);

        if (lang === "ko") {
          setKrId(res.data.data.id);
          setKrData(mapped);
        } else {
          setEnId(res.data.data.id);
          setEnData(mapped);
        }
      } catch (error) {
        console.error("콘텐츠 불러오기 실패:", error);
        alert("데이터를 불러오는 데 실패했습니다.");
      }
    };

    fetchData();
  }, [currentLang]);

  const handleSave = async () => {
    const krPayload = mapFormDataToRequest(krData, "ko", krId);
    const enPayload = mapFormDataToRequest(enData, "en", enId);

    console.log("저장할 KR payload:", krPayload);
    console.log("저장할 EN payload:", enPayload);

    try {
      await Promise.all([
        api.post("/api/v1/event-promotion/contents/insert", krPayload),
        api.post("/api/v1/event-promotion/contents/insert", enPayload),
      ]);

      alert("저장되었습니다.");
      window.location.reload();
    } catch (error) {
      console.error(" 저장 실패 상세:", error);
      if (error.response) {
        console.error("서버 응답:", error.response.data);
      }
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
          <BannerForm
            data={krData.banner}
            setData={(newVal) =>
              setKrData((prev) => ({ ...prev, banner: newVal }))
            }
          />
        </TabPanel>

        <TabPanel>
          <KeyVisualForm
            data={enData.keyVisual}
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
          <BannerForm
            data={enData.banner}
            setData={(newVal) =>
              setEnData((prev) => ({ ...prev, banner: newVal }))
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
