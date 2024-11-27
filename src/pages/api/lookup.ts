import type { NextApiRequest, NextApiResponse } from "next";
import { lookupWhoisWithCache } from "@/lib/whois/lookup";
import { WhoisAnalyzeResult } from "@/lib/whois/types";
import { i18n } from "next-i18next";

type Data = {
  status: boolean;
  time: number;
  cached?: boolean;
  result?: WhoisAnalyzeResult;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { query } = req.query;

  if (!query || typeof query !== "string" || query.length === 0) {
    return res
      .status(400)
      .json({ time: -1, status: false, error: i18n.t("Query is required") });
  }

  const { time, status, result, error, cached } =
    await lookupWhoisWithCache(query);
  if (!status) {
    return res.status(500).json({ time, status, error: i18n.t(error) });
  }

  return res.status(200).json({ time, status, result, cached });
}
