export interface FormData {
  // Step 1
  projectName: string;
  whatItDoes: string;
  whoIsItFor: string;
  howItFeels: string;
  // Step 2
  primaryColour: string;
  secondaryColour: string;
  background: string;
  typography: string;
  spacing: string;
  borderRadius: string;
  aestheticReference: string;
  // Step 3
  buttonHierarchy: string;
  navigationPattern: string;
  usesCards: boolean | null;
  cardsDescription: string;
  formFields: string;
  iconStyle: string;
  // Step 4
  motion: string;
  uiResponseFeel: string;
  loadingStates: string;
  errorHandling: string;
  // Step 5
  copyTone: string;
  errorMessages: string;
  emptyStates: string;
  languageToAvoid: string;
  // Step 6
  antiPatterns: string;
  accessibility: string;
  deviceTarget: string;
  browserTargets: string;
  // Step 7
  freeForm: string;
}

export const initialFormData: FormData = {
  projectName: "",
  whatItDoes: "",
  whoIsItFor: "",
  howItFeels: "",
  primaryColour: "",
  secondaryColour: "",
  background: "",
  typography: "",
  spacing: "",
  borderRadius: "",
  aestheticReference: "",
  buttonHierarchy: "",
  navigationPattern: "",
  usesCards: null,
  cardsDescription: "",
  formFields: "",
  iconStyle: "",
  motion: "",
  uiResponseFeel: "",
  loadingStates: "",
  errorHandling: "",
  copyTone: "",
  errorMessages: "",
  emptyStates: "",
  languageToAvoid: "",
  antiPatterns: "",
  accessibility: "",
  deviceTarget: "",
  browserTargets: "",
  freeForm: "",
};
