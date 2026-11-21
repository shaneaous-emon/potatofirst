"use client";

export function PrintButton() {
  return (
    <div className="mt-8 flex justify-center gap-3 print:hidden">
      <button type="button" onClick={() => window.print()} className="h-10 cursor-pointer rounded-sm bg-brown-700 px-5 text-[14px] font-medium text-cream-100 hover:bg-brown-900">
        Print / Save PDF
      </button>
    </div>
  );
}
