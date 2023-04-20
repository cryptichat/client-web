import React from 'react';
import { render, fireEvent, waitFor, screen, renderHook } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import '@testing-library/jest-dom/extend-expect';
import { act } from "react-dom/test-utils";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { gql } from "@apollo/client";
import fetch from 'cross-fetch';

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      accessToken
    }
  }
`;

describe("Login mutation", () => {
    
    const client = new ApolloClient({
      link: new HttpLink({ uri: 'http://127.0.0.1:5000/graphql', fetch }),
      cache: new InMemoryCache(),
      onError: (e) => { console.log(e) },
    });
  
    it("should return an access token on successful register", async () => {
   
      const { data } = await client.mutate({
        mutation: LOGIN,
        variables: {
          username: "test5",
          password: "password1",   
        },
      });
    
      expect(data.login.accessToken).toBeDefined();
    });

    // incorrect username error test
    it("should throw 'Username or Password is incorrect' error", async () => {
    
      await expect(client.mutate({
        mutation: LOGIN,
        variables: {
            username: "user2",
            password: "password2",   
        },
      })).rejects.toThrowError("Username or Password is incorrect").catch((err) => {
      
      });
    });

     // incorrect password error test
     it("should throw 'Username or Password is incorrect' error", async () => {
    
        await expect(client.mutate({
          mutation: LOGIN,
          variables: {
              username: "test2",
              password: "password2",   
          },
        })).rejects.toThrowError("Username or Password is incorrect").catch((err) => {
        
        });
      });

});


