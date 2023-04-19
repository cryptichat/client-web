import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import Register, { SIGNUP } from '../src/pages/register.jsx';
import '@testing-library/jest-dom/extend-expect';
describe('Register component', () => {
  test('renders the register form', () => {
    const { getByLabelText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Register />
      </MockedProvider>
    );

    expect(getByLabelText('Username')).toBeInTheDocument();
    expect(getByLabelText('Email')).toBeInTheDocument();
    expect(getByLabelText('Password')).toBeInTheDocument();
    expect(getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  
});
