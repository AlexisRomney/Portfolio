import { ThinkingLevel, Type } from "@google/genai";
import { parseAIAnalysis } from "@gd/lib/aiAnalysis";
import { parseControlDecision } from "@gd/lib/control";
import {
  parseRoutingDecision,
  validateAndEnrichRouting,
} from "@gd/lib/routing";
import {
  extractJsonObject,
  generateStructuredJson,
} from "@gd/services/aiProvider";
import type { AIAnalysis } from "@gd/types/aiAnalysis";
import type { ControlDecision } from "@gd/types/control";
import type { RoutingDecision } from "@gd/types/routing";
import { AI_PRIORITIES, AI_SENTIMENTS } from "@gd/types/aiAnalysis";
import { ASSIGNEE_TYPES, DEPARTMENTS } from "@gd/types/routing";
import {
  TICKET_CATEGORIES,
  type TicketStatus,
} from "@gd/types/ticket";

export const ANALYSIS_SYSTEM_PROMPT = `Tu es un assistant de tri de demandes clients pour une PME.
Tu analyses le message d'un demandeur et tu renvoies UNIQUEMENT un objet JSON valide, sans markdown, sans commentaire et sans texte autour.

Format JSON obligatoire :
{
  "category": "IT" | "Facturation" | "Commercial" | "Support" | "Administratif" | "Technique" | "Autre",
  "subcategory": "sous-catégorie courte ou null",
  "priority": "high" | "medium" | "low",
  "sentiment": "positive" | "neutral" | "negative",
  "summary": "résumé en une phrase",
  "action": "action administrative recommandée",
  "useful_information": ["faits exploitables extraits du message"]
}

Règles de catégorie :
- IT : accès compte, connexion, VPN, infrastructure, blocage système
- Facturation : factures, paiements, remboursements, montants
- Commercial : devis, licences, offres, partenariats
- Support : assistance utilisateur générale, mot de passe, usage produit
- Administratif : contrats, attestations, documents, RGPD
- Technique : bugs applicatifs, performances, intégrations techniques
- Autre : uniquement si aucune catégorie ne convient

Exemples de sous-catégories :
- Accès / Compte
- Mot de passe
- Demande de devis
- Facture
- Remboursement
- Incident technique

Règles de priorité :
- high : blocage, urgence explicite, interruption de service, problème financier important, intervention rapide nécessaire
- medium : intervention nécessaire sans urgence particulière
- low : information, demande générale, non urgente, suggestion

Règles de sentiment :
- positive : satisfaction, remerciement, retour positif
- neutral : demande factuelle, question, sans émotion particulière
- negative : plainte, frustration, mécontentement, ton négatif

Ne jamais inventer une valeur hors des listes autorisées pour category, priority et sentiment.
Le résumé, l'action et la sous-catégorie doivent être en français, concis et utiles.
Si aucune sous-catégorie claire n'existe, renvoie null.

useful_information :
- Liste courte de faits réellement présents dans le message (entreprise, échéance, contrainte, produit, n° mentionné, etc.)
- Ne jamais inventer une information absente
- Si rien d'exploitable : tableau vide []`;

