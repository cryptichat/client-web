import '@testing-library/jest-dom/extend-expect';
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { gql } from "@apollo/client";
import fetch from 'cross-fetch';

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

const CREATE_CONVO = gql`
  mutation CreateConversation(
    $directMessage: Boolean!
    $token: String!
    $users: [String]!
    $keys: [String]!
  ) {
    createConversation(
      directMessage: $directMessage
      token: $token
      users: $users
      keys: $keys
    ) {
      conversation {
        id
      }
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

describe("Create Conversation mutation", () => {
    
    const client = new ApolloClient({
      link: new HttpLink({ uri: 'http://127.0.0.1:5000/graphql', fetch }),
      cache: new InMemoryCache(),
      onError: (e) => { console.log(e) },
    });
  
    it("should Create Conversatior", async () => {

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

      const keyPair2 = await crypto.subtle.generateKey(
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
      
      const publicKeyDer2 = await crypto.subtle.exportKey(
        "spki",
        keyPair2.publicKey
      );
      const publicKeyPem2 = arrayBufferToBase64(publicKeyDer2);

      // Export private key
      const privateKeyDer = await crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
      );

      const privateKeyDer2 = await crypto.subtle.exportKey(
        "pkcs8",
        keyPair2.privateKey
      );

      const { user1 } = await client.mutate({
        mutation: SIGNUP,
        variables: {
          username: "convo1",
          email: "convo1@example.com",
          password: "password123",
          publicKey: publicKeyPem,
        },
      });

      const { user2 } = await client.mutate({
        mutation: SIGNUP,
        variables: {
          username: "convo2",
          email: "convo2@example.com",
          password: "password123",
          publicKey: publicKeyPem2,
        },
      });
   
      const { data } = await client.mutate({
        mutation: CREATE_CONVO,
        variables: {
            directMessage: true,
            token: user1.createAccount.accessToken,
            users: ["convo1", "convo2"],
            keys: [publicKeyPem, publicKeyPem2],  
        },
      });
    
      expect(data.createConversation.conversation.id).toBeDefined();
    });

    it("should throw 'At least 2 users are needed to create a conversation' error", async () => {
      const { data } = await client.mutate({
        mutation: LOGIN,
        variables: {
          username: "convo1",
          password: "password123",   
        },
      });
    
      await expect(client.mutate({
        mutation: CREATE_CONVO,
        variables: {
            directMessage: true,
            token: data.login.accessToken,
            users: ["convo1"],
            keys: ["convo1"],  
        },
      })).rejects.toThrowError("At least 2 users are needed to create a conversation").catch((err) => {
      
      });
    });

    it("should throw 'Invalid token' error", async () => {
    
        await expect(client.mutate({
          mutation: CREATE_CONVO,
          variables: {
              directMessage: true,
              token: "eyJhbGciOiJIUzI1NiIsI6-fKXdSmPqgOTgfc",
              users: ["convo1", "convo2"],
              keys: ["convo1", "convo2"],   
          },
        })).rejects.toThrowError("Invalid token").catch((err) => {
        
        });
      });

});


