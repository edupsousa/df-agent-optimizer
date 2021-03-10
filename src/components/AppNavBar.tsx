import React from "react";
import { Button, Nav, Navbar } from "react-bootstrap";
import { Link } from "wouter";
import useAgentStore from "hooks/useAgentStore";

export default function AppNavBar() {
  const state = useAgentStore();

  return (
    <Navbar bg="light" expand="lg" className="mb-3">
      <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          {state.agentConfig && (
            <>
              <Link href="/intents">
                <Nav.Link>List Intents</Nav.Link>
              </Link>
              <Link href="/rename-intents">
                <Nav.Link>Rename Intents</Nav.Link>
              </Link>
            </>
          )}
          {!state.agentConfig && <Nav.Link href="#home">Import Agent</Nav.Link>}
        </Nav>
        <Navbar.Text>
          Agent: {!state.agentConfig && <span>None</span>}
          {state.agentConfig && (
            <span>
              {state.agentConfig.displayName}
              <Button
                variant="outline-dark ml-2"
                onClick={() => state.unloadAgent()}
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
