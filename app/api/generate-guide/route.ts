import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

interface GuideStep {
  step: number;
  title: string;
  description: string;
  paperwork: string[];
  links: string[];
  pdfs: string[];
  submission: string;
  nextStepCondition: string;
}

interface GenerateGuideRequest {
  nationalities: string[];
  destination: string;
  movingReason?: string;
  uid?: string; // Will be set from auth token
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateGuideRequest = await request.json();
    const { nationalities, destination, movingReason } = body;

    if (!nationalities || nationalities.length === 0) {
      return NextResponse.json(
        { error: 'Nationalities are required' },
        { status: 400 }
      );
    }

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization');
    let uid: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // In production, verify the token with Firebase Admin SDK
      // For now, we'll accept it from the request body if provided
      uid = body.uid || null;
    }

    // If no UID provided, try to get from request body (client-side workaround)
    if (!uid && body.uid) {
      uid = body.uid;
    }

    if (!uid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Generate guide using Gemini - Focused on paperwork
    let promptBase = `You are an expert immigration consultant specializing in paperwork and documentation. Generate a detailed, step-by-step paperwork guide for someone with the following nationalities: ${nationalities.join(', ')} who wants to move to ${destination}.`;

    if (movingReason) {
      promptBase += `\nThe user is moving for the following reason: "${movingReason}". Please tailor the paperwork requirements specifically for this purpose (e.g., student visa for studying, work permit for employment, family reunification, etc.).`;
    }

    const prompt = `${promptBase}

IMPORTANT: Focus EXCLUSIVELY on the paperwork and documents required. Each step should be about completing and submitting specific forms and documents.

Create a comprehensive paperwork guide with:
1. A brief summary (2-3 sentences) focusing on the paperwork process
2. A detailed step-by-step paperwork plan with AS MANY STEPS AS NEEDED (do not limit to 5 steps - include all necessary paperwork steps):
   - Step number
   - Clear title (e.g., "Complete Visa Application Form", "Submit Passport Documents")
   - Detailed description of the paperwork required and what needs to be filled out
   - List of required paperwork/documents (be specific: "DS-160 Form", "Passport Copy", "Birth Certificate", etc.)
   - Direct PDF download links to official government forms (use real URLs when possible, or format as "https://[government-site]/forms/[form-name].pdf")
   - Relevant government or official website links where forms can be downloaded
   - Submission method (Online, In-person, Mail, etc.)
   - Condition for moving to the next step (e.g., "After form is submitted and approved")

Format your response as a JSON object with this exact structure:
{
  "summary": "Brief overview focusing on the paperwork process",
  "steps": [
    {
      "step": 1,
      "title": "Step title (paperwork-focused)",
      "description": "Detailed description of what paperwork needs to be completed",
      "paperwork": ["Document 1", "Document 2", "Form Name"],
      "pdfs": ["https://official-site.gov/forms/form-name.pdf", "https://official-site.gov/forms/another-form.pdf"],
      "links": ["https://official-link.com"],
      "submission": "Online/In-person/Mail",
      "nextStepCondition": "What needs to happen before next step"
    }
  ]
}

Make sure:
- Every step is about paperwork/documentation
- Include ALL necessary steps - do not limit the number of steps (create as many steps as needed for a complete paperwork guide)
- Include actual PDF links when you know them, or format them realistically
- Focus on forms, documents, certificates, and applications
- Be specific about document names and requirements
- Always respond with valid JSON only, no markdown formatting.`;

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const fullPrompt = `You are an expert immigration consultant. ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const responseContent = response.text();

    if (!responseContent) {
      throw new Error('No response from Gemini');
    }

    // Parse the JSON response
    let guideData;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      guideData = JSON.parse(cleanedContent);
    } catch {
      console.error('Failed to parse Gemini response:', responseContent);
      throw new Error('Failed to parse guide data');
    }

    // Validate and structure the guide
    const summary = guideData.summary || 'Paperwork guide for your migration journey';
    const steps: GuideStep[] = (guideData.steps || []).map((step: any, index: number) => ({
      step: step.step || index + 1,
      title: step.title || `Step ${index + 1}`,
      description: step.description || '',
      paperwork: Array.isArray(step.paperwork) ? step.paperwork : [],
      links: Array.isArray(step.links) ? step.links : [],
      pdfs: Array.isArray(step.pdfs) ? step.pdfs : [],
      submission: step.submission || 'Not specified',
      nextStepCondition: step.nextStepCondition || '',
    }));

    // Return guide data - client will write to database with authenticated context
    return NextResponse.json({
      uid,
      nationalities,
      destination,
      summary,
      steps,
    });
  } catch (error) {
    console.error('Error generating guide:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate guide';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

