import InputContexstDetails from "components/InputContexstDetails";
import IntentDetails from "components/IntentDetails";
import NetworkGraph from "components/NetworkGraph";
import React, { useCallback, useState } from "react";
import { Col, Row } from "react-bootstrap";

export type ContextLinks = {
  inputOn: string[];
  outputOn: Record<string, number>;
};

export type OldContextMap = Record<string, ContextLinks>;

export default function AgentMapPage() {
  const [selection, setSelection] = useState<{
    type: "intent" | "inputContext";
    name: string;
  } | null>(null);
  const selectionChangeHandler = useCallback(
    (type: "intent" | "inputContext", name: string) => {
      setSelection({ type, name });
    },
    []
  );

  return (
    <Row>
      <Col md={8}>
        <NetworkGraph onSelectionChange={selectionChangeHandler} />
      </Col>
      <Col>
        {selection?.type === "intent" && (
          <IntentDetails intentName={selection.name} />
        )}
        {selection?.type === "inputContext" && (
          <InputContexstDetails contextNames={selection.name.split(";")} />
        )}
      </Col>
    </Row>
  );
}
