import React, { useState, useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useLazyQuery , gql } from "@apollo/client";

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
    const navigate = useNavigate();
    let get_token = localStorage.getItem("auth-token");
    const [errors, setErrors] = useState([]);
    let arr = [];
    let user = "";
    const [GetUsers] = useLazyQuery(GET_USERS, {

      fetchPolicy:'cache-and-network',
      onCompleted: ( GetUsers ) => {
        user = GetUsers.conversationParticipants[0].username;
        getValues();
      },
      notifyOnNetworkStatusChange: true,
      onError: ( graphQLErrors ) => {
        console.error(graphQLErrors);
        setErrors(graphQLErrors);
      },
    });

    const { loading:conv_loading, error:conv_error, data:conv_data } = useQuery(GET_CONV, {
        variables: { nConversations:10,token:get_token },
        fetchPolicy:'cache-and-network', 
    });
    
    useEffect( () => {
      {
        async function  func() {
          if (conv_data) {
    
            for(var i = 0; i < conv_data['conversationsByUser'].length; i++){
              
              const res = await GetUsers({ variables: { conversationId:conv_data['conversationsByUser'][i],token:get_token },
                fetchPolicy: 'cache-and-network',
                notifyOnNetworkStatusChange: true,
              });
              
              console.log(res.data['conversationParticipants'][0]['username']);
              arr.push(res.data['conversationParticipants'][0]['username']);
              console.log(arr);
            }
          }
        }
        func();
      
      }
    }, [conv_data]);
   
    function getValues() {
      document.getElementById("result").innerHTML += user + "\n" +"</pre>";
    }
   
  return (
    <div>
      
      {conv_loading && <p>Loading...</p>}
      {conv_error && <p>Error! {conv_error}</p>}
      {!conv_loading && !conv_error && <p>Content goes here...</p> && conv_data.conversationsByUser[0]}
    
      <div id="result" ></div>
      
    </div>
  )
};

export default Friends;