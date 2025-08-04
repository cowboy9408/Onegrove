import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import Textarea from "@/components/common/Textarea";
import Editor from "@/components/common/Editor";

const RuleForm = forwardRef(function RuleForm(
  { data, setData, lang, category },
  ref
) {
  const editorRef = useRef();

  const [formData, setFormData] = useState({
    id: data?.id || null,
    title: data?.title || "",
    content: data?.content || "",
  });

  // 외부에서 submit() 가능하도록 ref 연결
  useImperativeHandle(ref, () => ({
    submit: async (onError) => {
      if (!formData.title.trim()) {
        onError("제목을 입력해주세요.");
        return null;
      }

      const content = await editorRef.current?.getContent();
      if (!content || content.trim() === "") {
        onError("내용을 입력해주세요.");
        return null;
      }

      return {
        id: formData.id || null,
        lang: lang.toUpperCase(),
        title: formData.title,
        content,
        category,
      };
    },
  }));

  useEffect(() => {
    setFormData({
      id: data?.id || null,
      title: data?.title || "",
      content: data?.content || "",
    });
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    setData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <div className="space-y-6">
      <Textarea
        label="제목"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        maxLength={100}
        placeholder="제목을 입력해주세요"
      />
      <Editor ref={editorRef} initialContent={formData.content} />
    </div>
  );
});

export default RuleForm;
