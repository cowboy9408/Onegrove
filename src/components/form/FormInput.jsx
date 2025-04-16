import { forwardRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import Input from "../common/Input";

const FormInput = forwardRef(function FormInput(
  { fieldName, rules, ...rest },
  ref
) {
  const { register, control, setValue } = useFormContext();
  const watchedValue = useWatch({
    control,
    name: fieldName,
  });

  const { onChange, onBlur, ref: registerRef } = register(fieldName, rules);

  const handleClear = () => {
    setValue(fieldName, "");
  };

  return (
    <Input
      {...rest}
      ref={(element) => {
        registerRef(element);
        if (typeof ref === "function") ref(element);
        else if (ref) ref.current = element;
      }}
      value={watchedValue || ""}
      onChange={(e) => {
        onChange(e);
        if (rest.onChange) rest.onChange(e);
      }}
      onBlur={onBlur}
      onClear={handleClear}
    />
  );
});

export default FormInput;