export const ROUTING_SYSTEM_PROMPT = `Tu es un agent de décision et de routage pour une PME.
Tu reçois une analyse IA déjà réalisée.
Tu ne refais PAS l'analyse.
Tu détermines uniquement le service métier. L'application attribue ensuite
elle-même un collaborateur actif de ce service par rotation.
Tu ne choisis et n'inventes JAMAIS de nom ou d'identifiant de collaborateur.
Tu renvoies UNIQUEMENT un objet JSON valide, sans markdown, sans commentaire et sans texte autour.

Format JSON obligatoire :
{
  "department": "IT Support" | "Facturation" | "Comptabilité" | "Commercial" | "Administratif" | "Ressources humaines" | "Support Client" | "Direction",
  "assignee_type": "support_team" | "billing_team" | "sales_team" | "admin_team" | "hr_team" | "management" | "human_review",
  "routing_reason": "raison courte du routage",
  "recommended_action": "action métier concrète à effectuer",
  "escalation": true | false,
  "escalation_reason": "raison de l'escalade ou null"
}

Règles de routage (department) :
- IT Support : connexion, compte, mot de passe, logiciel, matériel, panne, accès, bug technique IT
- Facturation : facture, paiement, remboursement, prélèvement, montant facturé
- Comptabilité : demande comptable interne qui ne relève pas directement de la facturation
- Commercial : devis, prix, licences, offre, produit, rendez-vous commercial
- Ressources humaines : congés, absences, paie RH, contrat de travail, onboarding RH
- Administratif : documents, contrats hors RH, informations administratives, procédures internes
- Support Client : utilisation produit/service, problème client hors IT, assistance générale
- Direction : uniquement si décision managériale réelle ou enjeu important

Correspondance assignee_type :
- IT Support → support_team
- Comptabilité / Facturation → billing_team
- Commercial → sales_team
- Ressources humaines → hr_team
- Administratif → admin_team
- Support Client → support_team
- Direction → management
- Si ambigu / insuffisant / multi-services / risque / décision non fiable → assignee_type = human_review
  (department reste le plus probable, ou Support Client si vraiment indéterminé)

Escalade :
- escalation = true si priorité high, impact activité important, délai très court, décision humaine nécessaire, situation sensible/ambiguë
- Une priorité high n'implique PAS automatiquement Direction
- Exemple : urgence IT → department = IT Support + escalation = true éventuelle
- Si escalation = false, escalation_reason = null
- Si escalation = true, escalation_reason obligatoire et en français

Textes en français, concis et utiles.
Ne jamais inventer une valeur hors des listes autorisées.`;

export const CONTROL_SYSTEM_PROMPT = `Tu es un agent de contrôle et de validation IA pour une PME.
Tu vérifies le travail des autres agents (analyse, routage, réponse) AVANT toute automatisation.
Tu ne modifies PAS directement les décisions existantes : tu signales, notes et proposes des corrections.
Tu renvoies UNIQUEMENT un objet JSON valide, sans markdown, sans commentaire et sans texte autour.

Format JSON obligatoire :
{
  "approved": true | false,
  "score": 0.0 à 1.0,
  "issues": ["problèmes importants"],
  "warnings": ["avertissements mineurs"],
  "requires_human_review": true | false,
  "review_reason": "raison ou null",
  "corrected_priority": "high" | "medium" | "low" | null,
  "corrected_department": "IT Support" | "Facturation" | "Comptabilité" | "Commercial" | "Administratif" | "Ressources humaines" | "Support Client" | "Direction" | null,
  "corrected_action": "action corrigée ou null",
  "control_summary": "résumé court du contrôle"
}

Tu dois vérifier :
1. cohérence analyse ↔ demande
2. cohérence de la catégorie
3. justification de la priorité
4. cohérence du service choisi et de l'affectation applicative
5. cohérence de la réponse avec le contexte et l'historique éventuel
6. exactitude (pas d'informations inventées)
7. pertinence et ton adapté
8. action cohérente
9. aucune promesse non garantie
10. nécessité d'une intervention humaine

Règles :
- approved = true seulement si le résultat est suffisamment fiable pour une future automatisation
- approved = false si problème important, contradiction, hallucination ou promesse non garantie
- requires_human_review = true si ambiguïté, infos insuffisantes, multi-services, sujet sensible, affirmation non vérifiable, contradictions entre agents, ou action importante
- Si requires_human_review = true → approved = false en général, et review_reason obligatoire
- Si escalation = true et priority = high, vérifier que la demande le justifie vraiment (ne pas valider automatiquement)
- corrected_* uniquement si clairement incorrect ; sinon null
- Ne pas inventer de corrections inutiles
- Textes en français, concis
- score est un indicateur (pas une vérité mathématique)`;

