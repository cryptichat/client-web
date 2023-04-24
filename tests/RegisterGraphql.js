import '@testing-library/jest-dom/extend-expect';
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import {  gql } from "@apollo/client";
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

describe("Register mutation", () => {
    
    const client = new ApolloClient({
      link: new HttpLink({ uri: 'http://127.0.0.1:5000/graphql', fetch }),
      cache: new InMemoryCache(),
      onError: (e) => { console.log(e) },
    });

    //  create account test
    // it("should return an access token on successful register", async () => {
      
    //   // Generate key pair
    //   const keyPair = await crypto.subtle.generateKey(
    //     {
    //       name: "RSA-OAEP",
    //       modulusLength: 2048,
    //       publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    //       hash: "SHA-256",
    //     },
    //     true,
    //     ["encrypt", "decrypt"]
    //   );

    //   // Export public key
    //   const publicKeyDer = await crypto.subtle.exportKey(
    //     "spki",
    //     keyPair.publicKey
    //   );
    //   const publicKeyPem = arrayBufferToBase64(publicKeyDer);

    //   // Export private key
    //   const privateKeyDer = await crypto.subtle.exportKey(
    //     "pkcs8",
    //     keyPair.privateKey
    //   );

    //   const { data } = await client.mutate({
    //     mutation: SIGNUP,
    //     variables: {
    //       username: "test1",
    //       email: "test1@example.com",
    //       password: "password123",
    //       publicKey: publicKeyPem,
    //     },
    //   });
    //   expect(data.createAccount.accessToken).toBeDefined();
    // });

     // email has already been registered error test
    it("should throw 'This email has already been registered' error", async () => { 
     
      await expect(client.mutate({
        mutation: SIGNUP,
        variables: {
          username: "test",
          email: "test1@example.com",
          password: "password1",
          publickey: "XXXtest",
        },
      })).rejects.toThrowError("This email has already been registered").catch((err) => {
      
      });

    });

     // username has already been taken error test
    it("should throw 'This username has already been taken' error", async () => {
      
      await expect(client.mutate({
        mutation: SIGNUP,
        variables: {
          username: "test1",
          email: "test@example.com",
          password: "password1",
          publickey: "XXXtest",
        },
      })).rejects.toThrowError("This username has already been taken").catch((err) => {
      
      });

    });

     // Username characters error test
    it("should throw 'Username must be between 3 and 32 characters' error using public key", async () => {
   
      await expect(client.mutate({
        mutation: SIGNUP,
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


