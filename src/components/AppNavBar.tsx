import React, { useEffect } from "react";
import { Button, Nav, Navbar } from "react-bootstrap";
import { useAgentConfig } from "../hooks/useAgentConfig";
import { useAgentFile } from "../hooks/useAgentFile";

export default function AppNavBar() {
  const { isAgentFileLoaded, deleteAgentFile } = useAgentFile();
  const {
    isAgentConfigLoaded,
    getAgentConfig,
    loadAgentConfig,
  } = useAgentConfig();

  useEffect(() => {
    if (!isAgentConfigLoaded()) {
      loadAgentConfig();
    }
  }, [isAgentConfigLoaded, loadAgentConfig]);

  return (
    <Navbar bg="light" expand="lg" className="mb-3">
      <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          {isAgentFileLoaded() && (
            <Nav.Link href="#link">List Intents</Nav.Link>
          )}
          {!isAgentFileLoaded() && (
            <Nav.Link href="#home">Import Agent</Nav.Link>
          )}
        </Nav>
        <Navbar.Text>
          Agent: {!isAgentConfigLoaded() && <span>None</span>}
          {isAgentConfigLoaded() && (
            <span>
              {getAgentConfig()?.displayName}
              <Button
                variant="outline-dark ml-2"
                onClick={() => deleteAgentFile()}
              >
                Unload Agent
              </Button>
            </span>
          )}
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  );
}
