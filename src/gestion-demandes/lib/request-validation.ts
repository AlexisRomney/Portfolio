export type TicketFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type TicketFormErrors = Partial<Record<keyof TicketFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateTicketForm(
  values: TicketFormValues,
): TicketFormErrors {
  const errors: TicketFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Le nom est obligatoire.";
  }

  if (!values.email.trim()) {
    errors.email = "L'e-mail est obligatoire.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Veuillez saisir une adresse e-mail valide.";
  }

  if (!values.subject.trim()) {
    errors.subject = "Le sujet est obligatoire.";
  }

  if (!values.message.trim()) {
    errors.message = "Le message est obligatoire.";
  }

  return errors;
}

export function hasFormErrors(errors: TicketFormErrors): boolean {
  return Object.values(errors).some((value) => Boolean(value));
}
