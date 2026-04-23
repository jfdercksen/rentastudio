import { handleITN } from "@/lib/payfast/itn-handler";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handleITN(request);
}
