import IntentDetails from "components/IntentDetails";
import NetworkGraph from "components/NetworkGraph";
import useAgentStore from "hooks/useAgentStore";
import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";

export type ContextLinks = {
  inputOn: string[];
  outputOn: Record<string, number>;
};

export type OldContextMap = Record<string, ContextLinks>;

export default function AgentMapPage() {
  const state = useAgentStore();
  const [intentName, setIntentName] = useState<string | null>(null);

  return (
    <Row>
      <Col md={8}>
        <NetworkGraph
          intentList={state.intentList}
          onSelectionChange={setIntentName}
        />
      </Col>
      <Col>{intentName && <IntentDetails intentName={intentName} />}</Col>
    </Row>
  );
}
