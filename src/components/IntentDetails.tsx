import useAgentStore from "hooks/useAgentStore";
import React, { useMemo } from "react";
import { Col, Row } from "react-bootstrap";

type IntentDetailsProps = {
  intentName: string;
};

export default function IntentDetails({ intentName }: IntentDetailsProps) {
  const { intentList } = useAgentStore();
  const intent = useMemo(
    () => intentList.find((i) => i.intent.name === intentName)?.intent,
    [intentList, intentName]
  );
  if (!intent) return null;

  return (
    <Row>
      <Col>Intent:</Col>
      <Col>{intent.name}</Col>
    </Row>
  );
}
