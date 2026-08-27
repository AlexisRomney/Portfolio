import { redirect } from "next/navigation";

/** Ancienne route : la création de demande est désormais sur `/`. */
export default function NouvelleDemandeRedirectPage() {
  redirect("/gestion-demandes");
}
