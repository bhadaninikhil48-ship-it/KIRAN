import { CropImage } from "../ui/CropImage";

export function ProduceShowcase() {
  const commodities = [
    { crop: "Wheat", category: "Cereals" },
    { crop: "Potato", category: "Vegetables" },
    { crop: "Onion", category: "Vegetables" },
    { crop: "Tomato", category: "Vegetables" },
    { crop: "Soybean", category: "Oilseeds" },
    { crop: "Garlic", category: "Spices" },
    { crop: "Carrot", category: "Vegetables" },
    { crop: "Banana", category: "Fruits" },
  ];

  return (
    <section
      id="produce"
      className="py-14 sm:py-18 bg-white border-b border-stone-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            SUPPORTED PRODUCE
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-950 tracking-tight mt-3">
            Active Commodities Traded Across KIRAN
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Staple grains, commercial oilseeds, and fresh horticulture actively listed across regional markets.
          </p>
        </div>

        {/* Compact Produce Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 max-w-6xl mx-auto">
          {commodities.map((item) => (
            <div
              key={item.crop}
              className="p-3 bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-300 hover:-translate-y-0.5 transition-all flex flex-col items-center text-center"
            >
              <CropImage
                crop={item.crop}
                size="preview"
                shape="rounded"
                className="w-16 h-16 sm:w-18 sm:h-18 mb-2 shadow-2xs"
              />
              <span className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">
                {item.crop}
              </span>
              <span className="text-[10px] text-stone-500 font-medium mt-0.5">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProduceShowcase;
