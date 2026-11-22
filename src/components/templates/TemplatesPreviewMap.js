import {
  TemplateExecutiveInline,
  TemplateNordicInline,
  TemplateBerlinInline,
  TemplateOnyxInline,
  TemplateTokyoInline,
  TemplateMilanoInline,
  TemplateSydneyInline,
  TemplateAtlasInline,
  TemplatePearlInline,
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
      return <TemplateTokyoInline {...props} />;

    case "milano":
      return <TemplateMilanoInline {...props} />;

    case "sydney":
      return <TemplateSydneyInline {...props} />;

    case "atlas":
      return <TemplateAtlasInline {...props} />;

    case "pearl":
      return <TemplatePearlInline {...props} />;

    default:
      return <TemplateGenericProInline {...props} />;
  }
};