export const RESPONSE_SYSTEM_PROMPT = `Tu es un assistant chargé de préparer des réponses professionnelles aux demandes reçues par une PME.

Tu rédiges un message destiné AU DEMANDEUR (client, prospect ou collaborateur), pas au personnel interne.

Tu peux recevoir l'historique de conversation : tiens-en compte pour répondre au dernier message sans répéter inutilement ce qui a déjà été dit.

Règles :
- Le statut actuel est fourni explicitement dans le contexte et détermine l'intention du message :
  - new : confirmer uniquement la prise en compte ; ne jamais prétendre que la demande est traitée ou résolue.
  - in_progress : indiquer que le traitement est en cours ; ne jamais prétendre que la demande est résolue.
  - pending : indiquer que le traitement est en attente, sans inventer la cause de cette attente.
  - resolved : rédiger une réponse finale de clôture indiquant que la demande a été traitée et est maintenant résolue.
- Si le statut est resolved, ne rédige jamais une simple réponse de prise en charge ou une promesse de traitement futur.
- Même avec le statut resolved, n'invente jamais COMMENT le problème a été résolu. Mentionne un détail de résolution uniquement s'il figure explicitement dans la demande ou l'historique.
- Réponds directement au problème exprimé (surtout le dernier message client).
- Sois professionnel, clair, concis et naturel.
- Adapte le ton à la priorité et au sentiment.
- Fais preuve d'empathie si le sentiment est négatif, sans familiarité excessive.
- Reconnais l'urgence si la priorité est high, sans dramatiser.
- Pour une demande commerciale, sois orienté service.
- Pour une réclamation, reconnais le problème et indique la prochaine étape.
- N'invente aucune information (nom, délai, montant, statut technique, politique).
- Si une information est inconnue, ne la fabrique pas.
- Ne promets jamais une action déjà réalisée ou garantie si elle ne l'est pas.
- N'utilise pas le résumé technique ni l'action interne comme texte de réponse.
- L'action recommandée est une instruction INTERNE : t'en servir uniquement pour orienter la réponse, jamais la copier telle quelle.
- Tu peux mentionner le service ou le responsable uniquement s'ils sont fournis dans le contexte.
- Ne dis jamais : « votre ticket a été classifié » ou des formulations robotiques.
- Respecte strictement la langue de sortie demandée dans l'instruction prioritaire et le champ outputLanguage du contexte.
- Signe de façon générique : « Cordialement,\\nL'équipe Support » (ou l'équipe adaptée : Support, Commercial, Facturation…).

Tu renvoies UNIQUEMENT un objet JSON valide :
{
  "response": "texte complet de la réponse au demandeur"
}`;

const ANALYSIS_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      enum: [...TICKET_CATEGORIES],
    },
    subcategory: {
      type: Type.STRING,
      nullable: true,
    },
    priority: {
      type: Type.STRING,
      enum: [...AI_PRIORITIES],
    },
    sentiment: {
      type: Type.STRING,
      enum: [...AI_SENTIMENTS],
    },
    summary: { type: Type.STRING },
    action: { type: Type.STRING },
    useful_information: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    "category",
    "subcategory",
    "priority",
    "sentiment",
    "summary",
    "action",
    "useful_information",
  ],
  propertyOrdering: [
    "category",
    "subcategory",
    "priority",
    "sentiment",
    "summary",
    "action",
    "useful_information",
  ],
};

const ROUTING_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    department: {
      type: Type.STRING,
      enum: [...DEPARTMENTS],
    },
    assignee_type: {
      type: Type.STRING,
      enum: [...ASSIGNEE_TYPES],
    },
    routing_reason: { type: Type.STRING },
    recommended_action: { type: Type.STRING },
    escalation: { type: Type.BOOLEAN },
    escalation_reason: {
      type: Type.STRING,
      nullable: true,
    },
  },
  required: [
    "department",
    "assignee_type",
    "routing_reason",
    "recommended_action",
    "escalation",
    "escalation_reason",
  ],
  propertyOrdering: [
    "department",
    "assignee_type",
    "routing_reason",
    "recommended_action",
    "escalation",
    "escalation_reason",
  ],
};

const CONTROL_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    approved: { type: Type.BOOLEAN },
    score: { type: Type.NUMBER },
    issues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    requires_human_review: { type: Type.BOOLEAN },
    review_reason: {
      type: Type.STRING,
      nullable: true,
    },
    corrected_priority: {
      type: Type.STRING,
      nullable: true,
    },
    corrected_department: {
      type: Type.STRING,
      nullable: true,
    },
    corrected_action: {
      type: Type.STRING,
      nullable: true,
    },
    control_summary: { type: Type.STRING },
  },
  required: [
    "approved",
    "score",
    "issues",
    "warnings",
    "requires_human_review",
    "review_reason",
    "corrected_priority",
    "corrected_department",
    "corrected_action",
    "control_summary",
  ],
  propertyOrdering: [
    "approved",
    "score",
    "issues",
    "warnings",
    "requires_human_review",
    "review_reason",
    "corrected_priority",
    "corrected_department",
    "corrected_action",
    "control_summary",
  ],
};

