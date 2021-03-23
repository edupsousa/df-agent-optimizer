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
    <>
      <Row>
        <Col md={3}>Intent:</Col>
        <Col>{intent.name}</Col>
      </Row>
      <Row>
        <Col md={3}>Input Contexts:</Col>
        <Col>
          <ul>
            {intent.contexts.sort().map((ctxName) => (
              <li key={ctxName}>{ctxName}</li>
            ))}
          </ul>
        </Col>
      </Row>
      <Row>
        <Col md={3}>Output Contexts:</Col>
        <Col>
          <ul>
            {intent.responses.map((r) =>
              r.affectedContexts
                .sort(({ name: a }, { name: b }) =>
                  a > b ? 1 : a < b ? -1 : 0
                )
                .map((ctx) => (
                  <li key={ctx.name}>
                    {ctx.name} ({ctx.lifespan})
                  </li>
                ))
            )}
          </ul>
        </Col>
      </Row>
      <Row>
        <Col md={3}>Reponses</Col>
        <Col>
          <ul>
            {intent.responses.map((r) =>
              r.messages
                .filter((m) => m.speech)
                .map((m, i) => <li key={i}>{m.speech}</li>)
            )}
          </ul>
        </Col>
      </Row>
    </>
  );
}
