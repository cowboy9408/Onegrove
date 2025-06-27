import RegistForm from "./component/RegistForm";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";
import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import Button from "@/components/common/Button";

export default function OccupancyRegist() {
  const [currentLang, setCurrentLang] = useState(0); // 0 = 국문
  const navigate = useNavigate();
  const koFormRef = useRef();
  const enFormRef = useRef(); // 다국어 확장 대비
  const { showModal } = useModal();

  const [koData, setKoData] = useState({});
  const [enData, setEnData] = useState({});

  const handleClickSave = async () => {
    const ref = currentLang === 0 ? koFormRef : enFormRef;

    const payload = await ref.current?.submit?.((message) => {
      showModal({
        title: "필수 항목을 입력해 주세요.",
        message,
        showCancel: false,
      });
    });

    // 입력 검증 실패 시 종료
    if (!payload || typeof payload !== "object") return;

    // 검증 성공 시 → 저장 확인 모달 표시
    showModal({
      title: "저장 확인",
      message: "저장하시겠습니까?",
      showCancel: true,
      onConfirm: () => handleSave(payload),
    });
  };

  const handleSave = async (payload) => {
    try {
      await api.post("/api/v1/company/insert", payload);
      navigate("/occupancy");
    } catch (err) {
      console.error("등록 실패:", err);
      showModal({
        title: "오류",
        message: "등록 중 오류가 발생했습니다.",
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
        onTabChange={(i) => setCurrentLang(i)}
      >
        <TabPanel>
          <RegistForm
            ref={koFormRef}
            data={koData}
            setData={setKoData}
            lang="ko"
            currentLang={currentLang}
          />
        </TabPanel>
        <TabPanel>
          <RegistForm
            ref={enFormRef}
            data={enData}
            setData={setEnData}
            lang="en"
            currentLang={currentLang}
          />
        </TabPanel>
      </Tabs>

      <div className="flex justify-end gap-4 px-6 pt-12">
        <Button onClick={handleClickSave}>저장</Button>
        <Button
          type="button"
          className="bg-gray-200"
          onClick={() =>
            showModal({
              title: "이동 확인",
              message: "입력된 내용이 사라집니다. 목록으로 돌아가시겠습니까?",
              showCancel: true,
              onConfirm: () => navigate("/occupancy"),
            })
          }
        >
          취소
        </Button>
      </div>
    </Section>
  );
}
