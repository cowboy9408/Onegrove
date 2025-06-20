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
  const { emId } = useParams();
  const [sharedCategory, setSharedCategory] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const resolveCategoryCode = (input) => {
    const matched = categoryOptions.find(
      (opt) => opt.code === input || opt.name === input || opt.value === input
    );
    return matched?.code || "";
  };
  const [sharedBrands, setSharedBrands] = useState([]);

  // 국문 상태
  const [koData, setKoData] = useState({});
  // 영문 상태
  const [enData, setEnData] = useState({});
  const defaultEventId = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/v1/event-promotion/item/${emId}`);
        console.log("API 응답 결과:", res.data);

        const list = Array.isArray(res.data?.data) ? res.data.data : [];

        const ko = list.find((item) => item.lang === "ko") || null;
        const en = list.find((item) => item.lang === "en") || null;

        console.log("koData:", ko);
        console.log("enData:", en);

        const patchedKo = ko
          ? {
              ...ko,
              category: resolveCategoryCode(ko.category),
            }
          : null;

        const patchedEn = en
          ? {
              ...en,
              category: resolveCategoryCode(en.category),
            }
          : null;

        setKoData(patchedKo);
        setEnData(patchedEn);
        setLoading(false);
      } catch (err) {
        console.error("API 호출 실패:", err);
        setKoData(null);
        setEnData(null);
        setLoading(false);
      }
    };
    fetchData();
  }, [emId, categoryOptions]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/v1/event-promotion/item/category");
        if (res.data?.success) {
          setCategoryOptions(res.data.data); //
        }
      } catch (err) {
        console.error("카테고리 로딩 실패", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoryOptions.length === 0) return;

    setKoData((prev) => ({
      ...prev,
      category: resolveCategoryCode(prev?.category),
    }));

    setEnData((prev) => ({
      ...prev,
      category: resolveCategoryCode(prev?.category),
    }));
  }, [categoryOptions]);

  const parseLocalDateTime = (str) => {
    if (!str) return null;
    const [datePart, timePart] = str.split("T"); // ex: "2025-05-27", "14:00"
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute);
  };

  useEffect(() => {
    if (!loading && categoryOptions.length > 0) {
      const patchForm = (formRef, data, fallbackCategory = "") => {
        if (!formRef) return;

        // console.log(">>> patchForm 호출 시점:", formRef.current);

        const patchImageMeta = (img) => {
          if (!img) return null;

          const fileName = img.originalName || img.name;
          const fallbackPath = fileName
            ? `https://assets.onegrove.kr/dev/event-promotion/${fileName}`
            : null;

          return {
            ...img,
            path: img.path || fallbackPath,
            name: img.name || fileName,
            status: img.status ?? "R",
          };
        };

        formRef.setValue(
          "progressStatus",
          data?.progressYn === "Y" ? "inProgress" : "ended"
        );

        const categoryCode = resolveCategoryCode(
          data?.categoryCode ?? fallbackCategory
        );
        setTimeout(() => {
          formRef.setValue("category", categoryCode);
          formRef.current.setValue(
            "progressStatus",
            data?.progressYn === "Y" ? "inProgress" : "ended"
          );
        }, 0);

        if (!data || Object.keys(data).length === 0) return;

        formRef.setValue("title", data.title || "");
        formRef.setValue("status", data.showYn === "Y" ? "active" : "inactive");

        formRef.setValue("thumbImg", patchImageMeta(data.thumbImg));
        formRef.setValue("imgBodyPc", patchImageMeta(data.imgBodyPc));
        formRef.setValue("imgBodyMo", patchImageMeta(data.imgBodyMo));
        formRef.setValue("imgPc", patchImageMeta(data.imgPc));
        formRef.setValue("imgMo", patchImageMeta(data.imgMo));
        formRef.setValue("content", data.content || "");
        formRef.setValue("description", data.description || "");
        formRef.setDescription?.(data.description || "");
        formRef.setContent?.(data.content || "");
        formRef.setValue(
          "startDate",
          data.startDate ? parseLocalDateTime(data.startDate) : null
        );
        formRef.setValue("brandId", data.brandId ?? null);

        const isManualEnd =
          data.manualEndInput === true ||
          (!!data.endInput &&
            (data.endDate === null || data.endDate === undefined));
        formRef.setValue("manualEndInput", isManualEnd);
        formRef.setValue("endInput", isManualEnd ? data.endInput : "");
        formRef.setValue(
          "endDate",
          !isManualEnd && data.endDate ? parseLocalDateTime(data.endDate) : null
        );
      };

      const sharedCategory = resolveCategoryCode(
        koData?.categoryCode || enData?.categoryCode || ""
      );

      patchForm(koFormRef.current, koData, sharedCategory);
      patchForm(enFormRef.current, enData, sharedCategory);
    }
  }, [loading, koData, enData, categoryOptions]);

  useEffect(() => {
    if (!loading) {
      console.log("koFormRef.current:", koFormRef.current);
      console.log("enFormRef.current:", enFormRef.current);
    }
  }, [loading]);

  useEffect(() => {
    console.log(" KO 데이터:", koData);
    console.log(" EN 데이터:", enData);
  }, [koData, enData]);

  const toImageMeta = (file, original) => {
    const base = file || original;
    if (!base) return null;

    const originalName = base.originalName || base.name || "";
    const extension = base.extension || "." + originalName.split(".").pop();

    let path = "";
    if (base.path) {
      path = base.path;
    } else if (originalName) {
      path = `https://d2md7choov3drl.cloudfront.net/event-promotion/${originalName}`;
    }

    return {
      id: base.id ?? null,
      originalName: originalName,
      name: base.name ?? originalName,
      size: base.size ?? 0,
      extension: extension,
      mime: base.mime || "image/jpeg",
      classification: base.classification || "event-promotion",
      path: base.path || "",
      status:
        base.status !== undefined && base.status !== null
          ? base.status
          : file?.changed
            ? "E"
            : "R", // 수정 안 하면 R
    };
  };

  const handleSave = async () => {
    const showError = (msg) =>
      showModal({
        title: "입력 오류",
        message: msg,
        showCancel: false,
      });
    try {
      const saveOne = async (data, original = {}) => {
        const isInsert = !data.id;
        const payload = {
          ...(isInsert ? {} : { id: data.id }),
          eventId: koData?.eventId ?? enData?.eventId ?? defaultEventId,
          lang: data.lang,
          category: data.category,
          title: data.title,
          thumbImg: toImageMeta(data.thumbImg, original.thumbImg),
          imgBodyPc: toImageMeta(data.imgBodyPc, original.imgBodyPc),
          imgBodyMo: toImageMeta(data.imgBodyMo, original.imgBodyMo),
          imgPc: toImageMeta(data.imgPc, original.imgPc),
          imgMo: toImageMeta(data.imgMo, original.imgMo),
          showYn: data.showYn,
          sort: data.sort,
          progressYn: data.progressYn,
          content: data.content,
          description: data.description || "",
          startDate:
            (typeof data.startDate === "string"
              ? new Date(data.startDate)
              : data.startDate
            )?.toISOString() || null,
          endDate: data.manualEndInput
            ? null
            : (typeof data.endDate === "string"
                ? new Date(data.endDate)
                : data.endDate
              )?.toISOString() || null,
          endInput: data.manualEndInput ? data.endInput : "",
          manualEndInput: data.manualEndInput === true,
          brandId: data.brandId ?? null,
          delYn: "N",
        };

        console.log("저장 payload:", payload);

        const apiUrl =
          data?.id != null
            ? "/api/v1/event-promotion/item/update"
            : "/api/v1/event-promotion/item/insert";
        const res = await api.post(apiUrl, payload);

        console.log("응답 결과:", res.data);
      };

      if (currentLang === 0) {
        const koValues = await koFormRef.current?.submit?.(showError);
        if (!koValues) return;

        localStorage.setItem(
          `manualEnd_ko_${emId}`,
          koValues.manualEndInput ? "1" : "0"
        );

        await saveOne(
          {
            ...koValues,
            id: koData?.id ?? null,
            eventId: koData?.eventId ?? enData?.eventId ?? null,
            lang: "ko",
          },
          koData || {}
        );
      } else {
        const enValues = await enFormRef.current?.submit?.(showError);
        if (!enValues) return;

        await saveOne(
          {
            ...enValues,
            id: enData?.id ?? null,
            eventId: koData?.eventId ?? null,
            lang: "en",
          },
          enData || {}
        );
      }

      setIsReadOnly(true);
      navigate("/contents/whatson/event/list?refresh=" + Date.now());
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장 실패. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem(`manualEnd_ko_${emId}`);
      localStorage.removeItem(`manualEnd_en_${emId}`);
    };
  }, [emId]);

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
      >
        <TabPanel>
          {!loading && (
            <>
              <EventRegistForm
                ref={koFormRef}
                data={koData}
                setData={setKoData}
                lang="ko"
                brands={sharedBrands}
                setBrands={setSharedBrands}
                category={sharedCategory}
                setCategory={setSharedCategory}
              />
            </>
          )}
        </TabPanel>

        <TabPanel>
          {!loading && (
            <>
              <EventRegistForm
                ref={enFormRef}
                data={enData}
                setData={setEnData}
                lang="en"
                brands={sharedBrands}
                setBrands={setSharedBrands}
                category={sharedCategory}
                setCategory={setSharedCategory}
              />
            </>
          )}
        </TabPanel>
      </Tabs>
      <div className="flex justify-end gap-4 px-6 pb-6">
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

        <Button
          type="button"
          className="bg-gray-200"
          onClick={() =>
            showModal({
              title: "이동 확인",
              message: "이전 페이지로 돌아갈 경우 입력한 정보가 사라집니다.",
              showCancel: true,
              onConfirm: () =>
                navigate("/contents/whatson/event/list?refresh=" + Date.now()),
            })
          }
        >
          목록
        </Button>
      </div>
    </Section>
  );
}
