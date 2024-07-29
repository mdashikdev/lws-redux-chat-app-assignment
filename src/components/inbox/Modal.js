import { useSelector } from "react-redux";
import {
  useAddConversationMutation,
  useEditConversationMutation,
  useGetConversationQuery,
} from "../../features/conversations/conversationsApi";
import { useAddMessageMutation } from "../../features/messages/messagesApi";
import { useEffect, useState } from "react";
import { useGetUserQuery } from "../../features/users/usersApi";
import isValidEmail from "../../utils/isValidEmail";
import Error from "../ui/Error";

export default function Modal({ open, control }) {
  const [to, setto] = useState();
  const [msg, setmsg] = useState();
  const [checkUser, setcheckUser] = useState(false);
  const [isReadyForSubmit, setisReadyForSubmit] = useState(false);
  const { user } = useSelector((state) => state.auth) || {};

  const { data: conversationData } = useGetConversationQuery(
    {
      userEmail: user?.email,
      participantEmail: to,
    },
    { skip: !isReadyForSubmit }
  );
  const { data: participantData } = useGetUserQuery(to, {
    skip: !checkUser,
  });

  const [editConversation, { isSuccess: isSuccessEditCoversession }] =
    useEditConversationMutation();
  const [addConversation, { isSuccess: isSuccessAddCoversession }] =
    useAddConversationMutation();

  useEffect(() => {
    if (isSuccessEditCoversession || isSuccessAddCoversession) {
      control();
      setto("");
    }
  }, [isSuccessEditCoversession, isSuccessAddCoversession]);

  const handleSendMsg = async (e) => {
    e.preventDefault();
    if (conversationData?.length > 0) {
      editConversation({
        id: conversationData[0].id,
        data: {
          participants: `${user.email}-${participantData[0].email}`,
          users: [user, participantData[0]],
          message: msg,
          timestamp: new Date().getTime(),
        },
        sender: user,
      });
    } else {
      addConversation({
        data: {
          participants: `${user.email}-${participantData[0].email}`,
          users: [user, participantData[0]],
          message: msg,
          timestamp: new Date().getTime(),
        },
        sender: user,
      });
    }
  };

  const handleDebounce = (fn, delay) => {
    let timeOut;
    return (...args) => {
      clearInterval(timeOut);
      timeOut = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  const doSearch = (value) => {
    if (isValidEmail(value)) {
      setto(value);
      setcheckUser(true);
      setisReadyForSubmit(true);
    }
  };
  const handleSearch = handleDebounce(doSearch, 500);

  return (
    open && (
      <>
        <div
          onClick={control}
          className="fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer"
        ></div>
        <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Send message
          </h2>
          <form
            className="mt-8 space-y-6"
            onSubmit={handleSendMsg}
            method="POST"
          >
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="to" className="sr-only">
                  To
                </label>
                <input
                  onChange={(e) => handleSearch(e.target.value)}
                  id="to"
                  name="to"
                  type="to"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Send to"
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  value={msg}
                  onChange={(e) => setmsg(e.target.value)}
                  id="message"
                  name="message"
                  type="message"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Message"
                />
              </div>
            </div>

            <div>
              <button
                disabled={false}
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white disabled:bg-violet-300 bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Send Message
              </button>
            </div>

            {participantData !== undefined && participantData?.length === 0 && (
              <Error message="Not Found!" />
            )}

            {user?.email === to && (
              <Error message="You cannot message yourself!" />
            )}

            {/* <Error message="There was an error" /> */}
          </form>
        </div>
      </>
    )
  );
}
