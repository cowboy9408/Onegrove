import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import KeyVisualForm from "./components/KeyVisualForm";
import api from "@/lib/apiClient";
import Button from "@/components/common/Button";
import WorkForm from "./components/WorkForm";
import useModal from "@/hooks/useModal";
import CompanyList from "@/pages/submain/work/components/CompanyList";

export default function WorkPage() {
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

  const workKRRef = useRef();
  const workENRef = useRef();
  const [workContents, setWorkContents] = useState({
    ko: [],
    en: [],
  });
  const [companyList, setCompanyList] = useState({
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
        const res = await api.get(`/api/v1/work/${lang}`, {
          withCredentials: true,
        });

        const item = res.data?.data;

        if (!item || item.lang?.toLowerCase() !== lang) {
          setKeyVisuals((prev) => ({ ...prev, [lang]: [] }));
          setWorkContents((prev) => ({ ...prev, [lang]: [] }));
          setIds((prev) => ({ ...prev, [lang]: null }));
          return;
        }

        const mergedKV = (item.keyVisualList || []).map((v) => ({
          id: v.id,
          type: v.type === "V" ? "video" : "image",
          file1: v.pcImg ?? null,
          file2: v.moImg ?? null,
          title: v.title ?? "",
          subtitle: v.subTitle ?? "",
        }));

        const mergedWork = (item.contentList || []).map((v) => ({
          id: v.id,
          title: v.title ?? "",
          subtitle: v.subTitle ?? "",
          file1: v.pcImg ?? null,
          file2: v.moImg ?? null,
        }));

        await fetchCompanyNames(item, lang);

        setKeyVisuals((prev) => ({ ...prev, [lang]: mergedKV }));
        setWorkContents((prev) => ({ ...prev, [lang]: mergedWork }));
        setIds((prev) => ({ ...prev, [lang]: item.id || null }));
      } catch (err) {
        console.error("조회 실패:", err);
        setKeyVisuals((prev) => ({ ...prev, [lang]: [] }));
        setWorkContents((prev) => ({ ...prev, [lang]: [] }));
        setIds((prev) => ({ ...prev, [lang]: null }));
      }
    };

    fetchData();
  }, [currentLang]);

  const fetchCompanyNames = async (item, lang) => {
    try {
      const res = await api.get("/api/v1/work/companyList?lang=KO");
      const nameMap = {};
      res?.data?.data?.forEach((c) => {
        nameMap[c.id] = c.name;
      });

      const mergedCompany = (item.companyList || [])
        .sort((a, b) => Number(a.sort) - Number(b.sort)) // ← 여기가 핵심
        .map((v) => ({
          id: v.id ?? null,
          companyId: v.companyId,
          companyName: nameMap[v.companyId] ?? "",
          sort: v.sort ?? 0,
          delYn: v.delYn ?? "N",
        }));

      setCompanyList((prev) => ({ ...prev, [lang]: mergedCompany }));
    } catch (err) {
      console.error("입주사 이름 매핑 실패:", err);
      setCompanyList((prev) => ({ ...prev, [lang]: [] }));
    }
  };

  const handleSave = async () => {
    const lang = currentLang === 0 ? "ko" : "en";
    const kvRef = currentLang === 0 ? keyVisualKRRef : keyVisualENRef;
    const workRef = currentLang === 0 ? workKRRef : workENRef;

    try {
      const kvResult = await kvRef.current.submit((err) =>
        showModal({ title: "필수 항목 누락", message: err, showCancel: false })
      );

      const contentList = await workRef.current.submit((err) =>
        showModal({ title: "필수 항목 누락", message: err, showCancel: false })
      );

      if (!kvResult || !contentList) return;

      const originalList = companyList[lang] || [];

      // 1. delYn이 "N"인 항목들만 추림
      const visibleList = originalList.filter((c) => c.delYn !== "Y");

      const companyMap = new Map();

      // reverse()로 뒤에서부터 보기 때문에, 모달에서 선택한 새 항목이 우선됨
      [...visibleList].reverse().forEach((item) => {
        const key = String(item.companyId);
        if (!companyMap.has(key)) {
          companyMap.set(key, item);
        }
      });
      const uniqueVisibleList = Array.from(companyMap.values()).reverse();

      const visibleCompanyIds = new Set(
        uniqueVisibleList.map((c) => c.companyId)
      );
      const removedList = originalList.filter(
        (c) => !visibleCompanyIds.has(c.companyId)
      );

      let sortIndex = 1;

      const companyListPayload = [
        ...uniqueVisibleList.map((c) => {
          const isNew = !c.id || c.id === c.companyId;
          return {
            id: isNew ? undefined : c.id,
            companyId: c.companyId,
            sort: (sortIndex++).toString(),
            delYn: "N",
          };
        }),
        ...removedList.map((c) => ({
          id: c.id,
          companyId: c.companyId,
          sort: "0",
          delYn: "Y",
        })),
      ];

      const payload = {
        id: kvResult.mainId || null,
        lang: lang.toUpperCase(),
        keyVisualList: kvResult.keyVisualList,
        contentList: contentList,
        companyList: companyListPayload,
      };

      const res = await api.post("/api/v1/work/update", payload);

      if (res.data?.success) {
        showModal({
          title: "저장 완료",
          message:
            lang === "ko"
              ? "국문 저장이 완료되었습니다."
              : "영문 저장이 완료되었습니다.",
          showCancel: false,
          onConfirm: () => window.location.reload(),
        });
      } else {
        showModal({
          title: "저장 실패",
          message: res.data?.message || "알 수 없는 오류가 발생했습니다.",
          showCancel: false,
        });
      }
    } catch (err) {
      console.error("저장 오류:", err);
      showModal({
        title: "저장 오류",
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
          <KeyVisualForm
            ref={keyVisualKRRef}
            lang="ko"
            mainId={ids.ko}
            data={keyVisuals.ko}
            setData={(newVal) =>
              setKeyVisuals((prev) => ({ ...prev, ko: newVal }))
            }
          />
          <WorkForm
            ref={workKRRef}
            data={workContents.ko}
            setData={(newVal) =>
              setWorkContents((prev) => ({ ...prev, ko: newVal }))
            }
          />
          <CompanyList
            data={Array.isArray(companyList.ko) ? companyList.ko : []}
            setData={(newVal) =>
              setCompanyList((prev) => ({
                ...prev,
                ko: Array.isArray(newVal) ? newVal : [],
              }))
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
          <WorkForm
            ref={workENRef}
            data={workContents.en}
            setData={(newVal) =>
              setWorkContents((prev) => ({ ...prev, en: newVal }))
            }
          />
          <CompanyList
            data={Array.isArray(companyList.en) ? companyList.en : []}
            setData={(newVal) =>
              setCompanyList((prev) => ({
                ...prev,
                en: Array.isArray(newVal) ? newVal : [],
              }))
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
