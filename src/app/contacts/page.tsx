import { redirect } from "next/navigation";

/**
 * `/contacts` was the original route. The list now lives at `/people` to
 * match the language used throughout the app (and the inspiration from
 * iOS Contacts). Keep the old URL working with a permanent redirect.
 */
export default function ContactsRedirect(): never {
  redirect("/people");
}
