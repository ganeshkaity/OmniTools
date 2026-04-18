"use client";

import { useState, useEffect } from "react";
import { ArrowUpDown, Loader2, DollarSign, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// Popular currencies for better sorting/display
const POPULAR_CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY", "CNY", "SGD", "AED"];

export default function CurrencyConverterPage() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  
  const [inputValue, setInputValue] = useState<string>("1");
  const [outputValue, setOutputValue] = useState<string>("");

  useEffect(() => {
    // Fetch latest exchange rates against USD
    const fetchRates = async () => {
      try {
        setLoading(true);
        // Using a free, no-key public CDN for currency data
        const res = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json");
        if (!res.ok) throw new Error("Failed to fetch rates");
        
        const data = await res.json();
        if (data && data.usd) {
          const ratesData = data.usd as Record<string, number>;
          
          // API returns lowercase keys, let's uppercase them for standard display
          const upperRates: Record<string, number> = {};
          Object.keys(ratesData).forEach(key => {
            upperRates[key.toUpperCase()] = ratesData[key];
          });
          
          setRates(upperRates);
          
          // Sort currencies, keeping popular ones at top
          const allCurrencies = Object.keys(upperRates).sort((a, b) => {
            const aPop = POPULAR_CURRENCIES.indexOf(a);
            const bPop = POPULAR_CURRENCIES.indexOf(b);
            if (aPop !== -1 && bPop !== -1) return aPop - bPop;
            if (aPop !== -1) return -1;
            if (bPop !== -1) return 1;
            return a.localeCompare(b);
          });
          
          setCurrencies(allCurrencies);
          setError(null);
        }
      } catch (err: any) {
        console.error("Currency API Error:", err);
        setError("Unable to load latest live rates. Please try again later.");
        
        // Fallback static rates for demo purposes if API fails
        const fallback = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.15, AUD: 1.52, CAD: 1.35, JPY: 151.3, CNY: 7.23 };
        setRates(fallback);
        setCurrencies(Object.keys(fallback));
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Calculate Conversion
  useEffect(() => {
    if (Object.keys(rates).length === 0) return;
    if (inputValue === "" || isNaN(Number(inputValue))) {
      setOutputValue("");
      return;
    }

    const val = Number(inputValue);
    
    // Cross conversion through USD base
    // Value in Target = (Amount / Rate of From against USD) * Rate of To against USD
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    
    if (fromRate && toRate) {
      const result = (val / fromRate) * toRate;
      // Format output nicely (max 4 decimal places)
      setOutputValue(parseFloat(result.toFixed(4)).toString());
    }
  }, [inputValue, fromCurrency, toCurrency, rates]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setInputValue(outputValue);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-primary" /> Live Currency Converter
        </h1>
        <p className="text-muted-foreground">Get real-time exchange rates for hundreds of global currencies.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 md:p-8 border border-border shadow-sm relative overflow-hidden min-h-[400px]"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10 -translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-medium animate-pulse">Fetching live rates...</p>
          </div>
        ) : null}

        {error && !loading ? (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive-foreground">{error}</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center mt-6">
          
          {/* FROM side */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full text-2xl font-semibold bg-background/80 border border-border rounded-xl px-4 py-6 focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all placeholder:text-muted"
                placeholder="0.00"
              />
            </div>
            <div className="relative">
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full appearance-none bg-muted/30 border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-semibold tracking-wider"
              >
                {currencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-4 md:my-0 md:pt-6">
            <button
              onClick={handleSwap}
              className="p-4 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-full transition-all active:scale-95 shadow-sm border border-primary/20 hover:shadow-primary/30 group"
              title="Swap currencies"
            >
              <ArrowUpDown className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* TO side */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Converted Amount</label>
              <input
                type="text"
                readOnly
                value={outputValue}
                className="w-full text-2xl font-semibold bg-background border border-border/50 rounded-xl px-4 py-6 text-foreground opacity-90 cursor-default"
                placeholder="0.00"
              />
            </div>
            <div className="relative">
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full appearance-none bg-muted/30 border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-semibold tracking-wider"
              >
                {currencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {inputValue && !isNaN(Number(inputValue)) && outputValue !== "" && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 text-center p-5 bg-muted/20 border border-border rounded-xl"
          >
            <p className="text-sm text-muted-foreground font-medium mb-2">Current Live Exchange Rate</p>
            <p className="text-xl md:text-3xl font-light">
              <span className="font-semibold text-foreground">{inputValue}</span> <span className="text-muted-foreground text-lg">{fromCurrency}</span>
              <span className="mx-3 text-primary">=</span>
              <span className="font-semibold text-foreground">{outputValue}</span> <span className="text-muted-foreground text-lg">{toCurrency}</span>
            </p>
            {rates[fromCurrency] && rates[toCurrency] && (
              <p className="text-xs text-muted-foreground mt-3">
                1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(6)} {toCurrency}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
