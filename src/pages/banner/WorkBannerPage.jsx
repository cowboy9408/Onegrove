import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import BannerForm from "./component/BannerForm";
import api from "@/lib/apiClient";
import Button from "@/components/common/Button";
import useModal from "@/hooks/useModal";

export default function MainBannerPage() {
  const koRef = useRef();
  const enRef = useRef();

  const [koData, setKoData] = useState({});
  const [enData, setEnData] = useState({});
  const [currentLang, setCurrentLang] = useState(0);
  const { showModal } = useModal();
  const MENU_CODE = "bn0104";

  const fetchBannerData = async (langCode) => {
    const menuCode = "bn0104";
    const lang = langCode === "ko" ? "KO" : "EN";

    try {
      const res = await api.get(`/api/v1/banner/${menuCode}/${lang}`);
      const data = res.data?.data;

      if (!data) return;

      const mapped = {
        id: data.id,
        title: data.title,
        subtitle: data.subTitle,
        url: data.url,
        bannerType: data.type,
        displayYn: data.showYn,
        image1: data.pcImg,
        image2: data.moImg,
      };

      if (langCode === "ko") {
        setKoData(mapped);
      } else {
        setEnData(mapped);
      }
    } catch (error) {
      console.error("데이터 불러오기 실패", error);
    }
  };

  useEffect(() => {
    const lang = currentLang === 0 ? "ko" : "en";
    fetchBannerData(lang);
  }, [currentLang]);

  const handleClickSave = async () => {
    const isKorean = currentLang === 0;
    const ref = isKorean ? koRef : enRef;

    // 1. 유효성 검사 수행
    const payload = await ref.current?.submit?.((message) => {
      showModal({
        title: "입력 오류",
        message,
        showCancel: false,
      });
    });

    // 유효성 실패 시 종료
    if (!payload) return;

    // 2. 저장 확인 모달 표시
    showModal({
      title: "저장 확인",
      message: "입력한 내용을 저장하시겠습니까?",
      showCancel: true,
      onConfirm: () => handleSave(payload), // → 확인 시 저장 실행
    });
  };

  const handleSave = async (payload) => {
    const isUpdate = !!payload.id;
    const apiUrl = isUpdate ? "/api/v1/banner/update" : "/api/v1/banner/insert";

    try {
      await api.post(apiUrl, payload);
      showModal({
        title: "완료",
        message: isUpdate ? "수정이 완료되었습니다." : "등록이 완료되었습니다.",
        showCancel: false,
      });
    } catch (error) {
      console.error("저장 실패", error);
      showModal({
        title: "오류",
        message: "저장 중 오류가 발생했습니다.",
        showCancel: false,
      });
      return;
    }

    // 저장 후 데이터 새로 고침
    const menuCode = "bn0104";
    const langCode = payload.lang;

    try {
      const res = await api.get(`/api/v1/banner/${menuCode}/${langCode}`);
      const data = res.data?.data;
      if (!data) return;

      const mapped = {
        id: data.id,
        title: data.title,
        subtitle: data.subTitle,
        url: data.url,
        bannerType: data.type,
        displayYn: data.showYn,
        image1: data.pcImg,
        image2: data.moImg,
      };

      if (langCode === "KO") {
        setKoData(mapped);
      } else {
        setEnData(mapped);
      }
    } catch (error) {
      console.error("조회 실패", error);
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
          <BannerForm
            ref={koRef}
            data={koData}
            setData={setKoData}
            lang="ko"
            menu={MENU_CODE}
          />
        </TabPanel>

        <TabPanel>
          <BannerForm
            ref={enRef}
            data={enData}
            setData={setEnData}
            lang="en"
            menu={MENU_CODE}
          />
        </TabPanel>
      </Tabs>
      <div className="flex justify-end gap-4 px-6 pb-6">
        <Button onClick={handleClickSave}>저장</Button>
      </div>
    </Section>
  );
}
