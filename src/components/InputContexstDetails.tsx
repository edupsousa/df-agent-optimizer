import React from "react";
import { Col, Row } from "react-bootstrap";

type InputContexstDetailsProps = {
  contextNames: string[];
};

export default function InputContexstDetails({
  contextNames,
}: InputContexstDetailsProps) {
  return (
    <>
      {contextNames.map((ctxName, i) => (
        <Row key={i}>
          <Col>{ctxName}</Col>
        </Row>
      ))}
    </>
  );
}
