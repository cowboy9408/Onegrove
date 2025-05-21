import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useState, useRef } from "react";
import Button from "@/components/common/Button";
import { useNavigate } from "react-router-dom";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";
import PressRegistForm from "./component/PressRegistForm";

export default function PressRegist() {
  const [currentLang, setCurrentLang] = useState(0); // 0 = 국문, 1 = 영문
  const navigate = useNavigate();
  const koFormRef = useRef();
  const enFormRef = useRef();
  const { showModal } = useModal();

  // 국문 상태
  const [koData, setKoData] = useState({});
  // 영문 상태
  const [enData, setEnData] = useState({});

  const handleSave = async () => {
    const ref = currentLang === 0 ? koFormRef : enFormRef;
    const form = await ref.current?.submit();
    if (!form) return;

    // const toImageMeta = (file) => {
    //   return {
    //     path: file?.path || null,
    //     classification: "press&media",
    //   };
    // };

    const payload = {
      lang: currentLang === 0 ? "ko" : "en",
      category: form.category,
      title: form.title,
      thumbImgPc: form.thumbImgPc?.path || null,
      thumbImgMo: form.thumbImgMo?.path || null,
      showYn: form.showYn,
      content: form.content,
      publish_date: form.publish_date,
    };

    console.log("전송 payload:", JSON.stringify(payload, null, 2));

    try {
      await api.post("/api/v1/press/insert", payload);
      alert("저장되었습니다.");
      navigate("/contents/whatson/media");
    } catch (err) {
      console.error("저장 실패:", err);
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
          <PressRegistForm
            ref={koFormRef}
            data={koData}
            setData={setKoData}
            lang="ko"
          />
        </TabPanel>

        <TabPanel>
          <PressRegistForm
            ref={enFormRef}
            data={enData}
            setData={setEnData}
            lang="en"
          />
        </TabPanel>
      </Tabs>
      <div className="flex justify-end gap-4 px-6 pb-6">
        <Button
          onClick={() =>
            showModal({
              title: "저장 확인",
              message: "저장하시겠습니까?",
              showCancel: true,
              onConfirm: handleSave,
            })
          }
        >
          저장
        </Button>
        <Button
          type="button"
          className="bg-gray-200"
          onClick={() =>
            showModal({
              title: "이동 확인",
              message: "이전 페이지로 돌아갈 경우 입력한 정보가 사라집니다.",
              showCancel: true,
              onConfirm: () => navigate("/contents/whatson/media"),
            })
          }
        >
          목록
        </Button>
      </div>
    </Section>
  );
}
