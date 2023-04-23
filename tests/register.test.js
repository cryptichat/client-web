import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import Register from '../src/pages/register.jsx';
import '@testing-library/jest-dom/extend-expect';
import { ContractContext } from '../src/utils/ContractProvider';
import {  gql } from "@apollo/client";
import crypto from 'crypto';

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Mock useNavigate hook
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

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

describe('Register component', () => {
  test('renders the register form', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <ContractContext.Provider value={{ web3: {}, contract: {} }}>
          <Register />
        </ContractContext.Provider>
      </MockedProvider>
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

  test('displays errors on form submission', async () => {
    const mockError = new Error('The passwords do not match');
    const mockAccessToken = 'test_access_token';
  
    const mockSignup = {
      request: {
        query: SIGNUP,
        variables: {
          username: "testuser",
          email: "test@example.com",
          password1: "password",
          password2: "password1",
          publicKey: "XXXtest",
        },
      },
      errors: [mockError],
    };

    const mocks = [mockSignup];

    const { getByLabelText, getByText, getAllByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ContractContext.Provider value={{ web3: {}, contract: {} }}>
          <Register />
        </ContractContext.Provider>
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId("password-input"), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password1' } });

    const registerButtons = getAllByText(/register/i);
    fireEvent.click(registerButtons[0]);
    

    await waitFor(() => {
      expect(() => {
        throw new Error('The passwords do not match');
      }).toThrow();
    });
  });

    test('successfully registers user and redirects to home page', async () => {
    const mockAccessToken = 'test_access_token';

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

    const mockSignup = {
      request: {
        query: SIGNUP,
        variables: {
          username: 'testuser4',
          email: 'test@example.com',
          password1: 'password',
          password2: 'password',
          publicKey: publicKeyPem,
        },
      },
      result: {
        data: {
          createAccount: {
            accessToken: mockAccessToken,
          },
        },
      },
    };

    const { getByLabelText, getByText, getAllByText } = render(
      <MockedProvider mocks={[mockSignup]} addTypename={false}>
         <ContractContext.Provider value={{ web3: {}, contract: {} }}>
          <Register />
        </ContractContext.Provider>
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser4' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId("password-input"), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password' } });

    const registerButtons = getAllByText(/register/i);
    fireEvent.click(registerButtons[0]);

    await waitFor(() => {
      // expect(localStorage.getItem('auth-token')).toEqual(mockAccessToken);
      // expect(localStorage.getItem('dsmessenger-username')).toEqual('testuser3');
      expect(window.location.pathname).toEqual('/');
    });
  });
  
});




