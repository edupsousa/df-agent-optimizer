import NetworkGraph from "components/NetworkGraph";
import useAgentStore from "hooks/useAgentStore";
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { NetworkGraphProps } from "react-graph-vis";

export type ContextLinks = {
  inputOn: string[];
  outputOn: Record<string, number>;
};

export type OldContextMap = Record<string, ContextLinks>;

export default function DiagramPage() {
  const [intentLimit, setIntentLimit] = useState(50);
  const [options, setOptions] = useState<NetworkGraphProps["options"]>({
    intentLimit,
  });
  const state = useAgentStore();

  return (
    <div>
      <h1>Diagram</h1>
      <Form
        onSubmit={(ev) => {
          ev.preventDefault();
          setOptions({ intentLimit });
        }}
      >
        <Form.Control
          type="number"
          value={intentLimit}
          onChange={(ev) => setIntentLimit(Number.parseInt(ev.target.value))}
        />
        <Button type="submit">Atualizar</Button>
      </Form>
      <NetworkGraph intentList={state.intentList} options={options} />
    </div>
  );
}
