import '@testing-library/jest-dom/extend-expect';
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { gql } from "@apollo/client";
import fetch from 'cross-fetch';

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

describe("Create Conversation mutation", () => {
    
    const client = new ApolloClient({
      link: new HttpLink({ uri: 'http://127.0.0.1:5000/graphql', fetch }),
      cache: new InMemoryCache(),
      onError: (e) => { console.log(e) },
    });
  
    it("should return an access token on successful register", async () => {
   
      const { data } = await client.mutate({
        mutation: CREATE_CONVO,
        variables: {
            directMessage: true,
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Q1IiwiZXhwaXJ5IjoxNjg5OTgzODk0LjA2MjQ2NCwidG9rZW5fc3RyaW5nIjoiUEp5TmIwc2dUeUotdU1Ya2stZzZRdyJ9.kygEPrKS8n8IEwSM5g9VZ0n_-EO6-fKXdSmPqgOTgfc",
            users: ["test5", "test6"],
            keys: ["test5", "test6"],  
        },
      });
    
      expect(data.createConversation.conversation.id).toBeDefined();
    });

    it("should throw 'At least 2 users are needed to create a conversation' error", async () => {
    
      await expect(client.mutate({
        mutation: CREATE_CONVO,
        variables: {
            directMessage: true,
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Q1IiwiZXhwaXJ5IjoxNjg5OTgzODk0LjA2MjQ2NCwidG9rZW5fc3RyaW5nIjoiUEp5TmIwc2dUeUotdU1Ya2stZzZRdyJ9.kygEPrKS8n8IEwSM5g9VZ0n_-EO6-fKXdSmPqgOTgfc",
            users: ["test5"],
            keys: ["test5"],  
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
              users: ["test5", "test6"],
              keys: ["test5", "test6"],   
          },
        })).rejects.toThrowError("Invalid token").catch((err) => {
        
        });
      });

});


