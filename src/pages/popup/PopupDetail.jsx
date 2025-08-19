import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useState, useRef, useEffect } from "react";
import Button from "@/components/common/Button";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";
import PopupRegistForm from "./component/PopupRegistForm";

export default function PopupDetail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLang = searchParams.get("lang") || "ko";

  const [currentLang, setCurrentLang] = useState(initialLang === "en" ? 1 : 0);

  const navigate = useNavigate();
  const koFormRef = useRef();
  const enFormRef = useRef();
  const { showModal } = useModal();
  const formRef = useRef();
  const { id } = useParams();

  // 국문 상태
  const [koData, setKoData] = useState({});
  // 영문 상태
  const [enData, setEnData] = useState({});

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;

      try {
        const fetchLang = async (langCode, setData) => {
          const res = await api.get(`/api/v1/popup/detail/${id}/${langCode}`);
          setData(res.data?.data);
        };

        await fetchLang("KO", setKoData);
        await fetchLang("EN", setEnData);
      } catch (err) {
        console.error("상세 데이터 불러오기 실패:", err);
      }
    };

    fetchDetail();
  }, [id]);

  const handleClickSave = async () => {
    const ref = currentLang === 0 ? koFormRef : enFormRef;
    const langCode = currentLang === 0 ? "KO" : "EN";
    const currentData = currentLang === 0 ? koData : enData;

    // 폼 유효성
    const form = await ref.current?.submit?.((message) => {
      showModal({
        title: "필수 항목을 입력해 주세요.",
        message,
        showCancel: false,
      });
    });
    if (!form) return;

    const isNewLang = !currentData || Object.keys(currentData).length === 0;

    showModal({
      title: isNewLang ? "등록 확인" : "수정 확인",
      message: isNewLang
        ? `${langCode} 콘텐츠를 새로 등록할까요?`
        : `${langCode} 콘텐츠를 수정할까요?`,
      showCancel: true,
      onConfirm: async () => {
        try {
          const url = isNewLang
            ? "/api/v1/popup/insert"
            : "/api/v1/popup/update";

          const payload = {
            ...form,
            id,
            lang: langCode,
          };

          await api.post(url, payload);

          showModal({
            title: "완료",
            message: "저장되었습니다.",
            showCancel: false,
            onConfirm: () => navigate("/popup"),
          });
        } catch (err) {
          console.error(err);
          showModal({
            title: "오류",
            message: "저장 중 문제가 발생했습니다.",
            showCancel: false,
          });
        }
      },
    });
  };

  return (
    <Section>
      <Tabs
        tabs={[
          { key: "kr", label: "국문" },
          { key: "en", label: "영문" },
        ]}
        defaultIndex={currentLang}
        onTabChange={(index) => {
          setCurrentLang(index);

          setSearchParams({ lang: index === 1 ? "en" : "ko" });
        }}
      >
        <TabPanel>
          <PopupRegistForm
            ref={koFormRef}
            data={koData}
            setData={setKoData}
            lang="ko"
          />
        </TabPanel>

        <TabPanel>
          <PopupRegistForm
            ref={enFormRef}
            data={enData}
            setData={setEnData}
            lang="en"
          />
        </TabPanel>
      </Tabs>
      <div className="flex justify-end gap-4 px-6 pb-6">
        <Button onClick={handleClickSave}>수정</Button>
        <Button
          type="button"
          className="bg-gray-200"
          onClick={() =>
            showModal({
              title: "이동 확인",
              message: "이전 페이지로 돌아갈 경우 입력한 정보가 사라집니다.",
              showCancel: true,
              onConfirm: () => navigate("/popup"),
            })
          }
        >
          목록
        </Button>
      </div>
    </Section>
  );
}
