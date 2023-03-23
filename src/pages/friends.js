import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

const GET_USERS = gql`
    query ConversationsByUser($nConversations: Int!, $token: String!){
        conversationsByUser(nConversations: $nConversations,token: $token)
     }
`;

const  Friends = () => {
    let get_token = localStorage.getItem("auth-token");
    let get_id = localStorage.getItem("conversationId");
    // const users = useQuery(GET_USERS);
    const { loading, error, data } = useQuery(GET_USERS, {
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
