export default function Accessibility() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink-900">
        Accessibility statement
      </h1>

      <div className="prose-block mt-6 space-y-4 text-ink-700">
        <p>
          We want everyone to be able to use this site — including people
          using screen readers, keyboard-only navigation, voice control,
          screen magnification, or a slow internet connection. We are
          building this site to meet{" "}
          <a
            href="https://www.w3.org/TR/WCAG22/"
            target="_blank"
            rel="noreferrer"
          >
            WCAG 2.2 Level AA
          </a>{" "}
          guidelines.
        </p>

        <h2 className="text-xl font-bold text-ink-900">
          What we do
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Every page can be used with only a keyboard.</li>
          <li>
            Text and background colors meet a 4.5:1 contrast ratio (or
            better) throughout the site.
          </li>
          <li>All images and icons that carry meaning have text labels.</li>
          <li>
            Forms — including the guided help wizard — have clear labels
            and error messages.
          </li>
          <li>
            Live chat and web voice controls are fully operable by
            keyboard and screen reader, with visible connection status at
            every step.
          </li>
          <li>
            Motion and animation respect your device&apos;s
            &ldquo;reduce motion&rdquo; setting.
          </li>
          <li>
            Content is written in plain language, aimed at a 6th–8th
            grade reading level.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-ink-900">Known limitations</h2>
        <p>
          This site is under active development. Some sections (guided
          help, live chat, web voice, the legislation table) are still
          being built — see the &ldquo;what&apos;s real vs. stubbed&rdquo;
          note in our project README for current status. We test with
          automated tools (axe) and manual keyboard/screen-reader passes,
          and we update this page as testing continues.
        </p>

        <h2 className="text-xl font-bold text-ink-900">
          Tell us about a problem
        </h2>
        <p>
          If you find something on this site that is hard to use, please
          let us know. (Contact method to be added once this project has
          an official maintainer inbox — see the README for current
          project status.)
        </p>
      </div>
    </div>
  );
}
