import React from 'react';
import Select from 'react-select';

export default function SingleSelect({
  name,
  onChange,
  data,
  defaultData,
}: {
  name: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  data?: object[];
  defaultData?: object;
  value?: string | Number;
  required: boolean
}) {

  return (
    <Select
      className="basic-single"
      classNamePrefix="select"
      isDisabled={false}
      isLoading={false}
      isClearable={false}
      isRtl={false}
      isSearchable
      name={name}
      options={data}
      onChange={onChange}
      value={defaultData}
    />
  );
}
