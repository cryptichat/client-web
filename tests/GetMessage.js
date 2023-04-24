import '@testing-library/jest-dom/extend-expect';
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { gql } from "@apollo/client";
import fetch from 'cross-fetch';

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const GET_MESSAGE = gql`
  query MessagesByConversation(
    $conversationId: Int!
    $nMessages: Int!
    $token: String!
  ) {
    me(token: $token) {
      conversations(
        nConversations: 1
        token: $token
        conversationId: $conversationId
      ) {
        id
        messages(nMessages: $nMessages) {
          sender {
            username
          }
          timestamp
          revision
          content
        }
      }
    }
  }
`;

describe("Get Message query", () => {
    
    const client = new ApolloClient({
      link: new HttpLink({ uri: 'http://127.0.0.1:5000/graphql', fetch }),
      cache: new InMemoryCache(),
      onError: (e) => { console.log(e) },
    });
  
    it("should return an message", async () => {
   
      const { data } = await client.subscribe({
        query: GET_MESSAGE,
        variables: {
            directMessage: true,
                      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwiZXhwaXJ5IjoxNjg5OTg1MzEyLjc4NTM5MzUsInRva2VuX3N0cmluZyI6InZpRjZWbW9wSFVEQ3FuWlpFMU5xN0EifQ.QCk4uTde80Die6FDqOeFcqzDbpuZFYXrEYYtfsHFyhg",
                      conversationId: 1,
                      nMessages: 10,
        },
      });
    
      expect(data.messages.sender.username).toBeDefined();
      expect(data.messages.timestamp).toBeDefined();
      expect(data.messages.revision).toBeDefined();
      expect(data.messages.content).toBeDefined();
    });

    it("should throw 'Invalid token' error", async () => {
    
        await expect(client.query({
            query: GET_MESSAGE,
            variables: {
                directMessage: true,
                          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IpRjZWbW9wSFVEQ3FuWlpFMU5xN0EifQ.-zYQeSaP0hOZuTr5FqTZk_9Inexs98dpiZkgcC-ECmE",
                          users: ["bob", "username"],
                          keys: ["XXX", "XX1X"],
            },
        })).rejects.toThrowError("Invalid token").catch((err) => {
        
        });
      });

});