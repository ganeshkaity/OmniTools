"use client";

import { useState, useEffect } from "react";
import { ArrowUpDown, Settings } from "lucide-react";
import { motion } from "framer-motion";

// Conversion Ratios (relative to a base unit for each category)
const conversionData: Record<string, Record<string, number>> = {
  Length: {
    Meter: 1,
    Kilometer: 1000,
    Centimeter: 0.01,
    Millimeter: 0.001,
    Micrometer: 0.000001,
    Nanometer: 1e-9,
    Mile: 1609.34,
    Yard: 0.9144,
    Foot: 0.3048,
    Inch: 0.0254,
    "Light Year": 9.461e15,
    "Nautical Mile": 1852,
  },
  Weight: {
    Kilogram: 1,
    Gram: 0.001,
    Milligram: 0.000001,
    "Metric Ton": 1000,
    Pound: 0.45359237,
    Ounce: 0.02834952,
    Stone: 6.35029318,
    Carat: 0.0002,
  },
  Area: {
    "Square Meter": 1,
    "Square Kilometer": 1000000,
    "Square Mile": 2589988.11,
    "Square Yard": 0.83612736,
    "Square Foot": 0.09290304,
    "Square Inch": 0.00064516,
    Hectare: 10000,
    Acre: 4046.85642,
  },
  Volume: {
    Liter: 1,
    Milliliter: 0.001,
    "Cubic Meter": 1000,
    "Cubic Centimeter": 0.001,
    "US Gallon": 3.78541,
    "US Quart": 0.946353,
    "US Pint": 0.473176,
    "US Cup": 0.24,
    "US Fluid Ounce": 0.0295735,
    "Imperial Gallon": 4.54609,
  },
  Speed: {
    "Meters per second": 1,
    "Kilometers per hour": 0.277778,
    "Miles per hour": 0.44704,
    Knot: 0.514444,
    "Feet per second": 0.3048,
  },
  Time: {
    Second: 1,
    Millisecond: 0.001,
    Microsecond: 0.000001,
    Minute: 60,
    Hour: 3600,
    Day: 86400,
    Week: 604800,
    Month: 2628000, // Approx 30.416 days
    Year: 31536000,
  },
  Data: {
    Byte: 1,
    Kilobyte: 1024,
    Megabyte: 1048576,
    Gigabyte: 1073741824,
    Terabyte: 1099511627776,
    Petabyte: 1125899906842624,
    Bit: 0.125,
  },
  Temperature: {
    Celsius: 1,
    Fahrenheit: 1,
    Kelvin: 1,
  } // Handled separately
};

const categories = Object.keys(conversionData);

export default function UnitConverterPage() {
  const [category, setCategory] = useState(categories[0]);
  const [units, setUnits] = useState(Object.keys(conversionData[categories[0]]));
  
  const [fromUnit, setFromUnit] = useState(units[0]);
  const [toUnit, setToUnit] = useState(units[1]);
  
  const [inputValue, setInputValue] = useState<string>("1");
  const [outputValue, setOutputValue] = useState<string>("");

  // Update available units when category changes
  useEffect(() => {
    const newUnits = Object.keys(conversionData[category]);
    setUnits(newUnits);
    setFromUnit(newUnits[0]);
    setToUnit(newUnits[1] || newUnits[0]);
  }, [category]);

  // Calculate Conversion
  useEffect(() => {
    if (inputValue === "" || isNaN(Number(inputValue))) {
      setOutputValue("");
      return;
    }

    const val = Number(inputValue);
    let result = 0;

    if (category === "Temperature") {
      // Special logic for Temperature
      let celsius = 0;
      if (fromUnit === "Celsius") celsius = val;
      else if (fromUnit === "Fahrenheit") celsius = (val - 32) * 5 / 9;
      else if (fromUnit === "Kelvin") celsius = val - 273.15;

      if (toUnit === "Celsius") result = celsius;
      else if (toUnit === "Fahrenheit") result = (celsius * 9 / 5) + 32;
      else if (toUnit === "Kelvin") result = celsius + 273.15;
    } else {
      // Standard ratio-based conversion
      const fromRatio = conversionData[category][fromUnit];
      const toRatio = conversionData[category][toUnit];
      
      const baseValue = val * fromRatio;
      result = baseValue / toRatio;
    }

    // Format output nicely (max 8 decimal places, avoiding trailing zeros)
    setOutputValue(parseFloat(result.toFixed(8)).toString());
  }, [inputValue, fromUnit, toUnit, category]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setInputValue(outputValue);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Universal Unit Converter</h1>
        <p className="text-muted-foreground">Convert between hundreds of units of measurement accurately.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 md:p-8 border border-border shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        {/* Category Selector */}
        <div className="mb-8">
          <label className="text-sm font-medium text-foreground mb-2 block">Select Measurement Type</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full md:w-1/2 appearance-none bg-background/50 border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-medium"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Settings className="absolute right-4 md:right-[52%] top-3.5 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          
          {/* FROM side */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">From</label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full text-2xl font-semibold bg-background/80 border border-border rounded-xl px-4 py-6 focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all placeholder:text-muted"
                placeholder="0.00"
              />
            </div>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full appearance-none bg-muted/30 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-4 md:my-0 md:pt-6">
            <button
              onClick={handleSwap}
              className="p-4 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-full transition-all active:scale-95 shadow-sm border border-primary/20 hover:shadow-primary/30 group"
              title="Swap units"
            >
              <ArrowUpDown className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* TO side */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">To</label>
              <input
                type="text"
                readOnly
                value={outputValue}
                className="w-full text-2xl font-semibold bg-background border border-border/50 rounded-xl px-4 py-6 text-foreground opacity-90 cursor-default"
                placeholder="0.00"
              />
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full appearance-none bg-muted/30 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

        </div>

        {inputValue && !isNaN(Number(inputValue)) && outputValue !== "" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 text-center p-4 bg-muted/20 border border-border rounded-lg"
          >
            <p className="text-sm text-muted-foreground font-medium">Conversion Formula Result:</p>
            <p className="text-xl md:text-2xl mt-1">
              <span className="font-semibold text-foreground">{inputValue}</span> <span className="text-muted-foreground">{fromUnit}</span>
              <span className="mx-2 text-primary">=</span>
              <span className="font-semibold text-foreground">{outputValue}</span> <span className="text-muted-foreground">{toUnit}</span>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
