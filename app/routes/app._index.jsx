import { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import world from "@svg-maps/world";
import bounds from "svg-path-bounds";

/* -------------------------------------------------
   CONSTANTS
------------------------------------------------- */
const CURRENCY_META = {
  USD: { name: "US Dollar", badge: "US" },
  EUR: { name: "Euro", badge: "EU" },
  GBP: { name: "British Pound", badge: "GB" },
  INR: { name: "Indian Rupee", badge: "IN" },
  AUD: { name: "Australian Dollar", badge: "AU" },
  CAD: { name: "Canadian Dollar", badge: "CA" },
  JPY: { name: "Japanese Yen", badge: "JP" },
  CNY: { name: "Chinese Yuan", badge: "CN" },
  MXN: { name: "Mexican Peso", badge: "MX" },
  BRL: { name: "Brazilian Real", badge: "BR" },
  CHF: { name: "Swiss Franc", badge: "CH" },
  SGD: { name: "Singapore Dollar", badge: "SG" },
};

const ALL_CURRENCIES = Object.entries(CURRENCY_META).map(([code, meta]) => ({
  code,
  label: meta.name,
  badge: meta.badge,
}));

const DEFAULT_SELECTED = ["USD", "EUR", "INR", "CAD"];

const DISPLAY_CURRENCIES = [
  "USD",
  "EUR",
  "INR",
  "CAD",
  "GBP",
  "JPY",
  "AUD",
  "CHF",
  "SGD",
].map((code) => ({ code, ...CURRENCY_META[code] }));

const BADGE_TO_ISO2 = {
  US: "US",
  CA: "CA",
  GB: "GB",
  IN: "IN",
  AU: "AU",
  JP: "JP",
  CN: "CN",
  MX: "MX",
  BR: "BR",
  CH: "CH",
  SG: "SG",
  // EU is not a country in the world svg map → fallback to text
  EU: null,
};

function CountryMapIcon({ iso, size = 18, className = "" }) {
  const iso2 = (BADGE_TO_ISO2[iso] ?? iso)?.toLowerCase();
  if (!iso2) return null;

  const location = world.locations?.find((l) => l.id === iso2);
  const d = location?.path;
  if (!d) return null;

  let viewBox = "0 0 24 24";
  try {
    const [minX, minY, maxX, maxY] = bounds(d);
    const pad = Math.max((maxX - minX) * 0.08, (maxY - minY) * 0.08, 6);
    const x = minX - pad;
    const y = minY - pad;
    const w = (maxX - minX) + pad * 2;
    const h = (maxY - minY) + pad * 2;
    viewBox = `${x} ${y} ${w} ${h}`;
  } catch {
    // If bounds parsing fails for any reason, fall back to the full map viewBox.
    viewBox = world.viewBox || viewBox;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}

CountryMapIcon.propTypes = {
  iso: PropTypes.string.isRequired,
  size: PropTypes.number,
  className: PropTypes.string,
};

function CurrencyBadge({ code, size = "md" }) {
  const badge = CURRENCY_META[code]?.badge ?? code.slice(0, 2);
  const classes = size === "sm" ? "w-5 h-5 text-[11px]" : "w-6 h-6 text-[12px]";
  const hasMap = Boolean(
    world.locations?.some(
      (l) => l.id === (BADGE_TO_ISO2[badge] ?? badge).toLowerCase(),
    ),
  );

  return (
    <span
      className={`inline-flex items-center justify-center ${classes} rounded bg-white border border-gray-200 font-semibold text-gray-700`}
    >
      <span className="text-gray-700">
        <CountryMapIcon iso={badge} size={size === "sm" ? 14 : 16} className="text-gray-700" />
      </span>
      {!hasMap ? badge : null}
    </span>
  );
}

CurrencyBadge.propTypes = {
  code: PropTypes.string.isRequired,
  size: PropTypes.oneOf(["sm", "md"]),
};

/* -------------------------------------------------
   STEP 1: CurrencySelector
------------------------------------------------- */
function CurrencySelector({
  onNext,
  initialSelected = DEFAULT_SELECTED,
  initialDefault = "INR",
}) {
  const safeInitialSelected =
    Array.isArray(initialSelected) && initialSelected.length
      ? initialSelected
      : DEFAULT_SELECTED;

  const safeInitialDefault = initialDefault || "INR";

  const [selectedCodes, setSelectedCodes] = useState(safeInitialSelected);
  const [defaultCode, setDefaultCode] = useState(safeInitialDefault);
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  useEffect(() => {
    if (Array.isArray(initialSelected) && initialSelected.length) {
      setSelectedCodes(initialSelected);
    }
  }, [initialSelected]);

  useEffect(() => {
    if (initialDefault) setDefaultCode(initialDefault);
  }, [initialDefault]);

  const selectedCurrencies = ALL_CURRENCIES.filter((c) =>
    selectedCodes.includes(c.code),
  );

  const toggleCode = useCallback(
    (code, checked) => {
      setSelectedCodes((prev) => {
        let next = checked ? [...prev, code] : prev.filter((c) => c !== code);

        if (defaultCode === code && !checked) {
          setDefaultCode(next.length > 0 ? next[0] : "");
        } else if (next.length === 0) {
          setDefaultCode("");
        }

        return Array.from(new Set(next));
      });
    },
    [defaultCode],
  );

  const handleRemoveCurrency = (code) => {
    toggleCode(code, false);
  };

  const handleSaveAndNext = () => {
    const dataToSave = {
      currencies: selectedCodes,
      defaultCurrency: defaultCode,
    };

    console.log("💾 [Step1] Data being sent:", dataToSave);
    onNext(dataToSave);
  };

  const isDisabled = selectedCodes.length === 0 || !defaultCode;

  const availableCurrencies = ALL_CURRENCIES.filter(
    (c) => !DISPLAY_CURRENCIES.some((d) => d.code === c.code),
  );

  return (
    <div className="min-h-screen w-full bg-white font-sans">
      <div className="w-full px-6 md:px-10 2xl:px-14 py-6">
        {/* What this app does section */}
        <div className="mb-7">
          <div className="flex items-start gap-4 max-w-5xl">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">What this app does</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Adds a lightweight currency switcher to your storefront so customers see prices in their local currency. Rates
                update automatically — checkout stays untouched.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                <span className="text-xs font-semibold text-gray-800 border-b-2 border-emerald-500 pb-0.5">Auto-detects Location</span>
                <span className="text-xs font-semibold text-gray-800 border-b-2 border-emerald-500 pb-0.5">No checkout changes</span>
                <span className="text-xs font-semibold text-gray-800 border-b-2 border-emerald-500 pb-0.5">Customizable Widget</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-8 max-w-5xl">
          <div className="grid grid-cols-3 rounded-xl border border-gray-200 overflow-hidden bg-white">
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border-r border-gray-200">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-semibold">1</div>
              <span className="text-sm font-semibold text-emerald-700">Currencies</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-white border-r border-gray-200">
              <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-semibold">2</div>
              <span className="text-sm font-semibold text-gray-700">Placement</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-white">
              <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-semibold">3</div>
              <span className="text-sm font-semibold text-gray-700">Go live</span>
            </div>
          </div>
        </div>

        {/* Choose currencies section */}
        <div className="mb-6 max-w-6xl">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Choose currencies</h2>
          <p className="text-sm text-gray-500 mb-4">Select which currencies customers can switch between</p>

          {/* Selected currency chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCurrencies.length === 0 ? (
              <span className="text-sm text-gray-400 italic">No currencies selected</span>
            ) : (
              selectedCurrencies.map((c) => (
                <div
                  key={c.code}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-sm"
                >
                  <CurrencyBadge code={c.code} size="sm" />
                  <span className="font-semibold text-gray-800">{c.code}</span>
                  <button
                    className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCurrency(c.code);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Currency cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {DISPLAY_CURRENCIES.map((currency) => {
              const isSelected = selectedCodes.includes(currency.code);
              return (
                <button
                  key={currency.code}
                  onClick={() => toggleCode(currency.code, !isSelected)}
                  type="button"
                  className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-200 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                    isSelected ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-200"
                  }`}>
                    {isSelected ? (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </div>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200">
                    <CurrencyBadge code={currency.code} />
                  </span>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{currency.code}</span>
                    </div>
                    <p className="text-xs text-gray-500">{currency.name}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Add more currencies button */}
          <div className="relative">
            <button
              onClick={() => setShowAllCurrencies(!showAllCurrencies)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 transition-colors"
            >
              + Add more currencies
            </button>

            {showAllCurrencies && (
              <div className="absolute top-full mt-2 left-0 z-20 w-80 max-h-64 overflow-y-auto bg-white rounded-xl shadow-xl p-3 border border-gray-200">
                {availableCurrencies.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    All available currencies are already shown above.
                  </div>
                ) : (
                  availableCurrencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => toggleCode(currency.code, true)}
                      type="button"
                      className="flex items-center gap-3 p-2.5 text-sm cursor-pointer rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-gray-200">
                        <CurrencyBadge code={currency.code} />
                      </span>
                      <span className="font-medium text-gray-700">{currency.code}</span>
                      <span className="text-gray-500">{currency.label}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Default currency section */}
        <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4 mb-8 max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Default currency</h3>
              <p className="text-xs text-gray-500">Shown to visitors before they switch</p>
            </div>
            <div className="relative">
              <select
                value={defaultCode}
                onChange={(e) => setDefaultCode(e.target.value)}
                disabled={selectedCurrencies.length === 0}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer"
              >
                <option value="" disabled>Select default</option>
                {selectedCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {CURRENCY_META[c.code]?.badge ?? c.code.slice(0, 2)} {c.code} — {c.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer step indicator */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 max-w-6xl">
          <span className="text-sm text-gray-500">Step 1 of 3</span>
          <button
            onClick={handleSaveAndNext}
            disabled={isDisabled}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   STEP 2: PlacementSelector
------------------------------------------------- */
function PlacementSelector({
  onBack,
  onSave,
  initialPlacement = "Fixed Position",
  initialFixedCorner = "bottom-left",
  initialDistanceTop = 16,
  initialDistanceRight = 16,
  initialDistanceBottom = 16,
  initialDistanceLeft = 16,
  initialInlineSide = "right",
}) {
  const [placement, setPlacement] = useState(initialPlacement);
  const [fixedCorner, setFixedCorner] = useState(initialFixedCorner);
  const [distanceTop, setDistanceTop] = useState(initialDistanceTop);
  const [distanceRight, setDistanceRight] = useState(initialDistanceRight);
  const [distanceBottom, setDistanceBottom] = useState(initialDistanceBottom);
  const [distanceLeft, setDistanceLeft] = useState(initialDistanceLeft);
  const [isSaving, setIsSaving] = useState(false);
  const [inlineSide, setInlineSide] = useState("right");

  useEffect(() => setPlacement(initialPlacement), [initialPlacement]);
  useEffect(() => setFixedCorner(initialFixedCorner), [initialFixedCorner]);
  useEffect(() => setDistanceTop(initialDistanceTop), [initialDistanceTop]);
  useEffect(
    () => setDistanceRight(initialDistanceRight),
    [initialDistanceRight],
  );
  useEffect(
    () => setDistanceBottom(initialDistanceBottom),
    [initialDistanceBottom],
  );
  useEffect(() => setDistanceLeft(initialDistanceLeft), [initialDistanceLeft]);

  useEffect(() => {
    setInlineSide(initialInlineSide);
  }, [initialInlineSide]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({
        placement,
        fixedCorner,
        distanceTop,
        distanceRight,
        distanceBottom,
        distanceLeft,
        inlineSide,
      });
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  const handleDistanceChange = (setter) => (event) => {
    const value = event.target.value.replace(/[^0-9]/g, "");
    setter(parseInt(value) || 0);
  };

  const handleArrowClick = (setter, increment) => (e) => {
    e.preventDefault();
    setter((prev) => Math.max(0, prev + increment));
  };

  const getCornerDistance = (corner) => {
    switch (corner) {
      case "top-right":
        return { top: `${distanceTop}px`, right: `${distanceRight}px` };
      case "top-left":
        return { top: `${distanceTop}px`, left: `${distanceLeft}px` };
      case "bottom-right":
        return { bottom: `${distanceBottom}px`, right: `${distanceRight}px` };
      case "bottom-left":
        return { bottom: `${distanceBottom}px`, left: `${distanceLeft}px` };
      default:
        return {};
    }
  };

  const isCornerChecked = (corner) =>
    placement === "Fixed Position" && fixedCorner === corner;

  // Note: we keep fixedCorner + distanceTop/Left/Bottom/Right in state because
  // they're persisted, even though the v2 UI only exposes Bottom/Right.

  const progressLabel = "Step 2 of 3";
  const progressPct = 66;

  return (
    <div className="min-h-screen w-full bg-gray-50 font-sans">
      <div className="w-full px-6 md:px-10 2xl:px-14 py-8">
        <div className="mx-auto max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-7">
          {/* Widget placement */}
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Widget placement</h2>
            <p className="text-xs text-gray-500 mt-1">
              Choose where the currency selector appears on your storefront
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Fixed position option */}
            <button
              type="button"
              onClick={() => setPlacement("Fixed Position")}
              className={`text-left rounded-2xl border p-4 transition-colors ${
                placement === "Fixed Position"
                  ? "border-emerald-300 bg-emerald-50/60"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="w-full h-36 rounded-2xl bg-emerald-100/60 relative overflow-hidden mb-4">
                <div className="absolute inset-0">
                  <div className="absolute top-5 left-5 w-14 h-14 rounded-2xl bg-white/70" />
                  <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-emerald-600" />
                  <div className="absolute bottom-7 right-7 w-6 h-6 rounded bg-emerald-600" />
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">Fixed position</div>
              <div className="text-xs text-gray-500 mt-1">Floating button, always visible</div>
            </button>

            {/* Inline option */}
            <button
              type="button"
              onClick={() => setPlacement("Inline with the header")}
              className={`text-left rounded-2xl border p-4 transition-colors ${
                placement === "Inline with the header"
                  ? "border-emerald-300 bg-emerald-50/60"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="w-full h-36 rounded-2xl bg-gray-100 relative overflow-hidden mb-4">
                <div className="absolute inset-0">
                  <div className="absolute top-7 right-10 w-8 h-8 rounded bg-emerald-600" />
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">Inline with header</div>
              <div className="text-xs text-gray-500 mt-1">Embedded in your nav bar</div>
            </button>
          </div>

          {/* Position offset */}
          {placement === "Fixed Position" && (
            <>
              <div className="text-xs font-semibold text-gray-700 mb-3">Position offset</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4">
                  <div className="text-[11px] font-semibold text-gray-700 mb-2">DISTANCE FROM BOTTOM</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={String(distanceBottom)}
                      onChange={handleDistanceChange(setDistanceBottom)}
                      className="w-24 px-3 py-2 rounded-full border border-emerald-200 bg-white text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-gray-500">px</span>
                    <div className="ml-auto flex flex-col">
                      <button
                        type="button"
                        onClick={handleArrowClick(setDistanceBottom, 1)}
                        className="h-5 w-6 text-xs text-gray-600 hover:bg-white/60 rounded"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={handleArrowClick(setDistanceBottom, -1)}
                        className="h-5 w-6 text-xs text-gray-600 hover:bg-white/60 rounded"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4">
                  <div className="text-[11px] font-semibold text-gray-700 mb-2">DISTANCE FROM RIGHT</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={String(distanceRight)}
                      onChange={handleDistanceChange(setDistanceRight)}
                      className="w-24 px-3 py-2 rounded-full border border-emerald-200 bg-white text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-gray-500">px</span>
                    <div className="ml-auto flex flex-col">
                      <button
                        type="button"
                        onClick={handleArrowClick(setDistanceRight, 1)}
                        className="h-5 w-6 text-xs text-gray-600 hover:bg-white/60 rounded"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={handleArrowClick(setDistanceRight, -1)}
                        className="h-5 w-6 text-xs text-gray-600 hover:bg-white/60 rounded"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 inline-flex items-center gap-2"
            >
              <span>←</span>
              Back
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSaving ? "Saving..." : "Save & finish"}
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   STEP 3: Confirmation
------------------------------------------------- */
// function ConfirmationScreen({ onReview }) {
//   return (
//     <div className="p-4 md:p-8 min-h-screen bg-gray-50 font-sans flex justify-center items-center h-screen flex-col">
//       <div className="bg-white rounded-xl p-12 text-center max-w-md shadow-2xl border border-gray-200">
//         <div className="text-5xl mb-4">
//           <span role="img" aria-label="Check Mark">
//             ✅
//           </span>
//         </div>
//         <h1 className="text-3xl font-bold text-gray-800 mb-2">
//           Setup Complete!
//         </h1>
//         <p className="text-base text-gray-600 mt-4">
//           Your Auto Currency Converter settings have been successfully
//           configured and are now active on your store.
//         </p>
//         <button
//           className="mt-8 px-6 py-3 rounded-lg border border-teal-500 bg-teal-500 text-white text-sm font-semibold cursor-pointer hover:bg-teal-600 transition-colors shadow-lg"
//           onClick={onReview}
//         >
//           Review Settings
//         </button>
//       </div>
//     </div>
//   );
// }

// https://${shop}/admin/api/2024-10/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json

function ConfirmationScreen({ onReview, themeStatus }) {
  const { shop, mainThemeId } = themeStatus;

  const themeEditorUrl =
    shop && mainThemeId
      ? `https://${shop}/admin/themes/${mainThemeId}/editor?context=apps`
      : "https://admin.shopify.com/themes/current/editor?context=apps";

  return (
    <div className="min-h-screen w-full bg-gray-50 font-sans">
      <div className="w-full px-6 md:px-10 2xl:px-14 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Settings saved</h1>
              <p className="text-sm text-gray-500 mt-1 max-w-md">
                One last step — enable the switcher in your theme so it shows on your Storefront.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 mb-8">
              <ol className="space-y-4">
                {[
                  "Click Open Theme Editor below",
                  "Click Edit theme",
                  "Open App embeds from the left sidebar",
                  "Enable Currency Switcher – App Embed and click Save",
                  "Visit your storefront to preview the currency switcher",
                ].map((text, idx) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-700">{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={themeEditorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-6 py-3 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Open Theme Editor
              </a>
              <button
                type="button"
                onClick={onReview}
                className="flex-1 px-6 py-3 rounded-full border border-emerald-300 bg-white text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors"
              >
                Review settings
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-500 flex items-start gap-2">
              <span className="mt-0.5">ⓘ</span>
              <span>
                If your theme supports app blocks, you can also add the <strong>Currency Switcher App Block</strong> to specific
                sections using the theme editor for more precise placement.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   MAIN ROUTE
------------------------------------------------- */
export default function SettingsRoute() {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState({
    currencies: [],
    defaultCurrency: "",
  });
  const [loading, setLoading] = useState(true);
  const [themeStatus, setThemeStatus] = useState({
    shop: "",
    mainThemeId: null,
    isEnabled: false,
  });

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/embed-status");
      const json = await res.json();
      setThemeStatus(json);
    })();
  }, []);

  // load settings
  useEffect(() => {
    (async () => {
      const __t0 = Date.now();
      let __status = 0;
      // #region agent log
      fetch("http://127.0.0.1:7780/ingest/d17002be-fcef-4dff-8e87-98a28dbcefc1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "7ed33c",
        },
        body: JSON.stringify({
          sessionId: "7ed33c",
          runId: "pre-fix",
          hypothesisId: "H3",
          location: "app._index.jsx:merchant-fetch:start",
          message: "client fetch merchant-settings start",
          data: {},
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      try {
        const res = await fetch("/api/merchant-settings", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        __status = res.status;
        if (!res.ok) {
          throw new Error(`Failed to load: ${res.status}`);
        }

        const text = await res.text();

        if (!text) {
          // no settings yet → use defaults
          throw new Error("Empty response");
        }

        const json = JSON.parse(text);

        const data = json.data || {};

        setStep1Data({
          currencies: data.selectedCurrencies ?? DEFAULT_SELECTED,
          defaultCurrency: data.defaultCurrency ?? "INR",
          placement: data.placement ?? "fixed",
          inlineSide: data.inlineSide ?? "right",
          fixedCorner: data.fixedCorner ?? "bottom-right",
          distanceTop: data.distanceTop ?? 16,
          distanceRight: data.distanceRight ?? 16,
          distanceBottom: data.distanceBottom ?? 16,
          distanceLeft: data.distanceLeft ?? 16,
        });
      } catch {
        setStep1Data({
          currencies: DEFAULT_SELECTED,
          defaultCurrency: "INR",
          placement: "fixed",
          fixedCorner: "bottom-right",
          distanceTop: 16,
          distanceRight: 16,
          distanceBottom: 16,
          distanceLeft: 16,
        });
      } finally {
        // #region agent log
        fetch("http://127.0.0.1:7780/ingest/d17002be-fcef-4dff-8e87-98a28dbcefc1", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "7ed33c",
          },
          body: JSON.stringify({
            sessionId: "7ed33c",
            runId: "pre-fix",
            hypothesisId: "H3",
            location: "app._index.jsx:merchant-fetch:finally",
            message: "client fetch merchant-settings finished",
            data: { ms: Date.now() - __t0, httpStatus: __status },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        setLoading(false);
      }
    })();
  }, []);

  const handleStep1Save = useCallback((data) => {
    console.log("📝 [Step1] Saving:", data);
    setStep1Data((prev) => ({ ...prev, ...data }));
    setStep(2);
  }, []);

  // const handleStep2Save = useCallback(
  //   async (data) => {
  //     console.log("⑤ [Step2Save] START with:", data);

  //     const normalizedPlacement =
  //       data.placement === "Fixed Position"
  //         ? "fixed"
  //         : data.placement === "Inline with the header"
  //           ? "inline"
  //           : "hidden";

  //     const payload = {
  //       currencies: step1Data.currencies,
  //       defaultCurrency: step1Data.defaultCurrency,
  //       baseCurrency: "USD",
  //       placement: normalizedPlacement,
  //       fixedCorner: normalizedPlacement === "fixed" ? data.fixedCorner : null,
  //       distanceTop: data.distanceTop,
  //       distanceRight: data.distanceRight,
  //       distanceBottom: data.distanceBottom,
  //       distanceLeft: data.distanceLeft,
  //     };

  //     console.log("⑥ Payload:", payload);

  //     // ✅ HARDCODED - same as your working GET request
  //     const apiUrl = "/api/merchant-settings";
  //     console.log("⑦ POST →", apiUrl);

  //     try {
  //       const res = await fetch("/api/merchant-settings", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(payload),
  //       });

  //       console.log("⑧ Response status:", res.status);

  //       if (res.ok) {
  //         setStep(3);
  //         return;
  //       }

  //       const text = await res.text();
  //       console.error("❌ Error:", res.status, text);
  //       alert(`Failed: ${res.status}`);
  //     } catch (err) {
  //       console.error("❌ Fetch failed:", err);
  //       alert(err.message);
  //     }
  //   },
  //   [step1Data],
  // );

  const handleStep2Save = useCallback(
    async (data) => {
      const normalizedPlacement =
        data.placement === "Fixed Position"
          ? "fixed"
          : data.placement === "Inline with the header"
            ? "inline"
            : "hidden";

      const payload = {
        currencies: step1Data.currencies,
        defaultCurrency: step1Data.defaultCurrency,
        baseCurrency: "USD",
        placement: normalizedPlacement,
        inlineSide: normalizedPlacement === "inline" ? data.inlineSide : null,
        fixedCorner: normalizedPlacement === "fixed" ? data.fixedCorner : null,
        distanceTop: data.distanceTop,
        distanceRight: data.distanceRight,
        distanceBottom: data.distanceBottom,
        distanceLeft: data.distanceLeft,
      };

      const res = await fetch("/api/merchant-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) setStep(3);
    },
    [step1Data],
  );

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-lg font-semibold text-gray-700">
          Loading settings…
        </div>
        <p className="text-sm text-gray-500 mt-2">Loading merchant settings…</p>
      </div>
    );
  }

  if (step === 1) {
    return (
      <CurrencySelector
        onNext={handleStep1Save}
        initialSelected={step1Data.currencies || DEFAULT_SELECTED}
        initialDefault={step1Data.defaultCurrency || "INR"}
      />
    );
  }

  if (step === 2) {
    const normalizePlacementForUI = (placement) => {
      if (placement === "fixed") return "Fixed Position";
      if (placement === "inline") return "Inline with the header";
      // if (placement === "hidden") return "Don't show at all";
      return "Fixed Position";
    };

    return (
      <PlacementSelector
        onBack={() => setStep(1)}
        onSave={handleStep2Save}
        initialPlacement={normalizePlacementForUI(step1Data.placement)}
        initialInlineSide={step1Data.inlineSide || "right"}
        initialFixedCorner={
          step1Data.fixedCorner ||
          (["top-left", "top-right", "bottom-left", "bottom-right"].includes(
            step1Data.placement,
          )
            ? step1Data.placement
            : "bottom-left")
        }
        initialDistanceTop={step1Data.distanceTop ?? 16}
        initialDistanceRight={step1Data.distanceRight ?? 16}
        initialDistanceBottom={step1Data.distanceBottom ?? 16}
        initialDistanceLeft={step1Data.distanceLeft ?? 16}
      />
    );
  }

  if (step === 3) {
    return (
      <ConfirmationScreen
        onReview={() => setStep(1)}
        themeStatus={themeStatus}
      />
    );
  }

  return null;
}
