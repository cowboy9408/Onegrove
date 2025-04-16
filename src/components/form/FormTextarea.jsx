import { useFormContext } from "react-hook-form";
import { forwardRef } from "react";
import Textarea from "../common/Textarea";

const FormTextarea = forwardRef(function FormTextarea(
  { name, rules, ...rest },
  ref
) {
  const { register, watch, setValue } = useFormContext();
  const value = watch(name) || "";

  const { ref: hookFormRef, ...registerProps } = register(name, rules);

  const combineRefs = (element) => {
    if (hookFormRef) hookFormRef(element);
    if (ref) {
      if (typeof ref === "function") ref(element);
      else ref.current = element;
    }
  };

  const handleChange = (e) => {
    setValue(name, e.target.value);
    if (rest.onChange) rest.onChange(e);
  };

  return (
    <Textarea
      {...rest}
      {...registerProps}
      name={name}
      ref={combineRefs}
      value={value}
      onChange={handleChange}
    />
  );
});

export default FormTextarea;
