import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: #f8f8f8;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export default function EventList({ events }) {
  return (
    <div>
      {events.map((e, idx) => (
        <Card key={idx}>
          <img src={e.image} width="100%" alt="event" />
          <p>{e.summary}</p>
          <small>{new Date(e.timestamp).toLocaleString()}</small>
        </Card>
      ))}
    </div>
  );
}
