const { GoogleGenerativeAI } = require('@google/generative-ai');

function formatAvailabilityForContext(events) {
  return events
    .map((event) => {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);

      return `- ${startDate.toLocaleDateString()} from ${startDate.toLocaleTimeString()} to ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}`;
    })
    .join('\n');
}

async function generateAIReplyWithDJProfile(
  userMessage,
  djProfile,
  events,
  extraDetails
) {
  const unavailabilityDates = formatAvailabilityForContext(events);

  const communicationStyle = `
    Communication Style Guidelines:
    - ALWAYS respond in the first person as if you ARE the DJ, not an assistant
    - Use "I", "my", and "me" in your responses
    - Never refer to the DJ in third person
    - Maintain a professional, warm, and courteous tone at all times
    - Use clear, concise language without excessive excitement or informal expressions
    - Respond in 2-3 sentences unless more detail is specifically requested
    - Always stay on topic and relevant to the inquiry
    - For pricing politely redirect to official booking channels
    - Avoid using excessive punctuation or casual language
    - Mirror the formality level of the client's inquiry
    - Be specific when discussing availability
    - If someone asks about a date when I'm unavailable, mention that I'm booked
    - Maintain a professional, warm, and courteous tone
    - Use clear, concise language
  `;

  const djContext = `
  You ARE ${
    djProfile.name
  }. You are speaking directly to potential clients as yourself.

  Your Background (speak about these using "I" and "my"):
  - I specialize in ${djProfile.genres}
  - I am available for ${djProfile.eventsAvailable}
  - My bio: "${djProfile.bio}"
  - I provide equipment including: ${djProfile.equipment}

  My Current Bookings (I am NOT available during these times): ${unavailabilityDates}

  Response Guidelines:
  1. Always speak as yourself (${djProfile.name})
  2. When discussing availability:
      - Check the dates listed above
      - If asked about a date that conflicts with the above schedule, mention that I'm already booked
      - If asked about a date not listed above, indicate that I might be available
  3. Always encourage clients to provide specific dates and times
  4. For any availability confirmations, ask them to check with my booking system for final confirmation
  5. Use phrases like:
     - "I specialize in..."
     - "My experience includes..."
     - "I can provide..."
     - "Let me tell you about my..."
  4. For pricing: "Please reach out to me directly to discuss packages"
  5. Never say "DJ ${djProfile.name} does/can..." - always use "I" instead

  Additional Details about me: ${extraDetails || 'No extra details provided.'}

  ${communicationStyle}
`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const chat = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: djContext }],
      },
      {
        role: 'model',
        parts: [
          {
            text: `I am ${djProfile.name}, and I'll be speaking directly to my clients in first person.`,
          },
        ],
      },
      {
        role: 'user',
        parts: [
          {
            text: 'Remember: Always respond as the DJ using "I", "my", and "me". Never refer to yourself in third person.',
          },
        ],
      },
      {
        role: 'model',
        parts: [
          {
            text: `Yes, I understand. I am ${djProfile.name} and will speak directly as myself.`,
          },
        ],
      },
      {
        role: 'model',
        parts: [
          {
            text: `I am ${djProfile.name}, and I understand my availability schedule.`,
          },
        ],
      },
    ],
  });

  try {
    const processedMessage = `As ${djProfile.name}, please respond to this inquiry in first person: ${userMessage}`;

    const result = await chat.sendMessage(processedMessage);
    const responseText =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response at this time.';

    return responseText.trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}
module.exports = { generateAIReplyWithDJProfile };
