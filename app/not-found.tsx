import Link from "next/link";

export default function NotFound() {
  return (
    <div className="hal-container wu-page">
      <header className="wu-intro">
        <h1 className="hal-headline">This page does not exist</h1>
        <p className="hal-lede">Ask your question from the start instead.</p>
        <Link href="/" className="hal-btn hal-btn--primary">
          Back to the start
        </Link>
      </header>
    </div>
  );
}
