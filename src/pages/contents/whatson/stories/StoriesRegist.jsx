import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useState, useRef } from "react";
import StoriesRegistForm from "./components/StoriesRegistForm";
import Button from "@/components/common/Button";
import { useNavigate } from "react-router-dom";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";

export default function StoriesRegist() {
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
    const form = await ref.current?.submit?.((message) => {
      showModal({
        title: "필수 항목을 입력해 주세요.",
        message,
        showCancel: false,
      });
    });

    if (!form) return;

    try {
      await api.post("/api/v1/stories/insert", form);

      navigate("/contents/whatson/stories/list");
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
          {/* 국문 폼 */}
          <StoriesRegistForm
            ref={koFormRef}
            data={koData}
            setData={setKoData}
            lang="ko"
          />
        </TabPanel>

        <TabPanel>
          {/* 영문 폼 */}
          <StoriesRegistForm
            ref={enFormRef}
            data={enData}
            setData={setEnData}
            lang="en"
          />
        </TabPanel>
      </Tabs>
      <div className="flex justify-end gap-4 px-6 pb-6">
        <Button
          onClick={async () => {
            const submitFn =
              currentLang === 0
                ? koFormRef.current?.submit
                : enFormRef.current?.submit;

            const form = await submitFn?.((message) => {
              showModal({
                title: "필수 항목을 입력해 주세요.",
                message,
                showCancel: false,
              });
            });

            if (!form) return;

            showModal({
              title: "저장 확인",
              message: "저장하시겠습니까?",
              showCancel: true,
              onConfirm: async () => {
                await api.post("/api/v1/stories/insert", form);
                navigate("/contents/whatson/stories/list");
              },
            });
          }}
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
              onConfirm: () => navigate("/contents/whatson/stories/list"),
            })
          }
        >
          목록
        </Button>
      </div>
    </Section>
  );
}
