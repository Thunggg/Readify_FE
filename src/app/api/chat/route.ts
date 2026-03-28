import { NextResponse } from "next/server";

const NEXT_PUBLIC_AI_ENDPOINT =
  process.env.NEXT_PUBLIC_AI_ENDPOINT ?? "http://localhost:5000";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.question || typeof body.question !== "string") {
      return NextResponse.json(
        { message: "question is required" },
        { status: 400 },
      );
    }

    const res = await fetch(`${NEXT_PUBLIC_AI_ENDPOINT}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: body.question.trim() }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { message: `AI service error: ${res.status}`, detail: text },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/chat] Error:", error);
    return NextResponse.json(
      { message: "Failed to connect to AI service" },
      { status: 502 },
    );
  }
}
