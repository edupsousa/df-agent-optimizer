import { Intent } from "hooks/useAgentStore";
import React from "react";
import { Col, ListGroupItem, Row } from "react-bootstrap";

type RenameIntentsListItemProps = {
  intent: Intent;
  newName: string;
  hasCollision: boolean;
};

export default function RenameIntentsListItem(
  props: RenameIntentsListItemProps
) {
  const { intent, newName, hasCollision } = props;
  return (
    <ListGroupItem className={hasCollision ? "bg-danger text-white" : ""}>
      <Row>
        <Col>{intent.name}</Col>
        <Col xs="auto">{"->"}</Col>
        <Col className="text-right">{newName}</Col>
      </Row>
    </ListGroupItem>
  );
}
