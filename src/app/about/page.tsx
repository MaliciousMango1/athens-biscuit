import Link from "next/link";

export const metadata = {
  title: "How It Works — Athens Biscuit",
  description:
    "How rankings are calculated on Athens Biscuit and the honest limits of anonymous voting.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl prose prose-amber">
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-amber-600 hover:text-amber-800"
      >
        &larr; Back to Leaderboard
      </Link>

      <h1 className="text-3xl font-bold text-amber-900">How It Works</h1>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-amber-900">Ranking</h2>
        <p className="mt-2 text-amber-800">
          Every voter picks their <strong>top 5 biscuit restaurants</strong> in
          Athens and ranks them 1 through 5. Each position is worth points:
        </p>
        <ul className="mt-2 text-amber-800">
          <li>#1 = 5 points</li>
          <li>#2 = 4 points</li>
          <li>#3 = 3 points</li>
          <li>#4 = 2 points</li>
          <li>#5 = 1 point</li>
        </ul>
        <p className="mt-2 text-amber-800">
          You can also tag your favorite biscuit type at each place (sausage,
          chicken, gravy, etc.) — that powers the category leaderboards like
          &ldquo;Best Sausage Biscuit.&rdquo;
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-amber-900">
          Bayesian Average
        </h2>
        <p className="mt-2 text-amber-800">
          A raw average is misleading when vote counts vary. A place with a
          single 5-point vote shouldn&apos;t beat a place averaging 4.8 across
          fifty voters. So we use a{" "}
          <strong>Bayesian average</strong> — the same idea as IMDb&apos;s top
          films list.
        </p>
        <p className="mt-2 text-amber-800">
          The formula is:{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-sm">
            score = (v / (v + m)) × R + (m / (v + m)) × C
          </code>
        </p>
        <ul className="mt-2 text-amber-800 text-sm">
          <li>
            <strong>R</strong> = the restaurant&apos;s raw average score
          </li>
          <li>
            <strong>v</strong> = how many ballots include that restaurant
          </li>
          <li>
            <strong>C</strong> = the global average score across all places
          </li>
          <li>
            <strong>m</strong> = a confidence threshold (currently 5)
          </li>
        </ul>
        <p className="mt-2 text-amber-800">
          In plain English: a restaurant with few votes gets pulled toward the
          community average until enough people weigh in. Once it has many
          votes, the formula just trusts its actual average. This keeps
          low-sample flukes from topping the leaderboard.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-amber-900">
          Anonymous Voting
        </h2>
        <p className="mt-2 text-amber-800">
          You don&apos;t have to make an account to vote — re-visiting the
          site lets you update your existing picks instead of stacking new
          ones. A handful of other quiet guardrails are in place to deter
          casual ballot stuffing.
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-amber-300 bg-amber-100 p-4">
        <h2 className="text-xl font-semibold text-amber-900">
          The Honest Disclaimer
        </h2>
        <p className="mt-2 text-amber-900">
          <strong>
            This site is for fun. It is <em>not</em> scientific.
          </strong>{" "}
          Any anonymous ranking can be gamed by someone determined enough.
          The guardrails here make that harder, but they can&apos;t make it
          impossible.
        </p>
        <p className="mt-3 text-amber-900">
          So please take the leaderboard with a grain of salt. If a biscuit
          spot suddenly rockets to #1 overnight, maybe they&apos;re having a
          moment — or maybe someone&apos;s cousin works there. Same caveat
          as any online ranking.
        </p>
        <p className="mt-3 text-amber-900">
          <strong>Play nice. Vote honestly.</strong> Nobody is monetizing
          this — it&apos;s just a fun tool to celebrate Athens biscuits. The
          results are only interesting if they reflect real opinions.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-amber-900">Missing a spot?</h2>
        <p className="mt-2 text-amber-800">
          Restaurants on the list are curated. If you know a great Athens
          biscuit spot that&apos;s missing, send it over using the{" "}
          <Link href="/suggest" className="font-semibold underline">
            suggestion form
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
