import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { THEME_CONFIG, CardTheme } from "@/lib/types";
import {
  Sparkles,
  Lock,
  ExternalLink,
  Download,
  FileText,
  Clock,
  User as UserIcon,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { format } from "date-fns";
import { SharedCardView } from "@/components/cards/SharedCardView";

interface SharePageProps {
  params: {
    token: string;
  };
}

export async function generateMetadata({ params }: SharePageProps) {
  const card = await db.card.findUnique({
    where: { shareToken: params.token },
    select: { title: true, isPublic: true },
  });

  if (!card || !card.isPublic) {
    return {
      title: "Shared Card - LifeVault",
    };
  }

  return {
    title: `${card.title} - Shared on LifeVault`,
    description: `View "${card.title}" notes, files, and study resources shared via LifeVault.`,
  };
}

export default async function SharedCardPage({ params }: SharePageProps) {
  const card = await db.card.findUnique({
    where: { shareToken: params.token },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!card || !card.isPublic) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Private or Expired Card
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
          This resource card is either private or the owner has disabled public link sharing.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to LifeVault Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Banner for Classmates / Visitors */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Shared Resource Card
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {card.user?.name ? `Shared by ${card.user.name}` : "Shared privately via LifeVault"}
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all self-start sm:self-center"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Create Your Own Vault</span>
        </Link>
      </div>

      {/* Shared Card Interactive View */}
      <SharedCardView card={card} />
    </div>
  );
}
