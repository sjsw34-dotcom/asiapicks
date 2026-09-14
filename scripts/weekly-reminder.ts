import { loadContent, contentToday } from "@/lib/content/loader";
import { upcomingCalendar } from "@/data/calendar";
import { openDays } from "@/lib/release";

/**
 * Body of the weekly "prepare next week's drafts" issue, written for the owner
 * (Korean). It only reminds; drafting happens in a Claude Code session and every
 * post still needs the owner's approval before it is committed.
 */
const today = contentToday();
const day = (offset: number) => new Date(Date.parse(`${today}T00:00:00Z`) + offset * 86_400_000).toISOString().slice(0, 10);
// Run on Thursday: next week is the coming Monday to Sunday.
const monday = day((8 - new Date(`${today}T00:00:00Z`).getUTCDay()) % 7 || 7);
const sunday = new Date(Date.parse(`${monday}T00:00:00Z`) + 6 * 86_400_000).toISOString().slice(0, 10);

const live = loadContent({ includeReview: false, asOf: today });
const all = loadContent({ includeReview: false, asOf: "9999-12-31" });
const queued = [...live.scheduled.entries()].sort((a, b) => a[1].localeCompare(b[1]));
const nextWeek = queued.filter(([, d]) => d >= monday && d <= sunday);
const empty = openDays(all, monday, sunday);
const seasonal = upcomingCalendar(today, 45).filter((e) => !all.byPath.has(e.path) || e.kind === "refresh");

const out: string[] = [];
out.push(`다음 주(${monday} ~ ${sunday}) 매일 1편씩 발행할 초안을 준비할 시간입니다.`);
out.push("");
out.push("## 할 일");
out.push("");
out.push("VS Code에서 asiapicks 폴더를 열고 Claude Code에 이렇게 말하면 됩니다:");
out.push("");
out.push("> 다음 주 초안 준비해");
out.push("");
out.push("초안이 나오면 승인할 글을 고르고, 승인한 글만 발행일 아침 06:05에 자동으로 공개됩니다. 승인이 끝나면 이 이슈를 닫아 주세요.");
out.push("");
out.push(`## 현재 상태`);
out.push("");
out.push(`- 공개된 글: ${live.articles.length}편`);
out.push(`- 다음 주에 이미 예약된 글: ${nextWeek.length}편 (목표 7편, 하루 1편)`);
out.push(`- 비어 있는 날: ${empty.length === 0 ? "없음" : empty.join(", ")}`);
out.push(`- 공개 대기 중인 예약 글 전체: ${queued.length}편`);
for (const [p, d] of queued) out.push(`  - ${d} ${p}`);
out.push("");
out.push("## 45일 안에 초안 마감인 시즌 글");
out.push("");
if (seasonal.length === 0) out.push("없음");
for (const e of seasonal) out.push(`- [ ] ${e.draftBy}까지 초안, ${e.publishBy} 공개: ${e.topic} (\`${e.path}\`)`);
console.log(out.join("\n"));
