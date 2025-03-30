import { render, screen } from "@testing-library/react";
import { ChatContainer } from "@/features/chat/components/chat-container";
import React from "react";

describe('ChatContainer', () => {
  it('renders with correct layout structure', () => {
    render(<ChatContainer />);
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });
}); 