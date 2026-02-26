import {
  TemplateExecutiveInline,
  TemplateNordicInline,
  TemplateBerlinInline,
  TemplateOnyxInline,
  TemplateGenericProInline
} from "./Templates";

/*
  MAP: template id → component renderer
  Використовується Dashboard для preview
*/

export const renderTemplate = (id, props) => {
  switch (id) {
    case "executive":
      return <TemplateExecutiveInline {...props} />;

    case "nordic":
      return <TemplateNordicInline {...props} />;

    case "berlin":
      return <TemplateBerlinInline {...props} />;

    case "onyx":
      return <TemplateOnyxInline {...props} />;

    case "tokyo":
      return <TemplateGenericProInline {...props} accent="#7c3aed" bg="#fafafa" />;

    case "milano":
      return <TemplateGenericProInline {...props} accent="#d97706" bg="#fffbf0" />;

    case "sydney":
      return <TemplateGenericProInline {...props} accent="#0369a1" bg="#f0f9ff" />;

    case "atlas":
      return <TemplateGenericProInline {...props} accent="#9333ea" bg="#fdf4ff" />;

    case "pearl":
      return <TemplateGenericProInline {...props} accent="#e11d48" bg="#fff1f2" />;

    default:
      return <TemplateGenericProInline {...props} />;
  }
};