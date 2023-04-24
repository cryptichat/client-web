import React, { useContext, useState, useEffect } from "react";
import ConvoListItem from "../components/convoListItem";
import { useMutation, useQuery, useLazyQuery, gql } from "@apollo/client";
import { ContractContext } from "../utils/ContractProvider";
import { BiMessageRoundedAdd } from "react-icons/bi";
import { BiLogOut } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { toast } from "react-toastify";
import { MdGroupAdd } from "react-icons/md";
import { useSpring, animated } from "react-spring";
import { useNavigate } from "react-router-dom";
import { generateSymmetricKey, encryptSymmetricKey } from "../utils/crypto";

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
    me(token: $token) {
      conversations(nConversations: $nConversations, token: $token) {
        id
        messages(nMessages: 10) {
          sender {
            username
          }
          timestamp
          revision
          content
        }
        aesKey(token: $token)
        users {
          username
          publicKey
        }
      }
    }
  }
`;

const GET_USER_PUBLIC_KEY = gql`
  query UserPublicKey($username: String!) {
    user(username: $username) {
      publicKey
    }
  }
`;

export default function ChatActionsView({ activeConvo, setActiveConvo, user }) {
  let token = localStorage.getItem("auth-token");

  const { web3, contract } = useContext(ContractContext);

  const [addChatOpen, setAddChatOpen] = useState(false);
  const [createConvoText, setCreateConvoText] = useState("");
  const [userConversations, setUserConversations] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");


  // New state to manage the group chat creation UI
  const [addGroupChatOpen, setAddGroupChatOpen] = useState(false);
  const [groupChatUsers, setGroupChatUsers] = useState([]);

  const userListAnimation = useSpring({
    height: addChatOpen || addGroupChatOpen ? '0px' : 'auto',
    opacity: addChatOpen || addGroupChatOpen ? 0 : 1,
    config: { duration: 200 },
  });

  const [loading, setLoading] = useState(false);

  const [CreateConvoHandler] = useMutation(CREATE_CONVO, {
    onCompleted: ({ createConversation }) => { 
      setLoading(false);
    },
    onError: ({ graphQLErrors }) => {
      console.error(graphQLErrors);
      toast.error("Error creating conversation, please check console");
    },
  });

  const [getUserPublicKey, { error: key_error }] =
    useLazyQuery(GET_USER_PUBLIC_KEY);

  const {
    loading: conv_loading,
    error: conv_error,
    data: conv_data,
  } = useQuery(GET_CONVO, {
    variables: { nConversations: 10, token: token },
    fetchPolicy: "cache-and-network",
    // pollInterval: 3000,
  });

  useEffect(() => {
    if (conv_data) {
      setUserConversations(
        conv_data["me"]["conversations"].map((convo, index) => {
          console.log(convo);
          let otherUsers = convo["users"].filter(
            (convoUser) => convoUser["username"] !== user.username
          );
          console.log("other users", otherUsers);
          return {
            id: index,
            user: otherUsers[0].username,
            conv_id: convo["id"],
            aesKey: convo["aesKey"],
            messages: convo["messages"],
            publicKey: otherUsers[0].publicKey,
          };
        })
      );
    }
  }, [conv_data, user]);

  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("auth-token");
    navigate("/login");
  }

  // New function to handle Group Convo creation
  function handleAddGroupChatUser(username) {
    if (username === "") {
      return;
    }

    if (groupChatUsers.includes(username)) {
      toast.error("User already added");
      return;
    }
    setGroupChatUsers([...groupChatUsers, username]);
  }

  function handleCreateGroupChat() {
    if (groupChatUsers.length < 2) {
      toast.error("A group chat needs at least 2 other participants");
      return;
    }

    // Call CreateConvoHandler with group chat users
    CreateConvoHandler({
      variables: {
        directMessage: false,
        token: localStorage.getItem("auth-token"),
        users: [user.username, ...groupChatUsers],
        keys: ["XXX", "XXX"], // Replace this with actual encryption keys
      },
    });

    setGroupChatUsers([]);
    setAddGroupChatOpen(false);
  }

  async function handleCreateGroupChat() {
    if (groupChatUsers.length < 2) {
      toast.error("A group chat needs at least 2 other participants");
      return;
    }

    setLoading(true);
    // ... the rest of the code for creating a group chat
    setLoading(false);
    setAddGroupChatOpen(false);
  }

  // END Group Convo Creation

  if (conv_loading) return <p>Loading...</p>;

  return (
    <div className="actionview flex flex-col flex-grow lg:max-w-full border border-[#5a5b5c] border-t-0 border-l-0 border-b-0">
      {/* Convo list */}
      <div className="flex items-center justify-between">
        <p className="font-black mt-4 mb-3 pl-4 text-2xl">Chats</p>
        <div className="flex items-center space-x-1 mt-1 mr-3">
          <div
            className={`p-1 rounded cursor-pointer hover:bg-slate-600 ${addChatOpen && "bg-slate-600"
              }`}
          >
            <BiMessageRoundedAdd
              size={24}
              onClick={() => {
                setAddChatOpen(!addChatOpen);
                setAddGroupChatOpen(false);
              }}
            />
          </div>
          {/* Add new button to start a group chat */}
          <div
            className={`p-1 rounded cursor-pointer hover:bg-slate-600 ${addGroupChatOpen && "bg-slate-600"
              }`}
          >
            <MdGroupAdd
              size={24}
              onClick={() => {
                setAddGroupChatOpen(!addGroupChatOpen);
                setAddChatOpen(false);
              }}
            />
          </div>
        </div>
      </div>

      <div className="">
        <div
          className={`py-2 mb-2 mt-2 rounded-[10px] ${(addChatOpen || addGroupChatOpen) && "bg-neutral-800"
            }`}
        >
          {addChatOpen && (
            <>
              <input
                type="text"
                placeholder="Enter username"
                className="mt-1 py-4 pl-2 mx-3 bg-gray-100 rounded-[8px] outline-none focus:text-gray-700"
                style={{ width: "-webkit-fill-available" }}
                name="message"
                onChange={(e) => setCreateConvoText(e.target.value)}
                required
              />
              <a
                href="#"
                className="bg-[#8b5cf6] flex p-2 mx-3 mt-3 mb-1
                text-white rounded-[10px] items-center
                  hover:bg-[#4c1d95] transition duration-200"
                onClick={async () => {
                  try {
                    setLoading(true);
                    console.log("add user to convo", createConvoText);
                    // get the public key of the user
                    const { data } = await getUserPublicKey({
                      variables: {
                        username: createConvoText,
                      },
                    });
                    const key = await generateSymmetricKey();
                    // encrypt symmetric key with own public key
                    const selfEncryptedSymmetric = await encryptSymmetricKey(
                      key,
                      user.publicKey
                    );
                    // encrypt symmetric key with other user's public key
                    const otherEncryptedSymmetric = await encryptSymmetricKey(
                      key,
                      data.user.publicKey
                    );
                    // create convo
                    await CreateConvoHandler({
                      variables: {
                        directMessage: true,
                        token: localStorage.getItem("auth-token"),
                        users: [user.username, createConvoText],
                        keys: [selfEncryptedSymmetric, otherEncryptedSymmetric],
                      },
                    });
                    setAddChatOpen(false);
                  } catch (error) {
                    console.error(error);
                    setLoading(false);
                  }
                }}
              >
                {loading ? (
                  <div className="convostart"></div>
                ) : (
                  <>Start</>
                )}
              </a>
            </>
          )}

          {addGroupChatOpen && (
            <>
              <input
                type="text"
                placeholder="Enter usernames"
                className="mt-1 py-4 pl-2 mx-3 bg-gray-100 rounded-[8px] outline-none focus:text-gray-700"
                style={{ width: "-webkit-fill-available" }}
                name="groupMessage"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddGroupChatUser(e.target.value);
                    e.target.value = "";
                  }
                }}
                required
              />
              <div className="flex flex-wrap mx-3">
                {groupChatUsers.map((user) => (
                  <span className="bg-gray-200 text-gray-800 px-2 py-1 m-1 rounded">
                    {user}
                  </span>
                ))}
              </div>
              <a
                href="#"
                className="hidden bg-[#8b5cf6] md:flex p-2 mx-3 mt-3 mb-1
                text-white rounded-[10px] items-center
                hover:bg-[#4c1d95] transition duration-200"
                onClick={handleCreateGroupChat}
              >
                {loading ? (
                  <div className="spinner inline-block"></div>
                ) : (
                  <>Start Group Chat</>
                )}
              </a>
            </>
          )}
        </div>
        {!addChatOpen && !addGroupChatOpen && (
          <div className="userblock pl-4 pr-4 mt-[-30px] text-white hover:rounded-md">
            <animated.ul style={userListAnimation} className="divide-gray-300 truncate">
              {userConversations.map((convo) => {
                return (
                  <div className="flex items-center gap-2" onClick={() => setActiveConvo(convo)}>
                    <CgProfile className="text-[25px]" />
                    <ConvoListItem
                      username={convo.user}
                      active={activeConvo && activeConvo.conv_id === convo.conv_id}
                    />
                  </div>
                );
              })}
            </animated.ul>
          </div>
        )}
      </div>
      <div className="grow"></div>
      <div
        className="flex py-2 items-center mb-3.5"
        style={{ display: "flex", justifyContent: "cente r" }}
      >
        <a
          href="#"
          className="flex items-center gap-2
                     transition duration-200"
        >
          <p
            className="flex px-3 scale-90 hover:scale-100 ease-in duration-200"
            onClick={handleLogout}
          >
            <BiLogOut className="text-[25px] mr-2" />
            {user.username}
          </p>
        </a>
      </div>
    </div>
  );
};
