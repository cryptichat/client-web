import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

const GET_CONV = gql`
    query ConversationsByUser($nConversations: Int!, $token: String!){
        conversationsByUser(nConversations: $nConversations,token: $token)
     }
`;

const GET_USERS = gql`
    query ConversationParticipants($conversationId: Int!, $token: String!){
      conversationParticipants(conversationId: $conversationId,token: $token)
     }
`;

const  Friends = () => {
    let get_token = localStorage.getItem("auth-token");
    let get_id = localStorage.getItem("conversationId");
    // const users = useQuery(GET_USERS);
    const { loading, error, data } = useQuery(GET_CONV, {
        variables: { nConversations:10,token:get_token },
    });
    if (loading) return null;
    if (error) return `Error! ${error}`;
  return (
    <div>
      {data.conversationsByUser}
    </div>
  )
}

export default Friends
