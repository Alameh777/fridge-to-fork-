import React from "react";
import { X } from "lucide-react";
export default function IngredientTag({ ingredient, onRemove }) {
  return (<span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full font-medium">{ingredient}{onRemove && <button onClick={() => onRemove(ingredient)} className="hover:text-orange-900"><X size={14} /></button>}</span>);
}