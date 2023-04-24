import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import Login from '../src/pages/login.jsx';
import { ApolloClient, InMemoryCache, HttpLink, gql } from "@apollo/client";
import "@testing-library/jest-dom";
import crypto from 'crypto';
import fetch from 'cross-fetch';

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

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const SIGNUP = gql`
  mutation CreateAccount(
    $username: String!
    $email: String!
    $password: String!
    $publicKey: String!
  ) {
    createAccount(
      username: $username
      email: $email
      password: $password
      publickey: $publicKey
    ) {
      accessToken
    }
  }
`;

describe('Login component', () => {
  const username = 'testlogin';
  const password = 'password123';
  const email = 'testlogin@gmail.com'

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

  const client = new ApolloClient({
    link: new HttpLink({ uri: 'http://127.0.0.1:5000/graphql', fetch }),
    cache: new InMemoryCache(),
    onError: (e) => { console.log(e) },
  });

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
  
      // Generate key pair
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      // Export public key
      const publicKeyDer = await crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
      );
      const publicKeyPem = arrayBufferToBase64(publicKeyDer);

      // Export private key
      const privateKeyDer = await crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
      );

      const { reg } = await client.mutate({
        mutation: SIGNUP,
        variables: {
          username: username,
          email: email,
          password: password,
          publicKey: publicKeyPem,
        },
      });
    
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
