import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Guide } from '@/lib/database';

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({
    apiKey: apiKey,
  });
}

interface ChatRequest {
  message: string;
  guide: Guide;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, guide, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build context about the current guide
    const currentStep = guide.steps[guide.currentStep - 1];
    const guideContext = `
You are a helpful migration assistant helping someone migrate from ${guide.nationalities.join(' or ')} to ${guide.destination}.

Current Migration Guide Summary: ${guide.summary}

Current Step (Step ${guide.currentStep}): ${currentStep?.title || 'N/A'}
${currentStep ? `Description: ${currentStep.description}` : ''}
${currentStep?.paperwork ? `Required Paperwork: ${currentStep.paperwork.join(', ')}` : ''}
${currentStep?.submission ? `Submission Method: ${currentStep.submission}` : ''}

All Steps:
${guide.steps.map((step, idx) => 
  `Step ${step.step}: ${step.title} ${step.completed ? '(Completed)' : ''}`
).join('\n')}

Answer the user's question based on this migration guide. Be helpful, specific, and reference the actual steps and paperwork when relevant.
`;

    // Build conversation messages
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: guideContext,
      },
      ...conversationHistory.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      {
        role: 'user',
        content: message,
      },
    ];

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process chat message';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

