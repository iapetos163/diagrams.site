import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { DiagramModel } from './diagram-model';
import { getMatcher, semantics } from './language';

export interface SpecInputProps {
  onDiagramChange?: (diagram: DiagramModel) => void;
}

export const SpecInput: React.FC<SpecInputProps> = ({
  onDiagramChange = () => {},
}) => {
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const matcher = useMemo(() => getMatcher(), []);

  const onTextChange = useCallback<
    React.ChangeEventHandler<HTMLTextAreaElement>
  >(
    (e) => {
      const text = e.target.value;
      setValue(text);
      matcher.setInput(text);
      const res = matcher.match();
      if (res.failed()) {
        setErrorMessage(res.message!);
        return;
      }
      try {
        const s = semantics(res);
        const diagram: DiagramModel = s.diagram;
        console.log({ diagram, s });
        onDiagramChange(diagram);
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message);
      }
    },
    [onDiagramChange, matcher],
  );

  return (
    <>
      <textarea value={value} onChange={onTextChange}></textarea>
      <StyledErrorMessage>{errorMessage}</StyledErrorMessage>
    </>
  );
};

export default SpecInput;

const StyledErrorMessage = styled.div`
  color: darkred;
`;
