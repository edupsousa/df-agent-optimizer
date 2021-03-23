import useAgentStore from "hooks/useAgentStore";
import React, { useMemo } from "react";
import { Button, Col, ListGroup, Row } from "react-bootstrap";

type IntentDetailsProps = {
  intentName: string;
};

export default function IntentDetails({ intentName }: IntentDetailsProps) {
  const { intentList, removeInputContext } = useAgentStore();
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
          <ListGroup variant="flush">
            {intent.contexts.sort().map((ctxName) => (
              <ListGroup.Item
                key={ctxName}
                className="d-flex justify-content-between py-2"
              >
                {ctxName}
                <div>
                  <Button size="sm" variant="info">
                    Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="ml-2"
                    onClick={() => removeInputContext(intent.name, ctxName)}
                  >
                    Remove
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
      <Row>
        <Col md={3}>Output Contexts:</Col>
        <Col>
          <ListGroup variant="flush">
            {intent.responses.map((r) =>
              r.affectedContexts
                .sort(({ name: a }, { name: b }) =>
                  a > b ? 1 : a < b ? -1 : 0
                )
                .map((ctx) => (
                  <ListGroup.Item
                    key={ctx.name}
                    className="d-flex justify-content-between py-2"
                  >
                    {ctx.name} ({ctx.lifespan})
                    <div>
                      <Button size="sm" variant="info">
                        Rename
                      </Button>
                      <Button size="sm" variant="danger" className="ml-2">
                        Remove
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))
            )}
          </ListGroup>
        </Col>
      </Row>
      <Row>
        <Col>Reponses</Col>
      </Row>
      <Row>
        <Col>
          <ListGroup>
            {intent.responses.map((r) =>
              r.messages
                .filter((m) => m.speech)
                .map((m, i) => (
                  <ListGroup.Item key={i} style={{ whiteSpace: "pre-wrap" }}>
                    {m.speech}
                  </ListGroup.Item>
                ))
            )}
          </ListGroup>
        </Col>
      </Row>
    </>
  );
}
