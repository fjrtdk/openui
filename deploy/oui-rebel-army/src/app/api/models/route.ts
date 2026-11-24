import { getModelConfig } from "@/lib/models";

export const dynamic = "force-dynamic";

/** The model menu: allowed ids and the default. Ids only, never keys. */
export function GET() {
  return Response.json(getModelConfig());
}
