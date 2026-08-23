export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink-900">About this site</h1>

      <div className="prose-block mt-6 space-y-4 text-ink-700">
        <p>
          The GA-08 Civic Resource Hub is a free, independent guide to
          public and government resources for people living in
          Georgia&apos;s 8th Congressional District. It helps you find
          services like food assistance, housing help, health care,
          veterans benefits, and more — and points you to your
          Congressman&apos;s official work in Congress.
        </p>

        <p>
          <strong>This site is unofficial.</strong> It is not created,
          run, or endorsed by Rep. Austin Scott&apos;s office, the U.S.
          House of Representatives, or the State of Georgia. It is a
          civic-information project. We link directly to official agency
          websites and phone numbers so you can always verify what you
          read here.
        </p>

        <h2 className="text-xl font-bold text-ink-900">
          How we choose what to list
        </h2>
        <p>
          Every resource in our directory comes from a real public or
          government agency. We record when we last checked each listing
          (&ldquo;last verified&rdquo;) and link to the agency&apos;s own
          page so you can double-check hours, eligibility, and contact
          details before you rely on them.
        </p>

        <h2 className="text-xl font-bold text-ink-900">Your privacy</h2>
        <p>
          The guided help tool does not ask for your name, and you do not
          need to create an account to search resources or use guided
          help. We keep anonymous records of the questions the guide asks
          (not who asked them) so we can improve it over time.
        </p>

        <h2 className="text-xl font-bold text-ink-900">
          The representative section
        </h2>
        <p>
          Information about Rep. Scott&apos;s committee work and
          legislation is pulled from the official Congress.gov API and
          presented factually, without editorializing. This is not a
          campaign or fundraising site.
        </p>

        <h2 className="text-xl font-bold text-ink-900">In a crisis</h2>
        <p>
          If you or someone you know is in emotional distress or a
          safety crisis, call or text{" "}
          <a href="tel:988">988</a> (Suicide &amp; Crisis Lifeline) or
          call 911 for emergencies. This site is not a substitute for
          emergency or medical care.
        </p>
      </div>
    </div>
  );
}
