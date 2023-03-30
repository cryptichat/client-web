import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMutation, gql } from "@apollo/client";

import "./styles.css";

const ADDMESSAGE = gql`
  mutation CreateMessage($content: String!, $conversationId: Int!, $token: String!) {
    createMessage(content: $content, conversationId: $conversationId, token: $token) {
        message{
            senderId,
            conversationId,
            timestamp,
            revision,
            content
        }
    }
}
`;

const Message = () => {
    let get_token = localStorage.getItem("auth-token");
    let get_id = localStorage.getItem("conversationId");
    const navigate = useNavigate();
    const [errors, setErrors] = useState([]);
    const [formState, setFormState] = useState({
        message: ""
      });

    const [MessageHandler] = useMutation(ADDMESSAGE, {
        onCompleted: ({createMessage}) => {
            console.log(createMessage)
            localStorage.setItem("senderId", createMessage.senderId);
            localStorage.setItem("timestamp", createMessage.timestamp);
            navigate("/");
        },
        onError: ({ graphQLErrors }) => {
            console.error(graphQLErrors);
            setErrors(graphQLErrors);
        },
    });

    const renderForm = (
        <div className="form">
            <div className="input-container">
            <label
                for="text"
                class="block mb-1 text-sm font-medium text-gray-900 dark:text-black"
            >
               
            </label>
            <input
                type="text"
                value={formState.message}
                onChange={(e) =>
                setFormState({
                    ...formState,
                    message: e.target.value,
                })
                }
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                name="user"
                required
            />
            </div>
            <div className="button-container">
            <input
                type="Submit"
                class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                onClick={() =>
                    MessageHandler({
                        variables: {
                            content:formState.message,
                            conversationId: get_id,
                            token: get_token
                        },
                    })       
                }
                />
            </div>
            <div>
                {errors.map((error) => (
                <div className="error">{error.message}</div>
                ))}
            </div>
            
        </div>
    );

    return (
        <div className="app">
          <div className="login-form w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="title text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-black">
                Send Message
              </h1>
            </div>
            {renderForm}
          </div>
        </div>
      );
}

export default Message
