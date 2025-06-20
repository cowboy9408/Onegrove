import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import KeyVisualForm from "./components/KeyVisualForm";
import WhatsOnForm from "./components/WhatsOnForm";
import LifestyleForm from "./components/LifestyleForm";
import WorkForm from "./components/WorkForm";
import EtcContentForm from "./components/EtcContentForm";
import WhatContent from "./components/WhatsonContent";
import { useForm, FormProvider } from "react-hook-form";
import api from "@/lib/apiClient";
import Button from "@/components/common/Button";
import useModal from "@/hooks/useModal";

export default function MainPage() {
  const { showModal } = useModal(); // MainPage 함수 내 선언

  const keyVisualKRRef = useRef();
  const keyVisualENRef = useRef();
  const [keyVisuals, setKeyVisuals] = useState({
    ko: [],
    en: [],
  });
  const [mainIds, setMainIds] = useState({ ko: null, en: null });
  const [whatsOn, setWhatsOn] = useState({ ko: {}, en: {} });
  const whatsOnKRRef = useRef();
  const whatsOnENRef = useRef();

  const [whatContent, setWhatContent] = useState({ ko: [], en: [] });

  const whatContentKRRef = useRef();
  const whatContentENRef = useRef();

  const [lifestyle, setLifestyle] = useState({ ko: {}, en: {} });
  const lifestyleKRRef = useRef();
  const lifestyleENRef = useRef();

  const [work, setWork] = useState({ ko: {}, en: {} });
  const workKRRef = useRef();
  const workENRef = useRef();

  const [etc, setEtc] = useState({ ko: {}, en: {} });
  const etcKRRef = useRef();
  const etcENRef = useRef();

  const methods = useForm({
    defaultValues: {
      sets: [
        {
          content1: { ids: [], selectedTitles: "", uploadFile: null },
          content2: { ids: [], selectedTitles: "", uploadFile: null },
        },
      ],
      contents: [
        { ids: [], selectedTitles: "", uploadFile: null }, // 1번
        { ids: [], selectedTitles: "", uploadFile: null }, // 2번
      ],
    },
  });

  const fetchMainData = async (lang) => {
    try {
      const res = await api.get(`/api/v1/main/${lang}`);
      const data = res?.data?.data;

      if (!res.data?.success || !data) {
        console.error(`${lang} 응답 실패 또는 데이터 없음`, res.data);
        setWhatsOn((prev) => ({
          ...prev,
          [lang]: {},
        }));
        setLifestyle((prev) => ({
          ...prev,
          [lang]: {},
        }));
        setKeyVisuals((prev) => ({ ...prev, [lang]: [] }));
        return;
      }

      if (data?.mainId) {
        setMainIds((prev) => ({
          ...prev,
          [lang]: data.mainId,
        }));
      }

      setWhatsOn((prev) => ({
        ...prev,
        [lang]: data.whatRes || {},
      }));

      setWhatContent((prev) => ({
        ...prev,
        [lang]: (data.whatContentList || []).map((item, i) => ({
          id: item.id ?? null,
          contents: item.contentId
            ? [
                {
                  _id: item.contentId,
                  categoryCode: item.contentCategoryCode,
                  title: item.contentTitle ?? "",
                },
              ]
            : [],
          // 아래 세 값도 항상 props로 넘겨줘야 Form에서 기본 값 표시됨
          contentId: item.contentId ?? null,
          contentCategoryCode: item.contentCategoryCode ?? "",
          contentTitle: item.contentTitle ?? "",
          selectedTitles: item.contentTitle ?? "",
          uploadFile: item.file?.path
            ? {
                id: item.file?.id ?? null,
                originalName: item.file?.originalName ?? "",
                name: item.file?.name ?? "",
                path: item.file?.path ?? "",
                size: item.file?.size ?? 0,
                extension: item.file?.extension ?? "",
                mime: item.file?.mime ?? "",
                classification: item.file?.classification ?? null,
                status: item.file?.status ?? "R",
              }
            : null,
          sort: item.sort ?? i + 1,
        })),
      }));

      setLifestyle((prev) => ({
        ...prev,
        [lang]: {
          ...data.lifeRes,
          brand: data.lifeRes?.brandList?.map((b) => b.brandId) || [],
        },
      }));

      setWork((prev) => ({
        ...prev,
        [lang]: {
          id: data.workRes?.id ?? null,
          subTitle1: data.workRes?.subTitle1 || "",
          subTitle2: data.workRes?.subTitle2 || "",
          file: (data.workRes?.workImgList || []).map((item) => ({
            ...item.file,
            id: item.id,
            fileId: item.file?.id,
            sort: item.sort,
            isDeleted: item.delYn === "Y",
          })),
        },
      }));

      setEtc((prev) => ({
        ...prev,
        [lang]: [
          {
            id: data.linkedContentRes?.id ?? null,
            title: data.linkedContentRes?.title ?? "",
            subtitle: data.linkedContentRes?.subTitle ?? "",
            detail: data.linkedContentRes?.content ?? "",
            button: data.linkedContentRes?.btnName ?? "",
            imagePC: data.linkedContentRes?.pcImg ?? null,
            imageMO: data.linkedContentRes?.moImg ?? null,
            contents: data.linkedContentRes?.contentId
              ? [
                  {
                    _id: data.linkedContentRes.contentId,
                    categoryCode: data.linkedContentRes.contentCategoryCode,
                    title: data.linkedContentRes.contentTitle,
                  },
                ]
              : [],
            //
            contentId: data.linkedContentRes?.contentId,
            contentCategoryCode: data.linkedContentRes?.contentCategoryCode,
            contentTitle: data.linkedContentRes?.contentTitle,
          },
        ],
      }));

      if (!data || !Array.isArray(data.keyVisualList)) {
        console.warn(`${lang} 데이터 없음`, data);
        setKeyVisuals((prev) => ({ ...prev, [lang]: [] }));
        return;
      }

      const list = data.keyVisualList.map((item) => ({
        id: item.id,
        type: item.contentType === "I" ? "image" : "video",
        title: item.title,
        subtitle: item.subTitle,
        file1: item.pcImg,
        file2: item.moImg,
      }));

      setKeyVisuals((prev) => ({
        ...prev,
        [lang]: list,
      }));
    } catch (err) {
      console.error(`${lang} 데이터 조회 실패`, err);
    }
  };

  useEffect(() => {
    fetchMainData("ko");
    fetchMainData("en");
  }, []);

  const handleSaveKeyVisual = async (lang) => {
    const ref = lang === "ko" ? keyVisualKRRef : keyVisualENRef;
    const payload = await ref.current?.submit((msg) =>
      showModal({
        title: "입력 확인",
        message: msg || "필수 항목을 입력해주세요.",
        showCancel: false,
      })
    );
    if (!payload) return;

    try {
      const res = await api.post("/api/v1/main/insert/keyVisual", payload);
      if (res.data?.success) {
        showModal({
          title: "저장 완료",
          message: `${lang.toUpperCase()} Key Visual 저장이 완료되었습니다.`,
          showCancel: false,
        });
        await fetchMainData(lang);
      } else {
        showModal({
          title: "저장 실패",
          message: res.data?.message || "서버 응답 오류입니다.",
          showCancel: false,
        });
      }
    } catch (e) {
      showModal({
        title: "오류 발생",
        message: "저장 중 오류가 발생했습니다.",
        showCancel: false,
      });
      console.error(e);
    }
  };
  const handleSaveWhatsOn = async (lang) => {
    const ref = lang === "ko" ? whatsOnKRRef : whatsOnENRef;
    const payload = await ref.current?.submit((msg) =>
      showModal({
        title: "입력 확인",
        message: msg || "필수 항목을 입력해주세요.",
        showCancel: false,
      })
    );
    if (!payload) return;

    try {
      const res = await api.post("/api/v1/main/insert/mainWhat", payload);
      if (res.data?.success) {
        showModal({
          title: "저장 완료",
          message: `${lang.toUpperCase()} What's On 저장이 완료되었습니다.`,
          showCancel: false,
        });
        await fetchMainData(lang);
      } else {
        showModal({
          title: "저장 실패",
          message: res.data?.message || "서버 응답 오류입니다.",
          showCancel: false,
        });
      }
    } catch (e) {
      showModal({
        title: "오류 발생",
        message: "저장 중 오류가 발생했습니다.",
        showCancel: false,
      });
      console.error(e);
    }
  };

  const handleSaveWhatContent = async (lang) => {
    const ref = lang === "ko" ? whatContentKRRef : whatContentENRef;
    const payload = await ref.current?.submit((msg) =>
      showModal({
        title: "입력 확인",
        message: msg || "필수 항목을 입력해주세요.",
        showCancel: false,
      })
    );
    if (!payload) return;

    try {
      const res = await api.post(
        "/api/v1/main/insert/mainWhatContent",
        payload
      );
      if (res.data?.success) {
        showModal({
          title: "저장 완료",
          message: `${lang.toUpperCase()} 콘텐츠 저장이 완료되었습니다.`,
          showCancel: false,
        });
        await fetchMainData(lang);
      } else {
        showModal({
          title: "저장 실패",
          message: res.data?.message || "서버 응답 오류입니다.",
          showCancel: false,
        });
      }
    } catch (e) {
      showModal({
        title: "오류 발생",
        message: "저장 중 오류가 발생했습니다.",
        showCancel: false,
      });
      console.error(e);
    }
  };

  const handleSaveLifestyle = async (lang) => {
    const ref = lang === "ko" ? lifestyleKRRef : lifestyleENRef;
    const payload = await ref.current?.submit((msg) =>
      showModal({
        title: "입력 확인",
        message: msg || "필수 항목을 입력해주세요.",
        showCancel: false,
      })
    );
    if (!payload) return;

    try {
      const res = await api.post("/api/v1/main/insert/mainLife", payload);
      if (res.data?.success) {
        showModal({
          title: "저장 완료",
          message: `${lang.toUpperCase()} Lifestyle 저장이 완료되었습니다.`,
          showCancel: false,
        });
        await fetchMainData(lang);
      } else {
        showModal({
          title: "저장 실패",
          message: res.data?.message || "서버 응답 오류입니다.",
          showCancel: false,
        });
      }
    } catch (e) {
      showModal({
        title: "오류 발생",
        message: "저장 중 오류가 발생했습니다.",
        showCancel: false,
      });
      console.error(e);
    }
  };

  const handleSaveWork = async (lang) => {
    const ref = lang === "ko" ? workKRRef : workENRef;
    const payload = await ref.current?.submit((msg) =>
      showModal({
        title: "입력 확인",
        message: msg || "필수 항목을 입력해주세요.",
        showCancel: false,
      })
    );
    if (!payload) return;

    try {
      const res = await api.post("/api/v1/main/insert/mainWork", {
        lang: lang.toUpperCase(),
        ...payload,
      });

      if (res.data?.success) {
        showModal({
          title: "저장 완료",
          message: "Work 저장이 완료되었습니다.",
          showCancel: false,
        });
        await fetchMainData(lang);
      } else {
        showModal({
          title: "저장 실패",
          message: res.data?.message || "서버 응답 오류입니다.",
          showCancel: false,
        });
      }
    } catch (e) {
      showModal({
        title: "오류 발생",
        message: "저장 중 오류가 발생했습니다.",
        showCancel: false,
      });
      console.error(e);
    }
  };

  const handleSaveEtcContent = async (lang) => {
    const ref = lang === "ko" ? etcKRRef : etcENRef;
    const payload = await ref.current?.submit((msg) =>
      showModal({
        title: "입력 확인",
        message: msg || "필수 항목을 입력해주세요.",
        showCancel: false,
      })
    );
    if (!payload) return;

    try {
      const res = await api.post(
        "/api/v1/main/insert/mainLinkedContent",
        payload
      );
      if (res.data?.success) {
        showModal({
          title: "저장 완료",
          message: `${lang.toUpperCase()} 연계 콘텐츠 저장이 완료되었습니다.`,
          showCancel: false,
        });
        await fetchMainData(lang);
      } else {
        showModal({
          title: "저장 실패",
          message: res.data?.message || "서버 응답 오류입니다.",
          showCancel: false,
        });
      }
    } catch (e) {
      showModal({
        title: "오류 발생",
        message: "저장 중 오류가 발생했습니다.",
        showCancel: false,
      });
      console.error(e);
    }
  };

  return (
    <FormProvider {...methods}>
      <Section>
        <Tabs
          tabs={[
            { key: "kr", label: "국문" },
            { key: "en", label: "영문" },
          ]}
        >
          <TabPanel>
            {/* 국문 폼 */}
            <KeyVisualForm
              ref={keyVisualKRRef}
              data={keyVisuals.ko}
              lang="ko"
              mainId={mainIds.ko}
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveKeyVisual("ko")}>저장</Button>
            </div>
            <WhatsOnForm
              ref={whatsOnKRRef}
              data={whatsOn.ko}
              lang="ko"
              mainId={mainIds.ko}
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveWhatsOn("ko")}>저장</Button>
            </div>

            <WhatContent
              ref={whatContentKRRef}
              data={whatContent.ko}
              lang="ko"
              mainId={mainIds.ko}
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveWhatContent("ko")}>저장</Button>
            </div>
            <LifestyleForm
              ref={lifestyleKRRef}
              data={lifestyle.ko}
              lang="ko"
              mainId={mainIds.ko}
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveLifestyle("ko")}>저장</Button>
            </div>
            <WorkForm
              ref={workKRRef}
              data={work.ko}
              lang="ko"
              mainId={mainIds.ko}
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveWork("ko")}>저장</Button>
            </div>
            <EtcContentForm
              ref={etcKRRef}
              data={etc.ko}
              lang="ko"
              mainId={mainIds.ko}
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveEtcContent("ko")}>저장</Button>
            </div>
          </TabPanel>

          <TabPanel>
            {/* 영문 폼 */}
            <KeyVisualForm
              ref={keyVisualENRef}
              data={keyVisuals.en}
              lang="en"
              mainId={mainIds.en}
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveKeyVisual("en")}>저장</Button>
            </div>
            <WhatsOnForm
              ref={whatsOnENRef}
              data={whatsOn.en}
              lang="en"
              mainId={mainIds.en}
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveWhatsOn("en")}>저장</Button>
            </div>
            <WhatContent
              ref={whatContentENRef}
              data={whatContent.en}
              lang="en"
              mainId={mainIds.en}
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveWhatContent("en")}>저장</Button>
            </div>
            <LifestyleForm
              ref={lifestyleENRef}
              data={lifestyle.en}
              lang="en"
              mainId={mainIds.en}
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveLifestyle("en")}>저장</Button>
            </div>
            <WorkForm
              ref={workENRef}
              data={work.en}
              lang="en"
              mainId={mainIds.en}
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveWork("en")}>저장</Button>
            </div>
            <EtcContentForm
              ref={etcENRef}
              data={etc.en}
              lang="en"
              mainId={mainIds.en}
            />
            <div className="my-4 flex justify-end">
              <Button onClick={() => handleSaveEtcContent("en")}>저장</Button>
            </div>
          </TabPanel>
        </Tabs>
      </Section>
    </FormProvider>
  );
}
