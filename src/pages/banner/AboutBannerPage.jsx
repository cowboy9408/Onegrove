import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import BannerForm from "./component/BannerForm";
import api from "@/lib/apiClient";
import Button from "@/components/common/Button";
import useModal from "@/hooks/useModal";

export default function AboutBannerPage() {
  const koRef = useRef();
  const enRef = useRef();

  const [koData, setKoData] = useState({});
  const [enData, setEnData] = useState({});
  const [currentLang, setCurrentLang] = useState(0);

  const { showModal } = useModal();

  const fetchBannerData = async (langCode) => {
    const menuCode = "bn0101";
    const lang = langCode === "ko" ? "KO" : "EN";

    try {
      const res = await api.get(`/api/v1/banner/${menuCode}/${lang}`);
      const data = res.data?.data;

      if (!data) return;

      const mapped = {
        title: data.title,
        subtitle: data.subTitle,
        url: data.url,
        bannerType: data.type,
        displayYn: data.showYn,
        image1: data.pcImg,
        image2: data.moImg,
      };

      if (langCode === "ko") {
        setKoData({ banner: mapped });
      } else {
        setEnData({ banner: mapped });
      }
    } catch (error) {
      console.error("데이터 불러오기 실패", error);
    }
  };

  useEffect(() => {
    const lang = currentLang === 0 ? "ko" : "en";
    fetchBannerData(lang);
  }, [currentLang]);

  const handleSave = async () => {
    const isKorean = currentLang === 0;
    const ref = isKorean ? koRef : enRef;

    const payload = await ref.current?.submit();
    if (!payload) return;

    console.log("전송할 payload:", payload);

    try {
      await api.post("/api/v1/banner/insert", payload);
      alert("저장 완료");

      const menuCode = "bn0101";
      const langCode = isKorean ? "KO" : "EN";

      const res = await api.get(`/api/v1/banner/${menuCode}/${langCode}`);
      const data = res.data?.data;

      if (!data) return;

      const mapped = {
        title: data.title,
        subtitle: data.subTitle,
        url: data.url,
        bannerType: data.type,
        displayYn: data.showYn,
        image1: data.pcImg,
        image2: data.moImg,
      };

      if (isKorean) {
        setKoData({ banner: mapped });
      } else {
        setEnData({ banner: mapped });
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
          <BannerForm ref={koRef} data={koData} setData={setKoData} lang="ko" />
        </TabPanel>

        <TabPanel>
          <BannerForm ref={enRef} data={enData} setData={setEnData} lang="en" />
        </TabPanel>
      </Tabs>
      <div className="flex justify-end gap-4 px-6 pb-6">
        <Button
          onClick={() =>
            showModal({
              title: "저장 확인",
              message: "입력한 내용을 저장하시겠습니까?",
              showCancel: true,
              onConfirm: handleSave,
            })
          }
        >
          저장
        </Button>
      </div>
    </Section>
  );
}
