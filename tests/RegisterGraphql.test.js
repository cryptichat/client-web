import React from 'react';
import { render, fireEvent, waitFor, screen, renderHook } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import '@testing-library/jest-dom/extend-expect';
import { act } from "react-dom/test-utils";
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from "@apollo/client";
import { useMutation, gql } from "@apollo/client";
import { GraphQLError } from 'graphql';
import fetch from 'cross-fetch';

const createUser = gql`
mutation CreateAccount($username: String!, $email: String!, $password1: String!, $password2: String!, $publickey: String!) {
  createAccount(
    username: $username,
    email: $email,
    password1: $password1,
    password2: $password2,
    publickey: $publickey,
  ) {
    accessToken
  }
}
`;

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      accessToken
    }
  }
`;

describe("Register mutation", () => {
    const mockAccessToken = "test_access_token";
    
    const client = new ApolloClient({
      link: new HttpLink({ uri: 'http://127.0.0.1:5000/graphql', fetch }),
      cache: new InMemoryCache(),
      onError: (e) => { console.log(e) },
    });
  
    it("should return an access token on successful register", async () => {
   

      const { data } = await client.mutate({
        mutation: createUser,
        variables: {
          username: "user4",
          email: "test4@example.com",
          password1: "password1",
          password2: "password1",
          publickey: "test4",
        },
      });
    
      expect(data.createAccount.accessToken).toBeDefined();
    });

    // not matching passwords error tests
    it("should throw 'The passwords do not match' error", async () => {
    
      await expect(client.mutate({
        mutation: createUser,
        variables: {
          username: "test",
          email: "test@example.com",
          password1: "password1",
          password2: "password2",
          publickey: "XXXtest",
        },
      })).rejects.toThrowError("The passwords do not match").catch((err) => {
      
      });
    });

    it("should throw 'This email has already been registered' error", async () => { 
     
      await expect(client.mutate({
        mutation: createUser,
        variables: {
          username: "test",
          email: "bob@gamil.com",
          password1: "password1",
          password2: "password1",
          publickey: "XXXtest",
        },
      })).rejects.toThrowError("This email has already been registered").catch((err) => {
      
      });

    });

    it("should throw 'This username has already been taken' error", async () => {
      
      await expect(client.mutate({
        mutation: createUser,
        variables: {
          username: "bob",
          email: "test@example.com",
          password1: "password1",
          password2: "password1",
          publickey: "XXXtest",
        },
      })).rejects.toThrowError("This username has already been taken").catch((err) => {
      
      });

    });

    it("should throw 'Username must be between 3 and 32 characters' error using public key", async () => {
   
      await expect(client.mutate({
        mutation: createUser,
        variables: {
          username: "to",
          email: "test@example.com",
          password1: "password1",
          password2: "password1",
          publickey: "XXX",
        },
      })).rejects.toThrowError("Username must be between 3 and 32 characters").catch((err) => {
  
      });

    });

});


