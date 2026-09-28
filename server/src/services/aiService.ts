import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  aiMedicineInfoRequestSchema,
  aiMedicineInfoResponseSchema,
  aiCompareExplanationRequestSchema,
  aiCompareExplanationResponseSchema,
  aiSafetyClassificationSchema,
} from '../validators/schemas.js';
import type { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const SYSTEM_PROMPT = `
You are MediCompare's Medicine Information Assistant.

Your role is to provide general, educational information about medicines and pharmacy-related terminology.

You are NOT a doctor, pharmacist, emergency service, or diagnostic system.

You may explain:
- General uses of a medicine
- Generic versus brand terminology
- Active ingredient terminology
- Dosage-form terminology
- General precaution categories
- Commonly documented side-effect categories
- General prescription terminology
- General price-comparison concepts

You MUST NOT:
- Diagnose a disease
- Diagnose a user's symptoms
- Recommend a medicine for a user's specific condition
- Tell a user to start, stop, or change medication
- Recommend personalized dosage
- Override a doctor's prescription
- Predict whether a medicine will work for a specific individual
- Provide emergency medical treatment instructions beyond advising the user to seek appropriate emergency care
- Claim that pharmacy price or inventory information is guaranteed to be current
- Invent medical facts
- Invent pharmacy prices
- Invent medicine availability
- Invent citations or sources

When information is uncertain, say so.

For prescription medicines, remind users that prescription requirements and medication decisions should be verified with a qualified healthcare professional or pharmacist.

If the user asks for personalized medical advice, explain that MediCompare cannot provide that advice and recommend consulting an appropriate healthcare professional.

Use concise, clear, non-alarming language.

Always distinguish:
1. General medicine information
2. User-specific medical advice

Only provide category-level information when personalized medical advice would otherwise be implied.

The goal is education and transparency, not diagnosis or treatment.
`;

const MANDATORY_DISCLAIMER =
  'Information provided by MediCompare is for general informational and educational purposes only and is not medical advice. Prescription requirements, dosage, and suitability must be verified with a qualified doctor or licensed pharmacist.';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/**
 * Evaluates whether a user prompt contains personal medical queries, diagnosis attempts,
 * or medication change requests.
 */
export function classifyPromptSafety(input: string): z.infer<typeof aiSafetyClassificationSchema> {
  const text = input.toLowerCase();

  // Emergency triggers
  const emergencyKeywords = ['emergency', 'chest pain', 'unconscious', 'overdose', 'poison', 'severe bleeding', 'difficulty breathing', 'suicide'];
  if (emergencyKeywords.some((k) => text.includes(k))) {
    return {
      category: 'emergency',
      allowed: false,
      reason: 'This appears to be an urgent medical situation. Please call local emergency services immediately (112 / 102 / 911) or visit the nearest emergency room.',
    };
  }

  // Diagnosis triggers
  const diagnosisKeywords = [
    'do i have', 'what disease', 'diagnose me', 'my symptoms are', 'i have fever and cough',
    'why is my stomach hurting', 'could it be cancer', 'tell me what illness'
  ];
  if (diagnosisKeywords.some((k) => text.includes(k))) {
    return {
      category: 'diagnosis',
      allowed: false,
      reason: 'MediCompare cannot interpret symptoms or provide a medical diagnosis. Please consult a qualified physician or healthcare clinic.',
    };
  }

  // Medication change / personalized dosage triggers
  const changeKeywords = [
    'should i take', 'can i take double', 'should i stop taking', 'stop taking my',
    'increase my dose', 'decrease my dose', 'how much should i give my child', 'prescribe me',
    'can i drink alcohol with this', 'is this safe for my pregnancy'
  ];
  if (changeKeywords.some((k) => text.includes(k))) {
    return {
      category: 'medication_change',
      allowed: false,
      reason: 'MediCompare cannot recommend initiating, altering, or stopping medications or personal dosages. Please consult your prescribing doctor or pharmacist.',
    };
  }

  return {
    category: 'general_information',
    allowed: true,
    reason: 'General educational question permitted.',
  };
}

/**
 * Returns structured medicine info via Gemini or structured fallback
 */
export async function getMedicineInformation(
  params: z.infer<typeof aiMedicineInfoRequestSchema>
): Promise<z.infer<typeof aiMedicineInfoResponseSchema>> {
  // Check safety of user's custom question if present
  if (params.userQuestion) {
    const safety = classifyPromptSafety(params.userQuestion);
    if (!safety.allowed) {
      return {
        medicineName: params.medicineName,
        summary: safety.reason,
        activeIngredient: 'N/A',
        commonUses: ['Consult a licensed medical practitioner for personalized assessment.'],
        precautionCategories: ['Individual clinical assessment required'],
        commonSideEffectCategories: ['Information restricted for safety'],
        prescriptionRequired: null,
        safetyNotice: MANDATORY_DISCLAIMER,
      };
    }
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `
        Provide general educational information about the supplied medicine.
        Medicine: ${params.medicineName}
        ${params.strength ? `Strength: ${params.strength}` : ''}
        ${params.dosageForm ? `Dosage Form: ${params.dosageForm}` : ''}
        ${params.userQuestion ? `User Question: ${params.userQuestion}` : ''}

        Explain:
        - Generic / active ingredient information
        - Common general uses
        - Dosage-form explanation
        - General precaution categories
        - Commonly documented side-effect categories
        - Prescription status only if known from supplied data

        Do not provide personalized medical advice.
        Do not recommend dosage changes.
        Do not diagnose.
        Do not invent facts.

        Return ONLY a valid JSON object matching this schema:
        {
          "medicineName": "string",
          "summary": "string",
          "activeIngredient": "string",
          "commonUses": ["string"],
          "precautionCategories": ["string"],
          "commonSideEffectCategories": ["string"],
          "prescriptionRequired": boolean or null,
          "safetyNotice": "string"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      parsed.safetyNotice = MANDATORY_DISCLAIMER;
      return aiMedicineInfoResponseSchema.parse(parsed);
    } catch (err) {
      console.warn('Gemini request failed, falling back to local educational knowledge base:', (err as Error).message);
    }
  }

  // Local structured educational fallback
  return getFallbackMedicineInfo(params.medicineName, params.strength, params.dosageForm);
}

/**
 * Extracts medicine formulation names from an uploaded prescription image/document
 */
export async function extractPrescriptionMedicines(
  fileBuffer: Buffer,
  mimeType: string
): Promise<{
  medicines: Array<{
    name: string;
    strength?: string;
    dosageForm?: string;
    frequency?: string;
  }>;
  doctorNotes?: string;
  disclaimer: string;
}> {
  const ai = getGeminiClient();

  if (ai) {
    try {
      const base64Image = fileBuffer.toString('base64');
      const prompt = `
        Analyze this prescription document and extract any prescribed medications.
        For each medication, identify:
        - name: The brand or generic name of the medicine
        - strength: e.g. "500 mg", "650 mg", "40 mg" (if visible)
        - dosageForm: e.g. "Tablet", "Capsule", "Syrup", "Injection" (if visible)
        - frequency: e.g. "Once daily", "Twice daily" (if visible)

        DO NOT make medical recommendations or diagnoses.
        Return ONLY a JSON object matching this schema:
        {
          "medicines": [
            {
              "name": "string",
              "strength": "string",
              "dosageForm": "string",
              "frequency": "string"
            }
          ],
          "doctorNotes": "string (general advice on the prescription if visible)"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Image,
                  mimeType: mimeType,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      return {
        medicines: parsed.medicines || [],
        doctorNotes: parsed.doctorNotes,
        disclaimer: MANDATORY_DISCLAIMER,
      };
    } catch (err: any) {
      console.warn('[Gemini Vision] Prescription analysis failed:', err.message);
    }
  }

  // Fallback if AI not reachable
  return {
    medicines: [],
    doctorNotes: 'Prescription uploaded successfully. You can search directly for your medicine name to compare pharmacy prices.',
    disclaimer: MANDATORY_DISCLAIMER,
  };
}

/**
 * Returns structured explanation of price variance
 */
export async function getPriceComparisonExplanation(
  params: z.infer<typeof aiCompareExplanationRequestSchema>
): Promise<z.infer<typeof aiCompareExplanationResponseSchema>> {
  const prices = params.prices.map((p) => p.price);
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  const absoluteDifference = Number((highestPrice - lowestPrice).toFixed(2));
  const percentageDifference = highestPrice > 0 ? Number(((absoluteDifference / highestPrice) * 100).toFixed(1)) : 0;

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `
        Explain the numerical price difference for ${params.medicine} across pharmacies in a neutral manner.
        Lowest price: ₹${lowestPrice}
        Highest price: ₹${highestPrice}
        Absolute difference: ₹${absoluteDifference}
        Percentage difference: ${percentageDifference}%
        Pharmacy list: ${JSON.stringify(params.prices)}

        Do not recommend a pharmacy.
        Do not claim that the lowest price is automatically the best option.
        Do not invent information.

        Return ONLY a JSON object matching:
        {
          "lowestPrice": number,
          "highestPrice": number,
          "absoluteDifference": number,
          "percentageDifference": number,
          "explanation": "string"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      return aiCompareExplanationResponseSchema.parse(parsed);
    } catch (err) {
      console.warn('Gemini price explanation failed, generating local calculation explanation:', (err as Error).message);
    }
  }

  // Local calculation explanation
  const explanation =
    percentageDifference > 0
      ? `Across the ${params.prices.length} surveyed pharmacies, prices for ${params.medicine} range from ₹${lowestPrice.toFixed(2)} to ₹${highestPrice.toFixed(2)}. This reflects a potential price variance of ₹${absoluteDifference.toFixed(2)} (${percentageDifference}% difference). Variations often stem from differences between generic and branded formulations, retail margins, or distributor terms. Consumers should verify stock and shelf-life directly before purchase.`
      : `All surveyed pharmacies currently list ${params.medicine} at a uniform price of ₹${lowestPrice.toFixed(2)}.`;

  return {
    lowestPrice,
    highestPrice,
    absoluteDifference,
    percentageDifference,
    explanation,
  };
}

/**
 * Standard structured local knowledge base for common medicines
 */
function getFallbackMedicineInfo(
  name: string,
  strength?: string,
  dosageForm?: string
): z.infer<typeof aiMedicineInfoResponseSchema> {
  const lower = name.toLowerCase();

  if (lower.includes('paracetamol') || lower.includes('dolo') || lower.includes('crocin') || lower.includes('calpol')) {
    return {
      medicineName: name,
      summary: 'Paracetamol (Acetaminophen) is a widely used antipyretic and analgesic medication used to relieve mild-to-moderate pain and reduce fever.',
      activeIngredient: 'Paracetamol / Acetaminophen IP',
      commonUses: ['Temporary relief of mild-to-moderate headache and body ache', 'Reduction of fever', 'Post-immunization fever management'],
      precautionCategories: ['Liver function monitoring (avoid exceeding recommended daily maximum of 4000 mg)', 'Avoid alcohol consumption while taking paracetamol', 'Check combination cold medicines to avoid accidental duplicate intake'],
      commonSideEffectCategories: ['Rare when used within recommended dosage', 'Potential allergic skin reactions', 'Gastrointestinal upset at higher doses'],
      prescriptionRequired: false,
      safetyNotice: MANDATORY_DISCLAIMER,
    };
  }

  if (lower.includes('pantoprazole') || lower.includes('pan-d') || lower.includes('pan 40')) {
    return {
      medicineName: name,
      summary: 'Pantoprazole is a proton pump inhibitor (PPI) that reduces the amount of acid produced in the stomach.',
      activeIngredient: 'Pantoprazole Sodium IP',
      commonUses: ['Gastroesophageal reflux disease (GERD)', 'Stomach and duodenal ulcers', 'Prevention of NSAID-induced gastric irritation'],
      precautionCategories: ['Take 30 to 60 minutes before breakfast as directed', 'Long-term use may affect magnesium and vitamin B12 absorption', 'Do not crush or chew gastro-resistant tablets'],
      commonSideEffectCategories: ['Headache', 'Mild diarrhea or abdominal pain', 'Flatulence or nausea'],
      prescriptionRequired: true,
      safetyNotice: MANDATORY_DISCLAIMER,
    };
  }

  if (lower.includes('metformin') || lower.includes('glycomet')) {
    return {
      medicineName: name,
      summary: 'Metformin is a biguanide antidiabetic medication that lowers blood glucose levels by decreasing hepatic glucose production and improving insulin sensitivity.',
      activeIngredient: 'Metformin Hydrochloride IP',
      commonUses: ['Management of type 2 diabetes mellitus', 'Adjunct to diet and exercise to improve glycemic control'],
      precautionCategories: ['Regular renal function testing is required', 'Take with or after meals to minimize digestive side effects', 'Temporarily withhold before radiographic iodinated contrast procedures'],
      commonSideEffectCategories: ['Mild gastrointestinal symptoms (nausea, abdominal bloating, loose stools)', 'Metallic taste in mouth during initial therapy'],
      prescriptionRequired: true,
      safetyNotice: MANDATORY_DISCLAIMER,
    };
  }

  if (lower.includes('cetirizine') || lower.includes('cetzine') || lower.includes('okacet')) {
    return {
      medicineName: name,
      summary: 'Cetirizine is a second-generation antihistamine that selectively blocks peripheral H1 receptors to alleviate allergic symptoms.',
      activeIngredient: 'Cetirizine Dihydrochloride IP',
      commonUses: ['Allergic rhinitis (hay fever, sneezing, runny nose)', 'Chronic idiopathic urticaria (itchy hives and skin rash)', 'Allergic conjunctivitis'],
      precautionCategories: ['May cause mild drowsiness in some individuals; exercise caution when driving', 'Avoid concurrent use with sedatives or alcohol', 'Dose adjustment may be advised for renal impairment'],
      commonSideEffectCategories: ['Mild fatigue or sleepiness', 'Dry mouth', 'Headache'],
      prescriptionRequired: false,
      safetyNotice: MANDATORY_DISCLAIMER,
    };
  }

  // Generic fallback for any other medicine
  return {
    medicineName: name,
    summary: `${name}${strength ? ` (${strength})` : ''} is a pharmaceutical formulation${dosageForm ? ` available as a ${dosageForm}` : ''}. Consult the prescribing physician or pharmacist for clinical indications and dosage guidelines.`,
    activeIngredient: `${name} Active Formulation`,
    commonUses: ['Consult packaging insert and prescribing doctor for specific therapeutic indications.'],
    precautionCategories: ['Always verify prescription status with a licensed pharmacist', 'Store in a cool, dry place away from direct sunlight', 'Keep out of reach of children'],
    commonSideEffectCategories: ['Report any unexpected allergic reactions or discomfort to a healthcare provider.'],
    prescriptionRequired: null,
    safetyNotice: MANDATORY_DISCLAIMER,
  };
}
