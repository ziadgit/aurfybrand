import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { ANGLES } from "@/aurfy/content";
import type { AngleId } from "@/aurfy/types";
import {
  CHANNELS,
  SEGMENTS,
  draftPost,
  resultsByAngle,
  useSocialPlan,
  utmLink,
  type SocialChannel,
  type SocialPost,
  type SocialSegment,
} from "@/aurfy/social";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/aurfy/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton, Pill, SectionHeading, TruthNote } from "@/components/aurfy/ui-bits";

function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="font-mono-label mb-1.5 text-[10px] text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={value === option.id}
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition",
              value === option.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-ink-soft hover:border-primary/40",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const numberOrNull = (value: string) => (value.trim() === "" ? null : Math.max(0, Math.round(Number(value) || 0)));
const pct = (value: number | null) => (value === null ? "—" : `${(value * 100).toFixed(1)}%`);

function PostRow({
  post,
  onUpdate,
  onRemove,
  onAddProspect,
}: {
  post: SocialPost;
  onUpdate: (patch: Partial<SocialPost>) => void;
  onRemove: () => void;
  onAddProspect: (name: string) => void;
}) {
  const [engager, setEngager] = useState("");
  const channel = CHANNELS.find((item) => item.id === post.channel);
  const angle = ANGLES.find((item) => item.id === post.angle);
  const segment = SEGMENTS.find((item) => item.id === post.segment);
  const link = utmLink(post);

  const addEngager = () => {
    const name = engager.trim();
    if (!name || post.engagers.includes(name)) return;
    onUpdate({ engagers: [...post.engagers, name] });
    setEngager("");
  };

  return (
    <li className="surface p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill tone="primary">{channel?.label}</Pill>
        <Pill tone="neutral">{angle?.label}</Pill>
        <Pill tone="outline">{segment?.label}</Pill>
        {post.isDemo ? <Pill tone="warning">Demo · fictional numbers</Pill> : null}
        <span className="ml-auto flex items-center gap-1.5">
          <Pill tone={post.status === "posted" ? "success" : "neutral"}>{post.status === "posted" ? `Posted ${post.postedOn ?? ""}` : "Planned"}</Pill>
          <button type="button" onClick={onRemove} aria-label="Remove post" className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Trash2 className="h-4 w-4" />
          </button>
        </span>
      </div>

      <p className="mt-3 line-clamp-3 whitespace-pre-line text-[12.5px] leading-relaxed text-ink-soft">{post.text}</p>
      <p className="mt-2 truncate font-mono text-[10.5px] text-muted-foreground" title={link}>
        Tracked link: {link}
      </p>

      {post.status === "planned" ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <CopyButton text={`${post.text}\n\n${link}`} label="Copy post + link" variant="outline" />
          <Button type="button" onClick={() => onUpdate({ status: "posted", postedOn: new Date().toISOString().slice(0, 10) })}>
            I posted it myself
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(
              [
                ["impressions", "Impressions"],
                ["engagements", "Engagements"],
                ["siteVisits", "Site visits (UTM)"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label htmlFor={`${post.id}-${key}`} className="text-[10.5px] text-muted-foreground">
                  {label}
                </Label>
                <Input
                  id={`${post.id}-${key}`}
                  inputMode="numeric"
                  value={post[key] ?? ""}
                  onChange={(event) => onUpdate({ [key]: numberOrNull(event.target.value) })}
                  className="mt-1 h-9"
                />
              </div>
            ))}
          </div>

          <div className="mt-3">
            <p className="font-mono-label text-[10px] text-muted-foreground">Merchant engagers worth a follow-up</p>
            <div className="mt-1.5 flex gap-2">
              <Input
                value={engager}
                onChange={(event) => setEngager(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && addEngager()}
                placeholder="Business name, e.g. Cedar & Crumb"
                className="h-9"
                aria-label="Merchant engager name"
              />
              <Button type="button" variant="outline" size="sm" onClick={addEngager} className="h-9 shrink-0">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            {post.engagers.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {post.engagers.map((name) => {
                  const added = post.addedToPipeline.includes(name);
                  return (
                    <li key={name} className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/60 px-2.5 py-1.5 text-[12px]">
                      <span className="min-w-0 flex-1 truncate font-medium text-foreground">{name}</span>
                      {added ? (
                        <Pill tone="success">In pipeline</Pill>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onAddProspect(name);
                            onUpdate({ addedToPipeline: [...post.addedToPipeline, name] });
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary-soft"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Add to pipeline
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </>
      )}
    </li>
  );
}

export default function Social() {
  const { addMerchant, state } = useStudio();
  const { posts, addPost, updatePost, removePost, clearDemo } = useSocialPlan();
  const [channel, setChannel] = useState<SocialChannel>("linkedin");
  const [angle, setAngle] = useState<AngleId>("connected");
  const [segment, setSegment] = useState<SocialSegment>("restaurant");
  const [observation, setObservation] = useState("");
  const [text, setText] = useState(() => draftPost("linkedin", "connected", "restaurant", ""));

  const limit = CHANNELS.find((item) => item.id === channel)?.limit ?? 3000;
  const results = resultsByAngle(posts);
  const ranked = results.filter((row) => row.posted > 0).sort((a, b) => (b.engagersPerPost ?? 0) - (a.engagersPerPost ?? 0));
  const leader = ranked[0];
  const hasDemo = posts.some((post) => post.isDemo);

  const redraft = (next: { channel?: SocialChannel; angle?: AngleId; segment?: SocialSegment; observation?: string }) => {
    const c = next.channel ?? channel;
    const a = next.angle ?? angle;
    const s = next.segment ?? segment;
    const o = next.observation ?? observation;
    if (next.channel) setChannel(c);
    if (next.angle) setAngle(a);
    if (next.segment) setSegment(s);
    setText(draftPost(c, a, s, o));
  };

  const addProspect = (post: SocialPost, name: string) => {
    if (state.merchants.some((merchant) => merchant.name.trim().toLowerCase() === name.trim().toLowerCase())) {
      toast.info(`${name} is already in the pipeline`, { description: "Marked as engaged on this post; no duplicate was created." });
      return;
    }
    const segmentLabel = SEGMENTS.find((item) => item.id === post.segment)?.label ?? "";
    const channelLabel = CHANNELS.find((item) => item.id === post.channel)?.label ?? "";
    addMerchant({
      name,
      url: "",
      category: segmentLabel,
      notes: `Engaged with a ${channelLabel} post (${ANGLES.find((item) => item.id === post.angle)?.label} angle${
        post.postedOn ? `, posted ${post.postedOn}` : ""
      }). Logged by hand from the social step; engagement is interest, not intent.`,
    });
    toast.success(`${name} added to the pipeline`, { description: "Stage: Research. Open the pipeline to set a next action." });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Social · LinkedIn and X"
        title="Posts that earn merchant attention."
        description="Draft posts from the same three positioning angles, post them yourself, log what happened, and move the merchants who engaged into the pipeline. Quality of engagers beats follower count."
        action={
          <Button asChild variant="outline">
            <Link to="/pipeline">
              Pipeline <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <TruthNote tone="safety" title="Nothing is posted from here">
        There is no LinkedIn or X connection. You copy the post, publish it yourself, and type the results in from the platform&apos;s own
        analytics. Tracked links carry UTM tags so site visits can be read from website analytics.
      </TruthNote>

      <section aria-labelledby="draft-heading" className="surface space-y-4 p-4 sm:p-5">
        <SectionHeading eyebrow="Draft" title="Write one post" description="Claims stay inside the approved Aurfy capability wording." />
        <div className="grid gap-3 sm:grid-cols-3">
          <Choice label="Channel" options={CHANNELS} value={channel} onChange={(value) => redraft({ channel: value })} />
          <Choice label="Angle" options={ANGLES.map((item) => ({ id: item.id, label: item.label }))} value={angle} onChange={(value) => redraft({ angle: value })} />
          <Choice label="Segment" options={SEGMENTS} value={segment} onChange={(value) => redraft({ segment: value })} />
        </div>
        <div>
          <Label htmlFor="social-hook" className="text-[12px]">
            Opening observation (optional)
          </Label>
          <Input
            id="social-hook"
            value={observation}
            onChange={(event) => setObservation(event.target.value)}
            onBlur={() => redraft({ observation })}
            placeholder="A pattern you saw, without naming a merchant"
            className="mt-1"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="social-text" className="text-[12px]">
              Post
            </Label>
            <span className={cn("font-mono text-[11px]", text.length > limit ? "text-destructive" : "text-muted-foreground")}>
              {text.length}/{limit}
            </span>
          </div>
          <Textarea id="social-text" value={text} onChange={(event) => setText(event.target.value)} rows={channel === "x" ? 4 : 9} className="mt-1" />
        </div>
        <Button
          type="button"
          className="w-full"
          disabled={!text.trim() || text.length > limit}
          onClick={() => {
            addPost({ channel, angle, segment, text });
            toast.success("Added to the content plan");
          }}
        >
          <Plus className="h-4 w-4" /> Add to content plan
        </Button>
      </section>

      <section aria-labelledby="results-heading">
        <SectionHeading
          eyebrow="What's working"
          title="Results by angle"
          description="Ranked by merchant engagers per posted post. Hand-entered numbers from a few posts are a hint, not a finding."
        />
        <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[560px] text-left text-[12px]">
            <thead className="font-mono-label text-[10px] text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-3 py-2">Angle</th>
                <th className="px-3 py-2 text-right">Posts</th>
                <th className="px-3 py-2 text-right">Impressions</th>
                <th className="px-3 py-2 text-right">Eng. rate</th>
                <th className="px-3 py-2 text-right">Site visits</th>
                <th className="px-3 py-2 text-right">Merchant engagers</th>
                <th className="px-3 py-2 text-right">To pipeline</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.angle} className={cn("border-b border-border/60 last:border-0", leader?.angle === row.angle && "bg-success-soft/40")}>
                  <td className="px-3 py-2 font-semibold text-foreground">
                    {row.label}
                    {leader?.angle === row.angle && ranked.length > 1 ? <span className="ml-2 text-[10px] font-semibold text-success">Leading</span> : null}
                  </td>
                  <td className="px-3 py-2 text-right">{row.posted}</td>
                  <td className="px-3 py-2 text-right">{row.impressions.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{pct(row.engagementRate)}</td>
                  <td className="px-3 py-2 text-right">{row.siteVisits}</td>
                  <td className="px-3 py-2 text-right">{row.merchantEngagers}</td>
                  <td className="px-3 py-2 text-right">{row.addedToPipeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="plan-heading">
        <SectionHeading
          eyebrow="Content plan"
          title={`${posts.length} post${posts.length === 1 ? "" : "s"}`}
          action={
            hasDemo ? (
              <Button type="button" variant="ghost" size="sm" onClick={clearDemo}>
                Clear demo posts
              </Button>
            ) : null
          }
        />
        {posts.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No posts yet. Draft one above.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {posts.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                onUpdate={(patch) => updatePost(post.id, patch)}
                onRemove={() => removePost(post.id)}
                onAddProspect={(name) => addProspect(post, name)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
