import '@testing-library/jest-dom/extend-expect';
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { gql } from "@apollo/client";
import fetch from 'cross-fetch';

const SEND_MESSAGE = gql`
  mutation CreateMessage(
    $content: String!
    $conversationId: Int!
    $token: String!
  ) {
    createMessage(
      content: $content
      conversationId: $conversationId
      token: $token
    ) {
      message {
        sender {
          username
        }
        timestamp
        revision
        content
      }
    }
  }
`;

describe("Create Message mutation", () => {
    
    const client = new ApolloClient({
      link: new HttpLink({ uri: 'http://127.0.0.1:5000/graphql', fetch }),
      cache: new InMemoryCache(),
      onError: (e) => { console.log(e) },
    });
  
    it("should return an access token on successful register", async () => {
   
      const { data } = await client.mutate({
        mutation: SEND_MESSAGE,
        variables: {
            content: "Hello World",
            conversationId: 1,
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwiZXhwaXJ5IjoxNjg5OTg1MzEyLjc4NTM5MzUsInRva2VuX3N0cmluZyI6InZpRjZWbW9wSFVEQ3FuWlpFMU5xN0EifQ.QCk4uTde80Die6FDqOeFcqzDbpuZFYXrEYYtfsHFyhg",
        },
      });
    
      expect(data.createMessage.message.sender.username).toBeDefined();
    });

    it("should throw 'This conversation does not exist' error", async () => {
    
      await expect(client.mutate({
        mutation: SEND_MESSAGE,
        variables: {
            content: "Hello World",
            conversationId: 100,
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwiZXhwaXJ5IjoxNjg5OTg1MzEyLjc4NTM5MzUsInRva2VuX3N0cmluZyI6InZpRjZWbW9wSFVEQ3FuWlpFMU5xN0EifQ.QCk4uTde80Die6FDqOeFcqzDbpuZFYXrEYYtfsHFyhg",
        },
      })).rejects.toThrowError("This conversation does not exist").catch((err) => {
      
      });
    });

    it("should throw 'Invalid token' error", async () => {
    
        await expect(client.mutate({
            mutation: SEND_MESSAGE,
            variables: {
                content: "Hello World",
                conversationId: 1,
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtDie6FDqOeFcqzDbpuZFYXrEYYtfsHFyhg",
            },
        })).rejects.toThrowError("Invalid token").catch((err) => {
        
        });
      });

});