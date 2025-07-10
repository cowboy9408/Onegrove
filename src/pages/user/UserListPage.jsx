import Button from "@/components/common/Button";
import DataTable from "@/components/common/DataTable";
import Input from "@/components/common/Input";
import Pagination from "@/components/common/Pagination";
import ResultSummary from "@/components/common/ResultSummary";
import Select from "@/components/common/Select";
import Box from "@/components/layout/Box";
import Col from "@/components/layout/Col";
import ResultSection from "@/components/layout/ResultSection";
import Row from "@/components/layout/Row";
import SearchSection from "@/components/layout/SearchSection";
import { useEffect, useId, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Radio from "@/components/common/Radio";
import api from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";

export default function UserListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { permission, companyId } = useAuthStore(); // 로그인된 사용자의 역할(role) 가져오기

  useEffect(() => {
    console.log("내 권한:", permission);
    console.log("내 companyId:", companyId);
  }, []);

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [checkedIds, setCheckedIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [companyOptions, setCompanyOptions] = useState([]);
  const defaultFilter = {
    name: "",
    email: "",
    status: "",
    type: "",
  };
  const [searchFilter, setSearchFilter] = useState(defaultFilter);
  const [activeFilter, setActiveFilter] = useState(defaultFilter);

  const nameId = useId();
  const emailId = useId();

  const size = 30;

  // const mapRoleToLabel = (role) => {
  //   switch (role) {
  //     case "SUPER_ADMIN":
  //       return "슈퍼관리자";
  //     case "NORMAL_ADMIN":
  //       return "일반 관리자";
  //     case "RETAIL_ADMIN":
  //       return "리테일 관리자";
  //     case "OFFICE_ADMIN":
  //       return "오피스 관리자";
  //     case "OFFICE_SECRETARY_ADMIN":
  //       return "입주사총무팀";
  //     case "MEMBER":
  //       return "회원";
  //     default:
  //       return "알 수 없음";
  //   }
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/v1/user/member");
        const res = response.data;

        if (res.success) {
          let allData = res.data;

          console.log(
            "총무 계정 임직원 목록:",
            allData.map((v) => v.companyName)
          );

          if (permission === "OFFICE_SECRETARY_ADMIN") {
            const myCompanyName = allData[0]?.companyName;
            if (myCompanyName) {
              setSearchFilter((prev) => ({ ...prev, type: myCompanyName }));
              setActiveFilter((prev) => ({ ...prev, type: myCompanyName }));
              setCompanyOptions([
                { companyId: null, companyName: myCompanyName },
              ]);
            }
          } else {
            // 관리자일 경우 전체 회사 옵션 구성
            const uniqueCompanies = Array.from(
              new Map(allData.map((item) => [item.companyId, item])).values()
            );
            setCompanyOptions(uniqueCompanies);
          }

          // 이후 필터 처리
        }
      } catch (error) {
        console.error("API 요청 실패:", error);
      }
    };

    fetchData();
  }, [page, refreshKey]);

  const handleCheck = (id, checked) => {
    setCheckedIds((prev) =>
      checked ? [...prev, id] : prev.filter((v) => v !== id)
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/v1/user/member");
        const res = response.data;

        if (res.success) {
          let allData = res.data;

          console.log(
            "item.isUse 실제 값들:",
            allData.map((item) => item.isUse)
          );

          let filtered = allData;

          if (permission === "OFFICE_SECRETARY_ADMIN" && companyId) {
            filtered = filtered.filter(
              (item) => String(item.companyId) === String(companyId)
            );
          }

          filtered.sort((a, b) => {
            const dateA = new Date(a.createDatetime);
            const dateB = new Date(b.createDatetime);
            return dateB - dateA;
          });

          if (activeFilter.type) {
            filtered = filtered.filter(
              (item) => item.companyName === activeFilter.type
            );
          }

          if (activeFilter.name) {
            filtered = filtered.filter((item) =>
              item.name?.includes(activeFilter.name)
            );
          }

          if (activeFilter.email) {
            filtered = filtered.filter((item) =>
              item.username?.includes(activeFilter.email)
            );
          }

          if (activeFilter.status === "active") {
            filtered = filtered.filter((item) => item.isUse === "사용");
          } else if (activeFilter.status === "inactive") {
            filtered = filtered.filter((item) => item.isUse === "미사용");
          }

          // 페이지네이션 처리
          const startIndex = (page - 1) * size;
          const paginated = filtered.slice(startIndex, startIndex + size);
          const totalFiltered = filtered.length;

          // 데이터 형식을 맞춰서 상태에 저장
          setData(
            paginated.map((item, index) => ({
              no: totalFiltered - (startIndex + index),
              _id: item.id,
              companyName: item.companyName,
              occupancy: "", // 입주사 없음
              name: item.name,
              username: item.username,
              email: item.email,
              status: item.status,
              valuable: item.isUse,
              createUser: item.createUser,
              created_at: item.createDatetime
                ? new Date(item.createDatetime).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    // hour: "2-digit",
                    // minute: "2-digit",
                    // second: "2-digit",
                  })
                : "",
            }))
          );

          setTotal(filtered.length); // 필터링된 전체 개수
        }
      } catch (error) {
        console.error("API 요청 실패:", error);
      }
    };

    fetchData();
  }, [page, activeFilter, refreshKey]);

  return (
    <div>
      <SearchSection>
        <Box>
          <Row className="gap-12">
            <Col>
              <Select
                label="입주사"
                value={searchFilter.type}
                disabled={permission === "OFFICE_SECRETARY_ADMIN"}
                onChange={(e) =>
                  setSearchFilter({ ...searchFilter, type: e.target.value })
                }
              >
                {permission !== "OFFICE_SECRETARY_ADMIN" && (
                  <option value="">전체</option>
                )}
                {companyOptions.map((company) => (
                  <option key={company.companyName} value={company.companyName}>
                    {company.companyName}
                  </option>
                ))}
              </Select>
            </Col>
            <Col>
              <Input
                id={nameId}
                label={"이름"}
                value={searchFilter.name}
                onChange={(e) =>
                  setSearchFilter({ ...searchFilter, name: e.target.value })
                }
                onClear={() => setSearchFilter({ ...searchFilter, name: "" })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setPage(1);
                    setActiveFilter(searchFilter);
                    setSearchParams({ ...searchFilter, page: 1 });
                  }
                }}
              />
            </Col>
            <Col>
              <Input
                id={emailId}
                label={"아이디"}
                value={searchFilter.email}
                onChange={(e) =>
                  setSearchFilter({ ...searchFilter, email: e.target.value })
                }
                onClear={() => setSearchFilter({ ...searchFilter, email: "" })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setPage(1);
                    setActiveFilter(searchFilter);
                    setSearchParams({ ...searchFilter, page: 1 });
                  }
                }}
              />
            </Col>
            <Col>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">사용 여부</span>
                <div className="flex flex-row items-center gap-4">
                  <Radio
                    name="status"
                    value="active"
                    label="사용"
                    checked={searchFilter.status === "active"}
                    onChange={() =>
                      setSearchFilter({ ...searchFilter, status: "active" })
                    }
                  />
                  <Radio
                    name="status"
                    value="inactive"
                    label="미사용"
                    checked={searchFilter.status === "inactive"}
                    onChange={() =>
                      setSearchFilter({ ...searchFilter, status: "inactive" })
                    }
                  />
                </div>
              </div>
            </Col>
            <Col className="flex gap-2 self-end">
              <Button
                onClick={() => {
                  setPage(1);
                  setActiveFilter(searchFilter);
                  setSearchParams({ ...searchFilter, page: 1 });
                }}
              >
                검색
              </Button>
              <Button
                variant="outline" // 혹은 스타일 지정
                onClick={() => {
                  setSearchFilter(defaultFilter); // 필터 UI 초기화
                  setActiveFilter(defaultFilter); // 필터 상태 초기화
                  setPage(1); // 페이지 초기화
                  setSearchParams({ page: 1 }); // URL 파라미터 초기화
                }}
              >
                초기화
              </Button>
            </Col>
          </Row>
        </Box>
      </SearchSection>
      <div className="mb-4 flex items-center justify-between">
        <ResultSummary total={total} />

        <div className="flex gap-2">
          {/* {permission !== "OFFICE_SECRETARY_ADMIN" && ( */}
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => {
              navigate("/user/regist");
            }}
          >
            등록
          </Button>
          {/* )} */}
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={async () => {
              if (checkedIds.length === 0) {
                alert("삭제할 항목을 선택해주세요.");
                return;
              }

              const confirmed =
                window.confirm("선택한 회원을 삭제하시겠습니까?");
              if (!confirmed) return;

              try {
                const res = await api.post("/api/v1/user/member/delete", {
                  checkArr: checkedIds,
                });

                if (res.status === 200 || res.data.success) {
                  alert("삭제가 완료되었습니다.");
                  setCheckedIds([]);
                  setPage(1);
                  setRefreshKey((prev) => prev + 1);
                } else {
                  alert("삭제 실패: 서버 오류");
                }
              } catch (err) {
                console.error("삭제 요청 실패:", err);
                alert("삭제 중 오류가 발생했습니다.");
              }
            }}
          >
            삭제
          </Button>
        </div>
      </div>
      <ResultSection>
        <DataTable
          columns={[
            { key: "no", label: "번호" },
            { key: "companyName", label: "입주사" },
            { key: "name", label: "이름" },
            {
              key: "username",
              label: "아이디",
              render: (row) => (
                <button
                  className="text-black-600 underline"
                  onClick={() => navigate(`/user/detail/${row._id}`)}
                >
                  {row.username}
                </button>
              ),
            },
            { key: "email", label: "이메일" },
            { key: "status", label: "계정 상태" },
            {
              key: "valuable",
              label: "사용 여부",
              render: (row) => row.valuable,
            },
            { key: "createUser", label: "등록자" },
            { key: "created_at", label: "등록일시" },
          ]}
          data={data}
          checkable={true}
          checkedIds={checkedIds}
          onCheck={handleCheck}
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
