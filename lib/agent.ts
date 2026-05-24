import "server-only";
import { classifyMail } from "./classifier";
import {
  createReplyDraft,
  getConnectedEmail,
  getMessage,
  isGmailConnected,
  listRecentInboxMessageIds,
} from "./gmail";
import { callLLM, getActiveProvider } from "./llm";
import {
  getRecentProcessed,
  hasSeenMessage,
  recordProcessed,
  type ProcessedEntry,
} from "./processed-store";

const REPLY_SYSTEM_PROMPT = [
  "당신은 한국 비즈니스 이메일 답장 초안 작성 비서다.",
  "받은 메일을 보고, 사람이 검토 후 발송할 수 있는 답장 초안을 작성한다.",
  "출력은 답장 본문만 한국어로 작성한다. 마크다운 헤더나 추가 설명은 넣지 않는다.",
  "구조: (1) 인사 (2) 핵심 응답 (3) 다음 액션이 필요하면 명시 (4) 끝인사.",
  "마지막 줄에는 다음 안내 문구를 그대로 붙인다:",
  "",
  "---",
  "이 초안은 HI AI LAB 에이전트가 자동 작성했습니다. 발송 전 반드시 사람이 검토해 주세요.",
].join("\n");

async function generateReplyBody(mail: {
  subject: string;
  from: string;
  body: string;
}): Promise<string | null> {
  const userPrompt = [
    "다음은 받은 메일입니다. 답장 초안을 작성해 주세요.",
    "",
    `From: ${mail.from}`,
    `Subject: ${mail.subject}`,
    "",
    "---",
    mail.body.slice(0, 4000),
    "---",
  ].join("\n");

  return callLLM({
    systemInstruction: REPLY_SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 800,
    temperature: 0.4,
  });
}

function extractEmailAddress(s: string): string {
  const m = s.match(/<([^>]+)>/);
  if (m) return m[1].trim();
  return s.trim();
}

function shouldSkipBySender(fromAddress: string, ownEmail: string | null): boolean {
  if (!fromAddress) return true;
  if (ownEmail && fromAddress.toLowerCase() === ownEmail.toLowerCase()) return true;
  if (/no[-_]?reply|donotreply|do-not-reply/i.test(fromAddress)) return true;
  return false;
}

export type AgentRunResult = {
  ok: boolean;
  error?: string;
  scanned: number;
  skippedSeen: number;
  skippedSender: number;
  classified: Record<string, number>;
  draftsCreated: number;
  draftErrors: number;
  processed: ProcessedEntry[];
};

export async function runAgentOnce(userId: string): Promise<AgentRunResult> {
  const result: AgentRunResult = {
    ok: true,
    scanned: 0,
    skippedSeen: 0,
    skippedSender: 0,
    classified: {},
    draftsCreated: 0,
    draftErrors: 0,
    processed: [],
  };

  if (!(await isGmailConnected(userId))) {
    return { ...result, ok: false, error: "Gmail이 연결되지 않았습니다." };
  }
  const provider = await getActiveProvider();
  if (provider === "none") {
    return {
      ...result,
      ok: false,
      error: "AI 키가 없습니다. (분류기와 답장 작성에 필요)",
    };
  }

  const ownEmail = await getConnectedEmail(userId);

  const ids = await listRecentInboxMessageIds(userId, "in:inbox newer_than:1d");
  result.scanned = ids.length;

  for (const { id } of ids) {
    if (await hasSeenMessage(userId, id)) {
      result.skippedSeen++;
      continue;
    }
    const msg = await getMessage(userId, id);
    if (!msg) continue;

    const fromAddress = extractEmailAddress(msg.from);
    if (shouldSkipBySender(fromAddress, ownEmail)) {
      result.skippedSender++;
      await recordProcessed(userId, {
        id: msg.id,
        threadId: msg.threadId,
        from: msg.from,
        subject: msg.subject,
        category: "other",
        processedAt: new Date().toISOString(),
      });
      continue;
    }

    const category = await classifyMail({
      from: msg.from,
      subject: msg.subject,
      bodyPreview: msg.body,
    });
    result.classified[category] = (result.classified[category] ?? 0) + 1;

    let draftId: string | undefined;
    let draftError: string | undefined;

    if (category === "needs_reply") {
      const replyBody = await generateReplyBody({
        subject: msg.subject,
        from: msg.from,
        body: msg.body,
      });
      if (!replyBody) {
        draftError = "답장 본문 생성 실패";
        result.draftErrors++;
      } else {
        const drafted = await createReplyDraft(userId, {
          to: fromAddress,
          subject: msg.subject.startsWith("Re:") ? msg.subject : `Re: ${msg.subject}`,
          body: replyBody,
          threadId: msg.threadId,
          inReplyToMessageId: msg.messageIdHeader || undefined,
        });
        if (drafted.ok) {
          draftId = drafted.draftId;
          result.draftsCreated++;
        } else {
          draftError = drafted.error;
          result.draftErrors++;
        }
      }
    }

    const entry: ProcessedEntry = {
      id: msg.id,
      threadId: msg.threadId,
      from: msg.from,
      subject: msg.subject,
      category,
      draftId,
      draftError,
      processedAt: new Date().toISOString(),
    };
    await recordProcessed(userId, entry);
    result.processed.push(entry);
  }

  return result;
}

export async function getAgentLog(userId: string, limit: number = 50) {
  return getRecentProcessed(userId, limit);
}
