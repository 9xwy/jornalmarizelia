import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useActivePoll } from "@/hooks/use-site-content";
import { getTotalVotes, queryKeys, voteForPollOption } from "@/lib/content-api";
import type { Poll } from "@/types/content";

const WeeklyPoll = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useActivePoll();
  const [localPoll, setLocalPoll] = useState<Poll | null>(null);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);

  const poll = localPoll ?? data?.poll ?? null;
  const totalVotes = poll ? getTotalVotes(poll) : 0;
  const isClosed = Boolean(poll?.closesAt && new Date(poll.closesAt).getTime() <= Date.now());

  useEffect(() => {
    if (!data?.poll) {
      return;
    }

    setLocalPoll(data.poll);
    const savedVote = window.localStorage.getItem(`jm-vote-${data.poll.id}`);
    setVotedOptionId(savedVote);
  }, [data]);

  const voteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      if (!poll) {
        throw new Error("Enquete indisponivel.");
      }

      if (data?.source === "demo") {
        const nextPoll = {
          ...poll,
          options: poll.options.map((option) =>
            option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
          ),
        };
        setLocalPoll(nextPoll);
        return { source: "demo" as const, optionId };
      }

      const voterStorageKey = "jm-voter-token";
      let voterToken = window.localStorage.getItem(voterStorageKey);
      if (!voterToken) {
        voterToken = `${crypto.randomUUID()}-${Date.now()}`;
        window.localStorage.setItem(voterStorageKey, voterToken);
      }

      await voteForPollOption(poll.id, optionId, voterToken);
      return { source: data?.source === "temporary" ? ("temporary" as const) : ("supabase" as const), optionId };
    },
    onSuccess: async ({ source, optionId }) => {
      if (!poll) {
        return;
      }

      window.localStorage.setItem(`jm-vote-${poll.id}`, optionId);
      setVotedOptionId(optionId);

      if (source === "supabase" || source === "temporary") {
        await queryClient.invalidateQueries({ queryKey: queryKeys.poll });
      }

      toast.success("Voto registrado com sucesso.");
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message || "Nao foi possivel registrar o voto.");
    },
  });

  const handleVote = (optionId: string) => {
    if (!poll || votedOptionId || isClosed) {
      return;
    }

    voteMutation.mutate(optionId);
  };

  return (
    <section id="enquete" className="py-10 md:py-16">
      <div className="container max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-7 h-7 text-primary" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">Enquete da semana</h2>
        </div>
        <div className="newspaper-divider mb-6" />

        {isLoading && <div className="rounded-2xl border border-border bg-card h-44 animate-pulse" />}

        {!isLoading && error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 font-body text-sm text-destructive">
            Nao foi possivel carregar a enquete agora.
          </div>
        )}

        {!isLoading && !error && poll && (
          <>
            <p className="font-display text-lg font-semibold text-foreground mb-2">{poll.question}</p>
            <p className="font-body text-sm text-muted-foreground mb-6">{poll.description}</p>

            <div className="space-y-3">
              {poll.options.map((option) => {
                const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                const isVoted = votedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleVote(option.id)}
                    disabled={Boolean(votedOptionId) || voteMutation.isPending || isClosed}
                    className={`w-full text-left rounded-lg border p-4 transition-all font-body relative overflow-hidden ${
                      isVoted
                        ? "border-primary bg-primary/5"
                        : votedOptionId
                        ? "border-border bg-card"
                        : "border-border bg-card hover:border-primary hover:shadow-sm cursor-pointer"
                    }`}
                  >
                    {votedOptionId && (
                      <div
                        className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    )}
                    <div className="relative flex justify-between items-center gap-4">
                      <span className="font-medium text-sm">{option.label}</span>
                      {votedOptionId && <span className="font-semibold text-sm text-primary">{pct}%</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {votedOptionId && (
              <p className="text-center font-body text-xs text-muted-foreground mt-4">
                Obrigado pelo seu voto. Total atual: {totalVotes} votos
              </p>
            )}

            {isClosed && (
              <p className="text-center font-body text-xs text-muted-foreground mt-4">
                Esta enquete ja foi encerrada.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default WeeklyPoll;
