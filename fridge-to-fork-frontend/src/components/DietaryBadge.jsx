import React from "react";
const B = {is_halal:{l:"Halal",a:"حلال",c:"bg-green-100 text-green-700"},is_vegetarian:{l:"Veg",a:"نباتي",c:"bg-green-100 text-green-600"},is_vegan:{l:"Vegan",a:"نباتي صرف",c:"bg-green-50 text-green-500"},is_ramadan_friendly:{l:"🌙 Ramadan",a:"🌙 رمضان",c:"bg-orange-100 text-orange-700"}};
export default function DietaryBadge({ type, isAr }) {
  const b = B[type]; if (!b) return null;
  return <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + b.c}>{isAr ? b.a : b.l}</span>;
}