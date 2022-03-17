import React from 'react';
import Box from './Box';
import {
  sortingFunction,
  isRootLevel,
  getDepth,
  isChildSelected,
} from './utils';

https:// github.com/codesandbox/codesandbox-client/blob/389073613e06eee944231f4aeef9dfa746c1b947/packages/app/src/embed/components/Sidebar/FileTree/index.js

function TokenSetTree2({ tokenSets }) {
  const selectedFile = allFiles.find((file) => file.longid === currentModuleId);
  const onSelect = (file) => setCurrentModuleId(file.longid);

  return (
    <SubTree
      files={allFiles}
      allFiles={allFiles}
      selectedFile={selectedFile}
      onSelect={onSelect}
    />
  );
}

export default FileTree;

function SubTree({
  files, allFiles, selectedFile, onSelect,
}) {
  return (
    <div>
      {files
        .filter((child) => isRootLevel(files, child))
        .sort(sortingFunction)
        .map((child) => (
          <React.Fragment key={child.id}>
            {child.type === 'directory' ? (
              <Directory
                className="directory"
                files={files}
                allFiles={allFiles}
                selectedFile={selectedFile}
                onSelect={onSelect}
                {...child}
              />
            ) : (
              <File
                selectedFile={selectedFile}
                allFiles={allFiles}
                onClick={() => onSelect(child)}
                {...child}
              />
            )}
          </React.Fragment>
        ))}
    </div>
  );
}

function Directory(props) {
  const children = props.allFiles.filter((file) => file.directory === props.id);

  const defaultOpen = isChildSelected({
    allFiles: props.allFiles,
    directory: props,
    selectedFile: props.selectedFile,
  });

  const [open, setOpen] = React.useState(defaultOpen);
  const toggle = () => setOpen(!open);

  return (
    <>
      <File
        selectedFile={props.selectedFile}
        allFiles={props.allFiles}
        onClick={toggle}
        {...props}
      />
      {open ? (
        <SubTree
          files={children}
          allFiles={props.allFiles}
          selectedFile={props.selectedFile}
          onSelect={props.onSelect}
        />
      ) : null}
    </>
  );
}

function Set(props) {
  const selected = props.selectedFile.id === props.id;
  const depth = getDepth(props.allFiles, props);

  return (
    <FileContainer depth={depth} isSelected={selected} onClick={props.onClick}>
      <Box>{props.title}</Box>
    </FileContainer>
  );
}
