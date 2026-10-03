import { ReactNode } from "react";
import { Link } from "react-router-dom";

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL ?? "contact@streetpulse.example";
const UPDATED = "3 October 2026";

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold tracking-tight">StreetPulse</Link>
          <Link to="/login" className="text-sm text-slate-300 hover:text-white">Sign in</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-10 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="text-slate-500">Last updated: {UPDATED}</p>
        {children}
        <p className="border-t pt-4 text-slate-500">Questions: <a className="underline" href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
      </main>
    </div>
  );
}

const H = ({ children }: { children: ReactNode }) => <h2 className="pt-2 text-lg font-semibold text-slate-900">{children}</h2>;

export function Privacy() {
  return (
    <Page title="Privacy policy">
      <p>This policy explains what personal data StreetPulse collects when you report or track road and street issues, how it is used, and the choices you have. It is written to align with India's Digital Personal Data Protection Act, 2023.</p>
      <H>Data we collect</H>
      <ul className="list-inside list-disc space-y-1">
        <li>Account details: name, email address and a hashed password.</li>
        <li>Report content: photos or videos you upload, the issue description, and the latitude and longitude of the location you submit.</li>
        <li>Device location, only when you allow your browser to share it on the report form.</li>
        <li>Activity on your reports, such as confirmations of completed repairs.</li>
      </ul>
      <H>How we use it</H>
      <ul className="list-inside list-disc space-y-1">
        <li>To create and group reports, assign them to municipal teams and show repair progress.</li>
        <li>To analyse uploaded images with an automated vision service that suggests the issue type, severity and whether a repair appears complete. These suggestions support, and do not replace, human review.</li>
        <li>To secure the service and prevent misuse.</li>
      </ul>
      <H>What others can see</H>
      <p>Incident locations, photos, status and timelines are visible to other signed-in users so that duplicate reports can be avoided. Your email address and password are never shown to other citizens.</p>
      <H>Service providers</H>
      <p>Media may be stored with a cloud media provider, and images may be sent to an AI vision provider for analysis. Map tiles are loaded from OpenStreetMap, which receives your IP address when the map is displayed.</p>
      <H>Retention and your rights</H>
      <p>Reports form a public repair record and are kept while the issue is relevant. You may ask us to access, correct or delete your account data by emailing the address below. Where a report is part of an official repair record, we may anonymise it instead of deleting it.</p>
      <H>Photos of people and vehicles</H>
      <p>Do not upload images that identify individuals or vehicle number plates. We may remove such content.</p>
    </Page>
  );
}

export function Terms() {
  return (
    <Page title="Terms and conditions">
      <p>By creating an account or using StreetPulse you agree to these terms.</p>
      <H>The service</H>
      <p>StreetPulse lets residents report road and street issues and track their repair. StreetPulse is not an emergency service. For immediate danger, contact the police or the relevant emergency number.</p>
      <H>Your responsibilities</H>
      <ul className="list-inside list-disc space-y-1">
        <li>Submit accurate reports and genuine photographs taken at the reported location.</li>
        <li>Do not upload unlawful, offensive or misleading content, or content you do not have the right to share.</li>
        <li>Keep your login credentials confidential and do not share your account.</li>
        <li>Do not attempt to disrupt, scrape or gain unauthorised access to the service.</li>
      </ul>
      <H>Content you submit</H>
      <p>You keep ownership of your photos and text. You grant StreetPulse and the municipal teams using it a non-exclusive licence to store, display and process them to run the service and keep the repair record.</p>
      <H>Automated analysis</H>
      <p>Issue type, severity and repair-verification results from automated analysis are suggestions only and may be wrong. Final decisions are made by municipal staff and administrators.</p>
      <H>No guarantee of repair</H>
      <p>Submitting a report does not guarantee that a repair will be made or any timeline for it. StreetPulse is provided as is, and to the extent permitted by law we are not liable for losses arising from its use or unavailability.</p>
      <H>Suspension and changes</H>
      <p>We may suspend accounts that breach these terms. We may update these terms and will change the date above when we do. Continued use means you accept the updated terms. These terms are governed by the laws of India.</p>
    </Page>
  );
}
