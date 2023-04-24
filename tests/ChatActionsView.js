import React from "react";
import { render, screen } from "@testing-library/react";
import ChatActionsView from "../src/components/ChatActionsView.jsx";

describe("ChatActionsView", () => {
  it("renders the component without errors", async () => {
    // Mock the localStorage.getItem function
    const localStorageMock = {
      getItem: jest.fn(),
    };
    global.localStorage = localStorageMock;

    // Render the component
    render(
      <ChatActionsView user={{ username: "TestUser" }} />
    );

    // Expect to find the chat title on the page
    const chatTitle = screen.getByText("Chats");
    expect(chatTitle).toBeInTheDocument();

    // Expect to find the logout button on the page
    const logoutButton = screen.getByText("TestUser");
    expect(logoutButton).toBeInTheDocument();
  });
});
