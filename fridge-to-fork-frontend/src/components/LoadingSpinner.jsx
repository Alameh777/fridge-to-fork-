import React from "react";
export default function LoadingSpinner({ text }) {
  return (<div className="flex flex-col items-center justify-center gap-3 py-12"><div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />{text && <p className="text-sm text-gray-500">{text}</p>}</div>);
}