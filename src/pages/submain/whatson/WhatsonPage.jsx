import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import KeyVisualForm from "./components/KeyVisualForm";
import api from "@/lib/apiClient";
import Button from "@/components/common/Button";
import TopContentForm from "./components/TopContentForm";
import useModal from "@/hooks/useModal";

export default function WhatsonPage() {
  const { showModal } = useModal();
  const emptyData = {
    keyVisual: [],
    etc: [],
  };

  const keyVisualKRRef = useRef();
  const keyVisualENRef = useRef();

  const [keyVisuals, setKeyVisuals] = useState({
    ko: [],
    en: [],
  });

  const topContentKRRef = useRef();
  const topContentENRef = useRef();
  const [topContents, setTopContents] = useState({
    ko: [],
    en: [],
  });

  const [ids, setIds] = useState({
    ko: null,
    en: null,
  });

  const [currentLang, setCurrentLang] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const lang = currentLang === 0 ? "ko" : "en";

      try {
        const res = await api.get("/api/v1/event-promotion/contents", {
          params: { lang },
          withCredentials: true,
        });

        const item = res.data?.data;

        if (!item || item.lang !== lang) {
          setKeyVisuals((prev) => ({ ...prev, [lang]: [] }));
          setTopContents((prev) => ({ ...prev, [lang]: [] }));
          setIds((prev) => ({ ...prev, [lang]: null }));
          return;
        }

        const mergedKV = (item.keyVisual || []).map((v) => ({
          id: v.id,
          type: v.contentType === "V" ? "video" : "image",
          file1: v.contentFilePc ?? null,
          file2: v.contentFileMo ?? null,
          title: v.title ?? "",
          subtitle: v.subTitle ?? "",
        }));

        const transformedTopContents = (item.topContents || []).map((v) => ({
          id: v.id,
          type: v.storiesId ?? "",
          image: v.imgPc
            ? {
                ...v.imgPc,
                url: v.imgPc.path,
                name: v.imgPc.originalName,
              }
            : { name: "", url: "", size: 0 },
        }));

        setKeyVisuals((prev) => ({ ...prev, [lang]: mergedKV }));
        setTopContents((prev) => ({ ...prev, [lang]: transformedTopContents }));
        setIds((prev) => ({ ...prev, [lang]: item.id || null }));
      } catch (err) {
        console.error("조회 실패:", err);
        setKeyVisuals((prev) => ({ ...prev, [lang]: [] }));
        setIds((prev) => ({ ...prev, [lang]: null }));
      }
    };

    fetchData();
  }, [currentLang]);

  const handleSave = async () => {
    const lang = currentLang === 0 ? "ko" : "en";
    const kvRef = currentLang === 0 ? keyVisualKRRef : keyVisualENRef;
    const topRef = currentLang === 0 ? topContentKRRef : topContentENRef;

    try {
      const keyVisualResult = await kvRef.current.submit((err) =>
        showModal({
          title: "입력 확인",
          message: err || "필수 항목을 입력해주세요.",
          showCancel: false,
        })
      );
      const topContentResult = await topRef.current.submit((err) =>
        showModal({
          title: "입력 확인",
          message: err || "필수 항목을 입력해주세요.",
          showCancel: false,
        })
      );

      console.log("TopContent submit result:", topContentResult);

      if (!keyVisualResult || !topContentResult) return;

      const eventId = ids[lang] ?? null;

      const keyVisual = keyVisualResult.keyVisual.map((item) => ({
        ...item,
        eventId,
      }));

      const topContents = topContentResult.map((item) => ({
        ...item,
        eventId: item.eventId ?? eventId,
        delYn: item.delYn ?? "N",
      }));

      if (!keyVisualResult || !topContentResult) return;

      const payload = {
        id: eventId,
        lang,
        delYn: "N",
        keyVisual,
        topContents,
      };

      const res = await api.post(
        "/api/v1/event-promotion/contents/insert",
        payload
      );
      console.log(payload);
      if (res.data?.success) {
        showModal({
          title: "저장 완료",
          message:
            lang === "ko"
              ? "국문 저장이 완료되었습니다."
              : "영문 저장이 완료되었습니다.",
          showCancel: false,
          onConfirm: () => {
            window.location.reload();
          },
        });
      } else {
        showModal({
          title: "저장 실패",
          message: res.data?.message || "알 수 없는 오류가 발생했습니다.",
          showCancel: false,
        });
      }
    } catch (error) {
      console.error("저장 오류:", error);
      showModal({
        title: "저장 오류",
        message: "서버와의 통신 중 문제가 발생했습니다.",
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
          <KeyVisualForm
            ref={keyVisualKRRef}
            lang="ko"
            mainId={ids.ko}
            data={keyVisuals.ko}
            setData={(newVal) =>
              setKeyVisuals((prev) => ({ ...prev, ko: newVal }))
            }
          />
          <TopContentForm
            ref={topContentKRRef}
            data={topContents.ko}
            eventId={ids.ko}
            setData={(newVal) =>
              setTopContents((prev) => ({ ...prev, ko: newVal }))
            }
          />
        </TabPanel>

        <TabPanel>
          <KeyVisualForm
            ref={keyVisualENRef}
            lang="en"
            mainId={ids.en}
            data={keyVisuals.en}
            setData={(newVal) =>
              setKeyVisuals((prev) => ({ ...prev, en: newVal }))
            }
          />
          <TopContentForm
            ref={topContentENRef}
            data={topContents.en}
            eventId={ids.en}
            setData={(newVal) =>
              setTopContents((prev) => ({ ...prev, en: newVal }))
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
