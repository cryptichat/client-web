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
      conversationParticipants(conversationId: $conversationId,token: $token){
        username,
        passwordHash,
        publicKey
      }
      
     }
`;

const  Friends = () => {
    let get_token = localStorage.getItem("auth-token");
    let get_id = localStorage.getItem("conversationId");
    const users = useQuery(GET_USERS);
    const { loading:conv_loading, error:conv_error, data:conv_data } = useQuery(GET_CONV, {
        variables: { nConversations:10,token:get_token },
    });
    const { loading:user_loading, error:user_error, data:user_data } = useQuery(GET_USERS, {
      variables: { conversationId:1,token:get_token },
    });
    if (conv_loading) return null;
    if (conv_error) return `Error! ${conv_error}`;

    if (conv_data) {
    
    if (user_loading) return null;
    if (user_error) return `Error! ${user_error}`;
    console.log(user_data.conversationParticipants[0])
    var x = user_data.conversationParticipants[0]
    var vals = Object.keys(x).sort().reduce(function (arr, key) {
      arr = arr.concat(x[key]);
      return arr;
    }, []).join('\n');
    console.log(vals )
  return (
    <div>
      {conv_data.conversationsByUser}
      {/* {user_data.conversationParticipants[0]} */}
      {/* {username} */}
      {vals}
    </div>
  )
}}

export default Friends
