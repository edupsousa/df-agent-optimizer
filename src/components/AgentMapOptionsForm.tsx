import React, { useMemo, useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
import { NetworkGraphProps } from "components/NetworkGraph";
import useAgentStore from "hooks/useAgentStore";

type AgentMapOptionsFormProps = {
  defaultOptions: NetworkGraphProps["options"];
  onOptionsChange: (options: NetworkGraphProps["options"]) => void;
};

export default function AgentMapOptionsForm({
  onOptionsChange,
  defaultOptions,
}: AgentMapOptionsFormProps) {
  const { intentList } = useAgentStore();
  const intents = useMemo(
    () =>
      intentList
        .slice()
        .map((i) => i.intent.name)
        .sort((a, b) => (a > b ? 1 : a < b ? -1 : 0)),
    [intentList]
  );
  const [intentLimit, setIntentLimit] = useState(defaultOptions.intentLimit);
  const [intentContains, setIntentContains] = useState(
    defaultOptions.intentContains
  );
  const [startIntent, setStartIntent] = useState(defaultOptions.startIntent);
  const [depthFromStart, setDepthFromStart] = useState(
    defaultOptions.depthFromStart
  );

  return (
    <Form
      className="mb-3"
      onSubmit={(ev) => {
        ev.preventDefault();
        onOptionsChange({
          intentLimit,
          intentContains,
          startIntent,
          depthFromStart,
        });
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
        <Form.Group as={Col} controlId="startIntent">
          <Form.Label>Start on Intent</Form.Label>
          <Form.Control
            as="select"
            value={startIntent}
            onChange={(ev) => setStartIntent(ev.target.value)}
          >
            {intents.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} controlId="depthFromStart">
          <Form.Label>Depth from Start</Form.Label>
          <Form.Control
            type="number"
            value={depthFromStart}
            onChange={(ev) =>
              setDepthFromStart(Number.parseInt(ev.target.value) || 0)
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
