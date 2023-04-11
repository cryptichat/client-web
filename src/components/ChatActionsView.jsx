import React, { useState, useEffect } from "react";
import ConvoListItem from "../components/convoListItem";
import { useMutation, useQuery, useLazyQuery, gql } from "@apollo/client";
import { BiMessageRoundedAdd } from "react-icons/bi";
import { BiLogOut } from "react-icons/bi";
import { toast } from "react-toastify";

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

const GET_CONVO = gql`
  query ConversationsByUser($nConversations: Int!, $token: String!) {
    conversationsByUser(nConversations: $nConversations, token: $token)
  }
`;

const GET_USERS = gql`
  query ConversationParticipants($conversationId: Int!, $token: String!) {
    conversationParticipants(conversationId: $conversationId, token: $token) {
      username
      publicKey
    }
  }
`;

export default function ChatActionsView({ activeConvo, setActiveConvo }) {
  const loggedInUsername = localStorage.getItem("dsmessenger-username");
  let token = localStorage.getItem("auth-token");

  const [addChatOpen, setAddChatOpen] = useState(false);
  const [createConvoText, setCreateConvoText] = useState("");
  const [userConversations, setUserConversations] = useState([]);

  const [CreateConvoHandler] = useMutation(CREATE_CONVO, {
    onCompleted: ({ createConversation }) => {
      console.log(createConversation);
      localStorage.setItem(
        "conversationId",
        createConversation.conversation.id
      );
      navigate("/");
    },
    onError: ({ graphQLErrors }) => {
      console.error(graphQLErrors);
      toast.error("Error creating conversation, please check console");
    },
  });

  const [GetUsers] = useLazyQuery(GET_USERS, {
    fetchPolicy: "cache-and-network",
    onCompleted: (GetUsers) => {},
    notifyOnNetworkStatusChange: true,
    onError: (graphQLErrors) => {
      console.error(graphQLErrors);
      toast.error("Internal error, please check console");
    },
  });

  const {
    loading: conv_loading,
    error: conv_error,
    data: conv_data,
  } = useQuery(GET_CONVO, {
    variables: { nConversations: 10, token: token },
    fetchPolicy: "cache-and-network",
    pollInterval: 3000,
  });

  useEffect(() => {
    async function func() {
      if (conv_data) {
        for (var i = 0; i < conv_data["conversationsByUser"].length; i++) {
          const res = await GetUsers({
            variables: {
              conversationId: conv_data["conversationsByUser"][i],
              token: token,
            },
            fetchPolicy: "cache-and-network",
            notifyOnNetworkStatusChange: true,
          });

          // skip adding convo to array if it already exists
          if (
            userConversations.filter(
              (convo) => convo.conv_id === conv_data["conversationsByUser"][i]
            ).length > 0
          ) {
            continue;
          }

          setUserConversations([
            ...userConversations,
            {
              id: userConversations.length,
              user: res.data["conversationParticipants"][0]["username"],
              conv_id: conv_data["conversationsByUser"][i],
            },
          ]);
        }
      }
    }
    func();
  }, [conv_data]);

  function handleLogout() {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("dsmessenger-username");
    navigate("/login");
  }

  return (
    <div className="flex flex-col flex-grow lg:max-w-full border border-white border-t-0 border-l-0 border-b-0">
      {/* Convo list */}
      <div className="flex items-center justify-between">
        <p className="font-black mt-4 mb-3 pl-4 text-2xl">Conversations</p>
        <div
          className={`p-2 rounded mt-1 mr-2 cursor-pointer hover:bg-slate-600 ${
            addChatOpen && "bg-slate-600"
          }`}
        >
          <BiMessageRoundedAdd
            size={24}
            onClick={() => setAddChatOpen(!addChatOpen)}
          />
        </div>
      </div>
      {addChatOpen && (
        <div className="bg-slate-600 py-2 mb-2">
          <input
            type="text"
            placeholder="Enter username"
            className="mt-1 py-4 pl-4 mx-3 bg-gray-100 rounded-[10px] outline-none focus:text-gray-700"
            style={{ width: "-webkit-fill-available" }}
            name="message"
            onChange={(e) => setCreateConvoText(e.target.value)}
            required
          />
          <a
            href="#"
            className="hidden bg-[#8b5cf6] md:flex border border-[#000000] p-2 mx-2 mt-2 mb-1
                              text-[#ffffff] rounded-[10px] items-center gap-2
                                hover:bg-[#4c1d95] hover:text-white transition duration-200"
            onClick={() => {
              console.log("add user to convo", createConvoText);
              CreateConvoHandler({
                variables: {
                  directMessage: true,
                  token: localStorage.getItem("auth-token"),
                  users: [loggedInUsername, createConvoText],
                  keys: ["XXX", "XXX"],
                },
              });
            }}
          >
            Start
          </a>
        </div>
      )}

      <div className="block pl-4 pr-4 text-white hover:rounded-md">
        <ul className="divide-y divide-gray-300 truncate">
          {userConversations.map((convo) => {
            return (
              <ConvoListItem
                username={convo.user}
                active={activeConvo && activeConvo.conv_id === convo.conv_id}
                onClick={() => setActiveConvo(convo)}
              />
            );
          })}
        </ul>
      </div>

      <div className="grow"></div>
      <div
        className="flex py-4 items-center mb-3.5"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <a
          href="#"
          className="bg-zinc-900 flex
                              text-[#ffffff] rounded-[10px] items-center gap-2
                                hover:bg-zinc-900 hover:text-white transition duration-200"
        >
          <p
            className="flex px-3 scale-90 hover:scale-100 ease-in duration-200"
            onClick={handleLogout}
          >
            <BiLogOut className="text-[25px] mr-2" />
            {loggedInUsername}
          </p>
        </a>
      </div>
    </div>
  );
}
