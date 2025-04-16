import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

export default function FieldGroup({ name, children }) {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <>
      {fields.map((field, index) => (
        <React.Fragment key={field.id}>
          {children({ fields, field, index, register, append, remove })}
        </React.Fragment>
      ))}
    </>
  );
}
