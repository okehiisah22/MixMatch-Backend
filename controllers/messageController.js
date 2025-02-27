const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Message = require('../models/Message');
const { sendEmail } = require('../services/email.service');
const AutomatedReply = require('../models/AutomatedReply');
const { createNotification } = require('../notifications/notification');
const { generateAIReplyWithDJProfile } = require('../utils/generateAIReply');
const EquipmentModel = require('../models/Equipments');
const GigModel = require('../models/Gigs');
const PublicProfileModel = require('../models/PublicProfile');
const Assistant = require('../models/Assistant');
const Booking = require('../models/Booking');
const Event = require('../models/Events');

const MessageController = {
  getMessages: async (req, res) => {
    try {
      const email = req.user.email;
      const conversationId = req.params.conversationId;
      const messages = await Message.find({
        conversationId,
        $or: [{ 'sender.email': email }, { 'receiver.email': email }],
      });
      return res.status(200).json({
        success: true,
        message: 'Messages retrieved successfully',
        data: messages,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err?.message || 'An error occurred while retrieving messages',
      });
    }
  },

  sendMessageDJ: async (req, res) => {
    try {
      const socket = req.app.get('socket');
      const IO = req.app.get('IO');
      const data = req.body;

      const { conversationId } = req.query;
      let conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      const newMessage = new Message({
        conversationId: conversation._id,
        sender: data.sender,
        receiver: data.receiver,
        type: data.type,
        message: data.message,
      });

      await newMessage.save();

      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: data.message,
        lastMessageType: data.type,
        lastMessageDate: new Date(),
        unreadMessages: 0,
      });

      IO.to(conversation?.id.toString()).emit('new_message', newMessage);

      const isLastMessageWith1Minute =
        new Date() - conversation.lastMessageDate < 60000;

      const externalUser = conversation.members.find(
        (member) =>
          member?.email.toLowerCase() !==
          conversation?.conversationAdmin?.email?.toLowerCase()
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
          'New message',
          'newMessageExternal',
          context
        );

        if (!isEmailSentToUser) {
          return res.status(400).json({
            success: false,
            message: 'An error occurred while sending email notification',
          });
        }

        return res.status(201).json({
          success: true,
          message: 'Message sent successfully',
          data: newMessage,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: newMessage,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err?.message || 'An error occurred while sending message',
      });
    }
  },

  sendMessageUser: async (req, res) => {
    try {
      const data = req.body;
      const io = req.app.get('IO');
      let conversation = await Conversation.findById(data?.conversationId);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'You have not created a conversation with this dj yet',
        });
      }

      const senderName = conversation?.members.find(
        (member) => member?.email === data?.sender?.email
      )?.name;

      const DJ = await User.findById(conversation?.conversationAdmin?._id);
      const PProf = await PublicProfileModel.findById(
        conversation?.conversationAdmin?._id
      );
      const EQ = await EquipmentModel.find({
        user: conversation?.conversationAdmin?._id,
      });
      const GIGS = await GigModel.find({
        user: conversation?.conversationAdmin?._id,
      });

      const ASSIST = await Assistant.find({
        user: conversation?.conversationAdmin?._id,
      });

      const EVENTS = await Event.find({
        user: conversation?.conversationAdmin?._id,
      });

      const BOOKING = await Booking.find({
        user: conversation?.conversationAdmin?._id,
      });

      /*     console.log('ASSIST---', EVENTS, BOOKING);
      console.log([...EVENTS, ...BOOKING]); */

      const equipmentsContext = EQ.map((item) => item.type.toLowerCase());
      const gigsContext = GIGS.map((item) => item.gigTitle.toLowerCase());

      if (!DJ) {
        return res.status(404).json({
          success: false,
          message: 'DJ not found',
        });
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

      // const message = await createNotification({
      //   type: "message",
      //   title: "sent a new message",
      //   content: newMessage?.message,
      //   sender: senderName,
      //   user: DJ,
      //   link: `/messages?conversation=${conversation._id?.toString()}`,
      // });

      // io.to(conversation.conversationAdmin.id.toString()).emit(
      //   "new_notification",
      //   message
      // );

      io.to(conversation?.id.toString()).emit('new_message', newMessage);

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
          'New message',
          'newMessage',
          context
        );

        if (!isEmailSentToDJ) {
          return res.status(400).json({
            success: false,
            message: 'An error occurred while sending email notification',
          });
        }
      }

      if (!DJ.isOnline && DJ.automatedMessagesEnabled) {
        const message = newMessage?.message.toLowerCase().replaceAll(',', '');

        const aiReply = await generateAIReplyWithDJProfile(
          message,
          {
            name: DJ.firstName,
            genres: DJ.genres,
            eventsAvailable: gigsContext,
            bio: PProf?.description || '',
            equipment: equipmentsContext,
          },
          [...EVENTS, ...BOOKING],
          ASSIST[0].description === 'Hello.' ? '' : ASSIST[0].description
        );

        const reply = new Message({
          conversationId: conversation?._id,
          sender: data?.receiver,
          receiver: data?.sender,
          type: 'text',
          message: aiReply,
        });

        await reply.save();

        await Conversation.findByIdAndUpdate(conversation._id, {
          lastMessage: aiReply,
          lastMessageType: 'text',
          lastMessageDate: new Date(),
          unreadMessages: conversation.unreadMessages + 1,
        });

        io.to(conversation?.id.toString()).emit('new_message', reply);

        return res.status(201).json({
          success: true,
          message: 'Message sent successfully',
          data: newMessage,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: newMessage,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err?.message || 'An error occurred while sending message',
      });
    }
  },
};

module.exports = MessageController;