const CUSTOMER_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    response: { type: Type.STRING },
  },
  required: ["response"],
  propertyOrdering: ["response"],
};

/**
 * Analyse une demande (Gemini, fallback OpenRouter si indisponible).
 * À utiliser uniquement côté serveur.
 */
export async function analyzeRequestMessage(
  message: string,
  options?: { conversationHistory?: string },
): Promise<AIAnalysis> {
  const historyBlock = options?.conversationHistory?.trim()
    ? `\n\nHistorique de conversation (pour contexte) :\n${options.conversationHistory.trim()}`
    : "";

  const result = await generateStructuredJson({
    operation: "analyze-request",
    systemInstruction: ANALYSIS_SYSTEM_PROMPT,
    userContent: `Analyse le message suivant et renvoie uniquement le JSON demandé :\n\n${message}${historyBlock}`,
    temperature: 0.2,
    geminiSchema: ANALYSIS_RESPONSE_SCHEMA,
    schemaName: "analysis_response",
  });

  return parseAIAnalysis(extractJsonObject(result.text));
}

export type RouteRequestInput = {
  message: string;
  subject?: string;
  analysis: AIAnalysis;
};

/**
 * Décide le service, le collaborateur (parmi team_members) et l'action métier.
 * À utiliser uniquement côté serveur. N'exécute aucune action externe.
 */
export async function routeRequest(
  input: RouteRequestInput,
): Promise<RoutingDecision> {
  const context = {
    subject: input.subject ?? null,
    message: input.message,
    category: input.analysis.category,
    subcategory: input.analysis.subcategory,
    priority: input.analysis.priority,
    sentiment: input.analysis.sentiment,
    summary: input.analysis.summary,
    action: input.analysis.action,
    useful_information: input.analysis.usefulInformation,
  };

  const result = await generateStructuredJson({
    operation: "route-request",
    systemInstruction: ROUTING_SYSTEM_PROMPT,
    userContent: `À partir de l'analyse, décide le service métier et renvoie uniquement le JSON demandé :\n\n${JSON.stringify(context, null, 2)}`,
    temperature: 0.2,
    geminiSchema: ROUTING_RESPONSE_SCHEMA,
    schemaName: "routing_response",
  });

  const parsed = parseRoutingDecision(extractJsonObject(result.text));
  return validateAndEnrichRouting(parsed);
}

export type GenerateResponseInput = {
  requesterName: string;
  subject: string;
  message: string;
  analysis?: Partial<AIAnalysis> | null;
  status: TicketStatus;
  conversationHistory?: string;
  assigneeName?: string | null;
  department?: string | null;
  recommendedAction?: string | null;
  /** Réponse de clôture après résolution manuelle du ticket. */
  closingForResolution?: boolean;
  /** Langue explicite de la nouvelle réponse ; n'affecte aucun autre agent IA. */
  responseLanguage?: "fr" | "en";
  /** Modèles imposés (bancs d'essai) ; sinon la configuration réponse. */
  models?: { gemini?: string; openRouter?: string; groq?: string };
};

/** Modèles dédiés à la réponse client, choisis pour la latence. */
function responseModels(override?: GenerateResponseInput["models"]) {
  return {
    gemini:
      override?.gemini ??
      process.env.AI_RESPONSE_MODEL?.trim() ??
      "gemini-3.5-flash-lite",
    openRouter:
      override?.openRouter ?? process.env.AI_RESPONSE_FALLBACK_MODEL?.trim(),
    groq:
      override?.groq ??
      process.env.GROQ_RESPONSE_MODEL?.trim() ??
      "openai/gpt-oss-20b",
  };
}

/**
 * Génère une réponse professionnelle destinée au demandeur.
 * À utiliser uniquement côté serveur.
 */
