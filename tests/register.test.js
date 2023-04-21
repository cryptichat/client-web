import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import Register from '../src/pages/register.jsx';
import '@testing-library/jest-dom/extend-expect';

describe('Register component', () => {
  test('renders the register form', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Register />
      </MockedProvider>
    );

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  // test('displays errors on form submission', async () => {
  //   const mockError = new GraphQLError("The passwords do not match");
  //   // const mockError = {
  //   //   graphQLErrors: [
  //   //     {
  //   //       message: "The passwords do not match",
          
  //   //       path: ["errors"],
  //   //     },
  //   //   ],
  //   // };
    
  //   const mockAccessToken = 'test_access_token';
  
  //   const mockSignup = {
  //     request: {
  //       query: SIGNUP,
  //       variables: {
  //         username: "testuser",
  //         email: "test@example.com",
  //         password1: "password",
  //         password2: "password1",
  //         publicKey: "XXXtest",
  //       },
  //     },
  //     errors: [mockError],
  //   };

  //   const mocks = [mockSignup];

  //   render(
  //     <MockedProvider mocks={mocks} addTypename={false}>
  //       <Register />
  //     </MockedProvider>
  //   );

  //   fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
  //   fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
  //   fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
  //   fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password1' } });

  //   fireEvent.click(screen.getByTestId('register-button'));

  //   await waitFor(() => {
  //     expect(screen.getByText(mockError.message)).toBeInTheDocument();
  //   });
  // });
  
});


  // test('successfully registers user and redirects to home page', async () => {
  //   const mockAccessToken = 'test_access_token';

  //   const mockSignup = {
  //     request: {
  //       query: SIGNUP,
  //       variables: {
  //         username: 'testuser',
  //         email: 'test@example.com',
  //         password1: 'password',
  //         password2: 'password',
  //         publicKey: 'XXX',
  //       },
  //     },
  //     result: {
  //       data: {
  //         createAccount: {
  //           accessToken: mockAccessToken,
  //         },
  //       },
  //     },
  //   };

  //   const { getByLabelText, getByText } = render(
  //     <MockedProvider mocks={[mockSignup]} addTypename={false}>
  //       <Register />
  //     </MockedProvider>
  //   );

  //   fireEvent.change(getByLabelText('Username'), { target: { value: 'testuser' } });
  //   fireEvent.change(getByLabelText('Email'), { target: { value: 'test@example.com' } });
  //   fireEvent.change(getByLabelText('Password'), { target: { value: 'password' } });
  //   fireEvent.change(getByLabelText('Confirm Password'), { target: { value: 'password' } });

  //   fireEvent.click(getByText('Register'));

  //   await waitFor(() => {
  //     expect(localStorage.getItem('auth-token')).toEqual(mockAccessToken);
  //     expect(localStorage.getItem('dsmessenger-username')).toEqual('testuser');
  //     expect(window.location.pathname).toEqual('/');
  //   });
  // });

