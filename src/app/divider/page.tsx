"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users } from "lucide-react";

const DIVIDER_KEY = process.env.NEXT_PUBLIC_DIVIDER_KEY || "DIVIDER_PERSONS";

export default function DividerPage() {
  const [persons, setPersons] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(DIVIDER_KEY);
    if (saved) setPersons(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isLoaded) return;
    localStorage.setItem(DIVIDER_KEY, JSON.stringify(persons));
  }, [persons, isLoaded]);

  const handleAdd = () => {
    const name = input.trim();
    if (!name) {
      setError("Name cannot be empty.");
      return;
    }
    if (persons.includes(name)) {
      setError("This person has already been added.");
      return;
    }
    setPersons([...persons, name]);
    setInput("");
    setError(null);
  };

  const handleRemove = (nameToRemove: string) => {
    setPersons(persons.filter((name) => name !== nameToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen flex justify-center items-start py-12 sm:py-16 px-4">
      <div className="relative border border-white/20 rounded-2xl max-w-2xl w-full mx-auto p-6 sm:p-8 bg-black/70 shadow-2xl backdrop-blur-xl">
        <h1 className="text-4xl text-center font-bold text-white mb-4">
          คนหาร
        </h1>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter a name..."
              className="flex-grow p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white-500 transition-all"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
            />
            <button
              className="flex-shrink-0 p-3 bg-white rounded-lg hover:bg-white-500 transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed"
              onClick={handleAdd}
              aria-label="Add person"
              disabled={!input.trim()}
            >
              <Plus size={24} color="#000000" />
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white/80 mb-4">
            สมาชิก ({persons.length})
          </h2>
          <div className="space-y-3">
            <AnimatePresence>
              {persons.length > 0 ? (
                persons.map((name) => (
                  <motion.div
                    key={name}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                    className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg text-white"
                  >
                    <div
                      className="w-9 h-9 flex items-center justify-center rounded-full mr-3 font-bold text-lg uppercase"
                      style={{
                        background: `hsl(${
                          (name.charCodeAt(0) * 39) % 360
                        }, 70%, 60%)`,
                        color: "#222",
                      }}
                    >
                      {name.charAt(0)}
                    </div>
                    <span className="flex-1">{name}</span>
                    <button
                      onClick={() => handleRemove(name)}
                      className="p-1 rounded-full text-white/50 hover:bg-white/20 hover:text-white transition-colors"
                      aria-label={`Remove ${name}`}
                    >
                      <X size={18} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.2 } }}
                  className="text-center py-10 px-4 border-2 border-dashed border-white/20 rounded-lg"
                >
                  <Users className="mx-auto text-white/30" size={40} />
                  <p className="text-white/60 mt-4">
                    The group is currently empty.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
