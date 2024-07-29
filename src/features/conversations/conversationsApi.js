import { io } from "socket.io-client";
import getPartnerInfo from "../../utils/getPartnerInfo";
import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";

export const conversationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,

      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData, dispatch }
      ) {
        const socket = io("http://localhost:9000", {
          reconnectionDelay: 1000,
          reconnection: true,
          reconnectionAttemps: 10,
          transports: ["websocket"],
          agent: false,
          upgrade: false,
          rejectUnauthorized: false,
        });

        try {
          await cacheDataLoaded;
          socket.on("conversation", (data) => {
            updateCachedData((draft) => {
              let conversation = draft.find((c) => c.id == data?.data?.id);

              if (conversation?.id) {
                conversation.message = data?.data?.message;
                conversation.timestamp = data?.data?.timestamp;
              } else {
                if (
                  arg !== data?.data?.users[0]?.email &&
                  arg === data?.data?.users[1]?.email
                ) {
                  draft.unshift(data?.data);
                  const pushedConversation = draft.find(
                    (c) => c.id == data?.data?.id
                  );
                  conversation = [
                    {
                      id: pushedConversation.id,
                      participants: pushedConversation.participants,
                      users: pushedConversation.users,
                      message: pushedConversation.message,
                      timestamp: pushedConversation.timestamp,
                    },
                  ];
                }
              }
            });
          });
          socket.on("messages", (data) => {
            dispatch(
              apiSlice.util.updateQueryData(
                "getMessages",
                data.data.conversationId.toString(),
                (draft) => {
                  draft.push(data.data);
                }
              )
            );
          });
        } catch (error) {}
        await cacheEntryRemoved;
        socket.close();
      },
    }),
    getConversation: builder.query({
      query: ({ userEmail, participantEmail }) =>
        `/conversations?participants_like=${userEmail}-${participantEmail}&&participants_like=${participantEmail}-${userEmail}`,
    }),
    addConversation: builder.mutation({
      query: ({ data }) => ({
        url: "/conversations",
        method: "POST",
        body: data,
      }),
      async onQueryStarted({ data, sender }, { dispatch, queryFulfilled }) {
        //optimistic add conversession

        try {
          const res = await queryFulfilled;
          const receiver = getPartnerInfo(data.users, sender.email);
          dispatch(
            messagesApi.endpoints.addMessage.initiate({
              conversationId: res.data.id,
              sender: sender,
              receiver,
              message: data.message,
              timestamp: data.timestamp,
            })
          )
            .unwrap()
            .then((res) => {
              dispatch(
                apiSlice.util.updateQueryData(
                  "getConversations",
                  sender.email,
                  (draft) => {
                    draft.unshift({
                      participants: data.participants,
                      users: data.users,
                      message: data.message,
                      timestamp: data.timestamp,
                      id: res.id,
                    });
                  }
                )
              );
            });
        } catch (error) {}
      },
    }),
    editConversation: builder.mutation({
      query: ({ id, data }) => ({
        url: `/conversations/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted({ id, data, sender }, { dispatch, queryFulfilled }) {
        // optimistic cache update start

        const pathResult = dispatch(
          apiSlice.util.updateQueryData(
            "getConversations",
            sender.email,
            (draft) => {
              const draftConversation = draft.find((c) => c.id == id);
              draftConversation.message = data.message;
              draftConversation.timestamp = data.timestamp;
            }
          )
        );
        try {
          await queryFulfilled;
          //silent message
          const receiver = getPartnerInfo(data.users, sender.email);
          dispatch(
            messagesApi.endpoints.addMessage.initiate({
              conversationId: id,
              sender: sender,
              receiver,
              message: data.message,
              timestamp: data.timestamp,
            })
          );
        } catch (error) {
          pathResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useAddConversationMutation,
  useEditConversationMutation,
} = conversationsApi;
