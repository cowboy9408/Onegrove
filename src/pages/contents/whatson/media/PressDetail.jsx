import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import Section from "@/components/layout/Section";
import Button from "@/components/common/Button";
import PressRegistForm from "./component/PressRegistForm";
import api from "@/lib/apiClient";

export default function PressDetail() {
  const navigate = useNavigate();
  const { pmId } = useParams();
  const [searchParams] = useSearchParams();
  const initialLang = searchParams.get("lang") || "ko";
  const [currentLang, setCurrentLang] = useState(initialLang === "ko" ? 0 : 1);
  const koFormRef = useRef();
  const enFormRef = useRef();

  const [koData, setKoData] = useState(null);
  const [enData, setEnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/v1/press/${pmId}`);
        console.log("API 응답 결과:", res.data);

        const list = Array.isArray(res.data?.data) ? res.data.data : [];

        const ko = list.find((item) => item.lang === "ko") || null;
        const en = list.find((item) => item.lang === "en") || null;

        console.log("koData:", ko);
        console.log("enData:", en);

        setKoData(ko);
        setEnData(en);
        setLoading(false);
      } catch (err) {
        console.error("API 호출 실패:", err);
        setKoData(null);
        setEnData(null);
        setLoading(false);
      }
    };
    fetchData();
  }, [pmId]);

  useEffect(() => {
    if (!loading) {
      const patchForm = (formRef, data, fallbackCategory = "") => {
        if (!formRef) return;
        const patchImageMeta = (img) =>
          img?.path
            ? {
                ...img,
                status: "R",
              }
            : null;

        formRef.setValue("category", data?.categoryCode ?? fallbackCategory);

        if (!data) return;

        formRef.setValue("title", data.title || "");
        formRef.setValue("status", data.showYn === "Y" ? "active" : "inactive");
        formRef.setValue("publishDate", data.publishDate || "");
        formRef.setValue("imgPc", patchImageMeta(data.thumbImgPc));
        formRef.setValue("imgMo", patchImageMeta(data.thumbImgMo));
        formRef.setValue("content", data.content || "");
      };

      const koCategory = koData?.categoryCode ?? "";
      const enCategory = enData?.categoryCode ?? "";

      patchForm(koFormRef.current, koData, enCategory);
      patchForm(enFormRef.current, enData, koCategory);
    }
  }, [loading, koData, enData]);

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
    // 사용자가 이미지 삭제한 경우
    if (file?.status === "D") {
      return {
        id: null,
        name: null,
        originalName: file.originalName || "",
        size: null,
        extension: null,
        mime: null,
        classification: "press-media", // 또는 null도 가능
        path: null,
        status: "D",
      };
    }

    const base = file || original;
    if (!base) return null;

    const originalName = base.originalName || base.name || "";
    const extension = base.extension || "." + originalName.split(".").pop();

    return {
      id: base.id ?? null,
      originalName: originalName,
      name: base.name ?? originalName,
      size: base.size ?? 0,
      extension: extension,
      mime: base.mime || "image/jpeg",
      classification: base.classification || "press-media",
      path: base.path || null,
      status:
        base.status !== undefined && base.status !== null
          ? base.status
          : file?.changed
            ? "E"
            : "R", // 수정 안 하면 R
    };
  };

  const handleSave = async () => {
    try {
      const saveOne = async (data, original = {}) => {
        const payload = {
          id: data.id,
          pressId: data.pressId,
          lang: data.lang,
          category: data.category,
          title: data.title,
          thumbImgPc: toImageMeta(data.thumbImgPc, original.thumbImgPc),
          thumbImgMo: toImageMeta(data.thumbImgMo, original.thumbImgMo),
          showYn: data.showYn,
          content: data.content,
          publishDate: data.publishDate,
        };
        console.log("저장 요청 - PC:", data.thumbImgPc);
        console.log("저장 요청 - MO:", data.thumbImgMo);
        console.log(
          "변환된 PC:",
          toImageMeta(data.thumbImgPc, original.thumbImgPc)
        );
        console.log(
          "변환된 MO:",
          toImageMeta(data.thumbImgMo, original.thumbImgMo)
        );
        console.log("저장 payload:", payload);
        console.log("payload.thumbImgPc:", payload.thumbImgPc);

        const apiUrl = data.id
          ? "/api/v1/press/update"
          : "/api/v1/press/insert";
        const res = await api.post(apiUrl, payload);

        console.log("응답 결과:", res.data);
      };

      if (currentLang === 0) {
        const koValues = await koFormRef.current?.submit?.();
        if (!koValues) return;

        await saveOne(
          {
            ...koValues,
            id: koData?.id ?? null,
            pressId: koData?.pressId ?? enData?.pressId ?? null,
            lang: "ko",
          },
          koData || {}
        );
      } else {
        const enValues = await enFormRef.current?.submit?.();
        if (!enValues) return;

        await saveOne(
          {
            ...enValues,
            id: enData?.id ?? null,
            pressId: koData?.pressId ?? null,
            lang: "en",
          },
          enData || {}
        );
      }

      alert("저장 완료");
      setIsReadOnly(true);
      navigate("/contents/whatson/media?refresh=" + Date.now());
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장 실패. 다시 시도해주세요.");
    }
  };

  return (
    <Section>
      <Tabs
        tabs={[
          { key: "ko", label: "국문" },
          { key: "en", label: "영문" },
        ]}
        defaultIndex={currentLang}
        onTabChange={(index) => {
          if (!loading) setCurrentLang(index);
        }}
        // disabled={isReadOnly}
      >
        <TabPanel>
          {!loading && (
            <>
              <PressRegistForm
                ref={koFormRef}
                data={koData}
                lang="ko"
                // readOnly={isReadOnly}
              />
              <table className="mb-4 w-full border border-gray-300 text-left text-sm text-gray-800">
                <tbody>
                  <tr>
                    <th className="w-32 border bg-gray-100 px-4 py-2">
                      등록일시
                    </th>
                    <td className="border px-4 py-2">
                      {koData?.createDatetime || "-"}
                    </td>
                    <th className="w-32 border bg-gray-100 px-4 py-2">
                      등록자
                    </th>
                    <td className="border px-4 py-2">
                      {koData?.createUser || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th className="border bg-gray-100 px-4 py-2">수정일시</th>
                    <td className="border px-4 py-2">
                      {koData?.updateDatetime || "-"}
                    </td>
                    <th className="border bg-gray-100 px-4 py-2">
                      최근 수정자
                    </th>
                    <td className="border px-4 py-2">
                      {koData?.updateUser || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </TabPanel>

        <TabPanel>
          {!loading && (
            <>
              <PressRegistForm
                ref={enFormRef}
                data={enData}
                lang="ko"
                // readOnly={isReadOnly}
              />
              <table className="mb-4 w-full border border-gray-300 text-left text-sm text-gray-800">
                <tbody>
                  <tr>
                    <th className="w-32 border bg-gray-100 px-4 py-2">
                      등록일시
                    </th>
                    <td className="border px-4 py-2">
                      {enData?.createDatetime || "-"}
                    </td>
                    <th className="w-32 border bg-gray-100 px-4 py-2">
                      등록자
                    </th>
                    <td className="border px-4 py-2">
                      {enData?.createUser || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th className="border bg-gray-100 px-4 py-2">수정일시</th>
                    <td className="border px-4 py-2">
                      {enData?.updateDatetime || "-"}
                    </td>
                    <th className="border bg-gray-100 px-4 py-2">
                      최근 수정자
                    </th>
                    <td className="border px-4 py-2">
                      {enData?.updateUser || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </TabPanel>
      </Tabs>

      <div className="flex justify-end gap-4 px-6 pb-6">
        <Button onClick={handleSave} theme="primary">
          저장
        </Button>

        <Button
          onClick={() =>
            navigate("/contents/whatson/media?refresh=" + Date.now())
          }
        >
          목록
        </Button>
      </div>
    </Section>
  );
}
