import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import Section from "@/components/layout/Section";
import Button from "@/components/common/Button";
import RegistForm from "./component/RegistForm";
import api from "@/lib/apiClient";
import useModal from "@/hooks/useModal";
import cloneDeep from "lodash/cloneDeep";

export default function OccupancyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialLang = searchParams.get("lang") || "ko";
  const [currentLang, setCurrentLang] = useState(initialLang === "ko" ? 0 : 1);
  const koFormRef = useRef();
  const enFormRef = useRef();
  const { showModal } = useModal();
  const [koData, setKoData] = useState(null);
  const [enData, setEnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const hasPatchedRef = useRef(false);
  const [koLocations, setKoLocations] = useState([]);
  const [enLocations, setEnLocations] = useState([]);
  const [koChargers, setKoChargers] = useState([]);
  const [enChargers, setEnChargers] = useState([]);
  const [freeTime, setFreeTime] = useState(null);
  const [paidTime, setPaidTime] = useState(null);

  const fetchDetail = async () => {
    try {
      const resKo = await api.get(`/api/v1/company/detail/${id}/KO`);
      const resEn = await api.get(`/api/v1/company/detail/${id}/EN`);

      const ko = resKo.data?.data || {};
      const en = resEn.data?.data || {};
      setKoChargers(ko.chargerList || []);
      setEnChargers(en.chargerList || []);

      setKoData(ko);
      setEnData(en);
      setKoLocations(ko.officeList ?? cloneDeep(en.officeList || []));
      setEnLocations(en.officeList ?? cloneDeep(ko.officeList || []));

      setLoading(false);

      const commonId = ko.id || en.id;
      if (commonId) {
        fetchMonthlyTime(commonId);
      }
    } catch (err) {
      console.error("상세 조회 실패:", err);
    }
  };

  const fetchMonthlyTime = async (companyId) => {
    try {
      const [resFree, resPaid] = await Promise.all([
        api.get(`/api/v1/company/detail/time?companyId=${companyId}&type=free`),
        api.get(`/api/v1/company/detail/time?companyId=${companyId}&type=paid`),
      ]);

      setFreeTime(resFree.data?.data ?? 0);
      setPaidTime(resPaid.data?.data ?? 0);
    } catch (err) {
      console.error("월별 시간 조회 실패:", err);
      setFreeTime(0);
      setPaidTime(0);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (!loading) {
      const patchForm = (formRef, data) => {
        if (!formRef?.current || !data) return;
        const set = formRef.current.setValue;

        // mainImg 구조 변환
        const patchImageMeta = (img) =>
          img?.path
            ? {
                id: img.id ?? null,
                name: img.name ?? img.originalName ?? "image.jpg",
                originalName: img.originalName ?? img.name,
                size: img.size ?? 0,
                extension:
                  img.extension ?? "." + (img.name || "").split(".").pop(),
                mime: img.mime ?? "image/jpeg",
                classification: "company",
                path: img.path,
                status: "R",
              }
            : null;

        set("companyName", data.name || "");
        set("ceoName", data.mainName || "");
        set("phone", data.tel || "");
        set("mail", data.email || "");
        set("time", data.freeHour || "");
        set("useStatus", data.useYn === "Y" ? "active" : "inactive");
        set("mainImage", patchImageMeta(data.mainImg));
        const locations = data.officeList || [];
        set("locations", locations);
      };

      patchForm(koFormRef, koData);
      patchForm(enFormRef, enData);

      hasPatchedRef.current = true;
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
    if (!file || file.status === "D" || !file.path) {
      return {
        id: null,
        name: null,
        originalName: file?.originalName || "",
        size: null,
        extension: null,
        mime: null,
        classification: "company",
        path: null,
        status: "D",
      };
    }

    const base = file || original;
    if (!base) return null;

    const originalName = base.originalName || base.name || "";
    const extension = base.extension || "." + originalName.split(".").pop();

    const isNew = !base.id && !original?.id;

    return {
      id: base.id ?? null,
      originalName: originalName,
      name: base.name ?? originalName,
      size: base.size ?? 0,
      extension: extension,
      mime: base.mime || "image/jpeg",
      classification: base.classification || "company",
      path: base.path || null,
      status: isNew
        ? "C"
        : file?.changed
          ? "E"
          : original?.path !== file?.path
            ? "E"
            : file?.status || "R",
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
        const payload = {
          id: data.id,
          lang: data.lang === "ko" ? "KO" : "EN",
          name: data.name,
          mainName: data.mainName,
          tel: data.tel,
          email: data.email,
          freeHour: data.freeHour,
          useYn: data.useYn,
          mainImg: toImageMeta(data.mainImg, original.mainImg),
          officeList: (data.officeList || []).filter(
            (item) =>
              item.delYn !== "Y" &&
              item.office?.trim() !== "" &&
              item.floor?.trim() !== ""
          ),
        };

        const isNew = !original?.id || original?.lang !== payload.lang;

        const apiUrl = isNew
          ? "/api/v1/company/insert"
          : "/api/v1/company/update";

        const res = await api.post(apiUrl, payload);
        console.log("응답 결과:", res.data);
      };

      const isKorean = currentLang === 0;
      const formRef = isKorean ? koFormRef : enFormRef;
      const originalData = isKorean ? koData : enData;

      const formValues = await formRef.current?.submit?.(showError);
      if (!formValues) {
        // 유효성 검사 실패 시, 상태 초기화
        await fetchDetail(); // 상태 초기화 (koData, enData, koLocations, enLocations)
        return;
      }

      const commonId = koData?.id || enData?.id || formValues?.id || null;

      if (!commonId) {
        showModal({
          title: "저장 불가",
          message:
            "기존 항목이 없어서 저장할 수 없습니다. 먼저 국문 정보를 저장해주세요.",
          showCancel: false,
        });
        return;
      }

      showModal({
        title: "수정 확인",
        message: "수정하시겠습니까?",
        showCancel: true,
        onConfirm: async () => {
          try {
            await saveOne(
              {
                ...formValues,
                id: commonId,
                lang: isKorean ? "ko" : "en",
              },
              originalData || {}
            );

            await fetchDetail();

            showModal({
              title: "수정 완료",
              message: "정상적으로 수정되었습니다.",
              showCancel: false,
              onConfirm: () => {
                setIsReadOnly(true);
                navigate("/occupancy?refresh=" + Date.now());
              },
            });
          } catch (err) {
            console.error("수정 실패:", err);
            showModal({
              title: "수정 실패",
              message: "수정 중 문제가 발생했습니다. 다시 시도해주세요.",
              showCancel: false,
            });
          }
        },
      });
    } catch (err) {
      console.error("시스템 예외:", err);
      showModal({
        title: "시스템 오류",
        message: "예상치 못한 오류가 발생했습니다.",
        showCancel: false,
      });
    }
  };

  return (
    <>
      <div className="absolute top-14 -mt-3 w-full text-2xl font-bold">
        입주사 관리 상세 정보
      </div>
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
                <RegistForm
                  ref={koFormRef}
                  data={koData}
                  lang="ko"
                  locations={koLocations}
                  setLocations={setKoLocations}
                  currentLang={currentLang}
                  readOnlyOffice={false}
                  chargerList={koChargers}
                  freeUsedTimeThisMonth={freeTime}
                  paidUsedTimeThisMonth={paidTime}
                />
              </>
            )}
          </TabPanel>

          <TabPanel>
            {!loading && (
              <>
                <RegistForm
                  ref={enFormRef}
                  data={enData}
                  lang="en"
                  locations={enLocations}
                  setLocations={setEnLocations}
                  currentLang={currentLang}
                  readOnlyOffice={false}
                  chargerList={enChargers}
                  freeUsedTimeThisMonth={freeTime}
                  paidUsedTimeThisMonth={paidTime}
                />
              </>
            )}
          </TabPanel>
        </Tabs>

        <div className="flex justify-end gap-4 px-6 pb-6">
          <Button onClick={handleSave}>수정</Button>

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
            목록
          </Button>
        </div>
      </Section>
    </>
  );
}
