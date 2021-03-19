import React, { useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
import { NetworkGraphProps } from "components/NetworkGraph";

type AgentMapOptionsFormProps = {
  defaultOptions: NetworkGraphProps["options"];
  onOptionsChange: (options: NetworkGraphProps["options"]) => void;
};

export default function AgentMapOptionsForm({
  onOptionsChange,
  defaultOptions,
}: AgentMapOptionsFormProps) {
  const [intentLimit, setIntentLimit] = useState(defaultOptions.intentLimit);
  const [intentContains, setIntentContains] = useState(
    defaultOptions.intentContains
  );

  return (
    <Form
      className="mb-3"
      onSubmit={(ev) => {
        ev.preventDefault();
        onOptionsChange({ intentLimit, intentContains });
      }}
    >
      <Form.Row>
        <Form.Group as={Col} controlId="intentLimit">
          <Form.Label>Intent Limit</Form.Label>
          <Form.Control
            type="number"
            value={intentLimit}
            onChange={(ev) =>
              setIntentLimit(Number.parseInt(ev.target.value) || 0)
            }
          />
        </Form.Group>
        <Form.Group as={Col} controlId="intentFilter">
          <Form.Label>Filter Intent Name</Form.Label>
          <Form.Control
            type="text"
            value={intentContains}
            onChange={(ev) => setIntentContains(ev.target.value)}
          />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Col className="d-flex justify-content-end">
          <Button type="submit">Atualizar</Button>
        </Col>
      </Form.Row>
    </Form>
  );
}
