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

  return (
    <Form
      className="mb-3"
      onSubmit={(ev) => {
        ev.preventDefault();
        onOptionsChange({ intentLimit });
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
      </Form.Row>
      <Form.Row>
        <Col className="d-flex justify-content-end">
          <Button type="submit">Atualizar</Button>
        </Col>
      </Form.Row>
    </Form>
  );
}
