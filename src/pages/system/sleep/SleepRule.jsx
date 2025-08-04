import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useState, useRef, useEffect } from "react";
import RuleForm from "./component/RuleForm";
import api from "@/lib/apiClient";
import Button from "@/components/common/Button";
import useModal from "@/hooks/useModal";

export default function MeetingRule() {
  const koRef = useRef();
  const enRef = useRef();

  const [koData, setKoData] = useState({});
  const [enData, setEnData] = useState({});
  const [currentLang, setCurrentLang] = useState(0);
  const { showModal } = useModal();
  const CATEGORY_CODE = "op0102"; // 운영 규정 구분 코드

  const fetchOperatingData = async (langCode) => {
    const lang = langCode === "ko" ? "KO" : "EN";

    try {
      const res = await api.get(
        `/api/v1/room/operating/${CATEGORY_CODE}/${lang}`
      );
      const data = res.data?.data;

      if (!data) return;

      const mapped = {
        id: data.id,
        title: data.title,
        content: data.content,
      };

      if (langCode === "ko") {
        setKoData(mapped);
      } else {
        setEnData(mapped);
      }
    } catch (error) {
      console.error("운영 규정 조회 실패", error);
    }
  };

  useEffect(() => {
    const lang = currentLang === 0 ? "ko" : "en";
    fetchOperatingData(lang);
  }, [currentLang]);

  const handleClickSave = async () => {
    const isKorean = currentLang === 0;
    const ref = isKorean ? koRef : enRef;

    const payload = await ref.current?.submit?.((message) => {
      showModal({
        title: "입력 오류",
        message,
        showCancel: false,
      });
    });

    if (!payload) return;

    showModal({
      title: "저장 확인",
      message: "입력한 내용을 저장하시겠습니까?",
      showCancel: true,
      onConfirm: () => handleSave(payload),
    });
  };

  const handleSave = async (payload) => {
    const isUpdate = !!payload.id;
    const apiUrl = isUpdate
      ? "/api/v1/room/operating/update"
      : "/api/v1/room/operating/insert";

    const body = isUpdate
      ? {
          id: payload.id,
          title: payload.title,
          content: payload.content,
        }
      : payload;

    try {
      await api.post(apiUrl, body);
      showModal({
        title: "완료",
        message: isUpdate ? "수정이 완료되었습니다." : "등록이 완료되었습니다.",
        showCancel: false,
      });

      const langCode = payload.lang === "KO" ? "ko" : "en";
      fetchOperatingData(langCode);
    } catch (error) {
      console.error("저장 실패", error);
      showModal({
        title: "오류",
        message: "저장 중 오류가 발생했습니다.",
        showCancel: false,
      });
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
          <RuleForm
            ref={koRef}
            data={koData}
            setData={setKoData}
            lang="ko"
            category={CATEGORY_CODE}
          />
        </TabPanel>

        <TabPanel>
          <RuleForm
            ref={enRef}
            data={enData}
            setData={setEnData}
            lang="en"
            category={CATEGORY_CODE}
          />
        </TabPanel>
      </Tabs>
      <div className="flex justify-end gap-4 px-6 pb-6">
        <Button onClick={handleClickSave}>저장</Button>
      </div>
    </Section>
  );
}
