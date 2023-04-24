// ChatMain.test.js
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MockedProvider } from "@apollo/client/testing";
import ChatMain, { GET_ME } from "../src/pages/chatMain.jsx";

const mocks = [
  {
    request: {
      query: GET_ME,
      variables: {
        token: "mocked-token",
      },
    },
    result: {
      data: {
        me: {
          username: "mocked-username",
          publicKey: "mocked-publicKey",
        },
      },
    },
  },
];

describe("ChatMain", () => {
  beforeEach(() => {
    localStorage.setItem("auth-token", "mocked-token");
  });

  afterEach(() => {
    localStorage.removeItem("auth-token");
  });

  it("renders without crashing", () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMain />
      </MockedProvider>
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
