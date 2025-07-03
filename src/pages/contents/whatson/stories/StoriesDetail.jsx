import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState, useRef } from "react";
import StoriesRegistForm from "./components/StoriesRegistForm";
import Button from "@/components/common/Button";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";

export default function StoriesDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialLang = searchParams.get("lang") || "ko";
  const [currentLang, setCurrentLang] = useState(initialLang === "ko" ? 0 : 1);
  const koFormRef = useRef();
  const enFormRef = useRef();
  const { showModal } = useModal();
  const { emId } = useParams();

  const [isReadOnly, setIsReadOnly] = useState(true);
  const [loading, setLoading] = useState(true);

  // 국문 상태
  const [koData, setKoData] = useState({});
  // 영문 상태
  const [enData, setEnData] = useState({});
  const defaultEventId = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resKO = await api.get(`/api/v1/stories/detail/${emId}/KO`);
        const resEN = await api.get(`/api/v1/stories/detail/${emId}/EN`);

        // const list = Array.isArray(resKO.data?.data) ? resKO.data.data : [];

        const ko = resKO.data.data || [];
        const en = resEN.data.data || [];

        const patchedKo = ko
          ? {
              ...ko,
            }
          : null;

        const patchedEn = en
          ? {
              ...en,
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
  }, [emId]);

  const parseLocalDateTime = (str) => {
    if (!str) return null;
    const [datePart, timePart] = str.split(" "); // ex: "2025-05-27", "14:00"
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hour, minute);
  };

  useEffect(() => {
    console.log("koFormRef.current:", koFormRef.current);
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      const patchForm = (formRef, data, fallbackCategory = "") => {
        if (!formRef) return;

        const patchImageMeta = (img) => {
          if (!img) return null;

          const fileName = img.originalName || img.name;
          const fallbackPath = fileName
            ? `https://assets.onegrove.kr/dev/stories/${fileName}`
            : null;

          return {
            ...img,
            path: img.path || fallbackPath,
            name: img.name || fileName,
            siFileId: img.siFileId ?? img.id ?? null,
            status: img.status ?? "R",
          };
        };

        if (!data || Object.keys(data).length === 0) return;

        formRef.setValue("title", data.title || "");
        formRef.setValue("category", data.category || "");
        formRef.setValue("order", data.sort.toString() || "");
        formRef.setValue("status", data.showYn === "Y" ? "active" : "inactive");

        formRef.setValue("thumbImg", patchImageMeta(data.thumbImg));
        formRef.setValue("patternTopPc", patchImageMeta(data.patternTopPc));
        formRef.setValue("patternTopMo", patchImageMeta(data.patternTopMo));
        formRef.setValue(
          "patternBottomPc",
          patchImageMeta(data.patternBottomPc)
        );
        formRef.setValue(
          "patternBottomMo",
          patchImageMeta(data.patternBottomMo)
        );

        if (data?.storiesImgList?.length > 0) {
          const sortedList = [...data.storiesImgList]
            .filter((img) => img && img.status !== "D")
            .sort((a, b) => {
              if (a.status === "D" && b.status !== "D") return 1;
              if (a.status !== "D" && b.status === "D") return -1;

              return Number(a.sort || 0) - Number(b.sort || 0);
            });

          sortedList.forEach((element, index) => {
            const imgMeta = patchImageMeta(element.swipeImg || element);
            formRef.setValue(`storiesImgList${index + 1}`, imgMeta);
            formRef.setValue(
              `storiesImgCaption${index + 1}`,
              element.caption || ""
            );
          });
        }

        formRef.setValue("content", data.content || "");
        const addContent = data.addContent?.trim?.() || "";
        formRef.setValue("addContent", addContent);
        formRef.setContent2?.(addContent);
        formRef.setValue("description", data.description || "");
        formRef.setDescription?.(data.description || "");
        formRef.setContent?.(data.content || "");
        formRef.setContent2?.(data.addContent || "");

        formRef.setValue(
          "startDate",
          data.startDt ? parseLocalDateTime(data.startDt) : null
        );
        formRef.setValue(
          "endDate",
          data.endDt ? parseLocalDateTime(data.endDt) : null
        );
      };

      patchForm(koFormRef.current, koData);
      patchForm(enFormRef.current, enData);
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
    const base = file || original;
    if (!base) return null;

    const originalName = base.originalName || base.name || "";
    const extension = base.extension || "." + originalName.split(".").pop();

    let path = "";
    if (base.path) {
      path = base.path;
    } else if (originalName) {
      path = `https://assets.onegrove.kr/dev/StoriesImg/${originalName}`;
    }

    return {
      id: base.id ?? null,
      originalName: originalName,
      name: base.name ?? originalName,
      size: base.size ?? 0,
      extension: extension,
      mime: base.mime || "image/jpeg",
      classification: base.classification || "StoriesImg",
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
        const isInsert = !koData?.id && !enData?.id;

        const payload = {
          ...(isInsert ? {} : { id: koData?.id || enData?.id }),
          // contentId: currentLang === 0 ? koData?.contentId : enData?.contentId,
          lang: data.lang,
          category: data.category,
          title: data.title,
          thumbImg: toImageMeta(data.thumbImg, original.thumbImg),
          patternTopPc: toImageMeta(data.patternTopPc, original.patternTopPc),
          patternTopMo: toImageMeta(data.patternTopMo, original.patternTopMo),
          patternBottomPc: toImageMeta(
            data.patternBottomPc,
            original.patternBottomPc
          ),
          patternBottomMo: toImageMeta(
            data.patternBottomMo,
            original.patternBottomMo
          ),

          showYn: data.showYn === "Y" ? "Y" : "N",
          sort: data.sort,
          content: data.content,
          addContent: data.addContent,
          description: data.description || "",
          startDt: data.startDt || null,
          endDt: data.endDt || null,
          delYn: "N",
        };

        if (currentLang === 0 && koData?.contentId) {
          payload.contentId = koData?.contentId;
        } else if (currentLang === 1 && enData?.contentId) {
          payload.contentId = enData?.contentId;
        }

        const deletedImages = (original?.storiesImgList || [])
          .filter((originalImg) => {
            const originalKey = originalImg?.originalName || originalImg?.path;
            const stillExists = (data.storiesImgList || []).some((newImg) => {
              const newKey = newImg?.originalName || newImg?.path;
              return newKey === originalKey;
            });
            return !stillExists;
          })
          .map((deletedImg) => ({
            ...deletedImg,
            status: "D",
            delYn: "Y",
          }));

        // 삭제 항목 포함한 전체 리스트 구성
        payload.storiesImgList = [
          ...(data.storiesImgList || []),
          ...deletedImages,
        ];

        const apiUrl =
          data?.id != null
            ? "/api/v1/stories/update"
            : "/api/v1/stories/insert";
        const res = await api.post(apiUrl, payload);

        console.log("응답 결과:", res.data);
      };

      if (currentLang === 0) {
        const koValues = await koFormRef.current?.submit?.(showError);
        if (!koValues) return;

        await saveOne(
          {
            ...koValues,
            id: koData?.id ?? null,
            lang: "KO",
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
            lang: "EN",
          },
          enData || {}
        );
      }

      alert("저장 완료");
      setIsReadOnly(true);
      navigate("/contents/whatson/stories/list?refresh=" + Date.now());
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장 실패. 다시 시도해주세요.");
    }
  };

  return (
    <>
      <div className="absolute top-14 -mt-3 w-full text-2xl font-bold">
        Stories of OneGrove 상세
      </div>
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
                <StoriesRegistForm
                  ref={koFormRef}
                  data={koData}
                  setData={setKoData}
                  lang="ko"
                />
                <table className="mb-4 w-full border border-gray-300 text-left text-sm text-gray-800">
                  <tbody>
                    <tr>
                      <th className="w-32 border bg-gray-100 px-4 py-2">
                        등록일시
                      </th>
                      <td className="border px-4 py-2">
                        {koData?.createDt || "-"}
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
                        {koData?.updateDt || "-"}
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
                <StoriesRegistForm
                  ref={enFormRef}
                  data={enData}
                  setData={setEnData}
                  lang="en"
                />
                <table className="mb-4 w-full border border-gray-300 text-left text-sm text-gray-800">
                  <tbody>
                    <tr>
                      <th className="w-32 border bg-gray-100 px-4 py-2">
                        등록일시
                      </th>
                      <td className="border px-4 py-2">
                        {enData?.createDt || "-"}
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
                        {enData?.updateDt || "-"}
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
          <Button
            onClick={() =>
              showModal({
                title: "수정 확인",
                message: "수정하시겠습니까?",
                showCancel: true,
                onConfirm: async () => {
                  await handleSave();
                  setIsReadOnly(true); // 저장 후 다시 읽기 전용
                },
              })
            }
          >
            수정
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
                  navigate(
                    "/contents/whatson/stories/list?refresh=" + Date.now()
                  ),
              })
            }
          >
            목록
          </Button>
        </div>
      </Section>
    </>
  );
}
