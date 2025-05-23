import api from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { Info, UploadIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import { useEffect, useRef, useState } from "react";
import { useController, useFormContext, useWatch } from "react-hook-form";

export default function Upload({
  name,
  value: externalValue,
  onChange: externalOnChange,
  label = "파일 업로드",
  readOnly = false,
  accept = "image/*,video/*",
  acceptWith,
  preview = true,
  className = "",
  error,
  required = false,
  defaultValue = null, // { name, size, url }
  classification = "default",
}) {
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const formContext = useFormContext();
  const control = formContext?.control;
  const {
    field: { value: fieldValue, onChange: fieldOnChange },
  } = useController({ name, control, defaultValue });

  const value = externalValue ?? fieldValue;
  const onChange = externalOnChange ?? fieldOnChange;

  const watchedValue = useWatch({
    control: control,
    name: acceptWith || "",
  });

  const accepted = useMemo(() => {
    switch (watchedValue) {
      case "image":
        return "image/png, image/jpeg, image/gif";
      case "document":
        return ".pdf, .doc, .docx, .txt";
      case "video":
        return "video/mp4, video/webm";
      default:
        return accept;
    }
  }, [watchedValue, accept]);

  const [localFile, setLocalFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!value) return;

    if (value.path) {
      setPreviewUrl(value.path);
      setLocalFile({
        name: value.name,
        size: value.size,
      });
    }
  }, [value]);

  useEffect(() => {
    if (error && wrapperRef.current) {
      wrapperRef.current?.focus();
    }
  }, [error]);

  const handleFileChange = async (e) => {
    console.log("파일 선택됨:", e.target.files[0]);
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("classification", classification);

    console.log("업로드할 파일:", selectedFile);

    //  1. preview URL 생성
    const blobUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(blobUrl);

    // 2. 로컬 상태 저장
    setLocalFile(selectedFile);

    // 3. react-hook-form 값으로도 반영
    onChange({
      name: selectedFile.name,
      size: selectedFile.size,
      url: blobUrl, // 실제 업로드 URL이 아니라 local preview용 URL
    });

    try {
      console.log("업로드할 form:", formData);
      const res = await api.post("/api/v1/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      console.log("업로드 전체 응답:", res);
      console.log("업로드 응답 .data:", res.data);
      console.log("업로드 응답 .data.data:", res.data?.data);

      const result = res.data;
      console.log("Upload 응답 result:", result);
      console.log("업로드 응답 result:", result);

      const isReplace = !!value?.id; // 기존 값이 있는지 판단
      const isNew = !isReplace;

      if (result.name && result.path) {
        onChange({
          id: result.id ?? null,
          originalName: selectedFile.name,
          name: result.name,
          size: result.size,
          extension: "." + selectedFile.name.split(".").pop(),
          mime: result.mime || selectedFile.type,
          classification: null,
          path: result.path ?? value?.path ?? "",
          status: isNew ? "C" : "E", //신규 등록이면 반드시 C
        });
      } else {
        console.error("파일 업로드 실패", result);
      }
    } catch (err) {
      if (err.isAuthFailed) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        // 필요시 로그인 모달 오픈 등 UI 처리
      } else {
        console.error("파일 업로드 에러", err);
        alert("파일 업로드 중 문제가 발생했습니다.");
      }
    }
  };

  const handleClick = () => {
    console.log("Upload 영역 클릭됨");
    if (readOnly) {
      console.log("읽기 전용 상태 - 클릭 무시");
      return;
    }

    if (!inputRef.current) {
      return;
    }

    inputRef.current.click();
  };

  const handleDelete = () => {
    if (readOnly) return;
    setLocalFile(null);
    setPreviewUrl(null);
    inputRef.current.value = null;
    onChange({
      ...value,
      url: null,
      status: "D",
    });
  };

  const formatSize = (size) => {
    if (!size) return "";
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className={cn("w-full", className)} ref={wrapperRef} tabIndex={-1}>
      <p className="mb-1 block pb-2 pl-1 text-sm font-medium text-gray-800 dark:text-gray-100">
        {label}
        {required && <span className="text-red-500">*</span>}
      </p>

      {preview && previewUrl && (
        <div className="mb-2 w-full text-center">
          <img
            src={previewUrl}
            alt="preview"
            className="mx-auto h-32 object-contain"
          />
          <div className="mt-1 text-sm text-gray-600">
            {localFile?.name} ({formatSize(localFile?.size)})
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="mt-1 text-xs text-red-500 underline"
          >
            이미지 제거
          </button>
        </div>
      )}

      {/* 업로드 박스 (미리보기 아래에 위치 X) */}
      <div
        className={cn(
          "relative flex h-10 w-full items-center justify-center rounded-md border text-xs",
          readOnly
            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
            : "cursor-pointer border-dashed border-gray-300 hover:bg-gray-100"
        )}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center justify-center gap-1">
          <UploadIcon size={20} />
          <p className="text-gray-500">
            {localFile ? "다시 업로드하려면 클릭" : "클릭하여 파일 업로드"}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accepted}
        className="hidden"
        onChange={(e) => {
          console.log("파일 선택됨"); // 반드시 찍히는지 확인
          handleFileChange(e);
        }}
      />

      {error && (
        <span className="flex items-center gap-1 pt-1 pl-1 text-xs text-red-500">
          <Info size={14} />
          {error}
        </span>
      )}
    </div>
  );
}
