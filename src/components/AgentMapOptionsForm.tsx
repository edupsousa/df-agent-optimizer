import { AgentGraphMode, AgentGraphOptions } from "hooks/useAgentGraph";
import useAgentStore from "hooks/useAgentStore";
import React, { useMemo, useState } from "react";
import { Button, Col, Dropdown, DropdownButton, Form } from "react-bootstrap";

type AgentMapOptionsFormProps = {
  onOptionsChange: (options: AgentGraphOptions) => void;
};

export default function AgentMapOptionsForm({
  onOptionsChange,
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
  const [graphMode, setGraphMode] = useState<AgentGraphMode>("filterIntents");
  const [intentLimit, setIntentLimit] = useState(50);
  const [intentFilter, setIntentFilter] = useState("");
  const [startIntent, setStartIntent] = useState(intents[0]);
  const [depthFromStart, setDepthFromStart] = useState(5);

  const graphModes: Record<AgentGraphMode, string> = {
    filterIntents: "Filter Intents",
    traverseFromIntent: "Traverse from Intent",
  };

  const updateOptions = () => {
    if (graphMode === "filterIntents") {
      onOptionsChange({
        mode: graphMode,
        intentFilter,
        intentLimit,
      });
    } else if (graphMode === "traverseFromIntent") {
      onOptionsChange({
        mode: graphMode,
        startIntent,
        depthFromStart,
      });
    }
  };

  const modeFormFields: Record<AgentGraphMode, React.ReactElement> = {
    filterIntents: (
      <>
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
              value={intentFilter}
              onChange={(ev) => setIntentFilter(ev.target.value)}
            />
          </Form.Group>
        </Form.Row>
      </>
    ),
    traverseFromIntent: (
      <>
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
      </>
    ),
  };

  return (
    <Form
      className="mb-3"
      onSubmit={(ev) => {
        ev.preventDefault();
        updateOptions();
      }}
    >
      <Form.Row className="mb-2">
        <Col>
          <DropdownButton
            id="graphMode"
            title={`Mode: ${graphModes[graphMode]}`}
            onChange={(ev) => console.log(ev)}
          >
            {Object.entries(graphModes).map(([key, value]) => (
              <Dropdown.Item
                key={key}
                onSelect={() => setGraphMode(key as AgentGraphMode)}
              >
                {value}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </Col>
      </Form.Row>
      {modeFormFields[graphMode]}
      <Form.Row>
        <Col className="d-flex justify-content-end">
          <Button type="submit">Atualizar</Button>
        </Col>
      </Form.Row>
    </Form>
  );
}
