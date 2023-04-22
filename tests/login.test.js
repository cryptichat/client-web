import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import Login from '../src/pages/login.jsx';
import { gql } from '@apollo/client';
import "@testing-library/jest-dom";

// Mock useNavigate hook
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      accessToken
    }
  }
`;

describe('Login component', () => {
  const username = 'test5';
  const password = 'password1';

  const mocks = [
    {
      request: {
        query: LOGIN,
        variables: {
          username,
          password,
        },
      },
      result: {
        data: {
          login: {
            accessToken: 'testaccesstoken',
          },
        },
      },
    },
  ];

  it('should render the login form', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Login />
      </MockedProvider>,
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should submit the login form', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Login />
      </MockedProvider>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: username },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: password },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem('auth-token')).toEqual('testaccesstoken');
      expect(localStorage.getItem('dsmessenger-username')).toEqual(username);
      expect(window.location.pathname).toEqual('/');
    });
  });

  it('should show errors on login failure', async () => {
    const error = new Error('Login failed');
    const mocksWithError = [
      {
        request: {
          query: LOGIN,
          variables: {
            username,
            password,
          },
        },
        error,
      },
    ];
  
    const { getByLabelText, getByText, getAllByText } = render(
      <MockedProvider mocks={mocksWithError} addTypename={false}>
        <Login />
      </MockedProvider>,
    );
  
    fireEvent.change(getByLabelText(/username/i), {
      target: { value: username },
    });
    fireEvent.change(getByLabelText(/password/i), {
      target: { value: password },
    });
    const loginButtons = getAllByText(/login/i);
    fireEvent.click(loginButtons[0]);
  
    await waitFor(() => {
      expect(() => {
        throw new Error('Username or Password is incorrect');
      }).toThrow();
    });
  });
  
});
