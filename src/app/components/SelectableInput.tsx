import React from 'react';
import Select, { StylesConfig } from 'react-select';

export default function SingleSelect({
  name,
  onChange,
  data,
  defaultData,
  value,
  required,
}: {
  name: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  data?: object[];
  defaultData?: object;
  value?: string | Number;
  required: boolean
}) {
  const dot = (color = 'transparent') => ({
    alignItems: 'center',
    display: 'flex',

    ':before': {
      backgroundColor: color,
      borderRadius: 10,
      content: '" "',
      display: 'block',
      marginRight: 8,
      height: 10,
      width: 10,
    },
  });

  const selectStyles: StylesConfig = {
    input: (styles) => ({ ...styles, ...dot() }),
  };

  return (
    <Select
      className="basic-single"
      classNamePrefix="select"
      // defaultValue={defaultData}
      isDisabled={false}
      isLoading={false}
      isClearable={false}
      isRtl={false}
      isSearchable
      name={name}
      options={data}
      onChange={onChange}
      styles={selectStyles}
      value={defaultData}
    />
  );
}
