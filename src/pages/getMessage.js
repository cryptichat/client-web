import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

const GET_MESSAGE = gql`
    query MessagesByConversation($conversationId:Int!,$nMessages:Int!,$token:String!){
        messagesByConversation(conversationId:$conversationId,nMessages:$nMessages,token:$token){
            senderId,
            conversationId,
            timestamp,
            revision,
            content
        }
    }
`

const getMessage = () => {
    const { loading:conv_loading, error:conv_error, data:conv_data } = useQuery(GET_CONV, {
        variables: { nConversations:10,token:get_token },
    });
    var vals = Object.keys(x).sort().reduce(function (arr, key) {
        arr = arr.concat(x[key]);
        return arr;
    }, []).join('\n');
    console.log(vals)

  return (
    <div>

    </div>
  )
}

export default getMessage
