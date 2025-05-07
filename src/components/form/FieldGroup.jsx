import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

export default function FieldGroup({ name, children }) {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <>
      {fields.map((field, index) => {
        const content = children({ fields, field, index, register, append, remove });
        return <div key={field.id}>{content}</div>;
      })}
    </>
  );
}