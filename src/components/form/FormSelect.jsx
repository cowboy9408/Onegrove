import { forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import Select from "../common/Select";

const FormSelect = forwardRef(function FormSelect(
  { name, rules, children, ...rest },
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
    <Select
      {...rest}
      {...registerProps}
      ref={combineRefs}
      value={value}
      onChange={handleChange}
    >
      {children}
    </Select>
  );
});

export default FormSelect;
