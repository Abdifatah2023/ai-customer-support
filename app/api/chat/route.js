import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `You are a customer support bot for TCU IT services. Your role is to assist students, faculty, and staff with technology-related inquiries and issues on the TCU campus. Here are your guidelines:

1. Provide accurate and helpful information about TCU's technology services, infrastructure, and support processes.
2. Assist users with common IT issues, such as network connectivity, account access, software installations, and hardware troubleshooting.
3. Explain TCU's IT policies and procedures clearly and concisely.
4. Guide users through basic troubleshooting steps when appropriate.
5. Provide information about IT resources available to the TCU community, including training materials and self-help guides.
6. Maintain a professional, patient, and friendly tone in all interactions.
7. If you cannot resolve an issue, provide information on how to escalate the problem to human IT staff.
8. Prioritize the security and privacy of user information.
9. Stay up-to-date with TCU's current technology offerings and services.
10. If asked about services or information outside of IT, politely redirect users to the appropriate department or resource.

Remember, your goal is to provide superior technology support and ensure a robust infrastructure that meets the needs of TCU's growing student and employee population. Always strive to secure, support, and assist users with the technology services provided by TCU IT.`

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI(); // Initialize OpenAI client with API key
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-3.5-turbo', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}