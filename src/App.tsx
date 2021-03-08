import React from "react";
import { Button, Container } from "react-bootstrap";
import AgentImportForm from "./components/AgentImportForm";
import IntentList from "./components/IntentList";
import { useAgentFile } from "./hooks/useAgentFile";

function App() {
  const { isAgentFileLoaded, deleteAgentFile } = useAgentFile();

  return (
    <Container>
      <AgentImportForm />
      <span>Agent Loaded: {isAgentFileLoaded() ? "true" : "false"}</span>
      <Button onClick={() => deleteAgentFile()} variant="danger">
        Delete Agent
      </Button>
      <IntentList />
    </Container>
  );
}

export default App;
