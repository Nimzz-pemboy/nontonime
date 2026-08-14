import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requestUpstream } from "./anime.server";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const pathSchema = z.object({ path: z.string().min(1).max(200) });

export const fetchAnimeApi = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => pathSchema.parse(data))
  .handler(async ({ data }) => {
    const result = await requestUpstream(data.path);
    return result as unknown as { [key: string]: Json };
  });
