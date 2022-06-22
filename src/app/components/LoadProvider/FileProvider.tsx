import React from 'react';
import Button from '../Button';
import Stack from '../Stack';

type Props = {
  onCancel: () => void;
};

export default function FileProvider({ onCancel }: Props) {
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  const [fileList, setFileList] = React.useState<FileList>();

  const handleClick = React.useCallback(() => {
    hiddenFileInput.current?.click();
  }, [hiddenFileInput]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    hiddenFileInput.current?.setAttribute("directory", "");
    hiddenFileInput.current?.setAttribute("webkitdirectory", "");
    const files = event.target.files;
    if (!files) return;
    setFileList(files);
    const reader = new FileReader();
    reader.readAsText(files[0]);
    reader.onload = () => {
      const result = reader.result;
    }
  }, [fileList]);

  return (
    <Stack direction="column" gap={2}>
      <p className="text-xs text-gray-600">
        Import your existing tokens JSON files into the plugin. If you're using a single file, the first-level keys should be the token set names. If you're using multiple files, the file name / path are the set names.
      </p>
      <Stack direction="row" gap={4} justify="between">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleClick}>
          Choose file or folder
        </Button>
        <input
          type="file"
          ref={hiddenFileInput}
          style={{ display: 'none' }}
          multiple
          onChange={handleChange}
          accept='*.json'
        />
      </Stack>
    </Stack>
  );
}
