import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function handleApiError(error: unknown) {
  if (error instanceof Response) {
    return error;
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const message =
    error instanceof Error ? error.message : "Something went wrong";
  const status = message.includes("not found") ? 404 : 500;
  return NextResponse.json({ error: message }, { status });
}
