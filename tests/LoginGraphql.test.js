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
          username: "test2",
          email: "test2@example.com",
          password: "password123",
          publicKey: publicKeyPem,
        },
      });

      const { data } = await client.mutate({
        mutation: LOGIN,
        variables: {
          username: "test2",
          password: "password123",   
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
              username: "test1",
              password: "password2",   
          },
        })).rejects.toThrowError("Username or Password is incorrect").catch((err) => {
        
        });
      });

});


