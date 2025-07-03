
import { useEffect, useState, useContext } from "react";
import Button from "@/components/common/Button";
import DataTableSimple from "@/components/common/DataTableSimple";
import Input from "@/components/common/Input";
import Pagination from "@/components/common/Pagination";
import ResultSummary from "@/components/common/ResultSummary";
import Select from "@/components/common/Select";
import Box from "@/components/layout/Box";
import Col from "@/components/layout/Col";
import ResultSection from "@/components/layout/ResultSection";
import Row from "@/components/layout/Row";
import SearchSection from "@/components/layout/SearchSection";
import { ModalContext } from "@/context/ModalContext";
import DateRangePicker from "@/components/common/Datepicker";
import VisitForm from "@/components/modal/VisitForm";
import api from "@/lib/apiClient";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Visit() {
  const { showModal } = useContext(ModalContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [visitList, setVisitList] = useState([]);

  const size = 30;
  const fetchList = async () => {
    try {
      const res = await api.get("/api/v1/visit");
      if (res.data?.success && Array.isArray(res.data.data)) {
        // console.log(res.data.data);
        setVisitList(res.data.data);
        setTotal(res.data.data?.length)
      }
    } catch (err) {
      console.error("목록 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleEventClick = async (event) => {
    try {
      const res = await api.get(`/api/v1/visit/detail/${event}`);
      if (!res.data.success) return;
      const detail = res.data.data;
      console.log(detail);

      showModal({
        title: "방문 예약 상세",
        size: "2xl",
        customButton: true,
        showCancel: true,
        children: ({ closeModal }) => (
          <div className="space-y-5 text-sm text-gray-700">
            <table className="w-full border text-left">
              <tbody>
                <tr>
                  <th className="p-2 border">예약일시</th><td className="p-2 border">{detail.reservationDatetime}</td>
                  <th className="p-2 border">예약 상태</th><td className={`p-2 border ${detail.status === '예약 확정' ? 'text-[#00AAFF]' : 'text-[#4CAF50]'} font-bold`}>{detail.status}</td>
                </tr>
                <tr>
                  <th className="p-2 border">방문 날짜</th><td className="p-2 border">{detail.visitDate}</td>
                  <th className="p-2 border">방문 시간</th><td className="p-2 border">{detail.visitTime}</td>
                </tr>
                <tr>
                  <th className="p-2 border">방문 입주사</th><td className="p-2 border">{detail.companyName}</td>
                  <th className="p-2 border">방문 동</th><td className="p-2 border">{detail.visitBuilding}</td>
                </tr>
                <tr>
                  <th className="p-2 border">방문 목적</th>
                  <td className="p-2 border h-[80px]" colSpan={3}>{detail.visitPurpose}</td>
                </tr>
                <tr>
                  <th className="p-2 border">방문자명</th><td className="p-2 border">{detail.name}</td>
                  <th className="p-2 border">방문 인원</th><td className="p-2 border">{detail.visitNumber}</td>
                </tr>
                <tr>
                  <th className="p-2 border">방문자 이메일</th><td className="p-2 border">{detail.email}</td>
                  <th className="p-2 border">방문자 연락처</th><td className="p-2 border">{detail.tel}</td>
                </tr>
                <tr>
                  <th className="p-2 border">출입카드 번호</th><td className="p-2 border">-</td>
                  <th className="p-2 border"></th><td className="p-2 border"></td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between gap-3">
              <div className="flex gap-3">
                {detail.status === '가예약' && (
                  <Button
                    theme="danger"
                    onClick={async () => {
                      if (confirm("예약을 확정하겠습니까?")) {
                        try {
                          const res = await api.post("/api/v1/visit/confirm", { checkArr : [detail.id]});
                          if (res.data?.success) {
                            alert("예약 확정 완료");
                            fetchList();
                            closeModal();
                          } else alert("예약 확정 실패");
                        } catch (err) {
                          console.error("예약 확정 오류:", err);
                        }
                      }
                    }}
                  >예약 확정</Button>
                )}
                
                {detail.status !== '예약 취소' && (
                  <Button
                    theme="danger"
                    onClick={async () => {
                      if (confirm("예약을 취소하겠습니까?")) {
                        try {
                          const res = await api.post("/api/v1/visit/cancel", {
                            id: detail.id,
                            companyId: detail.companyId,
                            tel: detail.tel,
                          });
                          if (res.data?.success) {
                            alert("취소 완료");
                            fetchList();
                            closeModal();
                          } else alert("취소 실패");
                        } catch (err) {
                          console.error("취소 오류:", err);
                        }
                      }
                    }}
                  >예약 취소</Button>
                )}
              </div>
              <div>
                <Button
                  onClick={() => {
                    closeModal();
                    showModify(detail);
                  }}
                >수정</Button>
              </div>
            </div>
          </div>
        ),
      });
    } catch (err) {
      console.error("상세 조회 실패:", err);
    }
  };

  const showModify = (detail) => {
    showModal({
      title: "방문 예약 수정",
      size: "2xl",
      customButton: true,
      showCancel: true,
      children: ({ closeModal }) => (
        <VisitForm
          isEdit
          initialData={detail}
          closeModal={closeModal}
          onSubmit={() => {
            fetchList();
            closeModal();
          }}
        />
      ),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <ResultSummary total={total} />

        <div className="flex gap-2">
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => {
              showModify({
                  id: null,
                  reservationDatetime: null,
                  status: null,
                  visitDate: null,
                  visitTime: null,
                  companyId: null,
                  companyName: null,
                  visitBuilding: null,
                  visitPurpose: null,
                  name: null,
                  visitNumber: null,
                  email: null,
                  tel: null,
                  accessCard: null
              });
            }}
          >
            방문객 추가
          </Button>
        </div>
      </div>

      <ResultSection>
        <DataTableSimple
          columns={[
            { key: "id", label: "번호" },
            { key: "companyName", label: "입주사" },
            { key: "name", label: "방문객" },
            {
              key: "visitPurpose",
              label: "방문 목적",
              render: (row) => (
                <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <button
                    className={`text-black-600 truncate p-2 text-left cursor-pointer ${row.visitPurpose && "underline"}`}
                    onClick={(e) => {
                      e.preventDefault();
                      console.log(row.id);
                      handleEventClick(row.id);
                    }}
                  >
                    {row.visitPurpose}
                  </button>
                </div>
              ),
            },
            { key: "visitDate", label: "방문 신청일" },
            { key: "visitTime", label: "방문 시간" },
            { key: "visitNumber", label: "방문 인원" },
            { key: "visitBuilding", label: "방문동" },
            { key: "createDatetime", label: "등록일시" },
            { key: "status", label: "상태" },
          ]}
          data={visitList}
          rowKey="id"
          checkable={true}
        />

        <Pagination
          current={page}
          totalPages={Math.ceil(total / size)}
          onChange={(page) => setPage(page)}
        />
      </ResultSection>
    </div>
  );
}
