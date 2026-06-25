import { NextResponse } from "next/server";

const VSL_RECOGNITION_API_URL = (
  process.env.VSL_RECOGNITION_API_URL ||
  process.env.NEXT_PUBLIC_VSL_RECOGNITION_API_URL ||
  "https://vsl-recognization-production.up.railway.app"
).replace(/\/$/, "");

type ApiErrorResponse = {
  detail?: string;
};

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { detail: "Không đọc được dữ liệu upload video." },
      { status: 400 },
    );
  }

  const video = formData.get("video");
  if (!(video instanceof File)) {
    return NextResponse.json(
      { detail: "Thiếu tệp video trong request." },
      { status: 400 },
    );
  }

  const upstreamFormData = new FormData();
  upstreamFormData.append("video", video, video.name);

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${VSL_RECOGNITION_API_URL}/predict/video`, {
      method: "POST",
      body: upstreamFormData,
    });
  } catch {
    return NextResponse.json(
      { detail: "Không thể kết nối đến server nhận diện VSL." },
      { status: 502 },
    );
  }

  if (!upstreamResponse.ok) {
    let detail = `Server nhận diện trả về lỗi ${upstreamResponse.status}.`;

    try {
      const body = (await upstreamResponse.json()) as ApiErrorResponse;
      if (body.detail) detail = body.detail;
    } catch {
      // The upstream API may return a non-JSON error body.
    }

    return NextResponse.json({ detail }, { status: upstreamResponse.status });
  }

  try {
    const body = await upstreamResponse.json();
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { detail: "Phản hồi từ server nhận diện không hợp lệ." },
      { status: 502 },
    );
  }
}
