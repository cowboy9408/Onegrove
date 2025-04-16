import { useFormContext } from "react-hook-form";
import RadioGroup from "../common/RadioGroup";

export default function FormRadioGroup({ name, options, rules, ...rest }) {
  const { register, watch, setValue } = useFormContext();
  const value = watch(name);

  register(name, rules);

  const handleChange = (e) => {
    setValue(name, e.target.value);
  };

  return (
    <RadioGroup
      name={name}
      options={options}
      value={value || ""}
      onChange={handleChange}
      {...rest}
    />
  );
}
