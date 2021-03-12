import React from "react";
import { Container } from "react-bootstrap";
import { Redirect, Route, Switch } from "wouter";
import AgentImportForm from "pages/AgentImportForm";
import AppNavBar from "components/AppNavBar";
import IntentList from "pages/IntentList";
import RenameIntents from "pages/RenameIntents";
import useAgentStore from "hooks/useAgentStore";

function App() {
  const state = useAgentStore();

  return (
    <>
      <AppNavBar />
      <Container>
        {state.agentConfig && (
          <Switch>
            <Route path="/intents" component={IntentList} />
            <Route path="/rename-intents" component={RenameIntents} />
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
