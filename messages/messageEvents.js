const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const AutomatedReply = require("../models/AutomatedReply");
const { sendEmail } = require("../services/email.service");

handleError = (error, socket) => {
  socket.emit("error", {
    message: error ?? "An error occurred",
  });
  return;
};

module.exports = {
  sendMessage: async (data, socket) => {
    try {
      let conversation = await Conversation.findOne({
        $and: [
          { "members.email": data?.sender?.email },
          { "members.email": data?.receiver?.email },
        ],
      });

      if (!conversation) {
        handleError("Conversation not found", socket);
        return;
      }
      const isSenderAdmin =
        conversation?.conversationAdmin?.email === data?.sender?.email;

      if (isSenderAdmin) {
        const newMessage = new Message({
          conversationId: conversation?._id,
          sender: data?.sender,
          receiver: data?.receiver,
          type: data?.type,
          message: data?.message,
        });

        await newMessage.save();

        await Conversation.findByIdAndUpdate(conversation?._id, {
          lastMessage: data.message,
          lastMessageType: data.type,
          lastMessageDate: new Date(),
          unreadMessages: 0,
        });

        socket.to(conversation?._id.toString()).emit("new_message", newMessage);

        const isLastMessageWith1Minute =
          new Date() - conversation?.lastMessageDate < 60000;

        const externalUser = conversation?.members.find(
          (member) =>
            member?.email.toLowerCase() !==
            conversation.conversationAdmin.email.toLowerCase()
        );

        if (!isLastMessageWith1Minute) {
          const profile_link = `${
            process.env.BASE_URL
          }/profile/${conversation.conversationAdmin._id?.toString()}`;

          const context = {
            profile_link,
            user: {
              firstName: externalUser?.name,
            },
          };

          const isEmailSentToUser = await sendEmail(
            externalUser?.email,
            "New message",
            "newMessageExternal",
            context
          );

          if (!isEmailSentToUser) {
            handleError("An error occurred while sending email", socket);
          }
        }

        return;
      } else {
        const senderName = conversation?.members.find(
          (member) => member?.email === data?.sender?.email
        )?.name;

        const DJ = await User.findById(conversation?.conversationAdmin?._id);

        if (!DJ) {
          handleError("DJ Not found", socket);
        }

        data.sender.name = senderName;

        const newMessage = new Message({
          conversationId: conversation?._id,
          sender: data?.sender,
          receiver: data?.receiver,
          type: data?.type,
          message: data?.message,
        });

        await newMessage.save();

        await Conversation.findByIdAndUpdate(conversation?._id, {
          lastMessage: data?.message,
          lastMessageType: data?.type,
          lastMessageDate: new Date(),
          unreadMessages: conversation?.unreadMessages + 1,
        });
        socket.to(DJ?._id.toString()).emit("new_message", newMessage);

        const conversation_link = `${
          process.env.BASE_URL
        }/messages?conversation=${conversation._id?.toString()}`;

        const context = {
          conversation_link,
          user: {
            firstName: DJ.firstName,
          },
          sender: {
            name: senderName,
            email: data?.sender?.email,
          },
        };

        const isLastMessageWith1Minute =
          new Date() - conversation?.lastMessageDate < 60000;

        if (
          !DJ.isOnline &&
          DJ.allowOfflineMessagesNotifications &&
          !isLastMessageWith1Minute
        ) {
          const isEmailSentToDJ = await sendEmail(
            DJ.email,
            "New message",
            "newMessage",
            context
          );

          if (!isEmailSentToDJ) {
            handleError("An error occurred while sending email", socket);
          }
        }

        if (!DJ.isOnline && DJ.automatedMessagesEnabled) {
          const message = newMessage?.message.toLowerCase().replaceAll(",", "");
          const words = message?.split(/\s+/);
          const escapedWords = words?.map((word) =>
            word.replace(/[.*+?!;:^${}()|[\]\\]/g, "")
          );

          const triggerObjects = await AutomatedReply.find({
            user: conversation.conversationAdmin,
          });

          const triggers = triggerObjects.reduce((acc, obj) => {
            obj.trigger
              .toLowerCase()
              .split(",")
              .forEach((trigger) => {
                acc.push(trigger?.trim());
              });
            return acc;
          }, []);

          const matchedTriggers = triggers.filter((trigger) =>
            escapedWords?.includes(trigger)
          );

          let AutomatedReplies = [];
          if (escapedWords?.length > 0 || matchedTriggers?.length > 0) {
            const regexes = matchedTriggers.map(
              (trigger) => new RegExp(`\\b${trigger}\\b`, "i")
            );
            AutomatedReplies = await AutomatedReply.find({
              user: conversation.conversationAdmin,
              trigger: { $in: regexes },
            });
          }

          if (AutomatedReplies?.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * AutomatedReplies.length
            );

            const automatedReply = AutomatedReplies[randomIndex];

            const reply = new Message({
              conversationId: conversation?._id,
              sender: data?.receiver,
              receiver: data?.sender,
              type: "text",
              message: automatedReply.message,
            });

            await reply.save();

            await Conversation.findByIdAndUpdate(conversation._id, {
              lastMessage: automatedReply.message,
              lastMessageType: "text",
              lastMessageDate: new Date(),
              unreadMessages: conversation.unreadMessages + 1,
            });

            setTimeout(() => {
              socket.emit("new_message", reply);
              return;
            }, 7000);
            return;
          }
          return;
        }
        return;
      }
    } catch (error) {
      handleError(error?.message, socket);
      return;
    }
  },
  readMessage: async (data, socket) => {
    try {
      const conversation = await Conversation.findById(data.conversationId);

      if (!conversation) {
        handleError("Conversation not found", socket);
        return;
      }

      if (conversation) {
        await Conversation.findByIdAndUpdate(conversation._id, {
          unreadMessages: 0,
        });
      }
      return;
    } catch (error) {
      handleError(error?.message, socket);
      return;
    }
  },
};