export async function generateCustomerResponse(
  input: GenerateResponseInput,
): Promise<string> {
  const models = responseModels(input.models);
  const responseLanguage = input.responseLanguage ?? "en";
  const usefulInformation = input.analysis?.usefulInformation ?? [];
  // Prompt volontairement minimal : chaque champ vide est omis.
  const context = Object.fromEntries(
    Object.entries({
      requesterName: input.requesterName,
      subject: input.subject,
      latestCustomerMessage: input.message,
      currentStatus: input.status,
      conversationHistory: input.conversationHistory,
      category: input.analysis?.category,
      subcategory: input.analysis?.subcategory,
      priority: input.analysis?.priority,
      sentiment: input.analysis?.sentiment,
      summary: input.analysis?.summary,
      internalAction: input.analysis?.action,
      usefulInformation:
        usefulInformation.length > 0 ? usefulInformation : undefined,
      assigneeName: input.assigneeName,
      department: input.department,
      recommendedAction: input.recommendedAction,
      closingForResolution:
        input.closingForResolution === true || input.status === "resolved"
          ? true
          : undefined,
      outputLanguage: responseLanguage === "en" ? "English" : "Français",
    }).filter(([, value]) => value !== undefined && value !== null),
  );

  const closingInstruction =
    input.closingForResolution === true || input.status === "resolved"
      ? `\n\nInstruction prioritaire : currentStatus vaut "resolved". Rédige une réponse FINALE de clôture adaptée au dossier et à l'historique. Confirme que la demande concernant le sujet réel du ticket a été traitée et est maintenant résolue. Ne parle pas de prise en charge future. N'invente aucune action technique ni aucun détail sur la méthode de résolution qui ne figure pas explicitement dans le contexte. Invite sobrement le demandeur à recontacter l'équipe si nécessaire.`
      : "";
  const languageInstruction =
    responseLanguage === "en"
      ? "\n\nInstruction prioritaire de langue : Generate the customer response in English. Rédige l'intégralité de la réponse destinée au demandeur en anglais naturel, même si la demande ou l'historique est en français. Ne traduis pas les noms propres, références ni données fournies par le demandeur."
      : "\n\nInstruction prioritaire de langue : Générez la réponse client en français. Rédige l'intégralité de la réponse destinée au demandeur en français naturel, même si la demande ou l'historique est en anglais. Ne traduis pas les noms propres, références ni données fournies par le demandeur.";

  const result = await generateStructuredJson({
    operation: "generate-response",
    systemInstruction: RESPONSE_SYSTEM_PROMPT,
    userContent: `À partir du contexte suivant, rédige la réponse destinée au demandeur et renvoie uniquement le JSON demandé :${languageInstruction}${closingInstruction}\n\n${JSON.stringify(context)}`,
    temperature: 0.4,
    geminiSchema: CUSTOMER_RESPONSE_SCHEMA,
    schemaName: "customer_response",
    // Réponse client courte : la réflexion longue n'apporte rien et coûte cher.
    thinkingLevel: ThinkingLevel.MINIMAL,
    geminiModel: models.gemini,
    openRouterModel: models.openRouter,
    groqModel: models.groq,
  });

  const parsed = extractJsonObject(result.text) as { response?: unknown };
  if (typeof parsed.response !== "string" || !parsed.response.trim()) {
    throw new Error("INVALID_AI_RESPONSE");
  }

  return parsed.response.trim();
}

export type ControlRequestInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  analysis: AIAnalysis;
  routing: RoutingDecision | null;
  aiResponse: string | null;
};

/**
 * Contrôle la cohérence analyse / routage / réponse avant automatisation.
 * Ne modifie aucune décision : propose uniquement un avis structuré.
 * À utiliser uniquement côté serveur.
 */
export async function controlRequest(
  input: ControlRequestInput,
): Promise<ControlDecision> {
  const context = {
    request: {
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
    },
    analysis: {
      category: input.analysis.category,
      subcategory: input.analysis.subcategory,
      priority: input.analysis.priority,
      sentiment: input.analysis.sentiment,
      summary: input.analysis.summary,
      action: input.analysis.action,
    },
    routing: input.routing
      ? {
          department: input.routing.department,
          assignee_type: input.routing.assigneeType,
          routing_reason: input.routing.routingReason,
          recommended_action: input.routing.recommendedAction,
          escalation: input.routing.escalation,
          escalation_reason: input.routing.escalationReason,
        }
      : null,
    ai_response: input.aiResponse,
  };

  const result = await generateStructuredJson({
    operation: "control-request",
    systemInstruction: CONTROL_SYSTEM_PROMPT,
    userContent: `Contrôle le dossier suivant et renvoie uniquement le JSON demandé :\n\n${JSON.stringify(context, null, 2)}`,
    temperature: 0.1,
    geminiSchema: CONTROL_RESPONSE_SCHEMA,
    schemaName: "control_response",
  });

  return parseControlDecision(extractJsonObject(result.text));
}
