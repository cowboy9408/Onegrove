import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import EventRegistForm from "./components/EventRegistForm";
import Button from "@/components/common/Button";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";

export default function EventDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialLang = searchParams.get("lang") || "ko";
  const [currentLang, setCurrentLang] = useState(initialLang === "ko" ? 0 : 1);
  const koFormRef = useRef();
  const enFormRef = useRef();
  const { showModal } = useModal();
  const { eventId } = useParams();
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [loading, setLoading] = useState(true);

  // 국문 상태
  const [koData, setKoData] = useState({
    keyVisual: [],
    whatsOn: {},
    lifestyle: {},
    work: {},
    etc: [],
    banner: {},
  });
  // 영문 상태
  const [enData, setEnData] = useState({
    keyVisual: [],
    whatsOn: {},
    lifestyle: {},
    work: {},
    etc: [],
    banner: {},
  });

  const patchForm = (ref, data) => {
    if (!data || !ref.current) return;
    const formValues = {
      title: data.title,
      category: data.category,
      status: data.showYn === "Y" ? "active" : "inactive",
      order: data.sort,
      thumbImg: data.thumbImg,
      imgBodyPc: data.imgBodyPc,
      imgBodyMo: data.imgBodyMo,
      imgPc: data.imgPc,
      imgMo: data.imgMo,
      content1: data.content,
      content2: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      lifestyle: { brand: [data.brandId] },
    };

    Object.entries(formValues).forEach(([key, value]) => {
      ref.current.setValue?.(key, value);
    });
  };

  const saveOne = async (form, lang) => {
    const payload = {
      id: form.id,
      eventId: Number(eventId),
      showYn: form.status === "active" ? "Y" : "N",
      sort: Number(form.order),
      lang,
      category: form.category || "ep0101",
      title: form.title,
      thumbImg: form.thumbImg,
      imgBodyPc: form.imgBodyPc,
      imgBodyMo: form.imgBodyMo,
      imgPc: form.imgPc,
      imgMo: form.imgMo,
      content: form.content1,
      description: form.content2,
      startDate: form.startDate,
      endDate: form.endDate,
      brandId: form.lifestyle?.brand?.[0],
      delYn: "N",
    };

    try {
      await api.post("/api/v1/event-promotion/item/update", payload);
    } catch (err) {
      console.error("수정 실패", err);
      throw err;
    }
  };

  useEffect(() => {
    if (!eventId) return;

    const fetchDetail = async () => {
      try {
        const res = await api.get(`/api/v1/event-promotion/item/${eventId}`, {
          withCredentials: true,
        });

        const items = res.data?.data || [];

        const koItem = items.find((item) => item.lang === "ko");
        const enItem = items.find((item) => item.lang === "en");

        patchForm(koFormRef, koItem);
        patchForm(enFormRef, enItem);
      } catch (err) {
        console.error("이벤트 상세 조회 실패:", err);
        alert("인증 정보가 없거나 접근이 거부되었습니다.");
      }
    };

    fetchDetail();
  }, [eventId]);

  useEffect;

  const handleSave = async () => {
    const ref = currentLang === 0 ? koFormRef : enFormRef;
    const form = await ref.current?.submit?.();
    if (!form) return;

    try {
      await saveOne(form, currentLang === 0 ? "ko" : "en");
      alert("저장되었습니다.");
      navigate("/contents/whatson/event/list");
    } catch (err) {
      console.error("저장 실패", err);
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
        defaultIndex={currentLang}
        onTabChange={(index) => {
          // 탭 비활성화: 클릭 무시
          if (!loading) setCurrentLang(index);
        }}
        disabled={isReadOnly}
      >
        <TabPanel>
          <EventRegistForm
            ref={koFormRef}
            data={koData}
            setData={setKoData}
            lang="ko"
            readOnly={isReadOnly}
          />
        </TabPanel>

        <TabPanel>
          <EventRegistForm
            ref={enFormRef}
            data={enData}
            setData={setEnData}
            lang="en"
            readOnly={isReadOnly}
          />
        </TabPanel>
      </Tabs>
      <div className="flex justify-end gap-4 px-6 pb-6">
        {isReadOnly ? (
          <Button onClick={() => setIsReadOnly(false)}>수정</Button>
        ) : (
          <Button
            onClick={() =>
              showModal({
                title: "저장 확인",
                message: "저장하시겠습니까?",
                showCancel: true,
                onConfirm: async () => {
                  await handleSave();
                  setIsReadOnly(true); // 저장 후 다시 읽기 전용
                },
              })
            }
          >
            저장
          </Button>
        )}
        <Button
          type="button"
          className="bg-gray-200"
          onClick={() =>
            showModal({
              title: "이동 확인",
              message: "이전 페이지로 돌아갈 경우 입려한 정보가 사라집니다.",
              showCancel: true,
              onConfirm: () => navigate("/contents/whatson/event/list"),
            })
          }
        >
          목록
        </Button>
      </div>
    </Section>
  );
}
