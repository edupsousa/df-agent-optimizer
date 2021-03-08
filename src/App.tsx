import React from "react";
import { Container } from "react-bootstrap";
import { Redirect, Route, Switch } from "wouter";
import AgentImportForm from "./components/AgentImportForm";
import AppNavBar from "./components/AppNavBar";
import IntentList from "./components/IntentList";
import useAgentStore from "./hooks/useAgentStore";

function App() {
  const state = useAgentStore();

  return (
    <>
      <AppNavBar />
      <Container>
        {state.agentConfig && (
          <Switch>
            <Route path="/intents" component={IntentList} />
            <Route>
              <Redirect to="/intents" />
            </Route>
          </Switch>
        )}
        {!state.agentConfig && (
          <Switch>
            <Route path="/import" component={AgentImportForm} />
            <Route>
              <Redirect to="/import" />
            </Route>
          </Switch>
        )}
      </Container>
    </>
  );
}

export default App;
